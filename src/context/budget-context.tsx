

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, setDoc, query, getDocs, writeBatch, increment, arrayUnion, orderBy, Unsubscribe, where, limit } from 'firebase/firestore';
import { createNotification } from '@/components/app-header';
import { type WithdrawalRequest } from '@/app/withdraw/page';
import { isAfter } from 'date-fns';

// New unified Transaction interface
export interface Transaction {
    id?: string;
    userId: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string;
    description: string;
    createdAt?: any;
}

// New unified DebtNote interface
export interface DebtNote {
    id?: string;
    userId: string;
    type: 'lent' | 'borrowed' | 'shopDue';
    person: string; // Name of person or shop
    amount: number;
    paidAmount: number;
    status: 'unpaid' | 'partially-paid' | 'paid';
    date: string;
    repaymentDate?: string;
    description?: string;
    createdAt?: any;
}

// UserProfile to match new structure
interface UserProfile {
    points?: number;
    joinDate?: string;
    notifiedMilestones?: number[];
    premiumStatus?: 'free' | 'premium';
    premiumExpiryDate?: any; // firestore timestamp
}

interface PremiumSubscription {
    id: string;
    userId: string;
    planId: string;
    status: 'pending' | 'approved' | 'rejected';
    expiresAt?: any; // Firestore Timestamp
}


interface AppConfig {
    minWithdrawalPoints: number;
    referrerBonusPoints: number;
    referredUserBonusPoints: number;
    bdtPer100Points: number;
}

interface Referral {
    id: string;
    userId: string;
    referredUserId: string;
    referredUserName: string;
    bonusPoints: number;
    createdAt: any;
}


