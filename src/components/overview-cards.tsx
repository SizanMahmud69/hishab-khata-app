import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react"
import { dailyExpenses, monthlyIncome } from "@/lib/data"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function OverviewCards() {
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
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-muted-foreground text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
          <p className="text-xs text-muted-foreground">এই মাসের সর্বমোট আয়</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">মোট ব্যয়</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-muted-foreground text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalExpense)}</div>
          <p className="text-xs text-muted-foreground">এই মাসের সর্বমোট খরচ</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">অবশিষ্ট</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
          <p className="text-xs text-muted-foreground">আপনার বর্তমান ব্যালেন্স</p>
        </CardContent>
      </Card>
    </div>
  )
}
