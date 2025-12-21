import { dailyExpenses } from "@/lib/data"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export function RecentTransactions() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>সাম্প্রতিক লেনদেন</CardTitle>
        <CardDescription>এই মাসে আপনার করা সর্বশেষ ৫টি খরচ।</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <div className="space-y-6">
            {dailyExpenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <span className="text-lg">🛍️</span>
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{expense.category}</p>
                  <p className="text-sm text-muted-foreground">{expense.description}</p>
                </div>
                <div className="ml-auto font-medium text-red-500">-{formatCurrency(expense.amount)}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
