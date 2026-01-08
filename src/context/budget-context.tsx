

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, setDoc, query, getDocs, writeBatch, increment, arrayUnion, orderBy, Unsubscribe, where, limit, Firestore } from 'firebase/firestore';
import { createNotification } from '@/components/app-header';
import { type WithdrawalRequest } from '@/app/withdraw/page';
import { isAfter, addDays, parseISO } from 'date-fns';
import { premiumPlans, type PremiumPlan } from '@/lib/data';

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
    premiumPlanId?: string;
    premiumExpiryDate?: any; // firestore timestamp
}

export interface PremiumSubscription {
    id: string;
    userId: string;
    planId: string;
    status: 'pending' | 'approved' | 'rejected';
    activatedAt?: any;
    expiresAt?: any; // Firestore Timestamp
    createdAt: any;
    paymentMethod?: string;
    pointsSpent?: number;
    amountBdt?: number;
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

interface CheckInRecord {
    id: string;
    date: string; // ISO String
    points: number;
    createdAt: any;
}


export interface PointHistoryItem {
    type: 'earned' | 'spent' | 'refunded';
    source: string;
    points: number;
    date: Date;
    status?: 'pending' | 'approved' | 'rejected';
}


interface BudgetContextType {
    transactions: Transaction[];
    debtNotes: DebtNote[];
    referrals: Referral[];
    pointHistory: PointHistoryItem[];
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
    userProfile: UserProfile | null;
    premiumSubscriptions: PremiumSubscription[];
    pendingSubscriptionPlanIds: string[];
    activePremiumPlan: PremiumPlan | null;
    isSubscriptionsLoading: boolean;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const SAVINGS_MILESTONES = [1000, 5000, 10000, 20000, 30000, 40000, 50000, 100000];


export const BudgetProvider = ({ children }: { children: ReactNode }) => {
    const { user, isLoading: isUserLoading } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, `users/${user.uid}`);
    }, [user, firestore]);
    
    const { data: userProfile, isLoading: isUserDocLoading } = useDoc<UserProfile>(userDocRef);
    
    const transactionsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, `users/${user.uid}/transactions`), orderBy("createdAt", "desc"));
    }, [user, firestore]);
    const { data: transactions = [], isLoading: areTransactionsLoading } = useCollection<Transaction>(transactionsQuery);

    const debtNotesQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, `users/${user.uid}/debtNotes`), orderBy("createdAt", "desc"));
    }, [user, firestore]);
    const { data: debtNotes = [], isLoading: areDebtNotesLoading } = useCollection<DebtNote>(debtNotesQuery);

    const referralsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, `users/${user.uid}/referrals`), orderBy("createdAt", "desc"));
    }, [user, firestore]);
    const { data: referrals = [], isLoading: areReferralsLoading } = useCollection<Referral>(referralsQuery);
    
    const appConfigRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'app_config', 'settings');
    }, [firestore]);
    const { data: appConfig, isLoading: isConfigLoading } = useDoc<AppConfig>(appConfigRef);

    const subscriptionsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/premium_subscriptions`), orderBy("createdAt", "desc"));
    }, [user, firestore]);
    const { data: premiumSubscriptions = [], isLoading: isSubscriptionsLoading } = useCollection<PremiumSubscription>(subscriptionsQuery);
    
    const checkInsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/checkIns`), orderBy("createdAt", "desc"));
    }, [user, firestore]);
    const { data: checkIns = [], isLoading: isCheckInsLoading } = useCollection<CheckInRecord>(checkInsQuery);
    
    const withdrawalsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/withdrawalRequests`), orderBy("requestedAt", "desc"));
    }, [user, firestore]);
    const { data: allWithdrawals = [], isLoading: isWithdrawalsLoading } = useCollection<WithdrawalRequest>(withdrawalsQuery);


    const activateSubscription = useCallback(async (firestore: Firestore, userId: string, subscriptionId: string, planId: string) => {
        const userDocRef = doc(firestore, 'users', userId);
        const plan = premiumPlans.find(p => p.id === planId);
        if (!plan) {
            console.error(`Plan with id ${planId} not found.`);
            return;
        }

        const batch = writeBatch(firestore);
        const expiryDate = plan.durationDays ? addDays(new Date(), plan.durationDays) : null;

        batch.update(userDocRef, {
            premiumStatus: 'premium',
            premiumPlanId: plan.id,
            premiumExpiryDate: expiryDate ? expiryDate : null,
        });

        const subRef = doc(firestore, `users/${userId}/premium_subscriptions`, subscriptionId);
        batch.update(subRef, {
            activatedAt: serverTimestamp(),
            expiresAt: expiryDate ? expiryDate : null,
            status: 'approved' // ensure status is approved
        });

        await batch.commit();

        createNotification({
            id: `premium-activated-${subscriptionId}`,
            title: "সাবস্ক্রিপশন সক্রিয় হয়েছে!",
            description: `আপনার "${plan.title}" প্ল্যানটি সফলভাবে সক্রিয় করা হয়েছে।`,
            link: "/profile",
        }, userId, firestore);
    }, []);

    useEffect(() => {
        if (!user || !firestore) return;
    
        const q = query(
            collection(firestore, `users/${user.uid}/premium_subscriptions`),
            where('status', '==', 'approved'),
            where('activatedAt', '==', null)
        );
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const subToActivate = snapshot.docs[0]; // Activate one by one
                activateSubscription(firestore, user.uid, subToActivate.id, subToActivate.data().planId)
                    .catch(err => console.error("Failed to auto-activate subscription:", err));
            }
        });
    
        return () => unsubscribe(); // Cleanup the listener
    }, [user, firestore, activateSubscription]);
    
    const { premiumStatus, premiumExpiryDate } = useMemo(() => {
        if (!userProfile) return { premiumStatus: 'free', premiumExpiryDate: null };
        const status = userProfile.premiumStatus ?? 'free';
        const expiry = userProfile.premiumExpiryDate?.toDate() ?? null;

        if (status === 'premium' && expiry && isAfter(new Date(), expiry)) {
             if (userDocRef) {
                updateDoc(userDocRef, {
                    premiumStatus: 'free',
                    premiumPlanId: null,
                    premiumExpiryDate: null,
                });
             }
            return { premiumStatus: 'free', premiumExpiryDate: null };
        }
        
        return { premiumStatus: status, premiumExpiryDate: expiry };

    }, [userProfile, userDocRef]);
    
    const pendingSubscriptionPlanIds = useMemo(() => {
        if (!premiumSubscriptions) return [];
        return premiumSubscriptions.filter(s => s.status === 'pending').map(s => s.planId);
    }, [premiumSubscriptions]);

    const activePremiumPlan = useMemo(() => {
        if (premiumStatus !== 'premium' || !userProfile?.premiumPlanId) return null;
        return premiumPlans.find(p => p.id === userProfile.premiumPlanId) || null;
    }, [premiumStatus, userProfile]);
    
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

    const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => {
        if(!user) return;
        await addDocToCollection('transactions', transaction);
    }, [user]);

    const addDebtNote = useCallback(async (debtNote: Omit<DebtNote, 'id' | 'createdAt' | 'userId'>) => {
        if(!user) return;
        await addDocToCollection('debtNotes', debtNote);
    }, [user]);

    const updateDebtNote = useCallback(async (debtNote: DebtNote, paymentAmount?: number) => {
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
    }, [user, firestore]);
    
    const pointHistory = useMemo((): PointHistoryItem[] => {
        const history: PointHistoryItem[] = [];

        if (checkIns) {
            checkIns.forEach(ci => {
                history.push({
                    type: 'earned',
                    source: 'দৈনিক চেক-ইন',
                    points: ci.points,
                    date: parseISO(ci.date)
                });
            });
        }
        
        if (referrals) {
            referrals.forEach(ref => {
                 if (ref.createdAt) {
                    history.push({
                        type: 'earned',
                        source: 'রেফারেল বোনাস',
                        points: ref.bonusPoints,
                        date: ref.createdAt.toDate(),
                    });
                }
            })
        }
        
        if (premiumSubscriptions) {
            premiumSubscriptions.forEach(sub => {
                if (sub.createdAt && sub.paymentMethod === 'points' && sub.pointsSpent) {
                    history.push({
                        type: 'spent',
                        source: 'সাবস্ক্রিপশন ক্রয়',
                        points: sub.pointsSpent,
                        date: sub.createdAt.toDate(),
                        status: sub.status
                    });
                }
            });
        }

        if (allWithdrawals) {
            allWithdrawals.forEach(wd => {
                if (wd.requestedAt) {
                    history.push({
                        type: 'spent',
                        source: 'পয়েন্ট উইথড্র',
                        points: wd.points,
                        date: wd.requestedAt.toDate(),
                        status: wd.status,
                    });
                }
                
                if (wd.status === 'rejected' && wd.isRefunded && wd.processedAt) {
                    history.push({
                        type: 'refunded',
                        source: 'পয়েন্ট রিফান্ড',
                        points: wd.points,
                        date: wd.processedAt.toDate(),
                        status: 'approved' // To show it as a completed transaction
                    });
                }
            });
        }
        
        return history.sort((a, b) => b.date.getTime() - a.date.getTime());

    }, [checkIns, allWithdrawals, referrals, premiumSubscriptions]);
    
    const isLoading = isUserLoading || isUserDocLoading || areTransactionsLoading || areDebtNotesLoading || isConfigLoading || isSubscriptionsLoading || isCheckInsLoading || areReferralsLoading || isWithdrawalsLoading;

    const contextValue = useMemo(() => ({
        transactions, 
        debtNotes,
        referrals,
        pointHistory,
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
        userProfile,
        premiumSubscriptions,
        pendingSubscriptionPlanIds,
        activePremiumPlan,
        isSubscriptionsLoading
    }), [
        transactions, debtNotes, referrals, pointHistory,
        totalIncome, totalExpense, totalSavings,
        rewardPoints, minWithdrawalPoints, referrerBonusPoints, referredUserBonusPoints, bdtPer100Points,
        isLoading, premiumStatus, premiumExpiryDate, userProfile, premiumSubscriptions, 
        pendingSubscriptionPlanIds, activePremiumPlan, isSubscriptionsLoading,
        addTransaction, addDebtNote, updateDebtNote
    ]);

     if (!user && !isUserLoading) {
         const emptyContext: BudgetContextType = {
            transactions: [],
            debtNotes: [],
            referrals: [],
            pointHistory: [],
            addTransaction: async () => {},
            addDebtNote: async () => {},
            updateDebtNote: async () => {},
            totalIncome: 0,
            totalExpense: 0,
            totalSavings: 0,
            rewardPoints: 0,
            minWithdrawalPoints: 1000,
            referrerBonusPoints: 100,
            referredUserBonusPoints: 50,
            bdtPer100Points: 5,
            isLoading: true,
            premiumStatus: 'free',
            premiumExpiryDate: null,
            userProfile: null,
            premiumSubscriptions: [],
            pendingSubscriptionPlanIds: [],
            activePremiumPlan: null,
            isSubscriptionsLoading: true,
        };
        return (
            <BudgetContext.Provider value={emptyContext}>
                {children}
            </BudgetContext.Provider>
        );
    }


    return (
        <BudgetContext.Provider value={contextValue}>
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
