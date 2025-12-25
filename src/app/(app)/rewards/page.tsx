

"use client";

import React, { useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from "@/components/page-header"
import { Banknote, Gift, Medal, Star, Trophy, ArrowUpCircle, ArrowDownCircle, History, Undo2, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { bn } from 'date-fns/locale';
import { type WithdrawalRequest } from '../withdraw/page';
import { Badge } from '@/components/ui/badge';
import { useBudget } from '@/context/budget-context';


interface UserProfile {
    points?: number;
}

interface CheckInRecord {
    id: string;
    date: string; // ISO String
    points: number;
    createdAt: any;
}

interface Referral {
    id: string;
    referredUserName: string;
    bonusPoints: number;
    createdAt: any; // Firestore Timestamp
}


interface PointHistoryItem {
    type: 'earned' | 'spent' | 'refunded';
    source: string;
    points: number;
    date: Date;
    status?: 'pending' | 'approved' | 'rejected';
}

const CONVERSION_RATE = 5; // 100 points = 5 BDT

function RewardsPageContent() {
    const { user } = useUser();
    const firestore = useFirestore();
    const searchParams = useSearchParams();
    const historyRef = useRef<HTMLDivElement>(null);
    const { minWithdrawalPoints } = useBudget();

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
        return query(collection(firestore, `users/${user.uid}/withdrawalRequests`), orderBy("requestedAt", "desc"));
    }, [user, firestore]);
    const { data: allWithdrawals, isLoading: isWithdrawalsLoading } = useCollection<WithdrawalRequest>(withdrawalsQuery);
    
    const referralsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/referrals`), orderBy("createdAt", "desc"));
    }, [user, firestore]);
    const { data: referrals, isLoading: areReferralsLoading } = useCollection<Referral>(referralsQuery);


    useEffect(() => {
        if (searchParams.get('section') === 'history' && historyRef.current && !isWithdrawalsLoading && !isCheckInsLoading && !areReferralsLoading) {
            historyRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [searchParams, isWithdrawalsLoading, isCheckInsLoading, areReferralsLoading]);

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
        
        if (referrals) {
            referrals.forEach(ref => {
                 if (ref.createdAt) {
                    history.push({
                        type: 'earned',
                        source: 'রেফারেল বোনাস',
                        points: ref.bonusPoints,
                        date: ref.createdAt.toDate(),
                    });
                }
            })
        }
        
        if (allWithdrawals) {
            allWithdrawals.forEach(wd => {
                if (wd.requestedAt) {
                    history.push({
                        type: 'spent',
                        source: 'পয়েন্ট উইথড্র',
                        points: wd.points,
                        date: wd.requestedAt.toDate(),
                        status: wd.status,
                    });
                }
                
                if (wd.status === 'rejected' && wd.isRefunded && wd.processedAt) {
                    history.push({
                        type: 'refunded',
                        source: 'পয়েন্ট রিফান্ড',
                        points: wd.points,
                        date: wd.processedAt.toDate(),
                        status: 'approved' // To show it as a completed transaction
                    });
                }
            });
        }
        
        return history.sort((a, b) => b.date.getTime() - a.date.getTime());

    }, [checkIns, allWithdrawals, referrals]);
    
    const canWithdraw = rewardPoints >= minWithdrawalPoints;
    const isLoading = isUserLoading || isCheckInsLoading || isWithdrawalsLoading || areReferralsLoading;
    const equivalentAmountBdt = Math.floor(rewardPoints / 100) * CONVERSION_RATE;
    
    const getStatusText = (status?: 'pending' | 'approved' | 'rejected') => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="border-yellow-500 text-yellow-600">পেন্ডিং</Badge>;
            case 'approved': return <Badge className="bg-green-500 hover:bg-green-500/80">সম্পন্ন</Badge>;
            case 'rejected': return <Badge variant="destructive">বাতিল</Badge>;
            default: return null;
        }
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'দৈনিক চেক-ইন': return <Star className="h-6 w-6 text-yellow-500" />;
            case 'রেফারেল বোনাস': return <Users className="h-6 w-6 text-blue-500" />;
            case 'পয়েন্ট উইথড্র': return <ArrowDownCircle className="h-6 w-6 text-red-500" />;
            case 'পয়েন্ট রিফান্ড': return <Undo2 className="h-6 w-6 text-blue-500" />;
            default: return <Gift className="h-6 w-6 text-gray-500" />;
        }
    }


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
        <CardContent className="relative text-center">
            <Trophy className="absolute -top-4 -left-4 w-16 h-16 text-yellow-200 opacity-20 transform -rotate-12" />
            <Medal className="absolute -bottom-6 -right-4 w-20 h-20 text-yellow-200 opacity-20 transform rotate-12" />
            <div className="text-6xl font-bold text-white drop-shadow-lg">{rewardPoints}</div>
            <p className="text-lg font-semibold text-yellow-100 mt-1">≈ ৳ {equivalentAmountBdt}</p>
            <p className="text-center text-yellow-200 font-medium mt-4">নিয়মিত অ্যাপ ব্যবহার করে আরও পয়েন্ট অর্জন করুন।</p>
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
                    অভিনন্দন! আপনার {minWithdrawalPoints} এর বেশি পয়েন্ট জমা হয়েছে। আপনি এখন আপনার পয়েন্ট টাকাতে রূপান্তর করে উইথড্র করতে পারবেন।
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
                {minWithdrawalPoints} পয়েন্ট অর্জন করলে উইথড্র অপশন দেখতে পাবেন।
            </p>
        </div>
      )}

       <Card ref={historyRef}>
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
                             {getSourceIcon(item.source)}
                             <div>
                                <div className="font-semibold flex items-center gap-2">
                                  {item.source}
                                  {item.source === 'পয়েন্ট উইথড্র' && getStatusText(item.status)}
                                </div>
                                <p className="text-sm text-muted-foreground">{format(item.date, "d MMMM, yyyy, h:mm a", { locale: bn })}</p>
                             </div>
                        </div>
                         <p className={`font-bold ${item.type === 'earned' || item.type === 'refunded' ? 'text-green-500' : 'text-red-500'}`}>
                           {item.type === 'earned' || item.type === 'refunded' ? '+' : '-'}{item.points}
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

export default function RewardsPage() {
    return (
        <React.Suspense fallback={<div>লোড হচ্ছে...</div>}>
            <RewardsPageContent />
        </React.Suspense>
    )
}
