
"use client";

import React, { useState } from 'react';
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
import { expenseCategories, savingsDestinations } from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useBudget } from "@/context/budget-context"
import { useToast } from "@/hooks/use-toast";

export default function ExpensesPage() {
    const { addTransaction } = useBudget();
    const { toast } = useToast();
    const formRef = React.useRef<HTMLFormElement>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const category = formData.get('category') as string;
        const amount = parseFloat(formData.get('amount') as string);
        const date = formData.get('date') as string;
        const description = formData.get('description') as string;
        
        if (!category || !amount || !date) {
            toast({
                variant: "destructive",
                title: "ফর্ম পূরণ আবশ্যক",
                description: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।",
            });
            return;
        }

        await addTransaction({
            type: 'expense',
            category,
            amount,
            date: new Date(date).toISOString(),
            description,
        });

        toast({
            title: "সফল!",
            description: "আপনার নতুন খরচ সফলভাবে যোগ করা হয়েছে।",
        });

        formRef.current?.reset();
        setSelectedCategory("");
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
            <CardContent className="space-y-4 py-4">
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="amount">
                    পরিমাণ
                    </Label>
                    <Input id="amount" name="amount" type="number" placeholder="500" required/>
                </div>
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="category">বিভাগ</Label>
                    <Select name="category" onValueChange={setSelectedCategory} required>
                        <SelectTrigger>
                            <SelectValue placeholder="একটি বিভাগ নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                            {expenseCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="date">
                  তারিখ
                </Label>
                <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required/>
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="description">
                  বিবরণ
                </Label>
                {selectedCategory === 'সঞ্চয় ডিপোজিট' ? (
                     <Select name="description" required>
                        <SelectTrigger>
                            <SelectValue placeholder="একটি মাধ্যম নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                            {savingsDestinations.map(dest => <SelectItem key={dest} value={dest}>{dest}</SelectItem>)}
                        </SelectContent>
                    </Select>
                ) : (
                    <Textarea id="description" name="description" placeholder="খরচের সংক্ষিপ্ত বিবরণ" />
                )}
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
