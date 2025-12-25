
"use client";

import React, { useState, useMemo } from 'react';
import PageHeader from "@/components/page-header";
import { useBudget } from "@/context/budget-context";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Filter as FilterIcon } from "lucide-react";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import { bn } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { type DateRange } from "react-day-picker";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

export default function HistoryPage() {
  const { transactions } = useBudget();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(undefined);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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
    setTempDateRange(undefined);
  }

  const applyFilter = () => {
    setDateRange(tempDateRange);
    setIsPopoverOpen(false);
  }

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="হিস্টোরি" description="আপনার সকল লেনদেনের ইতিহাস দেখুন।">
        <div className="flex items-center gap-2">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <FilterIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="end">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label className="font-medium text-center block">তারিখ সীমা বাছুন</Label>
                         <div className="flex flex-col sm:flex-row gap-4">
                            <div>
                                <Label className='text-sm text-muted-foreground'>শুরুর তারিখ</Label>
                                <Calendar
                                    mode="single"
                                    selected={tempDateRange?.from}
                                    onSelect={(date) => setTempDateRange(prev => ({...prev, from: date}))}
                                    defaultMonth={tempDateRange?.from}
                                    initialFocus
                                />
                            </div>
                             <div>
                                <Label className='text-sm text-muted-foreground'>শেষের তারিখ</Label>
                                <Calendar
                                    mode="single"
                                    selected={tempDateRange?.to}
                                    onSelect={(date) => setTempDateRange(prev => ({...prev, to: date}))}
                                    defaultMonth={tempDateRange?.to}
                                    initialFocus
                                />
                            </div>
                         </div>
                    </div>
                    <Button onClick={applyFilter} disabled={!tempDateRange?.from && !tempDateRange?.to}>ফিল্টার করুন</Button>
                  </div>
              </PopoverContent>
            </Popover>
            <Button onClick={resetFilter} variant="ghost" disabled={!dateRange}>
                ফিল্টার রিসেট
            </Button>
        </div>
      </PageHeader>
      
       {dateRange?.from && (
            <Card className="bg-muted/50">
                <CardContent className="p-3 text-center text-sm text-muted-foreground">
                    ফিল্টার চালু আছে: 
                    <span className="font-semibold mx-1">
                         {format(dateRange.from, "d MMM, y", { locale: bn })}
                    </span>
                    {dateRange.to && (
                        <>
                           থেকে
                           <span className="font-semibold ml-1">
                                {format(dateRange.to, "d MMM, y", { locale: bn })}
                           </span>
                        </>
                    )}
                </CardContent>
            </Card>
        )}

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
