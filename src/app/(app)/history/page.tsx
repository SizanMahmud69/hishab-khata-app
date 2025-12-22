"use client";

import { useMemo } from "react";
import PageHeader from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useBudget } from "@/context/budget-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { bn } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const { income, expenses, isLoading } = useBudget();

  const transactions = useMemo(() => {
    const allTransactions = [
      ...income.map(i => ({ ...i, type: 'income' as const, category: i.source, id: Math.random().toString() })),
      ...expenses.map(e => ({ ...e, type: 'expense' as const }))
    ];

    return allTransactions.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [income, expenses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4">
        <div className="grid gap-1 mb-6">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="হিস্টোরি" description="আপনার সকল লেনদেনের ইতিহাস দেখুন।" />
      
      {transactions.length > 0 ? (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className={cn("overflow-hidden", transaction.type === 'income' ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800')}>
                <div className="p-4 pb-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'} className={cn(transaction.type === 'income' && 'bg-green-500 hover:bg-green-600')}>
                                {transaction.type === 'income' ? 'আয়' : 'ব্যয়'}
                            </Badge>
                            <h3 className="text-xl font-bold mt-1">{formatCurrency(transaction.amount)}</h3>
                            <p className="text-sm text-muted-foreground">{transaction.category}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {transaction.type === 'income' ? 
                                <TrendingUp className="h-4 w-4 text-green-500" /> : 
                                <TrendingDown className="h-4 w-4 text-red-500" />}
                            <span>{format(parseISO(transaction.date), "d MMM, yyyy", { locale: bn })}</span>
                        </div>
                    </div>
                    {transaction.description && <p className="text-xs text-muted-foreground mt-2">{transaction.description}</p>}
                </div>
              <CardFooter className="bg-muted/50 px-4 py-2 mt-3 flex justify-end gap-1">
                <Button variant="ghost" size="sm" className="h-8">
                    <Edit className="mr-2 h-3.5 w-3.5" />
                    সম্পাদনা
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 h-8">
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    মুছুন
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-96 border rounded-lg">
          <p className="text-muted-foreground">কোনো লেনদেন পাওয়া যায়নি।</p>
        </div>
      )}
    </div>
  );
}
