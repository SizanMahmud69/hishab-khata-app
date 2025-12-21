import { PlusCircle, Landmark } from "lucide-react"

import { Button } from "@/components/ui/button"
import PageHeader from "@/components/page-header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
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
import { dailyExpenses, expenseCategories } from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export default function ExpensesPage() {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
      }

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="খরচের হিসাব" description="আপনার দৈনন্দিন খরচ পরিচালনা করুন।">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              নতুন খরচ যোগ করুন
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>নতুন খরচ যোগ করুন</DialogTitle>
              <DialogDescription>
                আপনার খরচের বিভাগ, পরিমাণ এবং তারিখ লিখুন।
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
                <Input id="amount" type="number" placeholder="500" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  তারিখ
                </Label>
                <Input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  বিবরণ
                </Label>
                <Textarea id="description" placeholder="খরচের সংক্ষিপ্ত বিবরণ" className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is-savings" className="text-right">
                  সঞ্চয়?
                </Label>
                 <div className="col-span-3 flex items-center space-x-2">
                    <Switch id="is-savings" />
                    <Label htmlFor="is-savings" className="text-sm text-muted-foreground">এটা কি আপনার সঞ্চয়ের অংশ?</Label>
                 </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">সংরক্ষণ করুন</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>
      
      <Card>
        <CardHeader>
          <CardTitle>খরচের তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>বিভাগ</TableHead>
                    <TableHead>বিবরণ</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead className="text-right">পরিমাণ</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {dailyExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.category}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{new Date(expense.date).toLocaleDateString('bn-BD')}</TableCell>
                    <TableCell className="text-right text-red-600 font-semibold">-{formatCurrency(expense.amount)}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}
