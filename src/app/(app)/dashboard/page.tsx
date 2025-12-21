import { OverviewCards } from "@/components/overview-cards"
import { OverviewChart } from "@/components/overview-chart"
import { RecentTransactions } from "@/components/recent-transactions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewPieChart } from "@/components/overview-pie-chart"
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Landmark } from "lucide-react"
import { dailyExpenses, monthlyIncome, savingsTransactions } from "@/lib/data"
import { Separator } from "@/components/ui/separator"

export default function DashboardPage() {
    const totalIncome = monthlyIncome.reduce((sum, item) => sum + item.amount, 0)
    const totalExpense = dailyExpenses.reduce((sum, item) => sum + item.amount, 0)
    const totalSavings = savingsTransactions.reduce((sum, item) => sum + item.amount, 0)
    const balance = totalIncome - totalExpense - totalSavings

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
          <p className="text-xs text-muted-foreground">আপনার বর্তমান ব্যবহারযোগ্য ব্যালেন্স</p>
          <Separator className="my-4" />
          <div className="space-y-3">
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
            {savingsTransactions.slice(0, 2).map(transaction => (
                 <div key={transaction.id} className="flex items-center justify-between pl-8">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-100 rounded-full">
                            <Landmark className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString('bn-BD')}</p>
                        </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-600">+{formatCurrency(transaction.amount)}</div>
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
