
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, setDoc, query, getDocs, writeBatch, increment, arrayUnion, orderBy } from 'firebase/firestore';
import { createNotification } from '@/components/app-header';
import { type WithdrawalRequest } from '@/app/(app)/withdraw/page';

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
}

interface AppConfig {
    minWithdrawalPoints: number;
    referrerBonusPoints: number;
    referredUserBonusPoints: number;
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
    updateDebtNote: (debtNote: DebtNote) => Promise<void>;
    totalIncome: number;
    totalExpense: number;
    totalSavings: number;
    rewardPoints: number;
    minWithdrawalPoints: number;
    referrerBonusPoints: number;
    referredUserBonusPoints: number;
    addRewardPoints: (points: number) => void;
    deductRewardPoints: (points: number) => void;
    isLoading: boolean;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const SAVINGS_MILESTONES = [1000, 5000, 10000, 20000, 30000, 40000, 50000, 100000];

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [debtNotes, setDebtNotes] = useState<DebtNote[]>([]);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [rewardPoints, setRewardPoints] = useState(0);
    const [minWithdrawalPoints, setMinWithdrawalPoints] = useState(1000);
    const [referrerBonusPoints, setReferrerBonusPoints] = useState(100);
    const [referredUserBonusPoints, setReferredUserBonusPoints] = useState(50);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}`);
    }, [user, firestore]);
    const { data: userProfile } = useDoc<UserProfile>(userDocRef);

    const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((sum, item) => sum + item.amount, 0), [transactions]);
    const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((sum, item) => sum + item.amount, 0), [transactions]);
    const totalSavings = useMemo(() => transactions.filter(t => t.category === 'সঞ্চয় ডিপোজিট').reduce((sum, t) => sum + t.amount, 0), [transactions]);


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


     useEffect(() => {
        if (isUserLoading) {
            setIsDataLoading(true);
            return;
        }
        if (!user || !firestore) {
            setIsDataLoading(false);
            setTransactions([]);
            setDebtNotes([]);
            setReferrals([]);
            setRewardPoints(0);
            return;
        }

        setIsDataLoading(true);
        const basePath = `users/${user.uid}`;
        const listeners: (() => void)[] = [];
        let activeListeners = 5; // transactions, debtNotes, user doc, app_config, referrals
        
        const onDataLoaded = () => {
            activeListeners--;
            if (activeListeners === 0) {
                setIsDataLoading(false);
            }
        };

        // Listener for app config
        const appConfigRef = doc(firestore, 'app_config', 'settings');
        const unsubConfig = onSnapshot(appConfigRef, (doc) => {
            if (doc.exists()) {
                const configData = doc.data() as AppConfig;
                setMinWithdrawalPoints(configData.minWithdrawalPoints || 1000);
                setReferrerBonusPoints(configData.referrerBonusPoints || 100);
                setReferredUserBonusPoints(configData.referredUserBonusPoints || 50);
            }
            onDataLoaded();
        }, (err) => {
            console.error("Error fetching app config:", err);
            onDataLoaded();
        });
        listeners.push(unsubConfig);
        
        // Listener for withdrawal requests to handle notifications and refunds
        const withdrawalRequestsRef = collection(firestore, basePath, 'withdrawalRequests');
        const unsubWithdrawals = onSnapshot(withdrawalRequestsRef, async (snapshot) => {
            const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawalRequest));
            const batch = writeBatch(firestore);
            let totalRefundPoints = 0;
            let refundOccurred = false;

            for (const req of requests) {
                if (req.status === 'approved') {
                    await createNotification({
                        id: `wd-status-${req.id}`,
                        title: 'উইথড্র অনুরোধ অনুমোদিত',
                        description: `আপনার ${req.amountBdt} টাকার উইথড্র অনুরোধটি সফল হয়েছে।`,
                        link: '/withdraw?section=history'
                    }, user.uid, firestore);
                } else if (req.status === 'rejected') {
                    await createNotification({
                        id: `wd-status-${req.id}`,
                        title: 'উইথড্র অনুরোধ বাতিল হয়েছে',
                        description: `আপনার উইথড্র অনুরোধটি বাতিল হয়েছে। কারণ: ${req.rejectionReason || 'অজানা'}`,
                        link: '/withdraw?section=history'
                    }, user.uid, firestore);
                }

                if (req.status === 'rejected' && !req.isRefunded) {
                    totalRefundPoints += req.points;
                    const reqRef = doc(firestore, basePath, 'withdrawalRequests', req.id);
                    batch.update(reqRef, { isRefunded: true, processedAt: serverTimestamp() });
                    refundOccurred = true;
                }
            }

            if (refundOccurred && totalRefundPoints > 0) {
                const userRef = doc(firestore, basePath);
                batch.update(userRef, { points: increment(totalRefundPoints) });
                await batch.commit();

                await createNotification({
                    id: `refund-${new Date().toISOString()}`,
                    title: "পয়েন্ট ফেরত দেওয়া হয়েছে",
                    description: `আপনার বাতিল হওয়া অনুরোধের জন্য ${totalRefundPoints} পয়েন্ট ফেরত দেওয়া হয়েছে।`,
                    link: "/rewards?section=history"
                }, user.uid, firestore);
            }
        });
        listeners.push(unsubWithdrawals);

        const createSnapshotListener = <T>(collectionName: string, setData: React.Dispatch<React.SetStateAction<T[]>>) => {
            const collectionRef = collection(firestore, basePath, collectionName);
            const q = query(collectionRef, orderBy("createdAt", "desc"));
            const listener = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
                setData(data);
                onDataLoaded();
            }, (err) => {
                console.error(`Error fetching ${collectionName}:`, err);
                onDataLoaded();
            });
            listeners.push(listener);
        };

        const userDocListener = onSnapshot(userDocRef!, (snapshot) => {
            const userData = snapshot.data() as UserProfile | undefined;
            setRewardPoints(userData?.points || 0);
            onDataLoaded();
        }, (err) => {
            console.error("User profile fetch error: ", err);
            onDataLoaded();
        });
        listeners.push(userDocListener);

        createSnapshotListener<Transaction>('transactions', setTransactions);
        createSnapshotListener<DebtNote>('debtNotes', setDebtNotes);
        createSnapshotListener<Referral>('referrals', setReferrals);
        
        return () => listeners.forEach(unsub => unsub());

    }, [user, firestore, isUserLoading, userDocRef]);
    
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

    const updateDebtNote = async (debtNote: DebtNote) => {
        if (!user || !firestore || !debtNote.id) return;
        const docRef = doc(firestore, `users/${user.uid}/debtNotes`, debtNote.id);
        await updateDoc(docRef, { ...debtNote });
    }
    
    const updateRewardPoints = async (points: number, operation: 'add' | 'deduct') => {
        if (!user || !firestore) return;
        
        try {
            const currentPoints = rewardPoints;
            
            let newPoints = 0;
            if (operation === 'add') {
                newPoints = currentPoints + points;
            } else {
                newPoints = Math.max(0, currentPoints - points);
            }
            
            await setDoc(userDocRef!, { points: newPoints }, { merge: true });
        } catch (e) {
            console.error("Error updating points: ", e);
        }
    }

    const addRewardPoints = (points: number) => {
        updateRewardPoints(points, 'add');
    }

    const deductRewardPoints = async (pointsToDeduct: number) => {
       await updateRewardPoints(pointsToDeduct, 'deduct');
    };
    
    const isLoading = isUserLoading || isDataLoading;

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
            addRewardPoints, 
            deductRewardPoints, 
            isLoading 
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
