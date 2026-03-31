"use client";

import React from 'react';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Clock, ShieldCheck, HeadphonesIcon } from "lucide-react";

export default function LiveSupportPage() {
    const openTawkChat = () => {
        // Tawk_API is a global variable injected by the Tawk script
        if (typeof window !== 'undefined' && (window as any).Tawk_API) {
            (window as any).Tawk_API.maximize();
        } else {
            alert("চ্যাট উইজেটটি লোড হচ্ছে, অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।");
        }
    };

    return (
        <div className="flex-1 space-y-6">
            <PageHeader 
                title="লাইভ সাপোর্ট" 
                description="আপনার যেকোনো সমস্যা বা জিজ্ঞাসায় আমরা আছি আপনার পাশে।" 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-primary/20 shadow-md">
                    <CardHeader className="bg-primary/5">
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="text-primary" />
                            সরাসরি চ্যাট করুন
                        </CardTitle>
                        <CardDescription>আমাদের কাস্টমার কেয়ার প্রতিনিধির সাথে কথা বলুন।</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground mb-6">
                            আপনার আর্থিক হিসাব, উইথড্রয়াল বা প্রিমিয়াম সাবস্ক্রিপশন নিয়ে যেকোনো সমস্যায় আমাদের সাথে লাইভ চ্যাট করতে পারেন। আমরা দ্রুত সমাধানের চেষ্টা করব।
                        </p>
                        <Button onClick={openTawkChat} size="lg" className="w-full gap-2">
                            <HeadphonesIcon className="h-5 w-5" />
                            চ্যাট শুরু করুন
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="text-blue-500" />
                            সাপোর্টের সময়সীমা
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-medium">শনিবার - বৃহস্পতিবার</span>
                            <span className="text-muted-foreground">সকাল ১০টা - রাত ১০টা</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-medium">শুক্রবার</span>
                            <span className="text-muted-foreground">বিকাল ৩টা - রাত ১০টা</span>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                * সাপোর্ট টিমের ব্যস্ততার কারণে উত্তরের জন্য কিছুক্ষণ অপেক্ষা করতে হতে পারে।
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border-none shadow-none">
                <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="bg-white dark:bg-black/20 p-4 rounded-full mb-4 shadow-sm">
                        <ShieldCheck className="h-12 w-12 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">সুরক্ষিত এবং গোপনীয়</h3>
                    <p className="text-muted-foreground max-w-lg">
                        আপনার চ্যাটের সকল তথ্য এবং গোপনীয়তা আমাদের কাছে সুরক্ষিত। আমরা কখনোই আপনার সংবেদনশীল পাসওয়ার্ড বা ব্যক্তিগত পিন কোড জানতে চাইব না।
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
