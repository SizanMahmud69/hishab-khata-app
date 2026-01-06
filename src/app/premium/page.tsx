
'use client';

import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, ShieldCheck, Sparkles, Zap, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface PremiumPlan {
    id: string;
    title: string;
    price: number;
    currency: string;
    period: string;
    description: string;
    bonusText?: string;
    isBestValue: boolean;
    sortOrder: number;
    isActive: boolean;
}

const premiumFeatures = [
    { text: "সম্পূর্ণ বিজ্ঞাপন-মুক্ত অভিজ্ঞতা", icon: <ShieldCheck className="h-5 w-5 text-green-500" /> },
    { text: "ভবিষ্যতের সকল প্রিমিয়াম ফিচারে অ্যাক্সেস", icon: <Sparkles className="h-5 w-5 text-yellow-500" /> },
    { text: "অগ্রাধিকার ভিত্তিতে কাস্টমার সাপোর্ট", icon: <Zap className="h-5 w-5 text-blue-500" /> },
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
        answer: "হ্যাঁ, আপনি যেকোনো সময় মাসিক থেকে বাৎসরিক বা বাৎসরিক থেকে মাসিক প্ল্যানে আপগ্রেড বা ডাউনগ্রেড করতে পারেন। পরিবর্তনটি আপনার পরবর্তী বিলিং সাইকেল থেকে কার্যকর হবে।"
    }
];

export default function PremiumPage() {
    const { toast } = useToast();
    const firestore = useFirestore();

    const premiumPlansQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'premium_plans'),
            where('isActive', '==', true),
            orderBy('sortOrder', 'asc')
        );
    }, [firestore]);

    const { data: plans, isLoading } = useCollection<PremiumPlan>(premiumPlansQuery);

    const handleSubscribeClick = () => {
        toast({
            title: "শীঘ্রই আসছে!",
            description: "আমাদের পেমেন্ট সিস্টেম এখনও চালু হয়নি। আমরা এটি নিয়ে কাজ করছি এবং খুব শীঘ্রই আপনার জন্য নিয়ে আসব।",
        });
    };

    return (
        <div className="flex-1 space-y-8">
            <PageHeader
                title="প্রিমিয়াম সাবস্ক্রিপশন"
                description="হিসাব খাতা অ্যাপের সেরা অভিজ্ঞতা পেতে প্রিমিয়াম প্ল্যান বেছে নিন।"
            />

            <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Features Card */}
                <Card className="md:sticky top-24">
                    <CardHeader>
                        <CardTitle>কেন প্রিমিয়াম বেছে নিবেন?</CardTitle>
                        <CardDescription>প্রিমিয়াম সাবস্ক্রিপশনের মাধ্যমে আপনি যে বিশেষ সুবিধাগুলো পাবেন।</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {premiumFeatures.map((feature, index) => (
                            <div key={index} className="flex items-start gap-3">
                                {feature.icon}
                                <span>{feature.text}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Pricing Plans */}
                <div className="space-y-8">
                    {isLoading && (
                        <>
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-48 w-full" />
                        </>
                    )}
                    {plans && plans.map(plan => (
                        <Card 
                            key={plan.id}
                            className={cn(
                                "relative overflow-hidden border-2",
                                plan.isBestValue ? "border-yellow-500 shadow-lg shadow-primary/20" : "border-primary"
                            )}
                        >
                            {plan.isBestValue && (
                                <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg z-10">
                                    Best Value
                                </div>
                            )}
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl">{plan.title}</CardTitle>
                                <p className={cn("text-4xl font-bold", plan.isBestValue ? "text-yellow-600" : "text-primary")}>
                                    {plan.currency}{plan.price}
                                    <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                                </p>
                                {plan.bonusText && <p className="text-sm text-green-600 font-semibold">{plan.bonusText}</p>}
                            </CardHeader>
                            <CardContent>
                                <p className="text-center text-muted-foreground">{plan.description}</p>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className={cn("w-full", plan.isBestValue && "bg-yellow-500 hover:bg-yellow-600")} 
                                    size="lg" 
                                    onClick={handleSubscribeClick}
                                >
                                    সাবস্ক্রাইব করুন
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    {!isLoading && plans?.length === 0 && (
                        <Card>
                            <CardContent className="p-10 text-center text-muted-foreground">
                                কোনো প্রিমিয়াম প্ল্যান পাওয়া যায়নি।
                            </CardContent>
                        </Card>
                    )}
                </div>
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
        </div>
    );
}

    