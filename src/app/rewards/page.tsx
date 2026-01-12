
"use client";

import React, { useMemo, useRef, useEffect, useState, Fragment } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from "@/components/page-header"
import { Banknote, Gift, Medal, Star, Trophy, ArrowUpCircle, ArrowDownCircle, History, Undo2, Users, Crown } from "lucide-react"
import { useBudget, PointHistoryItem } from "@/context/budget-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { AdBanner } from '@/components/ad-banner';


function RewardsPageContent() {
    const searchParams = useSearchParams();
    const historyRef = useRef<HTMLDivElement>(null);
    const { 
        rewardPoints, 
        minWithdrawalPoints, 
        bdtPer100Points, 
        isLoading, 
        pointHistory 
    } = useBudget();

    useEffect(() => {
        if (searchParams.get('section') === 'history' && historyRef.current && !isLoading) {
            historyRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [searchParams, isLoading]);
    
    const canWithdraw = rewardPoints >= minWithdrawalPoints;
    const equivalentAmountBdt = Math.floor(rewardPoints / 100) * bdtPer100Points;
    
    const getStatusText = (status?: 'pending' | 'approved' | 'rejected') => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="border-yellow-500 text-yellow-600">পেন্ডিং</Badge>;
            case 'approved': return <Badge className="bg-green-600 hover:bg-green-600/80">সম্পন্ন</Badge>;
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
            case 'সাবস্ক্রিপশন ক্রয়': return <Crown className="h-6 w-6 text-yellow-600" />;
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
            <p className="text-sm font-medium text-yellow-200 mt-2">(১০০ পয়েন্ট = ৳ {bdtPer100Points})</p>
             <p className="text-lg font-semibold text-yellow-100 mt-1">≈ ৳{equivalentAmountBdt}</p>
        </CardContent>
        <CardFooter className='flex flex-col items-center justify-center p-4 bg-black/10'>
            <p className="text-center text-yellow-200 font-medium text-sm">নিয়মিত অ্যাপ ব্যবহার করে আরও পয়েন্ট অর্জন করুন।</p>
        </CardFooter>
      </Card>
      
      {canWithdraw ? (
        <Card className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full">
                        <Banknote className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">পয়েন্ট উইথড্র করুন</h3>
                        <p className="text-sm opacity-90 max-w-sm">আপনার অর্জিত পয়েন্ট এখন টাকায় রূপান্তর করে সহজেই উইথড্র করতে পারবেন।</p>
                    </div>
                </div>
                 <Button asChild variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-6 py-3 w-full sm:w-auto flex-shrink-0">
                    <Link href="/withdraw">
                        এখনই উইথড্র করুন
                    </Link>
                </Button>
            </CardContent>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center text-center p-6 text-card-foreground">
            <Gift className="w-12 h-12 text-primary mb-4" />
            <CardTitle className="text-lg font-semibold mb-2">অপর্যাপ্ত পয়েন্ট</CardTitle>
            <CardDescription>
                উইথড্র করার জন্য আপনার কমপক্ষে {minWithdrawalPoints} পয়েন্ট প্রয়োজন। নিয়মিত অ্যাপ ব্যবহার করে আরও পয়েন্ট অর্জন করুন!
            </CardDescription>
        </Card>
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
                    <Fragment key={index}>
                        <div className="flex items-center justify-between p-3 rounded-lg border">
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
                            <p className={`font-bold ${item.type === 'earned' || item.type === 'refunded' ? 'text-green-600' : 'text-red-500'}`}>
                            {item.type === 'earned' || item.type === 'refunded' ? '+' : '-'}{item.points}
                            </p>
                        </div>
                        {(index + 1) % 5 === 0 && (
                            <div className='my-4'>
                                <AdBanner page="rewards" adIndex={(index + 1) / 5} />
                            </div>
                        )}
                    </Fragment>
                ))
            ) : (
                <p className='text-sm text-muted-foreground text-center py-4'>কোনো হিস্টোরি পাওয়া যায়নি।</p>
            )}
        </CardContent>
      </Card>
      <AdBanner page="rewards" adIndex={0} />
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
