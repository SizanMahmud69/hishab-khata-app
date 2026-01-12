
'use client';

import React, { useMemo } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShieldCheck, Sparkles, Zap, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { premiumPlans as allPlans, type PremiumPlan } from "@/lib/data";
import { useBudget } from '@/context/budget-context';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { AdBanner } from '@/components/ad-banner';

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
    const router = useRouter();
    const { 
        premiumStatus, 
        activePremiumPlan, 
        pendingSubscriptionPlanIds, 
        isSubscriptionsLoading,
        hasUsedFreeTrial,
    } = useBudget();
    
    const plans = useMemo(() => {
        return allPlans.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
    }, []);

    const handleSubscribeClick = (plan: PremiumPlan) => {
        router.push(`/premium/checkout?planId=${plan.id}`);
    };
    
    const getButtonState = (plan: PremiumPlan) => {
        if (isSubscriptionsLoading) {
            return { text: <Loader2 className="h-4 w-4 animate-spin" />, disabled: true };
        }
        if (plan.id === 'free_trial' && hasUsedFreeTrial) {
            return { text: "ট্রায়াল ব্যবহৃত হয়েছে", disabled: true };
        }
        if (premiumStatus === 'premium' && activePremiumPlan?.id === plan.id) {
            return { text: "আপনার বর্তমান প্ল্যান", disabled: true };
        }
        if (pendingSubscriptionPlanIds.includes(plan.id)) {
            return { text: "সাবস্ক্রিপশন পেন্ডিং", disabled: true };
        }
        return { text: "সাবস্ক্রাইব করুন", disabled: false };
    };

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
                 {plans.map(plan => {
                     const buttonState = getButtonState(plan);
                     return (
                        <Card 
                            key={plan.id}
                            className={cn(
                                "relative overflow-hidden border-2 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                                plan.isBestValue ? "border-yellow-500 shadow-lg shadow-yellow-500/20" : "border-primary/50",
                                buttonState.text === "আপনার বর্তমান প্ল্যান" && "ring-2 ring-offset-2 ring-yellow-500"
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
                                {isSubscriptionsLoading ? (
                                    <Skeleton className="h-12 w-full" />
                                ) : (
                                    <Button 
                                        className={cn("w-full", plan.isBestValue && !buttonState.disabled && "bg-yellow-500 hover:bg-yellow-600 text-white")} 
                                        size="lg" 
                                        onClick={() => handleSubscribeClick(plan)}
                                        disabled={buttonState.disabled}
                                    >
                                        {buttonState.text}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    )})}
                    {plans.length === 0 && (
                        <Card className="md:col-span-2 lg:col-span-3">
                            <CardContent className="p-10 text-center text-muted-foreground">
                                কোনো প্রিমিয়াম প্ল্যান পাওয়া যায়নি।
                            </CardContent>
                        </Card>
                    )}
            </div>

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
             <AdBanner page="premium" />
        </div>
    );
}
