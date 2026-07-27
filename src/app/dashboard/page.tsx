
"use client";

import { OverviewCards } from "@/components/overview-cards"
import { RecentTransactions } from "@/components/recent-transactions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewPieChart } from "@/components/overview-pie-chart"
import { Wallet, Landmark, Smartphone, SmartphoneNfc, Coins, CreditCard } from "lucide-react"
import { useBudget } from "@/context/budget-context";
import { cn } from '@/lib/utils';

export default function DashboardPage() {
    const { totalIncome, totalExpense, totalSavings, walletBreakdown, savingsBreakdown } = useBudget();
    const balance = totalIncome - totalExpense;

    const walletItems = [
        { name: 'ক্যাশ', key: 'ক্যাশ', color: 'text-yellow-600' },
        { name: 'বিকাশ', key: 'বিকাশ', color: 'text-[#E2136E]' },
        { name: 'রকেট', key: 'রকেট', color: 'text-[#8C3494]' },
        { name: 'নগদ', key: 'নগদ', color: 'text-[#F7941D]' }
    ];

  return (
    <div className="flex-1 space-y-4">
      <div className="grid gap-4 grid-cols-2">
        <OverviewCards />
      </div>
      
      <Card className="bg-white/95 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-6 pt-6">
          <CardTitle className="text-lg font-bold text-slate-700 dark:text-slate-300">বর্তমান ব্যালেন্স</CardTitle>
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Wallet className="h-5 w-5 text-slate-500" />
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="mb-4">
              <div className="text-5xl font-black text-slate-900 dark:text-white mb-2 flex items-baseline gap-1">
                {balance.toLocaleString('bn-BD')} <span className="text-2xl font-bold">৳</span>
              </div>
              <p className="text-sm text-slate-500 font-medium">আপনার বর্তমান ব্যবহারযোগ্য ব্যালেন্স</p>
          </div>
          
          {/* Usable Balance Breakdown */}
          <div className="grid grid-cols-4 gap-0 border-t border-slate-100 dark:border-slate-800 pt-4 mb-6">
              {walletItems.map((item, idx) => (
                  <div key={item.key} className={cn(
                      "text-center px-1 flex flex-col items-center",
                      idx !== 3 && "border-r border-slate-100 dark:border-slate-800"
                  )}>
                      <p className={cn("text-[10px] font-bold uppercase tracking-tighter mb-1", item.color)}>{item.name}</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-300">
                          {(walletBreakdown[item.key] || 0).toLocaleString('bn-BD')}
                      </p>
                  </div>
              ))}
          </div>

          <div className="w-full h-px bg-slate-100 dark:bg-slate-800 my-6" />

          {/* Total Savings Section */}
          <div className="flex items-center justify-between group mb-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800 shadow-sm">
                    <Landmark className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">মোট সঞ্চয়</h3>
                    <p className="text-xs text-slate-500">আপনার জমানো অর্থ</p>
                </div>
            </div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {totalSavings.toLocaleString('bn-BD')} ৳
            </div>
          </div>

          {/* Savings Breakdown */}
          <div className="w-full border-t border-dashed border-slate-200 dark:border-slate-700 pt-6">
              <div className="grid grid-cols-4 gap-0">
                  {walletItems.map((item, idx) => (
                      <div key={item.key} className={cn(
                          "text-center px-1 flex flex-col items-center",
                          idx !== 3 && "border-r border-slate-100 dark:border-slate-800"
                      )}>
                          <p className={cn("text-[10px] font-bold uppercase tracking-tighter mb-1", item.color)}>{item.name}</p>
                          <p className="text-sm font-black text-slate-700 dark:text-slate-300">
                              {(savingsBreakdown[item.key] || 0).toLocaleString('bn-BD')}
                          </p>
                      </div>
                  ))}
              </div>
          </div>
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
