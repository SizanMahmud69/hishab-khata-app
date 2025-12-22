"use client";

import { OverviewCards } from "@/components/overview-cards"
import { RecentTransactions } from "@/components/recent-transactions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewPieChart } from "@/components/overview-pie-chart"
import { Wallet, PiggyBank } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useBudget } from "@/context/budget-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
    const { totalIncome, totalExpense, totalSavings, isLoading } = useBudget();
    const balance = totalIncome - totalExpense - totalSavings;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
      }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="grid gap-4 grid-cols-2">
        <OverviewCards />
      </div>
       <Card className="bg-yellow-50/50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 shadow-yellow-glow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">বর্তমান ব্যালেন্স</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
          <p className="text-xs text-muted-foreground">আপনার বর্তমান ব্যবহারযোগ্য ব্যালেন্স</p>
          {totalSavings > 0 && (
            <>
                <Separator className="my-2" />
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <PiggyBank className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">মোট সঞ্চয়</p>
                                <p className="text-xs text-muted-foreground">আপনার জমানো অর্থ</p>
                            </div>
                        </div>
                        <div className="text-sm font-semibold text-blue-600">{formatCurrency(totalSavings)}</div>
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


function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-4">
      <div className="grid gap-4 grid-cols-2">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-36" />
      <Skeleton className="h-72" />
      <Skeleton className="h-96" />
    </div>
  );
}
