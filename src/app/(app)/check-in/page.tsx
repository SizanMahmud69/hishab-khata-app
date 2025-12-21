"use client";

import React, { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Gift } from "lucide-react"
import { useBudget } from "@/context/budget-context";
import { useToast } from "@/hooks/use-toast";

export default function CheckInPage() {
    const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
    const { addRewardPoints } = useBudget();
    const { toast } = useToast();
    
    useEffect(() => {
        const storedDate = localStorage.getItem('lastCheckInDate');
        setLastCheckIn(storedDate);
    }, []);

    const isCheckedInToday = () => {
        if (!lastCheckIn) return false;
        const today = new Date().toDateString();
        const lastCheckInDate = new Date(lastCheckIn).toDateString();
        return today === lastCheckInDate;
    };

    const handleCheckIn = () => {
        if (isCheckedInToday()) {
            toast({
                variant: "destructive",
                title: "ইতিমধ্যে চেক-ইন করেছেন",
                description: "আপনি আজকের জন্য ইতিমধ্যে চেক-ইন সম্পন্ন করেছেন।",
            });
            return;
        }

        const points = 10;
        addRewardPoints(points);
        const today = new Date().toISOString();
        localStorage.setItem('lastCheckInDate', today);
        setLastCheckIn(today);

        toast({
            title: "অভিনন্দন!",
            description: `আপনি ${points} পয়েন্ট অর্জন করেছেন।`,
        });
    }

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="দৈনিক চেক-ইন" description="প্রতিদিন চেক-ইন করে রিওয়ার্ড পয়েন্ট অর্জন করুন।" />
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>আজকের চেক-ইন</CardTitle>
          <CardDescription>
            দৈনিক চেক-ইন করে আপনার ধারাবাহিকতা বজায় রাখুন।
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8">
            {isCheckedInToday() ? (
                <div className="flex flex-col items-center gap-4">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                    <p className="font-semibold text-lg">আজকের জন্য আপনার চেক-ইন সম্পন্ন!</p>
                    <p className="text-muted-foreground">আগামীকাল আবার চেক-ইন করে পয়েন্ট নিন।</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <Gift className="w-16 h-16 text-primary" />
                    <p className="text-muted-foreground">আজ চেক-ইন করে ১০ পয়েন্ট অর্জন করুন।</p>
                    <Button onClick={handleCheckIn} size="lg" className="mt-4">
                        এখনই চেক-ইন করুন
                    </Button>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
