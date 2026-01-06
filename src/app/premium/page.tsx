
'use client';

import React, { useState, useMemo } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShieldCheck, Sparkles, Zap, Banknote, Gift, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { premiumPlans as allPlans, type PremiumPlan } from "@/lib/data";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { addDays } from 'date-fns';
import { useBudget } from '@/context/budget-context';

const premiumFeatures = [
    { text: "সম্পূর্ণ বিজ্ঞাপন-মুক্ত অভিজ্ঞতা", icon: <ShieldCheck className="h-5 w-5 text-green-500" /> },
    { text: "ভবিষ্যতের সকল প্রিমিয়াম ফিচারে অ্যাক্সেস", icon: <Sparkles className="h-5 w-5 text-yellow-500" /> },
    { text: "অগ্রাধিকার ভিত্তিতে কাস্টমার সাপোর্ট", icon: <Zap className="h-5 w-5 text-blue-500" /> },
    { text: "বিশেষ ব্যাজ এবং প্রোফাইল কাস্টমাইজেশন", icon: <CheckCircle className="h-5 w-5 text-purple-500" /> },
];

const faqItems = [
    {
        question: "আমি কীভাবে আমার সাবস্ক্রিপশন বাতিল করতে পারি?",
        answer: "আপনি যেকোনো সময় আপনার প্রোফাইল সেটিংস থেকে আপনার সাবস্ক্রিপশন বাতিল করতে পারবেন। আপনার বর্তমান বিলিং সাইকেল শেষ না হওয়া পর্যন্ত আপনি প্রিমিয়াম সুবিধাগুলো উপভোগ করতে পারবেন।"
    },
    {
        question: "আমার পেমেন্ট কি নিরাপদ?",
        answer: "হ্যাঁ, আপনার পেমেন্ট সম্পূর্ণ নিরাপদ। আমরা ইন্ডাস্ট্রি-স্ট্যান্ডার্ড পেমেন্ট প্রসেসর ব্যবহার করি যা আপনার ডেটা সুরক্ষিত রাখে। আমরা আপনার কার্ডের তথ্য সংরক্ষণ করি না।"
    },
    {
        question: "আমি কি প্ল্যান পরিবর্তন করতে পারি?",
        answer: "হ্যাঁ, আপনি যেকোনো সময় এক প্ল্যান থেকে অন্য প্ল্যানে আপগ্রেড বা ডাউনগ্রেড করতে পারেন। পরিবর্তনটি আপনার পরবর্তী বিলিং সাইকেল থেকে কার্যকর হবে।"
    }
];

