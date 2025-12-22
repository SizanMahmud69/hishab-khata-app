
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { type Debt, type ShopDue } from '@/lib/data';
import { useUser } from '@/firebase/provider';
import { useFirestore } from '@/firebase/provider';
import { collection, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { createNotification } from '@/components/app-header';

export interface Income {
    id?: string;
    source: string;
    amount: number;
    date: string;
    description?: string;
    createdAt?: any;
    userId?: string;
}

export interface Expense {
    id?: string;
    date: string;
    category: string;
    amount: number;
    description: string;
    createdAt?: any;
    userId?: string;
}

export interface Saving {
    id?: string;
    date: string;
    description: string;
    amount: number;
    createdAt?: any;
    userId?: string;
}

interface UserProfile {
    rewardPoints?: number;
}

interface BudgetContextType {
    income: Income[];
    expenses: Expense[];
    savings: Saving[];
    debts: Debt[];
    shopDues: ShopDue[];
    addIncome: (income: Omit<Income, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
    addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
    addSaving: (saving: Omit<Saving, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
    addDebt: (debt: Omit<Debt, 'id'>) => Promise<void>;
    updateDebt: (debt: Debt) => Promise<void>;
    addShopDue: (shopDue: Omit<ShopDue, 'id'>) => Promise<void>;
    updateShopDue: (shopDue: ShopDue) => Promise<void>;
    totalIncome: number;
    totalExpense: number;
    totalSavings: number;
    rewardPoints: number;
    addRewardPoints: (points: number) => void;
    deductRewardPoints: (points: number) => void;
    isLoading: boolean;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const SAVINGS_MILESTONES = [1000, 5000, 10000, 20000, 30000, 40000, 50000, 100000];

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    
    const [income, setIncome] = useState<Income[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [savings, setSavings] = useState<Saving[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [shopDues, setShopDues] = useState<ShopDue[]>([]);
    const [rewardPoints, setRewardPoints] = useState(0);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const totalIncome = useMemo(() => income.reduce((sum, item) => sum + item.amount, 0), [income]);
    const totalExpense = useMemo(() => expenses.reduce((sum, item) => sum + item.amount, 0), [expenses]);
    
    const checkSavingsMilestones = useCallback((currentSavings: number, previousSavings: number) => {
        if (typeof window === 'undefined') return;

        const notifiedMilestonesStr = localStorage.getItem('notifiedSavingsMilestones') || '[]';
        const notifiedMilestones: number[] = JSON.parse(notifiedMilestonesStr);

        SAVINGS_MILESTONES.forEach(milestone => {
            if (currentSavings >= milestone && previousSavings < milestone && !notifiedMilestones.includes(milestone)) {
                createNotification({
                    title: "অভিনন্দন! সঞ্চয়ের মাইলফলক অর্জন",
                    description: `আপনি সফলভাবে ${new Intl.NumberFormat("bn-BD").format(milestone)} টাকার সঞ্চয়ের মাইলফলক অর্জন করেছেন!`,
                    link: `/milestone?amount=${milestone}` 
                });
                notifiedMilestones.push(milestone);
            }
        });

        localStorage.setItem('notifiedSavingsMilestones', JSON.stringify(notifiedMilestones));
    }, []);

    const totalSavings = useMemo(() => {
        const currentTotal = savings.reduce((sum, item) => sum + item.amount, 0);
        return currentTotal;
    }, [savings]);

    useEffect(() => {
        const previousSavings = parseFloat(localStorage.getItem('previousTotalSavings') || '0');
        if(totalSavings > previousSavings) {
             checkSavingsMilestones(totalSavings, previousSavings);
        }
        localStorage.setItem('previousTotalSavings', totalSavings.toString());

    }, [totalSavings, checkSavingsMilestones]);


     useEffect(() => {
        if (isUserLoading) {
            setIsDataLoading(true);
            return;
        }
        if (!user || !firestore) {
            setIsDataLoading(false);
            setIncome([]);
            setExpenses([]);
            setSavings([]);
            setDebts([]);
            setShopDues([]);
            setRewardPoints(0);
            return;
        }

        setIsDataLoading(true);
        const basePath = `users/${user.uid}`;
        const listeners: (() => void)[] = [];
        let activeListeners = 6; // sub-collections + user doc
        
        const onDataLoaded = () => {
            activeListeners--;
            if (activeListeners === 0) {
                setIsDataLoading(false);
            }
        };

        const createSnapshotListener = <T>(collectionName: string, setData: React.Dispatch<React.SetStateAction<T[]>>) => {
            const collectionRef = collection(firestore, basePath, collectionName);
            const listener = onSnapshot(collectionRef, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
                setData(data);
                onDataLoaded();
            }, (err) => {
                console.error(`Error fetching ${collectionName}:`, err);
                onDataLoaded();
            });
            listeners.push(listener);
        };

        // Listener for the main user document to get reward points
        const userDocRef = doc(firestore, basePath);
        const unsubUser = onSnapshot(userDocRef, (snapshot) => {
            const userData = snapshot.data() as UserProfile | undefined;
            setRewardPoints(userData?.rewardPoints || 0);
            onDataLoaded();
        }, (err) => {
            console.error("User profile fetch error: ", err);
            onDataLoaded();
        });
        listeners.push(unsubUser);

        createSnapshotListener<Income>('income', setIncome);
        createSnapshotListener<Expense>('expenses', setExpenses);
        createSnapshotListener<Saving>('savings', setSavings);
        createSnapshotListener<Debt>('debts', setDebts);
        createSnapshotListener<ShopDue>('shopDues', setShopDues);
        
        return () => listeners.forEach(unsub => unsub());

    }, [user, firestore, isUserLoading]);
    
    const addDocToCollection = async (collectionName: string, data: any) => {
        if (!user || !firestore) throw new Error("User or firestore not available");
        const collectionRef = collection(firestore, `users/${user.uid}/${collectionName}`);
        await addDoc(collectionRef, {
            ...data,
            userId: user.uid,
            createdAt: serverTimestamp()
        });
    };

    const addIncome = async (newIncome: Omit<Income, 'id' | 'createdAt' | 'userId'>) => {
        await addDocToCollection('income', newIncome);
    };

    const addExpense = async (newExpense: Omit<Expense, 'id' | 'createdAt' | 'userId'>) => {
        await addDocToCollection('expenses', newExpense);
    };

    const addSaving = async (newSaving: Omit<Saving, 'id' | 'createdAt' | 'userId'>) => {
       await addDocToCollection('savings', newSaving);
    }
    
    const addDebt = async (debt: Omit<Debt, 'id'>) => {
        await addDocToCollection('debts', debt);
    }

    const updateDebt = async (debt: Debt) => {
        if (!user || !firestore || !debt.id) return;
        const docRef = doc(firestore, `users/${user.uid}/debts`, debt.id);
        await updateDoc(docRef, { ...debt });
    }


    const addShopDue = async (shopDue: Omit<ShopDue, 'id'>) => {
        await addDocToCollection('shopDues', shopDue);
    }

    const updateShopDue = async (shopDue: ShopDue) => {
        if (!user || !firestore || !shopDue.id) return;
        const docRef = doc(firestore, `users/${user.uid}/shopDues`, shopDue.id);
        await updateDoc(docRef, { ...shopDue });
    }
    
    const updateRewardPoints = async (points: number) => {
        if (!user || !firestore) return;
        const currentPoints = rewardPoints;
        const newPoints = currentPoints + points;
        const userDocRef = doc(firestore, `users/${user.uid}`);
        await setDoc(userDocRef, { rewardPoints: newPoints }, { merge: true });
    }

    const addRewardPoints = (points: number) => {
        updateRewardPoints(points);
    }

    const deductRewardPoints = (points: number) => {
        const newPoints = Math.max(0, rewardPoints - points);
        if (!user || !firestore) return;
        const userDocRef = doc(firestore, `users/${user.uid}`);
        setDoc(userDocRef, { rewardPoints: newPoints }, { merge: true });
    }
    
    const isLoading = isUserLoading || isDataLoading;

    return (
        <BudgetContext.Provider value={{ 
            income, 
            expenses, 
            savings, 
            debts, 
            shopDues, 
            addIncome, 
            addExpense, 
            addSaving, 
            addDebt, 
            updateDebt, 
            addShopDue, 
            updateShopDue, 
            totalIncome, 
            totalExpense, 
            totalSavings, 
            rewardPoints, 
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
