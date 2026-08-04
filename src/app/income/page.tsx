
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
import { incomeSources, savingsDestinations, walletSources } from "@/lib/data";
import { Loader2 } from "lucide-react";

const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

const allSources = Array.from(new Set([...walletSources, 'ব্যাংক']));

export default function IncomePage() {
    const { addTransaction, savingsBreakdown, walletBreakdown } = useBudget();
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [selectedSource, setSelectedSource] = React.useState<string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        const source = formData.get('source') as string;
        const amount = parseFloat(formData.get('amount') as string);
        const date = formData.get('date') as string;
        const descriptionInput = formData.get('description') as string;
        const walletSource = formData.get('walletSource') as string; // This is the "To" wallet
        const fromWallet = formData.get('fromWallet') as string; // This is the "From" wallet for transfer

        if (!source || !amount || !date || !walletSource) {
            toast({
                variant: "destructive",
                title: "ফর্ম পূরণ আবশ্যক",
                description: "অনুগ্রহ করে সকল তথ্য পূরণ করুন।",
            });
            setIsSubmitting(false);
            return;
        }

        // Validation for Fund Transfer
        if (source === 'ফান্ড ট্রান্সফার') {
            if (!fromWallet) {
                toast({ variant: "destructive", title: "তথ্য দিন", description: "কোথা থেকে ট্রান্সফার করছেন তা সিলেক্ট করুন।" });
                setIsSubmitting(false);
                return;
            }
            if (fromWallet === walletSource) {
                toast({ variant: "destructive", title: "ভুল ইনপুট", description: "একই ওয়ালেটে ট্রান্সফার করা সম্ভব নয়।" });
                setIsSubmitting(false);
                return;
            }

            // Check balance in fromWallet
            const availableInSource = fromWallet === 'ব্যাংক' ? (savingsBreakdown['নগদ'] || 0) : (walletBreakdown[fromWallet] || 0);
            if (amount > availableInSource) {
                toast({
                    variant: "destructive",
                    title: "অপর্যাপ্ত ব্যালেন্স",
                    description: `আপনার "${fromWallet}"-এ পর্যাপ্ত ব্যালেন্স নেই। বর্তমান ব্যালেন্স ${formatCurrency(availableInSource)}।`,
                });
                setIsSubmitting(false);
                return;
            }
        }

        // Validation for Savings Withdrawal
        if (source === 'সঞ্চয় উত্তোলন') {
            const availableInDestination = savingsBreakdown[descriptionInput] || 0;
            if (amount > availableInDestination) {
                toast({
                    variant: "destructive",
                    title: "অপর্যাপ্ত সঞ্চয়",
                    description: `আপনার "${descriptionInput}"-এ পর্যাপ্ত ব্যালেন্স নেই। আপনার বর্তমান ${descriptionInput} ব্যালেন্স ${formatCurrency(availableInDestination)}।`,
                });
                setIsSubmitting(false);
                return;
            }
        }

        try {
            if (source === 'ফান্ড ট্রান্সফার') {
                // Submit two transactions for transfer
                // 1. Expense from source
                await addTransaction({
                    type: 'expense',
                    category: 'ফান্ড ট্রান্সফার',
                    amount,
                    date: new Date(date).toISOString(),
                    description: `${walletSource}-এ ট্রান্সফার`,
                    source: fromWallet,
                    isTransfer: true
                });
                // 2. Income to destination
                await addTransaction({
                    type: 'income',
                    category: 'ফান্ড ট্রান্সফার',
                    amount,
                    date: new Date(date).toISOString(),
                    description: `${fromWallet} থেকে ট্রান্সফার`,
                    source: walletSource,
                    isTransfer: true
                });

                toast({ title: "সফল!", description: "ফান্ড ট্রান্সফার সফলভাবে সম্পন্ন হয়েছে।" });
            } else {
                let description = descriptionInput;
                if (selectedSource === 'মাসিক বেতন') {
                    description = `${descriptionInput} মাসের বেতন`;
                } else if (selectedSource === 'সঞ্চয় উত্তোলন') {
                    description = descriptionInput;
                }

                await addTransaction({
                    type: 'income',
                    category: source,
                    amount,
                    date: new Date(date).toISOString(),
                    description: description || 'আয়',
                    source: walletSource
                });

                toast({
                    title: "সফল!",
                    description: "আপনার নতুন আয় সফলভাবে যোগ করা হয়েছে।",
                });
            }

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
    <div className="flex-1 space-y-4 animate-slide-in-right">
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
                    আয়ের উৎস / বিভাগ
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
                
                {selectedSource === 'ফান্ড ট্রান্সফার' && (
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="fromWallet">কোথা থেকে ট্রান্সফার করছেন?</Label>
                        <Select name="fromWallet" required>
                            <SelectTrigger>
                                <SelectValue placeholder="উৎস ওয়ালেট নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                                {allSources.map(src => <SelectItem key={src} value={src}>{src}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="walletSource">
                        {selectedSource === 'ফান্ড ট্রান্সফার' ? "কোথায় জমা হচ্ছে?" : "কোথায় জমা হচ্ছে?"}
                    </Label>
                    <Select name="walletSource" required>
                        <SelectTrigger>
                            <SelectValue placeholder="গন্তব্য ওয়ালেট নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                            {allSources.map(src => <SelectItem key={src} value={src}>{src}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="date">
                  তারিখ
                </Label>
                <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
               
               {selectedSource !== 'ফান্ড ট্রান্সফার' && (
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
                                    <SelectValue placeholder="কোথা থেকে উত্তোলন করছেন?" />
                                </SelectTrigger>
                                <SelectContent>
                                    {savingsDestinations.map(dest => <SelectItem key={dest} value={dest}>{dest}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Textarea id="description" name="description" placeholder="আয়ের সংক্ষিপ্ত বিবরণ" />
                        )}
                    </div>
               )}
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
