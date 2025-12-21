"use client";

import React from 'react';
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/page-header"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { expenseCategories } from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useBudget } from "@/context/budget-context"
import { useToast } from "@/hooks/use-toast";

export default function ExpensesPage() {
    const { addExpense, addSaving } = useBudget();
    const { toast } = useToast();
    const formRef = React.useRef<HTMLFormElement>(null);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const category = formData.get('category') as string;
        const amount = parseFloat(formData.get('amount') as string);
        const date = formData.get('date') as string;
        const description = formData.get('description') as string;
        const isSavings = formData.get('is-savings') === 'on';

        if (!category || !amount || !date) {
            toast({
                variant: "destructive",
                title: "ফর্ম পূরণ আবশ্যক",
                description: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।",
            });
            return;
        }

        const newExpense = {
            id: Date.now(),
            category,
            amount,
            date,
            description,
        };

        addExpense(newExpense);
        if (isSavings) {
            addSaving({
                id: Date.now(),
                amount,
                date,
                description: description || "সঞ্চয়",
            });
        }

        toast({
            title: "সফল!",
            description: "আপনার নতুন খরচ সফলভাবে যোগ করা হয়েছে।",
        });

        formRef.current?.reset();
    }

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="নতুন খরচ যোগ করুন" description="আপনার খরচের বিভাগ, পরিমাণ এবং তারিখ লিখুন।" />
      
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} ref={formRef}>
            <CardHeader>
              <CardTitle>খরচের তথ্য</CardTitle>
              <CardDescription>
                অনুগ্রহ করে নিচের ফর্মটি পূরণ করুন।
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">বিভাগ</Label>
                    <Select name="category">
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
                <Input id="amount" name="amount" type="number" placeholder="500" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  তারিখ
                </Label>
                <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  বিবরণ
                </Label>
                <Textarea id="description" name="description" placeholder="খরচের সংক্ষিপ্ত বিবরণ" className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is-savings" className="text-right">
                  সঞ্চয়?
                </Label>
                 <div className="col-span-3 flex items-center space-x-2">
                    <Switch id="is-savings" name="is-savings" />
                    <Label htmlFor="is-savings" className="text-sm text-muted-foreground">এটা কি আপনার সঞ্চয়ের অংশ?</Label>
                 </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">সংরক্ষণ করুন</Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  )
}