interface BudgetContextType {
    transactions: Transaction[];
    debtNotes: DebtNote[];
    referrals: Referral[];
    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
    addDebtNote: (debtNote: Omit<DebtNote, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
    updateDebtNote: (debtNote: DebtNote, paymentAmount?: number) => Promise<void>;
    totalIncome: number;
    totalExpense: number;
    totalSavings: number;
    rewardPoints: number;
    minWithdrawalPoints: number;
    referrerBonusPoints: number;
    referredUserBonusPoints: number;
    bdtPer100Points: number;
    isLoading: boolean;
    premiumStatus: 'free' | 'premium';
    premiumExpiryDate: Date | null;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const SAVINGS_MILESTONES = [1000, 5000, 10000, 20000, 30000, 40000, 50000, 100000];

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}`);
    }, [user, firestore]);
    
    const { data: userProfile, isLoading: isUserDocLoading } = useDoc<UserProfile>(userDocRef);
    
    const transactionsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/transactions`), orderBy("createdAt", "desc"));
    }, [user, firestore]);
    const { data: transactions = [], isLoading: areTransactionsLoading } = useCollection<Transaction>(transactionsQuery);

    const debtNotesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/debtNotes`), orderBy("createdAt", "desc"));
    }, [user, firestore]);
    const { data: debtNotes = [], isLoading: areDebtNotesLoading } = useCollection<DebtNote>(debtNotesQuery);

    const referralsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/referrals`), orderBy("createdAt", "desc"));
    }, [user, firestore]);
    const { data: referrals = [], isLoading: areReferralsLoading } = useCollection<Referral>(referralsQuery);
    
    const appConfigRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'app_config', 'settings');
    }, [firestore]);

    const { data: appConfig, isLoading: isConfigLoading } = useDoc<AppConfig>(appConfigRef);
    
    const { premiumStatus, premiumExpiryDate } = useMemo(() => {
        if (!userProfile) return { status: 'free', expiryDate: null };
        const status = userProfile.premiumStatus ?? 'free';
        const expiry = userProfile.premiumExpiryDate?.toDate() ?? null;

        if (status === 'premium' && expiry && isAfter(new Date(), expiry)) {
             // TODO: Logic to update status to 'free' in Firestore if expired
            return { status: 'free', expiryDate: null };
        }
        
        return { status, expiryDate: expiry };

    }, [userProfile]);

    const minWithdrawalPoints = appConfig?.minWithdrawalPoints ?? 1000;
    const referrerBonusPoints = appConfig?.referrerBonusPoints ?? 100;
    const referredUserBonusPoints = appConfig?.referredUserBonusPoints ?? 50;
    const bdtPer100Points = appConfig?.bdtPer100Points ?? 5;
    const rewardPoints = userProfile?.points ?? 0;
    
    const totalIncome = useMemo(() => (transactions || []).filter(t => t.type === 'income').reduce((sum, item) => sum + item.amount, 0), [transactions]);
    const totalExpense = useMemo(() => (transactions || []).filter(t => t.type === 'expense').reduce((sum, item) => sum + item.amount, 0), [transactions]);
    
    const totalSavings = useMemo(() => {
        const deposits = (transactions || []).filter(t => t.type === 'expense' && t.category === 'সঞ্চয় ডিপোজিট').reduce((sum, item) => sum + item.amount, 0);
        const withdrawals = (transactions || []).filter(t => t.type === 'income' && t.category === 'সঞ্চয় উত্তোলন').reduce((sum, item) => sum + item.amount, 0);
        return deposits - withdrawals;
    }, [transactions]);


    useEffect(() => {
        if (totalSavings > 0 && userProfile && user && firestore) {
            const notifiedMilestones = userProfile.notifiedMilestones || [];
            
            SAVINGS_MILESTONES.forEach(milestone => {
                if (totalSavings >= milestone && !notifiedMilestones.includes(milestone)) {
                    createNotification({
                        id: `milestone-${milestone}`,
                        title: "অভিনন্দন! সঞ্চয়ের মাইলফলক অর্জন",
                        description: `আপনি সফলভাবে ${new Intl.NumberFormat("bn-BD").format(milestone)} টাকার সঞ্চয়ের মাইলফলক অর্জন করেছেন!`,
                        link: `/milestone?amount=${milestone}` 
                    }, user.uid, firestore);

                    // Update user doc in firestore
                    if (userDocRef) {
                        updateDoc(userDocRef, {
                            notifiedMilestones: arrayUnion(milestone)
                        });
                    }
                }
            });
        }
    }, [totalSavings, userProfile, user, firestore, userDocRef]);
    
    const addDocToCollection = async (collectionName: string, data: any) => {
        if (!user || !firestore) throw new Error("User or firestore not available");
        const collectionRef = collection(firestore, `users/${user.uid}/${collectionName}`);
        await addDoc(collectionRef, {
            ...data,
            userId: user.uid,
            createdAt: serverTimestamp()
        });
    };

    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => {
        await addDocToCollection('transactions', transaction);
    };

    const addDebtNote = async (debtNote: Omit<DebtNote, 'id' | 'createdAt' | 'userId'>) => {
        await addDocToCollection('debtNotes', debtNote);
    }

    const updateDebtNote = async (debtNote: DebtNote, paymentAmount?: number) => {
        if (!user || !firestore || !debtNote.id) return;
    
        const batch = writeBatch(firestore);
        const docRef = doc(firestore, `users/${user.uid}/debtNotes`, debtNote.id);
        
        batch.update(docRef, { paidAmount: debtNote.paidAmount, status: debtNote.status });
        
        if (paymentAmount && paymentAmount > 0) {
            const transactionCollectionRef = collection(firestore, `users/${user.uid}/transactions`);
            const transactionDocRef = doc(transactionCollectionRef);
            
            const transactionData: Omit<Transaction, 'id' | 'createdAt'> = {
                userId: user.uid,
                type: debtNote.type === 'lent' ? 'income' : 'expense',
                category: debtNote.type === 'lent' ? 'ধার ফেরত' : 'ধার পরিশোধ',
                amount: paymentAmount,
                date: new Date().toISOString(),
                description: `${debtNote.person} ${debtNote.type === 'lent' ? 'থেকে প্রাপ্তি' : 'কে পরিশোধ'}`,
            };
        
            batch.set(transactionDocRef, {...transactionData, createdAt: serverTimestamp()});
        }
        
        await batch.commit();
    }
    
    const isLoading = isUserLoading || isUserDocLoading || areTransactionsLoading || areDebtNotesLoading || isConfigLoading || areReferralsLoading;

    return (
        <BudgetContext.Provider value={{ 
            transactions, 
            debtNotes,
            referrals,
            addTransaction, 
            addDebtNote, 
            updateDebtNote, 
            totalIncome, 
            totalExpense, 
            totalSavings, 
            rewardPoints,
            minWithdrawalPoints,
            referrerBonusPoints,
            referredUserBonusPoints,
            bdtPer100Points,
            isLoading,
            premiumStatus,
            premiumExpiryDate,
        }}>
            {children}
        </BudgetContext.Provider>
    );
};

export const useBudget = () => {
    const context = useContext(BudgetContext);
    if (context === undefined) {
        throw new Error('useBudget must be used within a BudgetProvider');
    }
    return context;
};
