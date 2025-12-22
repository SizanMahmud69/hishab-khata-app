
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { type Debt, type ShopDue } from '@/lib/data';
import { useUser } from '@/firebase/provider';
import { useFirestore } from '@/firebase/provider';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, writeBatch, setDoc } from 'firebase/firestore';

export interface Income {
    id?: string;
    source: string;
    amount: number;
    date: string;
    description?: string;
    createdAt?: any;
}

export interface Expense {
    id: string;
    date: string;
    category: string;
    amount: number;
    description: string;
    createdAt: any;
}

export interface Saving {
    id: string;
    date: string;
    description: string;
    amount: number;
    createdAt: any;
}

interface BudgetContextType {
    income: Income[];
    expenses: Expense[];
    savings: Saving[];
    debts: Debt[];
    shopDues: ShopDue[];
    setDebts: (debts: Debt[]) => Promise<void>;
    setShopDues: (shopDues: ShopDue[]) => Promise<void>;
    addIncome: (income: Omit<Income, 'id' | 'createdAt'>) => Promise<void>;
    addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
    addSaving: (saving: Omit<Saving, 'id' | 'createdAt'>) => Promise<void>;
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

    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [totalSavings, setTotalSavings] = useState(0);

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
        let activeListeners = 6;
        
        const onDataLoaded = () => {
            activeListeners--;
            if (activeListeners === 0) {
                setIsDataLoading(false);
            }
        };

        const unsubscribes = [
            onSnapshot(collection(firestore, basePath, 'income'), (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Income));
                setIncome(data);
                onDataLoaded();
            }, onDataLoaded),
            onSnapshot(collection(firestore, basePath, 'expenses'), (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
                setExpenses(data);
                onDataLoaded();
            }, onDataLoaded),
            onSnapshot(collection(firestore, basePath, 'savings'), (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Saving));
                setSavings(data);
                onDataLoaded();
            }, onDataLoaded),
            onSnapshot(collection(firestore, basePath, 'debts'), (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Debt));
                setDebts(data);
                onDataLoaded();
            }, onDataLoaded),
            onSnapshot(collection(firestore, basePath, 'shopDues'), (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShopDue));
                setShopDues(data);
                onDataLoaded();
            }, onDataLoaded),
            onSnapshot(doc(firestore, `users/${user.uid}/rewards`, 'summary'), (snapshot) => {
                setRewardPoints(snapshot.data()?.points || 0);
                onDataLoaded();
            }, onDataLoaded)
        ];
        
        return () => unsubscribes.forEach(unsub => unsub());

    }, [user, firestore, isUserLoading]);


    useEffect(() => {
        setTotalIncome(income.reduce((sum, item) => sum + item.amount, 0));
    }, [income]);

    useEffect(() => {
        setTotalExpense(expenses.reduce((sum, item) => sum + item.amount, 0));
    }, [expenses]);

    useEffect(() => {
        setTotalSavings(savings.reduce((sum, item) => sum + item.amount, 0));
    }, [savings]);

    const getCollectionRef = (name: string) => {
        if (!user || !firestore) throw new Error("User or firestore not available");
        return collection(firestore, `users/${user.uid}/${name}`);
    }

    const addDocToCollection = async (collectionName: string, data: any) => {
        if (!user) throw new Error("User not logged in");
        await addDoc(getCollectionRef(collectionName), { ...data, createdAt: serverTimestamp(), userId: user.uid });
    }
    
    const addIncome = async (newIncome: Omit<Income, 'id' | 'createdAt'>) => {
        await addDocToCollection('income', newIncome);
    };

    const addExpense = async (newExpense: Omit<Expense, 'id' | 'createdAt'>) => {
        await addDocToCollection('expenses', newExpense);
    };

    const addSaving = async (newSaving: Omit<Saving, 'id' | 'createdAt'>) => {
       await addDocToCollection('savings', newSaving);
    }
    
    const addDebt = async (debt: Omit<Debt, 'id'>) => {
        await addDocToCollection('debts', debt);
    }

    const updateDebt = async (debt: Debt) => {
        if (!user || !firestore) return;
        const docRef = doc(firestore, `users/${user.uid}/debts`, debt.id);
        await updateDoc(docRef, { ...debt });
    }

    const addShopDue = async (shopDue: Omit<ShopDue, 'id'>) => {
        await addDocToCollection('shopDues', shopDue);
    }

    const updateShopDue = async (shopDue: ShopDue) => {
        if (!user || !firestore) return;
        const docRef = doc(firestore, `users/${user.uid}/shopDues`, shopDue.id);
        await updateDoc(docRef, { ...shopDue });
    }
    
    const updateRewardPoints = async (points: number) => {
        if (!user || !firestore) return;
        const rewardRef = doc(firestore, `users/${user.uid}/rewards`, 'summary');
        await setDoc(rewardRef, { points }, { merge: true });
    }

    const addRewardPoints = (points: number) => {
        const newPoints = rewardPoints + points;
        setRewardPoints(newPoints);
        updateRewardPoints(newPoints);
    }

    const deductRewardPoints = (points: number) => {
        const newPoints = Math.max(0, rewardPoints - points);
        setRewardPoints(newPoints);
        updateRewardPoints(newPoints);
    }

    const setDebtsFirebase = async (newDebts: Debt[]) => {
        if (!user || !firestore) return;
        const batch = writeBatch(firestore);
        newDebts.forEach(debt => {
            const docRef = doc(firestore, `users/${user.uid}/debts`, debt.id);
            batch.set(docRef, debt);
        });
        await batch.commit();
    }

    const setShopDuesFirebase = async (newShopDues: ShopDue[]) => {
        if (!user || !firestore) return;
        const batch = writeBatch(firestore);
        newShopDues.forEach(due => {
            const docRef = doc(firestore, `users/${user.uid}/shopDues`, due.id);
            batch.set(docRef, due);
        });
        await batch.commit();
    }
    
    const isLoading = isUserLoading || isDataLoading;

    return (
        <BudgetContext.Provider value={{ 
            income, 
            expenses, 
            savings, 
            debts, 
            setDebts: setDebtsFirebase, 
            shopDues, 
            setShopDues: setShopDuesFirebase, 
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
