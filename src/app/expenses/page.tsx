

"use client";

import React, { useState, useRef } from 'react';
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
import { Loader2 } from 'lucide-react';

const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

export default function ExpensesPage() {
    const { addTransaction, totalIncome, totalExpense } = useBudget();
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const balance = totalIncome - totalExpense;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(event.currentTarget);
        const category = formData.get('category') as string;
        const amount = parseFloat(formData.get('amount') as string);
        const date = formData.get('date') as string;
        const descriptionInput = formData.get('description') as string;
        
        if (!category || !amount || !date) {
            toast({
                variant: "destructive",
                title: "ফর্ম পূরণ আবশ্যক",
                description: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।",
            });
            setIsSubmitting(false);
            return;
        }

        if (amount > balance) {
            toast({
                variant: "destructive",
                title: "অপর্যাপ্ত ব্যালেন্স",
                description: `আপনার বর্তমান ব্যালেন্স ${formatCurrency(balance)}। আপনি এর বেশি খরচ করতে পারবেন না।`,
            });
            setIsSubmitting(false);
            return;
        }

        let description = descriptionInput;
        if (category === 'বাড়ি ভাড়া') {
            description = `${descriptionInput} মাসের বাড়ি ভাড়া`;
        } else if (category === 'বিল') {
            description = `${descriptionInput} মাসের বিল`;
        }

        try {
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
            setSelectedCategory(undefined);
        } catch (error) {
            console.error("Error adding expense:", error);
            toast({ variant: "destructive", title: "ত্রুটি", description: "একটি সমস্যা হয়েছে।" });
        } finally {
            setIsSubmitting(false);
        }
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
                    <Select name="category" onValueChange={setSelectedCategory} value={selectedCategory} required>
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
                ) : selectedCategory === 'বাড়ি ভাড়া' || selectedCategory === 'বিল' ? (
                     <Select name="description" required>
                        <SelectTrigger>
                            <SelectValue placeholder="একটি মাস নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map(month => <SelectItem key={month} value={month}>{month}</SelectItem>)}
                        </SelectContent>
                    </Select>
                ) : (
                    <Textarea id="description" name="description" placeholder="খরচের সংক্ষিপ্ত বিবরণ" />
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'প্রসেসিং...' : 'সংরক্ষণ করুন'}
              </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  )
}
