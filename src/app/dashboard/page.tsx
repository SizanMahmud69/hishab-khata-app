
"use client";

import { OverviewCards } from "@/components/overview-cards"
import { RecentTransactions } from "@/components/recent-transactions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewPieChart } from "@/components/overview-pie-chart"
import { Wallet, Landmark, Smartphone, Banknote, CreditCard, Coins } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useBudget } from "@/context/budget-context";
import { cn } from '@/lib/utils';

export default function DashboardPage() {
    const { totalIncome, totalExpense, totalSavings, savingsBreakdown, walletBreakdown } = useBudget();
    const balance = totalIncome - totalExpense;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
      }

  return (
    <div className="flex-1 space-y-4">
      <div className="grid gap-4 grid-cols-2">
        <OverviewCards />
      </div>
      <Card className="bg-yellow-50/50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 shadow-yellow-glow overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">বর্তমান ব্যালেন্স</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{formatCurrency(balance)}</div>
          <p className="text-xs text-muted-foreground">আপনার বর্তমান ব্যবহারযোগ্য মোট ব্যালেন্স</p>
          
          <div className="grid grid-cols-4 gap-1 mt-6 pt-4 border-t border-yellow-200/50 dark:border-yellow-800/50">
                {[
                    { name: 'ক্যাশ', key: 'ক্যাশ', icon: <Coins className="h-3 w-3" /> },
                    { name: 'বিকাশ', key: 'বিকাশ', icon: <Smartphone className="h-3 w-3" /> },
                    { name: 'রকেট', key: 'রকেট', icon: <CreditCard className="h-3 w-3" /> },
                    { name: 'ব্যাংক', key: 'ব্যাংক', icon: <Banknote className="h-3 w-3" /> }
                ].map((item, idx) => (
                    <div key={item.key} className={cn("text-center space-y-1.5", idx > 0 && "border-l border-yellow-100 dark:border-yellow-900/50")}>
                        <div className="flex flex-col items-center gap-1">
                             <div className={cn(
                                 "p-1.5 rounded-full",
                                 (walletBreakdown[item.key] || 0) > 0 ? "bg-primary/20 text-primary-foreground" : "bg-slate-100 text-slate-400"
                             )}>
                                 {item.icon}
                             </div>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">{item.name}</p>
                        </div>
                        <p className={cn(
                            "text-[11px] font-black tracking-tighter leading-none", 
                            (walletBreakdown[item.key] || 0) > 0 ? "text-primary" : "text-slate-400"
                        )}>
                            {formatCurrency(walletBreakdown[item.key] || 0).replace('৳', '')}
                        </p>
                    </div>
                ))}
            </div>

          {totalSavings > 0 && (
            <>
                <div className="mt-8 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                                < Landmark className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">মোট সঞ্চয়</p>
                            </div>
                        </div>
                        <div className="text-base font-black text-blue-600 dark:text-blue-400">{formatCurrency(totalSavings)}</div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-1">
                       {[
                           { name: 'ব্যাংক', key: 'ব্যাংক' },
                           { name: 'বিকাশ', key: 'বিকাশ' },
                           { name: 'ক্যাশ', key: 'ক্যাশ' },
                           { name: 'রকেট', key: 'রকেট' }
                       ].map((item, idx) => (
                           <div key={item.key} className={cn("text-center space-y-1", idx > 0 && "border-l border-blue-100 dark:border-blue-900/50")}>
                               <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none">{item.name}</p>
                               <p className={cn(
                                   "text-[10px] font-black tracking-tight leading-none", 
                                   (savingsBreakdown[item.key] || 0) > 0 ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                               )}>
                                   {formatCurrency(savingsBreakdown[item.key] || 0).replace('৳', '')}
                               </p>
                           </div>
                       ))}
                    </div>
                </div>
            </>
          )}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-6">
        <div>
            <OverviewPieChart />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <RecentTransactions />
      </div>
    </div>
  )
}
