
"use client";

import React from 'react';
import PageHeader from "@/components/page-header"
import { Banknote, Gift, Medal, Star, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const WITHDRAW_THRESHOLD = 1000;

interface UserProfile {
    points?: number;
}

export default function RewardsPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading } = useDoc<UserProfile>(userDocRef);
    const rewardPoints = userProfile?.points ?? 0;
    
    const canWithdraw = rewardPoints >= WITHDRAW_THRESHOLD;

  if (isLoading) {
    return (
        <div className="flex-1 space-y-4">
            <PageHeader title="রিওয়ার্ড" description="আপনার অর্জিত রিওয়ার্ড এবং পয়েন্ট দেখুন।" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-60 w-full" />
        </div>
    )
  }

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="রিওয়ার্ড" description="আপনার অর্জিত রিওয়ার্ড এবং পয়েন্ট দেখুন।" />
      <Card className="bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 border-yellow-600 overflow-hidden">
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
        <div className="flex flex-col items-center justify-center h-60 border rounded-lg bg-card text-card-foreground shadow-sm mt-6">
            <Gift className="w-16 h-16 text-primary mb-4" />
            <p className="text-muted-foreground">পয়েন্ট দিয়ে আকর্ষণীয় অফার রিডিম করুন।</p>
            <p className="text-sm text-muted-foreground">
                {WITHDRAW_THRESHOLD} পয়েন্ট অর্জন করলে উইথড্র অপশন দেখতে পাবেন।
            </p>
        </div>
      )}
    </div>
  )
}
