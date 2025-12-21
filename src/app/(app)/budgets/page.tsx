import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import PageHeader from "@/components/page-header"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { budgets, expenseCategories } from "@/lib/data"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function BudgetsPage() {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
      }

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="বাজেট ব্যবস্থাপনা" description="আপনার মাসিক খরচের জন্য বাজেট তৈরি করুন।">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              নতুন বাজেট তৈরি করুন
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>নতুন বাজেট তৈরি করুন</DialogTitle>
              <DialogDescription>
                খরচের বিভাগ এবং বাজেটের পরিমাণ নির্ধারণ করুন।
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">বিভাগ</Label>
                    <Select>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="একটি বিভাগ নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                            {expenseCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  পরিমাণ
                </Label>
                <Input id="amount" type="number" placeholder="10000" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">সংরক্ষণ করুন</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>
      
      <div className="grid gap-4 grid-cols-1">
        {budgets.map(budget => {
            const progress = (budget.spent / budget.budget) * 100
            return (
                <Card key={budget.category}>
                    <CardHeader>
                        <CardTitle>{budget.category}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">খরচ হয়েছে</span>
                            <span>{formatCurrency(budget.spent)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">মোট বাজেট</span>
                            <span>{formatCurrency(budget.budget)}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Progress value={progress} className="w-full" />
                    </CardFooter>
                </Card>
            )
        })}
      </div>
    </div>
  )
}
