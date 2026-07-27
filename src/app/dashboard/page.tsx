
"use client";

import { OverviewCards } from "@/components/overview-cards"
import { RecentTransactions } from "@/components/recent-transactions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewPieChart } from "@/components/overview-pie-chart"
import { Wallet, Smartphone, CreditCard, Coins, SmartphoneNfc } from "lucide-react"
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

    const walletItems = [
        { name: 'ক্যাশ', key: 'ক্যাশ', icon: <Coins className="h-4 w-4" />, color: "text-yellow-600", bg: "bg-yellow-100" },
        { name: 'বিকাশ', key: 'বিকাশ', icon: <Smartphone className="h-4 w-4" />, color: "text-[#E2136E]", bg: "bg-[#E2136E]/10" },
        { name: 'রকেট', key: 'রকেট', icon: <CreditCard className="h-4 w-4" />, color: "text-[#8C3494]", bg: "bg-[#8C3494]/10" },
        { name: 'নগদ', key: 'নগদ', icon: <SmartphoneNfc className="h-4 w-4" />, color: "text-[#F7941D]", bg: "bg-[#F7941D]/10" }
    ];

  return (
    <div className="flex-1 space-y-4">
      <div className="grid gap-4 grid-cols-2">
        <OverviewCards />
      </div>
      
      <Card className="bg-white/95 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50 dark:bg-slate-800/50">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">বর্তমান ব্যালেন্স</CardTitle>
          <Wallet className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center mb-8">
              <div className="text-4xl font-black text-slate-900 dark:text-white mb-1 drop-shadow-sm">{formatCurrency(balance)}</div>
              <p className="text-xs text-muted-foreground font-medium">আপনার সর্বমোট ব্যবহারযোগ্য ব্যালেন্স</p>
          </div>
          
          <div className="grid grid-cols-4 gap-2 py-4 border-y border-slate-100 dark:border-slate-800">
                {walletItems.map((item, idx) => (
                    <div key={item.key} className={cn("text-center space-y-2", idx > 0 && "border-l border-slate-100 dark:border-slate-800")}>
                        <div className="flex flex-col items-center gap-1.5">
                             <div className={cn(
                                 "p-2 rounded-full shadow-sm",
                                 item.bg
                             )}>
                                 <span className={item.color}>{item.icon}</span>
                             </div>
                             <p className="text-[10px] font-bold text-slate-500 uppercase leading-none">{item.name}</p>
                        </div>
                        <p className={cn(
                            "text-xs font-black tracking-tight", 
                            (walletBreakdown[item.key] || 0) !== 0 ? "text-slate-900 dark:text-slate-100" : "text-slate-300 dark:text-slate-700"
                        )}>
                            {formatCurrency(walletBreakdown[item.key] || 0).replace('৳', '')}
                        </p>
                    </div>
                ))}
            </div>

          {totalSavings > 0 && (
            <div className="mt-6 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                            <SmartphoneNfc className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-100">মোট সঞ্চয়</p>
                    </div>
                    <div className="text-lg font-black text-blue-600 dark:text-blue-400">{formatCurrency(totalSavings)}</div>
                </div>
                
                <div className="grid grid-cols-4 gap-1">
                   {walletItems.map((item, idx) => (
                       <div key={item.key} className={cn("text-center space-y-1", idx > 0 && "border-l border-blue-200/30 dark:border-blue-800/30")}>
                           <p className="text-[9px] font-bold text-blue-400 uppercase leading-none">{item.name}</p>
                           <p className={cn(
                               "text-[11px] font-black tracking-tight leading-none", 
                               (savingsBreakdown[item.key] || 0) > 0 ? "text-blue-700 dark:text-blue-300" : "text-blue-300 dark:text-blue-900/50"
                           )}>
                               {formatCurrency(savingsBreakdown[item.key] || 0).replace('৳', '')}
                           </p>
                       </div>
                   ))}
                </div>
            </div>
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
