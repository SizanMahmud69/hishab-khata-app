
'use client';

import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
                    <Card className="border-2 border-primary shadow-lg shadow-primary/20">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">মাসিক প্ল্যান</CardTitle>
                            <p className="text-4xl font-bold text-primary">৳৫০<span className="text-sm font-normal text-muted-foreground">/মাস</span></p>
                        </CardHeader>
                        <CardContent>
                            <p className="text-center text-muted-foreground">যারা স্বল্প সময়ের জন্য প্রিমিয়াম সুবিধা পরীক্ষা করতে চান তাদের জন্য উপযুক্ত।</p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" size="lg" onClick={handleSubscribeClick}>সাবস্ক্রাইব করুন</Button>
                        </CardFooter>
                    </Card>

                    <Card className="relative overflow-hidden border-2 border-yellow-500">
                        <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                            Best Value
                        </div>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">বাৎসরিক প্ল্যান</CardTitle>
                            <p className="text-4xl font-bold text-yellow-600">৳৫০০<span className="text-sm font-normal text-muted-foreground">/বছর</span></p>
                            <p className="text-sm text-green-600 font-semibold">২ মাস ফ্রি!</p>
                        </CardHeader>
                        <CardContent>
                            <p className="text-center text-muted-foreground">যারা দীর্ঘ সময়ের জন্য সেরা মূল্য এবং নিরবচ্ছিন্ন পরিষেবা চান তাদের জন্য।</p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-yellow-500 hover:bg-yellow-600" size="lg" onClick={handleSubscribeClick}>সাবস্ক্রাইব করুন</Button>
                        </CardFooter>
                    </Card>
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
