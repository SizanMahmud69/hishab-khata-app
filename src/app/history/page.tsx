"use client";

import React, { useState, useMemo } from 'react';
import PageHeader from "@/components/page-header";
import { useBudget } from "@/context/budget-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Filter as FilterIcon, Calendar as CalendarIcon, Tag, RefreshCw } from "lucide-react";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import { bn } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { type DateRange } from "react-day-picker";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function HistoryPage() {
  const { transactions } = useBudget();
  
  // Applied filters
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");

  // Temporary states for the popover
  const [tempDate, setTempDate] = useState<DateRange | undefined>(undefined);
  const [tempCategory, setTempCategory] = useState<string | "all">("all");
  
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);

  // Get unique categories from all transactions
  const uniqueCategories = useMemo(() => {
    const cats = Array.from(new Set(transactions.map(t => t.category)));
    return cats.sort();
  }, [transactions]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
        const timeA = a.createdAt?.seconds || new Date(a.date).getTime() / 1000;
        const timeB = b.createdAt?.seconds || new Date(b.date).getTime() / 1000;
        return timeB - timeA;
    });
  }, [transactions]);
  
  const filteredTransactions = useMemo(() => {
    return sortedTransactions.filter(transaction => {
      // Date Filter logic
      let matchesDate = true;
      if (dateRange && (dateRange.from || dateRange.to)) {
        const transactionDate = parseISO(transaction.date);
        const from = dateRange.from ? startOfDay(dateRange.from) : null;
        const to = dateRange.to ? endOfDay(dateRange.to) : null;

        if (from && to) {
          matchesDate = transactionDate >= from && transactionDate <= to;
        } else if (from) {
          matchesDate = transactionDate >= from;
        } else if (to) {
          matchesDate = transactionDate <= to;
        }
      }

      // Category Filter logic
      const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;

      return matchesDate && matchesCategory;
    });
  }, [sortedTransactions, dateRange, selectedCategory]);

  const filteredTotals = useMemo(() => {
    // CRITICAL: Exclude fund transfers from income/expense totals as they are not real income/expense
    const income = filteredTransactions
        .filter(t => t.type === 'income' && !t.isTransfer)
        .reduce((sum, t) => sum + t.amount, 0);
        
    const expense = filteredTransactions
        .filter(t => t.type === 'expense' && !t.isTransfer)
        .reduce((sum, t) => sum + t.amount, 0);
        
    return { income, expense };
  }, [filteredTransactions]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  const resetFilter = () => {
    setDateRange(undefined);
    setSelectedCategory("all");
    setTempDate(undefined);
    setTempCategory("all");
    setIsPopoverOpen(false);
  }

  const applyFilter = () => {
    setDateRange(tempDate);
    setSelectedCategory(tempCategory);
    setIsPopoverOpen(false);
  }

  return (
    <div className="flex-1 space-y-4 animate-slide-in-right">
      <PageHeader title="হিস্টোরি" description="আপনার সকল লেনদেনের ইতিহাস দেখুন।">
        <Popover open={isPopoverOpen} onOpenChange={(open) => {
          setIsPopoverOpen(open);
          if (open) {
            setTempDate(dateRange);
            setTempCategory(selectedCategory);
          }
        }}>
          <PopoverTrigger asChild>
            <Button variant={dateRange?.from || selectedCategory !== "all" ? "default" : "outline"} size="icon" className="relative">
              <FilterIcon className="h-4 w-4" />
              {(dateRange?.from || selectedCategory !== "all") && (
                 <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] text-white">!</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-4 space-y-4" align="end">
              <div className="text-center font-bold border-b pb-2">ফিল্টার অপশন</div>
              
              {/* Category Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold flex items-center gap-1">
                  <Tag className="h-3 w-3" /> ক্যাটাগরি বাছুন
                </label>
                <Select value={tempCategory} onValueChange={setTempCategory}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="সবগুলো" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
                    {uniqueCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selectors */}
              <div className="space-y-2">
                <label className="text-xs font-semibold flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" /> তারিখ বাছুন
                </label>
                <div className="grid gap-2">
                  <Popover open={isStartCalendarOpen} onOpenChange={setIsStartCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        size="sm"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tempDate?.from && "text-muted-foreground"
                        )}
                      >
                        {tempDate?.from ? format(tempDate.from, "dd/MM/yyyy") : <span>শুরুর তারিখ</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={tempDate?.from}
                        onSelect={(date) => {
                          setTempDate(prev => ({...prev, from: date}));
                          setIsStartCalendarOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover open={isEndCalendarOpen} onOpenChange={setIsEndCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        size="sm"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tempDate?.to && "text-muted-foreground"
                        )}
                      >
                        {tempDate?.to ? format(tempDate.to, "dd/MM/yyyy") : <span>শেষের তারিখ</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={tempDate?.to}
                        onSelect={(date) => {
                          setTempDate(prev => ({...prev, to: date}));
                          setIsEndCalendarOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className='flex w-full gap-2 pt-2'>
                  <Button onClick={applyFilter} className="w-full h-9">
                      ফিল্টার করুন
                  </Button>
                  <Button onClick={resetFilter} variant="ghost" className="w-full h-9 text-red-500 hover:text-red-600 hover:bg-red-50">
                      রিসেট
                  </Button>
              </div>
          </PopoverContent>
        </Popover>
      </PageHeader>
      
       {(dateRange?.from || selectedCategory !== "all") && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <Card className="bg-muted/50 border-dashed border-2">
                    <CardContent className="p-3 text-center text-xs text-muted-foreground flex flex-wrap items-center justify-center gap-2">
                        <span>ফিল্টার চালু:</span>
                        {selectedCategory !== "all" && (
                          <span className="bg-primary/20 text-primary-foreground px-2 py-0.5 rounded-full font-bold">
                            {selectedCategory}
                          </span>
                        )}
                        {dateRange?.from && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                            {format(dateRange.from, "dd/MM/yyyy")} 
                            {dateRange.to && ` - ${format(dateRange.to, "dd/MM/yyyy")}`}
                          </span>
                        )}
                    </CardContent>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                    <Card className="border-green-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
                            <CardTitle className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">ফিল্টারকৃত আয়</CardTitle>
                            <TrendingUp className="h-3 w-3 text-green-600" />
                        </CardHeader>
                        <CardContent className="px-3 pb-3">
                            <div className="text-xl font-black text-green-700">{formatCurrency(filteredTotals.income)}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-red-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
                            <CardTitle className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">ফিল্টারকৃত ব্যয়</CardTitle>
                            <TrendingDown className="h-3 w-3 text-red-500" />
                        </CardHeader>
                        <CardContent className="px-3 pb-3">
                            <div className="text-xl font-black text-red-600">{formatCurrency(filteredTotals.expense)}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )}

      {filteredTransactions.length > 0 ? (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => {
            // Define colors based on transaction type and transfer status
            const isTransfer = transaction.isTransfer || transaction.category === 'ফান্ড ট্রান্সফার';
            const borderClass = isTransfer 
                ? 'border-l-blue-500' 
                : (transaction.type === 'income' ? 'border-l-green-500' : 'border-l-red-500');
            const textClass = isTransfer 
                ? 'text-blue-600' 
                : (transaction.type === 'income' ? 'text-green-700' : 'text-red-600');
            const Icon = isTransfer 
                ? RefreshCw 
                : (transaction.type === 'income' ? TrendingUp : TrendingDown);
            const iconColor = isTransfer 
                ? 'text-blue-500' 
                : (transaction.type === 'income' ? 'text-green-600' : 'text-red-500');

            return (
                <Card key={transaction.id} className={cn("overflow-hidden transition-all duration-300 hover:shadow-md border-l-4", borderClass)}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-tighter">
                            <div className="flex items-center gap-1">
                                <Icon className={cn("h-3 w-3", iconColor)} />
                                <span>{transaction.category}</span>
                            </div>
                            {transaction.date && <span>{format(parseISO(transaction.date), "d MMM, yyyy", { locale: bn })}</span>}
                        </div>
                        
                        <div className="flex justify-between items-baseline">
                          <h3 className={cn("text-xl font-black tabular-nums", textClass)}>
                              {formatCurrency(transaction.amount)}
                          </h3>
                          {transaction.description && <p className="text-[10px] text-muted-foreground italic truncate max-w-[150px]">{transaction.description}</p>}
                        </div>
                    </CardContent>
                </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-muted/20">
          <FilterIcon className="h-10 w-10 text-muted-foreground/30 mb-2" />
          <p className="text-muted-foreground text-sm">এই ফিল্টারের মধ্যে কোনো লেনদেন পাওয়া যায়নি।</p>
          <Button variant="link" onClick={resetFilter} className="mt-2">সবগুলো দেখুন</Button>
        </div>
      )}
    </div>
  );
}
