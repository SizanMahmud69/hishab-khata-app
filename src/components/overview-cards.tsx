import {
  Minus,
  Plus,
  MoreVertical,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { dailyExpenses, monthlyIncome } from "@/lib/data"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Button } from "./ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

export function OverviewCards() {
  const totalIncome = monthlyIncome.reduce((sum, item) => sum + item.amount, 0)
  const totalExpense = dailyExpenses.reduce((sum, item) => sum + item.amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <>
      <Card className="bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>এই মাস</DropdownMenuItem>
                <DropdownMenuItem>গত মাস</DropdownMenuItem>
                <DropdownMenuItem>সকল</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-2 flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                মোট আয়
            </div>
          <div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(totalIncome)}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                +100.0% গত মাস থেকে
              </p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>এই মাস</DropdownMenuItem>
                    <DropdownMenuItem>গত মাস</DropdownMenuItem>
                    <DropdownMenuItem>সকল</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Minus className="h-4 w-4" />
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-2 flex items-center">
                <TrendingDown className="mr-2 h-4 w-4" />
                মোট ব্যয়
            </div>
          <div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                {formatCurrency(totalExpense)}
              </div>
              <p className="text-xs text-red-600 dark:text-red-400">
                +100.0% গত মাস থেকে
              </p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
