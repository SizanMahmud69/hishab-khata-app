
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { type Debt, type ShopDue } from '@/lib/data';
import { useUser } from '@/firebase/provider';
import { useFirestore } from '@/firebase/provider';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, writeBatch, setDoc, query } from 'firebase/firestore';

export interface Income {
    id?: string;
    source: string;
    amount: number;
    date: string;
    description?: string;
    createdAt: any;
    userId: string;
}

export interface Expense {
    id: string;
    date: string;
    category: string;
    amount: number;
    description: string;
    createdAt: any;
    userId: string;
}

export interface Saving {
    id: string;
    date: string;
    description: string;
    amount: number;
    createdAt: any;
    userId: string;
}

interface BudgetContextType {
    income: Income[];
    expenses: Expense[];
    savings: Saving[];
    debts: Debt[];
    shopDues: ShopDue[];
    setDebts: (debts: Debt[]) => Promise<void>;
    setShopDues: (shopDues: ShopDue[]) => Promise<void>;
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

        const createSnapshotListener = (collectionName: string, setData: React.Dispatch<React.SetStateAction<any[]>>) => {
            const collectionRef = collection(firestore, basePath, collectionName);
            return onSnapshot(collectionRef, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setData(data);
                onDataLoaded();
            }, (err) => {
                console.error(`Error fetching ${collectionName}:`, err);
                onDataLoaded();
            });
        };

        const rewardsDocRef = doc(firestore, basePath, 'rewards/summary');
        const unsubRewards = onSnapshot(rewardsDocRef, (snapshot) => {
            setRewardPoints(snapshot.data()?.points || 0);
            onDataLoaded();
        }, (err) => {
            console.error("Rewards fetch error: ", err);
            onDataLoaded();
        });


        const unsubscribes = [
            createSnapshotListener('income', setIncome),
            createSnapshotListener('expenses', setExpenses),
            createSnapshotListener('savings', setSavings),
            createSnapshotListener('debts', setDebts),
            createSnapshotListener('shopDues', setShopDues),
            unsubRewards
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

    const addDocToCollection = async (collectionName: string, data: object) => {
        if (!user) throw new Error("User not logged in");
        const dataToSave = {
            ...data,
            userId: user.uid,
            createdAt: serverTimestamp()
        };
        const collectionRef = getCollectionRef(collectionName);
        await addDoc(collectionRef, dataToSave);
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
            if (!debt.id) return;
            const docRef = doc(firestore, `users/${user.uid}/debts`, debt.id);
            batch.set(docRef, debt);
        });
        await batch.commit();
    }

    const setShopDuesFirebase = async (newShopDues: ShopDue[]) => {
        if (!user || !firestore) return;
        const batch = writeBatch(firestore);
        newShopDues.forEach(due => {
            if (!due.id) return;
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

    

    