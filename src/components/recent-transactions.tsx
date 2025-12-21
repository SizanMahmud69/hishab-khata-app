"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { History } from "lucide-react"
import { Button } from "./ui/button"
import Link from "next/link"
import { useBudget } from "@/context/budget-context"

export function RecentTransactions() {
  const { expenses } = useBudget();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const recentExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>সাম্প্রতিক লেনদেন</CardTitle>
          <CardDescription>এই মাসে আপনার করা সর্বশেষ ৫টি খরচ।</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
            <Link href="/expenses">
                হিস্টোরি <History className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </CardHeader>
      <CardContent>
          <div className="space-y-6">
            {recentExpenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center">
                <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-muted text-muted-foreground font-bold">{expense.category.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{expense.category}</p>
                  <p className="text-sm text-muted-foreground">{expense.description}</p>
                </div>
                <div className="ml-auto font-medium text-red-500">-{formatCurrency(expense.amount)}</div>
              </div>
            ))}
            {recentExpenses.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">কোনো লেনদেন পাওয়া যায়নি।</p>
            )}
          </div>
      </CardContent>
    </Card>
  )
}
