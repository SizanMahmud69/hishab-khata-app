
'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter, notFound } from 'next/navigation';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Banknote, Gift, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { premiumPlans as allPlans, type PremiumPlan, paymentMethods } from "@/lib/data";
import { useUser, useFirestore } from '@/firebase';
import { useBudget } from '@/context/budget-context';
import { doc, collection, serverTimestamp, increment, writeBatch, setDoc, updateDoc } from 'firebase/firestore';
import { addDays } from 'date-fns';

function CheckoutPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const { rewardPoints } = useBudget();
    
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const planId = searchParams.get('planId');
    const selectedPlan = useMemo(() => {
        if (!planId) return null;
        return allPlans.find(p => p.id === planId);
    }, [planId]);

    const handleSubscriptionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedPlan || !user || !firestore || !selectedPaymentMethod) {
            toast({ variant: "destructive", title: "ত্রুটি", description: "অনুগ্রহ করে একটি পেমেন্ট মাধ্যম নির্বাচন করুন।" });
            return;
        }
        setIsSubmitting(true);

        if (selectedPaymentMethod === 'points') {
            await activateWithPoints();
        } else {
            await createPendingSubscription(event);
        }
        setIsSubmitting(false);
    };

    const activateWithPoints = async () => {
        if (!selectedPlan || !user || !firestore || !selectedPlan.points) return;

        if (rewardPoints < selectedPlan.points) {
            toast({ variant: 'destructive', title: "অপর্যাপ্ত পয়েন্ট", description: `আপনার ${selectedPlan.points} পয়েন্ট প্রয়োজন, কিন্তু আপনার আছে ${rewardPoints} পয়েন্ট।` });
            setIsSubmitting(false);
            return;
        }

        try {
            const batch = writeBatch(firestore);
            const userDocRef = doc(firestore, 'users', user.uid);
            
            const newUserSubscriptionRef = doc(collection(firestore, `users/${user.uid}/premium_subscriptions`));

            let expiryDate = null;
            if (selectedPlan.durationDays) {
                expiryDate = addDays(new Date(), selectedPlan.durationDays);
            }

            const subscriptionData = {
                id: newUserSubscriptionRef.id,
                userId: user.uid,
                planId: selectedPlan.id,
                status: 'approved',
                paymentMethod: 'points',
                createdAt: serverTimestamp(),
                activatedAt: serverTimestamp(),
                expiresAt: expiryDate ? expiryDate : null,
            };

            batch.set(newUserSubscriptionRef, subscriptionData);
            
            // Update user document with premium status
            batch.update(userDocRef, {
                premiumStatus: 'premium',
                premiumPlanId: selectedPlan.id,
                premiumExpiryDate: expiryDate ? expiryDate : null,
                points: increment(-selectedPlan.points)
            });

            await batch.commit();
            
            toast({ title: "অভিনন্দন!", description: `আপনি সফলভাবে "${selectedPlan.title}" প্ল্যানে সাবস্ক্রাইব করেছেন।` });
            router.push('/profile');

        } catch (error) {
            console.error("Error activating plan with points:", error);
            toast({ variant: 'destructive', title: "ত্রুটি", description: "প্ল্যান সক্রিয় করার সময় একটি সমস্যা হয়েছে।" });
        }
    };

    const createPendingSubscription = async (event: React.FormEvent<HTMLFormElement>) => {
        if (!selectedPlan || !user || !firestore || !selectedPaymentMethod) return;

        const formData = new FormData(event.currentTarget);
        const accountNumber = formData.get('accountNumber') as string;
        const transactionId = formData.get('transactionId') as string;

        if (!accountNumber || !transactionId) {
            toast({ variant: "destructive", title: "ফর্ম পূরণ আবশ্যক", description: "অনুগ্রহ করে আপনার অ্যাকাউন্ট নম্বর এবং ট্রানজেকশন আইডি দিন।" });
            return;
        }

        try {
            const batch = writeBatch(firestore);

            const newUserSubscriptionRef = doc(collection(firestore, `users/${user.uid}/premium_subscriptions`));
            const rootSubscriptionRef = doc(firestore, 'premium_subscriptions', newUserSubscriptionRef.id);

            const subscriptionData = {
                id: newUserSubscriptionRef.id,
                userId: user.uid,
                planId: selectedPlan.id,
                status: 'pending',
                paymentMethod: selectedPaymentMethod,
                accountNumber: accountNumber,
                transactionId: transactionId,
                createdAt: serverTimestamp(),
            };

            batch.set(newUserSubscriptionRef, subscriptionData);
            batch.set(rootSubscriptionRef, subscriptionData);

            await batch.commit();

            toast({ title: "অনুরোধ সফল হয়েছে", description: "আপনার সাবস্ক্রিপশন অনুরোধটি পর্যালোচনার জন্য জমা দেওয়া হয়েছে। ২৪ ঘণ্টার মধ্যে এটি সক্রিয় করা হবে।" });
            router.push('/profile');
        } catch (error) {
            console.error("Error creating pending subscription:", error);
            toast({ variant: 'destructive', title: "ত্রুটি", description: "আপনার অনুরোধ জমা দেওয়ার সময় একটি সমস্যা হয়েছে।" });
        }
    };

    if (!selectedPlan) {
        notFound();
    }

    return (
        <div className="flex-1 space-y-6">
            <PageHeader title="পেমেন্ট সম্পন্ন করুন" description={`আপনি "${selectedPlan.title}" প্ল্যানটি বেছে নিয়েছেন।`} />
            
            <form onSubmit={handleSubscriptionSubmit}>
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>প্ল্যানের বিবরণ</CardTitle>
                        <div className="flex justify-between items-baseline pt-2">
                            <span className="text-lg">{selectedPlan.title}</span>
                            <span className="text-2xl font-bold text-primary">৳{selectedPlan.price}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label className="text-base font-semibold">পেমেন্ট মাধ্যম নির্বাচন করুন</Label>
                            <RadioGroup 
                                value={selectedPaymentMethod ?? undefined} 
                                onValueChange={setSelectedPaymentMethod}
                                className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4"
                            >
                                {paymentMethods.map(method => (
                                    <Label key={method} htmlFor={method} className={cn("flex items-center gap-4 rounded-lg border p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground", selectedPaymentMethod === method && "bg-accent text-accent-foreground")}>
                                        <RadioGroupItem value={method} id={method} />
                                        <Banknote className="h-6 w-6" />
                                        <span className="font-medium">{method}</span>
                                    </Label>
                                ))}
                                <Label htmlFor="points" className={cn("flex items-center gap-4 rounded-lg border p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground", selectedPaymentMethod === "points" && "bg-accent text-accent-foreground")}>
                                    <RadioGroupItem value="points" id="points" disabled={!selectedPlan.points || selectedPlan.points <= 0} />
                                    <Gift className="h-6 w-6 text-green-500" />
                                    <div>
                                        <p className="font-medium">রিওয়ার্ড পয়েন্ট</p>
                                        <p className="text-xs text-muted-foreground">{selectedPlan.points || 0} পয়েন্ট প্রয়োজন</p>
                                    </div>
                                </Label>
                            </RadioGroup>
                        </div>
                        
                        {selectedPaymentMethod && selectedPaymentMethod !== 'points' && (
                             <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                                <p className="text-sm text-center">অনুগ্রহ করে নিচের নম্বরে <span className='font-bold'>(৳{selectedPlan.price})</span> সেন্ড মানি করুন এবং নিচের তথ্যগুলো পূরণ করুন।</p>
                                <p className="text-lg font-bold text-center text-primary tracking-widest">01700000000 ({selectedPaymentMethod})</p>
                                <div className="space-y-2">
                                    <Label htmlFor="accountNumber">আপনার {selectedPaymentMethod} নম্বর</Label>
                                    <Input id="accountNumber" name="accountNumber" placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="transactionId">ট্রানজেকশন আইডি</Label>
                                    <Input id="transactionId" name="transactionId" placeholder="পেমেন্টের ট্রানজেকশন আইডি" required />
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !selectedPaymentMethod}>
                           {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                           {isSubmitting ? 'প্রসেসিং...' : 'সাবস্ক্রিপশন নিশ্চিত করুন'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}


export default function CheckoutPage() {
    return (
        <Suspense fallback={<div>লোড হচ্ছে...</div>}>
            <CheckoutPageContent />
        </Suspense>
    )
}
