import {
  MinusCircle,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"
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
    <>
      <Card className="lg:col-span-1 bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
            মোট আয়
          </CardTitle>
          <PlusCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mt-1" />
            <div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(totalIncome)}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                +100.0% গত মাস থেকে
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="lg:col-span-1 bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">
            মোট ব্যয়
          </CardTitle>
          <MinusCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2">
            <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400 mt-1" />
            <div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                {formatCurrency(totalExpense)}
              </div>
              <p className="text-xs text-red-600 dark:text-red-400">
                +100.0% গত মাস থেকে
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-1 md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">বর্তমান ব্যালেন্স</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
          <p className="text-xs text-muted-foreground">আপনার বর্তমান সঞ্চয়</p>
        </CardContent>
      </Card>
    </>
  )
}