export default function PremiumPage() {
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const { rewardPoints } = useBudget();
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PremiumPlan | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const plans = useMemo(() => {
        return allPlans.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
    }, []);

    const handleSubscribeClick = (plan: PremiumPlan) => {
        setSelectedPlan(plan);
        setIsPaymentDialogOpen(true);
    };

    const activatePlan = async (plan: PremiumPlan) => {
        if (!user || !firestore) return;
        setIsSubmitting(true);

        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            let expiryDate = null;
            if (plan.durationDays) {
                expiryDate = addDays(new Date(), plan.durationDays);
            }

            await updateDoc(userDocRef, {
                premiumStatus: 'premium',
                premiumPlanId: plan.id,
                premiumExpiryDate: expiryDate ? serverTimestamp.from(expiryDate) : null,
            });

            toast({
                title: "অভিনন্দন!",
                description: `আপনি সফলভাবে "${plan.title}" প্ল্যানে সাবস্ক্রাইব করেছেন।`,
            });
        } catch (error) {
            console.error("Error activating plan:", error);
            toast({
                variant: 'destructive',
                title: "ত্রুটি",
                description: "প্ল্যান সক্রিয় করার সময় একটি সমস্যা হয়েছে।"
            });
        } finally {
            setIsSubmitting(false);
            setIsPaymentDialogOpen(false);
        }
    };

    const handlePaymentMethodClick = (method: 'cash' | 'points') => {
        if (!selectedPlan) return;

        if (method === 'points') {
            if (rewardPoints < (selectedPlan.points || 0)) {
                toast({
                    variant: 'destructive',
                    title: "অপর্যাপ্ত পয়েন্ট",
                    description: `আপনার ${selectedPlan.points} পয়েন্ট প্রয়োজন, কিন্তু আপনার আছে ${rewardPoints} পয়েন্ট।`,
                });
                return;
            }
            // Deduct points and activate
            activatePlanWithPoints(selectedPlan);
        } else {
            // Simulate cash payment
            toast({
                title: "শীঘ্রই আসছে!",
                description: "আমাদের পেমেন্ট সিস্টেম এখনও চালু হয়নি। আপাতত আপনার প্ল্যানটি সক্রিয় করে দেওয়া হচ্ছে।",
            });
            activatePlan(selectedPlan);
        }
    };
    
    const activatePlanWithPoints = async (plan: PremiumPlan) => {
         if (!user || !firestore || !plan.points) return;
        setIsSubmitting(true);

        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            let expiryDate = null;
            if (plan.durationDays) {
                expiryDate = addDays(new Date(), plan.durationDays);
            }

            await updateDoc(userDocRef, {
                points: increment(-plan.points),
                premiumStatus: 'premium',
                premiumPlanId: plan.id,
                premiumExpiryDate: expiryDate ? serverTimestamp.from(expiryDate) : null,
            });
            
             toast({
                title: "অভিনন্দন!",
                description: `আপনি সফলভাবে "${plan.title}" প্ল্যানে সাবস্ক্রাইব করেছেন।`,
            });

        } catch (error) {
             console.error("Error activating plan with points:", error);
            toast({
                variant: 'destructive',
                title: "ত্রুটি",
                description: "প্ল্যান সক্রিয় করার সময় একটি সমস্যা হয়েছে।"
            });
        } finally {
            setIsSubmitting(false);
            setIsPaymentDialogOpen(false);
        }
    }


    return (
        <div className="flex-1 space-y-8">
            <PageHeader
                title="প্রিমিয়াম সাবস্ক্রিপশন"
                description="হিসাব খাতা অ্যাপের সেরা অভিজ্ঞতা পেতে প্রিমিয়াম প্ল্যান বেছে নিন।"
            />
            
            <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                    <CardHeader>
                        <CardTitle className='text-center text-2xl'>কেন প্রিমিয়াম বেছে নিবেন?</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {premiumFeatures.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                                {feature.icon}
                                <span>{feature.text}</span>
                            </div>
                        ))}
                    </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {plans.map(plan => (
                        <Card 
                            key={plan.id}
                            className={cn(
                                "relative overflow-hidden border-2 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                                plan.isBestValue ? "border-yellow-500 shadow-lg shadow-yellow-500/20" : "border-primary/50"
                            )}
                        >
                            {plan.isBestValue && (
                                <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg z-10 animate-pulse">
                                    Best Value
                                </div>
                            )}
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl">{plan.title}</CardTitle>
                                {plan.bonusText && <p className="text-sm text-green-600 font-semibold">{plan.bonusText}</p>}
                                <p className={cn("text-4xl font-bold pt-2", plan.isBestValue ? "text-yellow-600" : "text-primary")}>
                                    {plan.price === 0 ? 'ফ্রি' : `৳${plan.price}`}
                                    {plan.period && <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>}
                                </p>
                                
                            </CardHeader>
                            <CardContent className='flex-grow'>
                                <p className="text-center text-muted-foreground text-sm">{plan.description}</p>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className={cn("w-full", plan.isBestValue && "bg-yellow-500 hover:bg-yellow-600 text-white")} 
                                    size="lg" 
                                    onClick={() => handleSubscribeClick(plan)}
                                    disabled={plan.price === 0}
                                >
                                    {plan.price === 0 ? 'আপনার প্ল্যান' : 'সাবস্ক্রাইব করুন'}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    {plans.length === 0 && (
                        <Card className="md:col-span-2 lg:col-span-3">
                            <CardContent className="p-10 text-center text-muted-foreground">
                                কোনো প্রিমিয়াম প্ল্যান পাওয়া যায়নি।
                            </CardContent>
                        </Card>
                    )}
            </div>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle>সাধারণ জিজ্ঞাসা (FAQ)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqItems.map((item, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger>{item.question}</AccordionTrigger>
                                <AccordionContent>
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>

             {/* Payment Dialog */}
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>পেমেন্ট সম্পন্ন করুন</DialogTitle>
                        <DialogDescription>
                            আপনি "{selectedPlan?.title}" প্ল্যানটি বেছে নিয়েছেন। অনুগ্রহ করে আপনার পছন্দের পেমেন্ট মাধ্যমটি নির্বাচন করুন।
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Button className="w-full justify-start h-14" variant="outline" onClick={() => handlePaymentMethodClick('cash')} disabled={isSubmitting}>
                           {isSubmitting ? <Loader2 className="mr-4 h-6 w-6 animate-spin" /> : <Banknote className="mr-4 h-6 w-6 text-pink-500" />}
                            <div>
                                <p className="font-semibold">বিকাশ</p>
                                <p className="text-xs text-muted-foreground">Bkash</p>
                            </div>
                        </Button>
                        <Button className="w-full justify-start h-14" variant="outline" onClick={() => handlePaymentMethodClick('cash')} disabled={isSubmitting}>
                             {isSubmitting ? <Loader2 className="mr-4 h-6 w-6 animate-spin" /> : <Banknote className="mr-4 h-6 w-6 text-orange-500" />}
                             <div>
                                <p className="font-semibold">রকেট</p>
                                <p className="text-xs text-muted-foreground">Rocket</p>
                            </div>
                        </Button>
                         <Button className="w-full justify-start h-14" variant="outline" onClick={() => handlePaymentMethodClick('cash')} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-4 h-6 w-6 animate-spin" /> : <Banknote className="mr-4 h-6 w-6 text-orange-700" />}
                            <div>
                                <p className="font-semibold">নগদ</p>
                                <p className="text-xs text-muted-foreground">Nagad</p>
                            </div>
                        </Button>
                         <Button className="w-full justify-start h-14" variant="outline" onClick={() => handlePaymentMethodClick('points')} disabled={isSubmitting}>
                           {isSubmitting ? <Loader2 className="mr-4 h-6 w-6 animate-spin" /> : <Gift className="mr-4 h-6 w-6 text-green-500" />}
                             <div>
                                <p className="font-semibold">রিওয়ার্ড পয়েন্ট</p>
                                <p className="text-xs text-muted-foreground">{selectedPlan?.points} পয়েন্ট প্রয়োজন</p>
                            </div>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
