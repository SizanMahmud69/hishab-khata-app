
"use client";

import { OverviewCards } from "@/components/overview-cards"
import { RecentTransactions } from "@/components/recent-transactions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewPieChart } from "@/components/overview-pie-chart"
import { Wallet, Landmark } from "lucide-react"
import { useBudget } from "@/context/budget-context";
import { cn } from '@/lib/utils';

export default function DashboardPage() {
    const { totalIncome, totalExpense, totalSavings, walletBreakdown, savingsBreakdown } = useBudget();
    const balance = totalIncome - totalExpense;

    // Items for the Usable Balance section with subtle brand backgrounds
    const walletItems = [
        { name: 'ক্যাশ', key: 'ক্যাশ', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-100 dark:border-yellow-900/20' },
        { name: 'বিকাশ', key: 'বিকাশ', color: 'text-[#E2136E]', bg: 'bg-[#E2136E]/5 dark:bg-[#E2136E]/10', border: 'border-[#E2136E]/10 dark:border-[#E2136E]/20' },
        { name: 'রকেট', key: 'রকেট', color: 'text-[#8C3494]', bg: 'bg-[#8C3494]/5 dark:bg-[#8C3494]/10', border: 'border-[#8C3494]/10 dark:border-[#8C3494]/20' },
        { name: 'নগদ', key: 'নগদ', color: 'text-[#F7941D]', bg: 'bg-[#F7941D]/5 dark:bg-[#F7941D]/10', border: 'border-[#F7941D]/10 dark:border-[#F7941D]/20' }
    ];

    // Items for the Savings section with subtle brand backgrounds
    const savingsItems = [
        { name: 'ব্যাংক', key: 'নগদ', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-100 dark:border-blue-900/20' }, 
        { name: 'বিকাশ', key: 'বিকাশ', color: 'text-[#E2136E]', bg: 'bg-[#E2136E]/5 dark:bg-[#E2136E]/10', border: 'border-[#E2136E]/10 dark:border-[#E2136E]/20' },
        { name: 'রকেট', key: 'রকেট', color: 'text-[#8C3494]', bg: 'bg-[#8C3494]/5 dark:bg-[#8C3494]/10', border: 'border-[#8C3494]/10 dark:border-[#8C3494]/20' },
        { name: 'নগদ', key: 'zero', color: 'text-[#F7941D]', bg: 'bg-[#F7941D]/5 dark:bg-[#F7941D]/10', border: 'border-[#F7941D]/10 dark:border-[#F7941D]/20' }
    ];

  return (
    <div className="flex-1 space-y-4">
      <div className="grid gap-4 grid-cols-2">
        <OverviewCards />
      </div>
      
      <Card className="border-white/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-6 pt-6">
          <CardTitle className="text-lg font-bold text-slate-700 dark:text-slate-300">বর্তমান ব্যালেন্স</CardTitle>
          <div className="p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg">
            <Wallet className="h-5 w-5 text-slate-500" />
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="mb-6">
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-2 flex items-baseline gap-1">
                {balance.toLocaleString('bn-BD')} <span className="text-2xl font-bold">৳</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">আপনার বর্তমান ব্যবহারযোগ্য ব্যালেন্স</p>
          </div>
          
          {/* Usable Balance Breakdown with Brand-Colored Subtle Cards */}
          <div className="grid grid-cols-4 gap-2 mb-8">
              {walletItems.map((item) => (
                  <div key={item.key} className={cn("rounded-xl p-1.5 shadow-sm border flex flex-col items-center justify-center transition-transform active:scale-95", item.bg, item.border)}>
                      <p className={cn("text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter mb-0.5", item.color)}>{item.name}</p>
                      <p className="text-[11px] sm:text-xs font-black text-slate-700 dark:text-slate-300">
                          {(walletBreakdown[item.key] || 0).toLocaleString('bn-BD')}
                      </p>
                  </div>
              ))}
          </div>

          <div className="w-full h-px bg-slate-200/50 dark:bg-slate-800 my-6" />

          {/* Total Savings Section */}
          <div className="flex items-center justify-between group mb-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100/50 dark:border-blue-800 shadow-sm">
                    < Landmark className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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

          {/* Savings Breakdown with Brand-Colored Subtle Cards */}
          <div className="grid grid-cols-4 gap-2">
              {savingsItems.map((item) => (
                  <div key={item.name} className={cn("rounded-xl p-1.5 shadow-sm border flex flex-col items-center justify-center transition-transform active:scale-95", item.bg, item.border)}>
                      <p className={cn("text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter mb-0.5", item.color)}>{item.name}</p>
                      <p className="text-[11px] sm:text-xs font-black text-slate-700 dark:text-slate-300">
                          {item.key === 'zero' ? "০" : (savingsBreakdown[item.key] || 0).toLocaleString('bn-BD')}
                      </p>
                  </div>
              ))}
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
