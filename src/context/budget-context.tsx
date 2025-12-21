"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { dailyExpenses as initialExpenses, monthlyIncome as initialIncome, savingsTransactions as initialSavings } from '@/lib/data';

interface Income {
    source: string;
    amount: number;
    date: string;
    description?: string;
}

interface Expense {
    id: number;
    date: string;
    category: string;
    amount: number;
    description: string;
}

interface Saving {
    id: number;
    date: string;
    description: string;
    amount: number;
}

interface BudgetContextType {
    income: Income[];
    expenses: Expense[];
    savings: Saving[];
    addIncome: (income: Income) => void;
    addExpense: (expense: Expense) => void;
    addSaving: (saving: Saving) => void;
    totalIncome: number;
    totalExpense: number;
    totalSavings: number;
    rewardPoints: number;
    addRewardPoints: (points: number) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
    const [income, setIncome] = useState<Income[]>(initialIncome);
    const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
    const [savings, setSavings] = useState<Saving[]>(initialSavings);
    const [rewardPoints, setRewardPoints] = useState(120);

    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [totalSavings, setTotalSavings] = useState(0);

    useEffect(() => {
        setTotalIncome(income.reduce((sum, item) => sum + item.amount, 0));
    }, [income]);

    useEffect(() => {
        setTotalExpense(expenses.reduce((sum, item) => sum + item.amount, 0));
    }, [expenses]);

    useEffect(() => {
        setTotalSavings(savings.reduce((sum, item) => sum + item.amount, 0));
    }, [savings]);

    const addIncome = (newIncome: Income) => {
        setIncome(prev => [...prev, newIncome]);
    };

    const addExpense = (newExpense: Expense) => {
        setExpenses(prev => [...prev, newExpense]);
    };

    const addSaving = (newSaving: Saving) => {
        setSavings(prev => [...prev, newSaving]);
    }

    const addRewardPoints = (points: number) => {
        setRewardPoints(prev => prev + points);
    }

    return (
        <BudgetContext.Provider value={{ income, expenses, savings, addIncome, addExpense, addSaving, totalIncome, totalExpense, totalSavings, rewardPoints, addRewardPoints }}>
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
