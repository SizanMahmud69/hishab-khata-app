"use client";

import React, { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Gift, Star, History } from "lucide-react"
import { useBudget } from "@/context/budget-context";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

const MAX_STREAK_DAYS = 30;
const BASE_REWARD = 5;

interface CheckInRecord {
    date: string;
    points: number;
}

export default function CheckInPage() {
    const [lastCheckInDate, setLastCheckInDate] = useState<string | null>(null);
    const [consecutiveDays, setConsecutiveDays] = useState(0);
    const [history, setHistory] = useState<CheckInRecord[]>([]);
    const { addRewardPoints } = useBudget();
    const { toast } = useToast();
    
    useEffect(() => {
        const storedDate = localStorage.getItem('lastCheckInDate');
        const storedStreak = localStorage.getItem('consecutiveCheckInDays');
        const storedHistory = localStorage.getItem('checkInHistory');
        
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }

        if (storedDate && storedStreak) {
            const lastDate = new Date(storedDate);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);

            if (lastDate.toDateString() === yesterday.toDateString()) {
                setConsecutiveDays(parseInt(storedStreak, 10));
            } else if (lastDate.toDateString() !== today.toDateString()) {
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

    const calculateReward = (streak: number) => {
        // The streak passed is the *new* streak after today's check-in
        const effectiveStreak = Math.min(streak, MAX_STREAK_DAYS);
        return effectiveStreak * BASE_REWARD;
    };
    
    const rewardForToday = calculateReward(consecutiveDays + 1);

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
        const points = calculateReward(newConsecutiveDays);
        
        addRewardPoints(points);

        const today = new Date();
        const todayISO = today.toISOString();
        localStorage.setItem('lastCheckInDate', todayISO);
        localStorage.setItem('consecutiveCheckInDays', newConsecutiveDays.toString());
        
        // Update history
        const newHistoryRecord: CheckInRecord = { date: todayISO, points };
        const updatedHistory = [newHistoryRecord, ...history];
        localStorage.setItem('checkInHistory', JSON.stringify(updatedHistory));
        setHistory(updatedHistory);

        setLastCheckInDate(todayISO);
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

      <Card className="max-w-md mx-auto">
        <CardHeader>
            <CardTitle className='flex items-center gap-2'>
                <History className='w-5 h-5' />
                চেক-ইন হিস্টোরি
            </CardTitle>
            <CardDescription>আপনার সাম্প্রতিক চেক-ইন রেকর্ড।</CardDescription>
        </CardHeader>
        <CardContent>
            {history.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>তারিখ</TableHead>
                            <TableHead className='text-right'>অর্জিত পয়েন্ট</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.slice(0, 7).map((record, index) => (
                            <TableRow key={index}>
                                <TableCell className='font-medium'>
                                    {format(new Date(record.date), "d MMMM, yyyy", { locale: bn })}
                                </TableCell>
                                <TableCell className='text-right font-semibold text-primary'>+{record.points}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className='text-sm text-muted-foreground text-center py-4'>কোনো হিস্টোরি পাওয়া যায়নি।</p>
            )}
        </CardContent>
      </Card>

    </div>
  )
}
