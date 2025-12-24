"use client";

import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Gift, Star, History, Loader2 } from "lucide-react"
import { useBudget } from "@/context/budget-context";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, isToday, isYesterday, parseISO, subDays } from 'date-fns';
import { bn } from 'date-fns/locale';
import { useUser, useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, setDoc, doc } from 'firebase/firestore';

const MAX_STREAK_DAYS = 30;
const BASE_REWARD = 5;

interface CheckInRecord {
    id: string;
    date: string; // ISO String
    points: number;
    createdAt: any;
}

export default function CheckInPage() {
    const { addRewardPoints } = useBudget();
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const checkInsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/checkIns`), orderBy("createdAt", "desc"), limit(30));
    }, [user, firestore]);
    
    const { data: history, isLoading } = useCollection<CheckInRecord>(checkInsQuery);

    const { consecutiveDays, isCheckedInToday } = useMemo(() => {
        if (!history || history.length === 0) {
            return { consecutiveDays: 0, isCheckedInToday: false };
        }

        const latestCheckIn = history[0];
        const lastDate = parseISO(latestCheckIn.date);
        
        const checkedInToday = isToday(lastDate);
        if (checkedInToday) {
             let streak = 1;
             let lastStreakDate = lastDate;
             for (let i = 1; i < history.length; i++) {
                 const currentCheckInDate = parseISO(history[i].date);
                 const expectedPreviousDate = subDays(lastStreakDate, 1);
                 if (currentCheckInDate.toDateString() === expectedPreviousDate.toDateString()) {
                     streak++;
                     lastStreakDate = currentCheckInDate;
                 } else {
                     break; 
                 }
             }
             return { consecutiveDays: streak, isCheckedInToday: true };
        }

        if (isYesterday(lastDate)) {
             let streak = 1;
             let lastStreakDate = lastDate;
             for (let i = 1; i < history.length; i++) {
                 const currentCheckInDate = parseISO(history[i].date);
                 const expectedPreviousDate = subDays(lastStreakDate, 1);

                 if (currentCheckInDate.toDateString() === expectedPreviousDate.toDateString()) {
                     streak++;
                     lastStreakDate = currentCheckInDate;
                 } else {
                     break; 
                 }
             }
             return { consecutiveDays: streak, isCheckedInToday: false };
        }
        
        return { consecutiveDays: 0, isCheckedInToday: false };

    }, [history]);

    const calculateReward = (streak: number) => {
        const effectiveStreak = Math.min(streak, MAX_STREAK_DAYS);
        return effectiveStreak * BASE_REWARD;
    };
    
    const rewardForToday = calculateReward(consecutiveDays + 1);

    const handleCheckIn = async () => {
        if (isCheckedInToday || !user || !firestore) {
            toast({
                variant: "destructive",
                title: "ইতিমধ্যে চেক-ইন করেছেন",
                description: "আপনি আজকের জন্য ইতিমধ্যে চেক-ইন সম্পন্ন করেছেন।",
            });
            return;
        }
        
        setIsSubmitting(true);
        const newConsecutiveDays = consecutiveDays + 1;
        const points = calculateReward(newConsecutiveDays);
        
        const today = new Date();
        const newCheckIn = {
            date: today.toISOString(),
            points: points,
            createdAt: serverTimestamp(),
        };

        const userUpdateData = {
            lastCheckIn: today.toISOString().split('T')[0],
            checkInStreak: newConsecutiveDays
        };

        try {
            const collectionRef = collection(firestore, `users/${user.uid}/checkIns`);
            await addDoc(collectionRef, newCheckIn);

            await addRewardPoints(points);

            const userDocRef = doc(firestore, `users/${user.uid}`);
            
            setDoc(userDocRef, userUpdateData, { merge: true }).catch(error => {
                 errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: userDocRef.path,
                        operation: 'update',
                        requestResourceData: userUpdateData
                    })
                )
            });

            toast({
                title: "অভিনন্দন!",
                description: `আপনি ${points} পয়েন্ট অর্জন করেছেন। আপনার ধারাবাহিক চেক-ইন ${newConsecutiveDays} দিন!`,
            });
        } catch (error) {
            console.error("Error adding check-in:", error);
            toast({
                variant: "destructive",
                title: "ত্রুটি",
                description: "চেক-ইন করার সময় একটি সমস্যা হয়েছে।",
            });
        } finally {
            setIsSubmitting(false);
        }
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
            {isLoading ? (
                <p>লোড হচ্ছে...</p>
            ) : isCheckedInToday ? (
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
                    <Button onClick={handleCheckIn} size="lg" className="mt-4" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'প্রসেসিং...' : 'এখনই চেক-ইন করুন'}
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
            {history && history.length > 0 ? (
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
                                    {format(parseISO(record.date), "d MMMM, yyyy", { locale: bn })}
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
