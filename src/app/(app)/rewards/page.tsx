
"use client";

import React, { useMemo } from 'react';
import PageHeader from "@/components/page-header"
import { Banknote, Gift, Medal, Star, Trophy, ArrowUpCircle, ArrowDownCircle, History } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { bn } from 'date-fns/locale';
import { type WithdrawalRequest } from './withdraw/page';

const WITHDRAW_THRESHOLD = 1000;

interface UserProfile {
    points?: number;
}

interface CheckInRecord {
    id: string;
    date: string; // ISO String
    points: number;
    createdAt: any;
}

interface PointHistoryItem {
    type: 'earned' | 'spent';
    source: string;
    points: number;
    date: Date;
}

export default function RewardsPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isUserLoading } = useDoc<UserProfile>(userDocRef);
    const rewardPoints = userProfile?.points ?? 0;

    const checkInsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/checkIns`), orderBy("createdAt", "desc"));
    }, [user, firestore]);
    const { data: checkIns, isLoading: isCheckInsLoading } = useCollection<CheckInRecord>(checkInsQuery);
    
    const withdrawalsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/withdrawalRequests`), where("status", "==", "approved"), orderBy("processedAt", "desc"));
    }, [user, firestore]);
    const { data: withdrawals, isLoading: isWithdrawalsLoading } = useCollection<WithdrawalRequest>(withdrawalsQuery);

    const pointHistory = useMemo((): PointHistoryItem[] => {
        const history: PointHistoryItem[] = [];

        if (checkIns) {
            checkIns.forEach(ci => {
                history.push({
                    type: 'earned',
                    source: 'দৈনিক চেক-ইন',
                    points: ci.points,
                    date: parseISO(ci.date)
                });
            });
        }

        if (withdrawals) {
            withdrawals.forEach(wd => {
                if (wd.processedAt) {
                    history.push({
                        type: 'spent',
                        source: 'পয়েন্ট উইথড্র',
                        points: wd.points,
                        date: wd.processedAt.toDate()
                    });
                }
            });
        }
        
        return history.sort((a, b) => b.date.getTime() - a.date.getTime());

    }, [checkIns, withdrawals]);
    
    const canWithdraw = rewardPoints >= WITHDRAW_THRESHOLD;
    const isLoading = isUserLoading || isCheckInsLoading || isWithdrawalsLoading;

  if (isLoading) {
    return (
        <div className="flex-1 space-y-4">
            <PageHeader title="রিওয়ার্ড" description="আপনার অর্জিত রিওয়ার্ড এবং পয়েন্ট দেখুন।" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-72 w-full" />
        </div>
    )
  }

  return (
    <div className="flex-1 space-y-6">
      <PageHeader title="রিওয়ার্ড" description="আপনার অর্জিত রিওয়ার্ড এবং পয়েন্ট দেখুন।" />
      <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground border-yellow-600 overflow-hidden shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white drop-shadow-md">
                <Star className="text-white" />
                আপনার পয়েন্ট
            </CardTitle>
        </CardHeader>
        <CardContent className="relative">
            <Trophy className="absolute -top-4 -left-4 w-16 h-16 text-yellow-200 opacity-20 transform -rotate-12" />
            <Medal className="absolute -bottom-6 -right-4 w-20 h-20 text-yellow-200 opacity-20 transform rotate-12" />
            <div className="text-6xl font-bold text-center p-8 text-white drop-shadow-lg">{rewardPoints}</div>
            <p className="text-center text-yellow-100 font-medium">নিয়মিত অ্যাপ ব্যবহার করে আরও পয়েন্ট অর্জন করুন।</p>
        </CardContent>
      </Card>
      
      {canWithdraw ? (
        <Card className="border-primary">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Banknote className="text-primary" />
                    পয়েন্ট উইথড্র করুন
                </CardTitle>
                <CardDescription>
                    অভিনন্দন! আপনার {WITHDRAW_THRESHOLD} এর বেশি পয়েন্ট জমা হয়েছে। আপনি এখন আপনার পয়েন্ট টাকাতে রূপান্তর করে উইথড্র করতে পারবেন।
                </CardDescription>
            </CardHeader>
            <CardFooter>
                 <Button asChild className="w-full">
                    <Link href="/withdraw">
                        এখনই উইথড্র করুন
                    </Link>
                </Button>
            </CardFooter>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 border rounded-lg bg-card text-card-foreground shadow-sm">
            <Gift className="w-12 h-12 text-primary mb-3" />
            <p className="text-muted-foreground">পয়েন্ট দিয়ে আকর্ষণীয় অফার রিডিম করুন।</p>
            <p className="text-sm text-muted-foreground">
                {WITHDRAW_THRESHOLD} পয়েন্ট অর্জন করলে উইথড্র অপশন দেখতে পাবেন।
            </p>
        </div>
      )}

       <Card>
        <CardHeader>
            <CardTitle className='flex items-center gap-2'>
                <History className='w-5 h-5' />
                পয়েন্ট হিস্টোরি
            </CardTitle>
            <CardDescription>আপনার সাম্প্রতিক পয়েন্ট অর্জন এবং খরচের তালিকা।</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {pointHistory.length > 0 ? (
                pointHistory.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                             {item.type === 'earned' ? <ArrowUpCircle className="h-6 w-6 text-green-500" /> : <ArrowDownCircle className="h-6 w-6 text-red-500" />}
                             <div>
                                <p className="font-semibold">{item.source}</p>
                                <p className="text-sm text-muted-foreground">{format(item.date, "d MMMM, yyyy", { locale: bn })}</p>
                             </div>
                        </div>
                         <p className={`font-bold ${item.type === 'earned' ? 'text-green-500' : 'text-red-500'}`}>
                           {item.type === 'earned' ? '+' : '-'}{item.points}
                         </p>
                    </div>
                ))
            ) : (
                <p className='text-sm text-muted-foreground text-center py-4'>কোনো হিস্টোরি পাওয়া যায়নি।</p>
            )}
        </CardContent>
      </Card>
    </div>
  )
}

    