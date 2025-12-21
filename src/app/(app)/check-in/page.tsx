"use client";

import React, { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Gift, Star } from "lucide-react"
import { useBudget } from "@/context/budget-context";
import { useToast } from "@/hooks/use-toast";

const MAX_STREAK_DAYS = 30;
const BASE_REWARD = 5;

export default function CheckInPage() {
    const [lastCheckInDate, setLastCheckInDate] = useState<string | null>(null);
    const [consecutiveDays, setConsecutiveDays] = useState(0);
    const { addRewardPoints } = useBudget();
    const { toast } = useToast();
    
    useEffect(() => {
        const storedDate = localStorage.getItem('lastCheckInDate');
        const storedStreak = localStorage.getItem('consecutiveCheckInDays');
        
        if (storedDate && storedStreak) {
            const lastDate = new Date(storedDate);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);

            // Check if the last check-in was yesterday to continue the streak
            if (lastDate.toDateString() === yesterday.toDateString()) {
                setConsecutiveDays(parseInt(storedStreak, 10));
            } else if (lastDate.toDateString() !== today.toDateString()) {
                // If they missed a day (and it's not today), reset streak
                setConsecutiveDays(0);
            } else {
                 setConsecutiveDays(parseInt(storedStreak, 10));
            }
            setLastCheckInDate(storedDate);
        } else {
            setConsecutiveDays(0);
        }
    }, []);

    const isCheckedInToday = () => {
        if (!lastCheckInDate) return false;
        const today = new Date().toDateString();
        const lastDate = new Date(lastCheckInDate).toDateString();
        return today === lastDate;
    };

    const calculateReward = () => {
        const currentStreak = isCheckedInToday() ? consecutiveDays : consecutiveDays + 1;
        return Math.min(currentStreak, MAX_STREAK_DAYS) * BASE_REWARD;
    };
    
    const rewardForToday = calculateReward();

    const handleCheckIn = () => {
        if (isCheckedInToday()) {
            toast({
                variant: "destructive",
                title: "ইতিমধ্যে চেক-ইন করেছেন",
                description: "আপনি আজকের জন্য ইতিমধ্যে চেক-ইন সম্পন্ন করেছেন।",
            });
            return;
        }
        
        const newConsecutiveDays = consecutiveDays + 1;
        const points = calculateReward();
        
        addRewardPoints(points);

        const today = new Date().toISOString();
        localStorage.setItem('lastCheckInDate', today);
        localStorage.setItem('consecutiveCheckInDays', newConsecutiveDays.toString());
        
        setLastCheckInDate(today);
        setConsecutiveDays(newConsecutiveDays);

        toast({
            title: "অভিনন্দন!",
            description: `আপনি ${points} পয়েন্ট অর্জন করেছেন। আপনার ধারাবাহিক চেক-ইন ${newConsecutiveDays} দিন!`,
        });
    }

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="দৈনিক চেক-ইন" description="প্রতিদিন চেক-ইন করে রিওয়ার্ড পয়েন্ট অর্জন করুন।" />
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>আজকের চেক-ইন</CardTitle>
          <CardDescription>
            ধারাবাহিক চেক-ইন করে আপনার পুরস্কার বাড়াতে থাকুন।
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8">
            {isCheckedInToday() ? (
                <div className="flex flex-col items-center gap-4">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                    <p className="font-semibold text-lg">আজকের জন্য আপনার চেক-ইন সম্পন্ন!</p>
                    <p className="text-muted-foreground">আপনার বর্তমান ধারাবাহিকতা: {consecutiveDays} দিন।</p>
                    <p className="text-muted-foreground">আগামীকাল আবার চেক-ইন করে পয়েন্ট নিন।</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <Gift className="w-16 h-16 text-primary" />
                     <div className='flex flex-col items-center gap-1'>
                        <p className="text-lg font-semibold">আজকের পুরস্কার</p>
                        <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                            <Star className="w-6 h-6" />
                            <span>{rewardForToday} পয়েন্ট</span>
                        </div>
                        <p className="text-sm text-muted-foreground">আপনার বর্তমান ধারাবাহিকতা: {consecutiveDays} দিন।</p>
                     </div>
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
