import { OverviewCards } from "@/components/overview-cards"
import { OverviewChart } from "@/components/overview-chart"
import { RecentTransactions } from "@/components/recent-transactions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewPieChart } from "@/components/overview-pie-chart"
import { Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { dailyExpenses, monthlyIncome } from "@/lib/data"
import { Separator } from "@/components/ui/separator"

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
          <Separator className="my-4" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-full">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">মাসিক বেতন</p>
                        <p className="text-xs text-muted-foreground">জুলাই ১, ২০২৪</p>
                    </div>
                </div>
                <div className="text-sm font-semibold text-green-600">+{formatCurrency(50000)}</div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-red-100 rounded-full">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">মাসের বাজার</p>
                        <p className="text-xs text-muted-foreground">জুলাই ২৭, ২০২৪</p>
                    </div>
                </div>
                <div className="text-sm font-semibold text-red-600">-{formatCurrency(2500)}</div>
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
