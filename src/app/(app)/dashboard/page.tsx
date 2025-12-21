import { OverviewCards } from "@/components/overview-cards"
import { OverviewChart } from "@/components/overview-chart"
import { RecentTransactions } from "@/components/recent-transactions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewPieChart } from "@/components/overview-pie-chart"
import { Wallet } from "lucide-react"
import { dailyExpenses, monthlyIncome } from "@/lib/data"

export default function DashboardPage() {
    const totalIncome = monthlyIncome.reduce((sum, item) => sum + item.amount, 0)
    const totalExpense = dailyExpenses.reduce((sum, item) => sum + item.amount, 0)
    const balance = totalIncome - totalExpense

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
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">বর্তমান ব্যালেন্স</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
          <p className="text-xs text-muted-foreground">আপনার বর্তমান সঞ্চয়</p>
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
