
"use client";

import PageHeader from "@/components/page-header";
import { useBudget } from "@/context/budget-context";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { bn } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const { transactions } = useBudget();

  const sortedTransactions = transactions.sort((a, b) => {
      const timeA = a.createdAt?.seconds || new Date(a.date).getTime() / 1000;
      const timeB = b.createdAt?.seconds || new Date(b.date).getTime() / 1000;
      return timeB - timeA;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="হিস্টোরি" description="আপনার সকল লেনদেনের ইতিহাস দেখুন।" />
      
      {sortedTransactions.length > 0 ? (
        <div className="space-y-3">
          {sortedTransactions.map((transaction) => (
            <Card key={transaction.id} className={cn("overflow-hidden", transaction.type === 'income' ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800')}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-2">
                            {transaction.type === 'income' ? 
                                <TrendingUp className="h-4 w-4 text-green-500" /> : 
                                <TrendingDown className="h-4 w-4 text-red-500" />}
                            <span>{transaction.category}</span>
                        </div>
                        {transaction.date && <span>{format(parseISO(transaction.date), "d MMM, yyyy", { locale: bn })}</span>}
                    </div>
                    
                    <h3 className={cn("text-2xl font-bold", transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                        {formatCurrency(transaction.amount)}
                    </h3>

                    {transaction.description && <p className="text-sm text-muted-foreground mt-1">{transaction.description}</p>}
                </CardContent>
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
