
"use client";

import React, { useState } from 'react';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Copy, CheckCircle, Smartphone, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useBudget } from '@/context/budget-context';

export default function DonatePage() {
    const { toast } = useToast();
    const { user } = useUser();
    const { donationNumber } = useBudget();
    const firestore = useFirestore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(donationNumber);
        toast({
            title: "কপি হয়েছে!",
            description: `নম্বর (${donationNumber}) ক্লিপবোর্ডে কপি করা হয়েছে।`,
        });
    };

    const handleDonationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user || !firestore) return;

        setIsSubmitting(true);
        const formData = new FormData(event.currentTarget);
        const amount = formData.get('amount') as string;
        const transactionId = formData.get('transactionId') as string;

        try {
            await addDoc(collection(firestore, 'donations'), {
                userId: user.uid,
                userName: user.displayName || 'Anonymous',
                amount: Number(amount),
                transactionId: transactionId,
                status: 'received',
                createdAt: serverTimestamp(),
            });

            toast({
                title: "ধন্যবাদ!",
                description: "আপনার ডোনেশন রিপোর্টটি সফলভাবে জমা হয়েছে। আমাদের সাথে থাকার জন্য ধন্যবাদ।",
            });
            (event.target as HTMLFormElement).reset();
        } catch (error) {
            console.error("Donation report error:", error);
            toast({
                variant: "destructive",
                title: "ত্রুটি",
                description: "রিপোর্ট জমা দেওয়া সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 space-y-6">
            <PageHeader 
                title="ডোনেট করুন" 
                description="আমাদের অ্যাপকে আরও উন্নত করতে আপনার সাহায্য একান্ত কাম্য।" 
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Card className="border-primary/20 shadow-md bg-gradient-to-br from-white to-primary/5 dark:from-slate-900 dark:to-primary/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary text-2xl">
                                <Heart className="fill-current" />
                                কেন ডোনেট করবেন?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground">
                            <p>
                                "হিসাব খাতা" একটি সম্পূর্ণ ফ্রি অ্যাপ যা আপনার আর্থিক জীবনকে সহজ করতে সাহায্য করে। আমরা সবসময় চেষ্টা করি আপনাকে সেরা অভিজ্ঞতা প্রদান করতে।
                            </p>
                            <p>
                                আপনার সামান্য অবদান আমাদের সার্ভার খরচ মেটাতে এবং অ্যাপে নতুন নতুন চমৎকার সব ফিচার যোগ করতে অনুপ্রাণিত করবে। ডোনেশন করা সম্পূর্ণ আপনার ব্যক্তিগত ইচ্ছার উপর নির্ভরশীল।
                            </p>
                            <ul className="space-y-2 pt-2">
                                <li className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                    <span>অ্যাপের সার্ভার ও রক্ষণাবেক্ষণ খরচ পরিচালনা।</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                    <span>বিজ্ঞাপন-মুক্ত এবং দ্রুত সেবা নিশ্চিত করা।</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                    <span>নতুন ও আধুনিক আর্থিক ফিচার যোগ করা।</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone className="text-blue-500" />
                                পেমেন্ট পদ্ধতি
                            </CardTitle>
                            <CardDescription>নিচের নম্বরটিতে আপনার ডোনেশন পাঠাতে পারেন।</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-lg bg-muted flex items-center justify-between border border-dashed border-primary/30">
                                <div>
                                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">পার্সোনাল নম্বর</p>
                                    <p className="text-2xl font-black text-primary tracking-widest">{donationNumber}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">(বিকাশ, নগদ, রকেট পাওয়া যাবে)</p>
                                </div>
                                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="h-full">
                    <form onSubmit={handleDonationSubmit} className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>ডোনেশন রিপোর্ট</CardTitle>
                            <CardDescription>ডোনেট করার পর নিচের ফর্মটি পূরণ করুন যাতে আমরা আপনাকে ধন্যবাদ জানাতে পারি।</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-1">
                            <div className="space-y-2">
                                <Label htmlFor="amount">ডোনেশন পরিমাণ (টাকা)</Label>
                                <Input id="amount" name="amount" type="number" placeholder="যেমন: ১০০" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="transactionId">ট্রানজেকশন আইডি (TrxID)</Label>
                                <Input id="transactionId" name="transactionId" placeholder="পেমেন্টের ট্রানজেকশন আইডি লিখুন" required />
                            </div>
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <p className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed italic">
                                    * ডোনেশন হলো আপনার ভালোবাসা। এর কোনো নির্দিষ্ট পরিমাণ নেই। আপনি যেকোনো পরিমাণ টাকা ডোনেট করতে পারেন।
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-6">
                            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? 'প্রসেসিং...' : 'রিপোর্ট জমা দিন'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
