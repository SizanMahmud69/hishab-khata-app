"use client"

import React from "react"
import {
  Minus,
  Plus,
  MoreVertical,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
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
import { useBudget } from "@/context/budget-context"
import { isThisMonth, isSameMonth, subMonths } from "date-fns"

type FilterType = "all" | "thisMonth" | "lastMonth";

export function OverviewCards() {
  const { income, expenses } = useBudget();
  const [incomeFilter, setIncomeFilter] = React.useState<FilterType>("thisMonth");
  const [expenseFilter, setExpenseFilter] = React.useState<FilterType>("thisMonth");

  const filterData = <T extends { date: string }>(data: T[], filter: FilterType): T[] => {
    const now = new Date();
    switch (filter) {
      case "thisMonth":
        return data.filter(item => isThisMonth(new Date(item.date)));
      case "lastMonth":
        const lastMonth = subMonths(now, 1);
        return data.filter(item => isSameMonth(new Date(item.date), lastMonth));
      case "all":
      default:
        return data;
    }
  };

  const filteredIncome = filterData(income, incomeFilter);
  const filteredExpenses = filterData(expenses, expenseFilter);

  const totalIncome = filteredIncome.reduce((sum, item) => sum + item.amount, 0)
  const totalExpense = filteredExpenses.reduce((sum, item) => sum + item.amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getFilterLabel = (filter: FilterType) => {
    switch (filter) {
        case "thisMonth": return "এই মাস";
        case "lastMonth": return "গত মাস";
        case "all": return "সকল";
    }
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
                <DropdownMenuItem onClick={() => setIncomeFilter("thisMonth")}>এই মাস</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIncomeFilter("lastMonth")}>গত মাস</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIncomeFilter("all")}>সকল</DropdownMenuItem>
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
                {getFilterLabel(incomeFilter)}
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
                    <DropdownMenuItem onClick={() => setExpenseFilter("thisMonth")}>এই মাস</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setExpenseFilter("lastMonth")}>গত মাস</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setExpenseFilter("all")}>সকল</DropdownMenuItem>
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
                {getFilterLabel(expenseFilter)}
              </p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
