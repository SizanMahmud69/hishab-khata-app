
"use client"

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { History, TrendingDown, TrendingUp } from "lucide-react"
import { Button } from "./ui/button"
import Link from "next/link"
import { useBudget } from "@/context/budget-context"
import { parseISO } from "date-fns"
import { cn } from "@/lib/utils";

export function RecentTransactions() {
  const { income, expenses } = useBudget();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const transactions = useMemo(() => {
    if (!income || !expenses) return [];
    const allTransactions = [
      ...income.map(i => ({ ...i, type: 'income' as const, category: i.source, id: i.id || Math.random().toString() })),
      ...expenses.map(e => ({ ...e, type: 'expense' as const, id: e.id || Math.random().toString() }))
    ];

    return allTransactions.sort((a, b) => {
        const dateA = a.date ? (typeof a.date === 'string' ? parseISO(a.date) : a.date) : 0;
        const dateB = b.date ? (typeof b.date === 'string' ? parseISO(b.date) : b.date) : 0;
        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime();
    });
  }, [income, expenses]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>সাম্প্রতিক লেনদেন</CardTitle>
          <CardDescription>এই মাসে আপনার করা সর্বশেষ ৫টি লেনদেন।</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
            <Link href="/history">
                হিস্টোরি <History className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </CardHeader>
      <CardContent>
          <div className="space-y-6">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center">
                <Avatar className="h-10 w-10">
                    <AvatarFallback className={cn("font-bold", transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600')}>
                        {transaction.type === 'income' ? <TrendingUp size={20}/> : <TrendingDown size={20} />}
                    </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{transaction.category}</p>
                  <p className="text-sm text-muted-foreground">{transaction.description}</p>
                </div>
                <div className={cn("ml-auto font-medium", transaction.type === 'income' ? 'text-green-500' : 'text-red-500')}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">কোনো লেনদেন পাওয়া যায়নি।</p>
            )}
          </div>
      </CardContent>
    </Card>
  )
}
