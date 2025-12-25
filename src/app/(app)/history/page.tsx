
"use client";

import React, { useState, useMemo } from 'react';
import PageHeader from "@/components/page-header";
import { useBudget } from "@/context/budget-context";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calendar as CalendarIcon } from "lucide-react";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import { bn } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { type DateRange } from "react-day-picker";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function HistoryPage() {
  const { transactions } = useBudget();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
        const timeA = a.createdAt?.seconds || new Date(a.date).getTime() / 1000;
        const timeB = b.createdAt?.seconds || new Date(b.date).getTime() / 1000;
        return timeB - timeA;
    });
  }, [transactions]);
  
  const filteredTransactions = useMemo(() => {
    if (!dateRange || (!dateRange.from && !dateRange.to)) {
      return sortedTransactions;
    }
    
    return sortedTransactions.filter(transaction => {
      const transactionDate = parseISO(transaction.date);
      const from = dateRange.from ? startOfDay(dateRange.from) : null;
      const to = dateRange.to ? endOfDay(dateRange.to) : null;

      if (from && to) {
        return transactionDate >= from && transactionDate <= to;
      }
      if (from) {
        return transactionDate >= from;
      }
      if (to) {
        return transactionDate <= to;
      }
      return true;
    });
  }, [sortedTransactions, dateRange]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  const resetFilter = () => {
    setDateRange(undefined);
  }

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="হিস্টোরি" description="আপনার সকল লেনদেনের ইতিহাস দেখুন।" />
      
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "d MMM, y", { locale: bn })} -{" "}
                        {format(dateRange.to, "d MMM, y", { locale: bn })}
                      </>
                    ) : (
                      format(dateRange.from, "d MMM, y", { locale: bn })
                    )
                  ) : (
                    <span>একটি তারিখ সীমা বাছুন</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button onClick={resetFilter} variant="ghost" disabled={!dateRange}>
                ফিল্টার রিসেট
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {filteredTransactions.length > 0 ? (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
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
          <p className="text-muted-foreground">এই তারিখ সীমার মধ্যে কোনো লেনদেন পাওয়া যায়নি।</p>
        </div>
      )}
    </div>
  );
}
