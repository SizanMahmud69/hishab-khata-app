

"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/page-header"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useBudget } from "@/context/budget-context";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { incomeSources, savingsDestinations } from "@/lib/data";
import { Loader2 } from "lucide-react";
import { AdBanner } from "@/components/ad-banner";

const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

export default function IncomePage() {
    const { addTransaction } = useBudget();
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [selectedSource, setSelectedSource] = React.useState<string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(event.currentTarget);
        const source = formData.get('source') as string;
        const amount = parseFloat(formData.get('amount') as string);
        const date = formData.get('date') as string;
        const descriptionInput = formData.get('description') as string;

        if (!source || !amount || !date || ((selectedSource === 'মাসিক বেতন' || selectedSource === 'সঞ্চয় উত্তোলন') && !descriptionInput)) {
            toast({
                variant: "destructive",
                title: "ফর্ম পূরণ আবশ্যক",
                description: "অনুগ্রহ করে সকল তথ্য পূরণ করুন।",
            });
            setIsSubmitting(false);
            return;
        }

        try {
            let description = descriptionInput;
            if (selectedSource === 'মাসিক বেতন') {
                description = `${descriptionInput} মাসের বেতন`;
            } else if (selectedSource === 'সঞ্চয় উত্তোলন') {
                description = `${descriptionInput} থেকে উত্তোলন`;
            }

            await addTransaction({
                type: 'income',
                category: source,
                amount,
                date: new Date(date).toISOString(),
                description,
            });

            toast({
                title: "সফল!",
                description: "আপনার নতুন আয় সফলভাবে যোগ করা হয়েছে।",
            });

            formRef.current?.reset();
            setSelectedSource(undefined);
        } catch (error) {
            console.error("Error adding income:", error);
            toast({ variant: "destructive", title: "ত্রুটি", description: "একটি সমস্যা হয়েছে।" });
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="নতুন আয় যোগ করুন" description="আপনার আয়ের উৎস, পরিমাণ এবং তারিখ লিখুন।" />
      
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} ref={formRef}>
            <CardHeader>
              <CardTitle>আয়ের তথ্য</CardTitle>
              <CardDescription>
                অনুগ্রহ করে নিচের ফর্মটি পূরণ করুন।
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 py-4">
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="amount">
                    পরিমাণ
                    </Label>
                    <Input id="amount" name="amount" type="number" placeholder="50000" required />
                </div>
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="source">
                    উৎস
                    </Label>
                    <Select name="source" onValueChange={setSelectedSource} value={selectedSource} required>
                        <SelectTrigger>
                            <SelectValue placeholder="একটি উৎস নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                            {incomeSources.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="date">
                  তারিখ
                </Label>
                <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
               <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="description">
                  বিবরণ
                </Label>
                {selectedSource === 'মাসিক বেতন' ? (
                    <Select name="description" required>
                        <SelectTrigger>
                            <SelectValue placeholder="একটি মাস নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map(month => <SelectItem key={month} value={month}>{month}</SelectItem>)}
                        </SelectContent>
                    </Select>
                ) : selectedSource === 'সঞ্চয় উত্তোলন' ? (
                     <Select name="description" required>
                        <SelectTrigger>
                            <SelectValue placeholder="একটি মাধ্যম নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                            {savingsDestinations.map(dest => <SelectItem key={dest} value={dest}>{dest}</SelectItem>)}
                        </SelectContent>
                    </Select>
                ) : (
                    <Textarea id="description" name="description" placeholder="আয়ের সংক্ষিপ্ত বিবরণ" />
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
      <AdBanner page="income" />
    </div>
  )
}
