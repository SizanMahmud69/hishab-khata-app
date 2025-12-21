"use client";

import React from "react";
import { PlusCircle } from "lucide-react"
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
import { useBudget } from "@/context/budget-context";
import { useToast } from "@/hooks/use-toast";

export default function IncomePage() {
    const { income, addIncome } = useBudget();
    const { toast } = useToast();
    const [dialogOpen, setDialogOpen] = React.useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
      }
    
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const source = formData.get('source') as string;
        const amount = parseFloat(formData.get('amount') as string);
        const date = formData.get('date') as string;

        if (!source || !amount || !date) {
            toast({
                variant: "destructive",
                title: "ফর্ম পূরণ আবশ্যক",
                description: "অনুগ্রহ করে সকল তথ্য পূরণ করুন।",
            });
            return;
        }

        const newIncome = {
            source,
            amount,
            date,
        };

        addIncome(newIncome);

        toast({
            title: "সফল!",
            description: "আপনার নতুন আয় সফলভাবে যোগ করা হয়েছে।",
        });

        setDialogOpen(false);
    }

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="আয়ের হিসাব" description="আপনার সকল আয়ের উৎস পরিচালনা করুন।">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              নতুন আয় যোগ করুন
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>নতুন আয় যোগ করুন</DialogTitle>
                  <DialogDescription>
                    আপনার আয়ের উৎস, পরিমাণ এবং তারিখ লিখুন।
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="source" className="text-right">
                      উৎস
                    </Label>
                    <Input id="source" name="source" defaultValue="মাসিক বেতন" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      পরিমাণ
                    </Label>
                    <Input id="amount" name="amount" type="number" defaultValue="50000" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      তারিখ
                    </Label>
                    <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">সংরক্ষণ করুন</Button>
                </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>
      
      <Card>
        <CardHeader>
          <CardTitle>আয়ের তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>উৎস</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead className="text-right">পরিমাণ</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {income.map((inc, index) => (
                    <TableRow key={index}>
                    <TableCell className="font-medium">{inc.source}</TableCell>
                    <TableCell>{new Date(inc.date).toLocaleDateString('bn-BD')}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">{formatCurrency(inc.amount)}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}
