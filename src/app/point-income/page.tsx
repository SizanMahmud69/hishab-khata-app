

"use client";

import React, { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBudget } from "@/context/budget-context";
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, increment, serverTimestamp, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, MousePointerClick, Star, Tv } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { createNotification } from '@/components/app-header';

const TOTAL_ADS_TO_VIEW = 4;
const CLICK_AD_INDEX = 4; // The 5th ad (index 4) is for clicking
const WAIT_SECONDS = 10;

interface AdTaskStatus {
    lastCompletedDate: string; // YYYY-MM-DD
}

export default function PointIncomePage() {
    const { adTaskPoints, isLoading: isBudgetLoading } = useBudget();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [viewedAds, setViewedAds] = useState<number[]>([]);
    const [isWaiting, setIsWaiting] = useState(false);
    const [countdown, setCountdown] = useState(WAIT_SECONDS);
    const [taskCompletedToday, setTaskCompletedToday] = useState(false);
    const [isStatusLoading, setIsStatusLoading] = useState(true);

    const todayStr = new Date().toISOString().split('T')[0];

    const adTaskStatusRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/adTaskStatus/daily`);
    }, [user, firestore]);

    useEffect(() => {
        if (!adTaskStatusRef) return;
        
        const getStatus = async () => {
            try {
                const docSnap = await getDoc(adTaskStatusRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as AdTaskStatus;
                    if (data.lastCompletedDate === todayStr) {
                        setTaskCompletedToday(true);
                    }
                }
            } catch (error) {
                console.error("Error fetching ad task status:", error);
            } finally {
                setIsStatusLoading(false);
            }
        };

        getStatus();
    }, [adTaskStatusRef, todayStr]);


    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isWaiting && countdown > 0) {
            timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        } else if (isWaiting && countdown === 0) {
            const rewardPoints = adTaskPoints[CLICK_AD_INDEX];
            if (rewardPoints && user && firestore) {
                 const completeTask = async () => {
                    const userDocRef = doc(firestore, 'users', user.uid);
                    await updateDoc(userDocRef, {
                        points: increment(rewardPoints)
                    });

                    const adTasksCollectionRef = collection(firestore, `users/${user.uid}/adTasks`);
                    await addDoc(adTasksCollectionRef, {
                        points: rewardPoints,
                        date: serverTimestamp(),
                        createdAt: serverTimestamp()
                    });
                    
                    if (adTaskStatusRef) {
                        await setDoc(adTaskStatusRef, { lastCompletedDate: todayStr });
                    }

                    await createNotification({
                        title: "পয়েন্ট অর্জন করেছেন!",
                        description: `বিজ্ঞাপন দেখার টাস্ক সম্পন্ন করার জন্য আপনি ${rewardPoints} পয়েন্ট পেয়েছেন।`,
                        link: "/rewards?section=history"
                    }, user.uid, firestore);

                    toast({
                        title: "অভিনন্দন!",
                        description: `আপনি ${rewardPoints} পয়েন্ট অর্জন করেছেন।`
                    });

                    setIsWaiting(false);
                    setTaskCompletedToday(true);
                };
                completeTask();
            }
        }
        return () => clearTimeout(timer);
    }, [isWaiting, countdown, user, firestore, adTaskPoints, toast, todayStr, adTaskStatusRef]);

    const handleAdClick = (index: number) => {
        const adUrl = 'https://pl28428118.effectivegatecpm.com/0c/22/02/0c220271b2d231c2e61062d769563457';
        window.open(adUrl, '_blank');

        if (viewedAds.length < CLICK_AD_INDEX) {
            if (!viewedAds.includes(index)) {
                setViewedAds(prev => [...prev, index]);
            }
        } else if (viewedAds.length === CLICK_AD_INDEX && index === CLICK_AD_INDEX) {
            setIsWaiting(true);
        }
    };
    
    const getInstruction = () => {
        if (taskCompletedToday) {
            return "আপনি আজকের টাস্ক সম্পন্ন করেছেন। অনুগ্রহ করে আগামীকাল আবার আসুন।";
        }
        if (viewedAds.length < CLICK_AD_INDEX) {
            return `বিজ্ঞাপন ${viewedAds.length + 1} দেখুন (${viewedAds.length + 1}/${TOTAL_ADS_TO_VIEW + 1})`;
        }
        return `বিজ্ঞাপন ${CLICK_AD_INDEX + 1}-এ ক্লিক করে ${WAIT_SECONDS} সেকেন্ড অপেক্ষা করুন।`;
    };

    const isCardDisabled = (index: number) => {
        if (taskCompletedToday || isWaiting) return true;
        if (viewedAds.length < index) return true;
        if (viewedAds.length < CLICK_AD_INDEX && viewedAds.includes(index)) return true;
        return false;
    }

    if (isBudgetLoading || isStatusLoading) {
        return (
            <div className="flex-1 space-y-4">
                <PageHeader title="পয়েন্ট ইনকাম" description="বিজ্ঞাপন দেখে পয়েন্ট অর্জন করুন।" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(5)].map((_, i) => (
                        <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
                    ))}
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex-1 space-y-6">
            <PageHeader title="পয়েন্ট ইনকাম" description="নিচের টাস্কগুলো সম্পন্ন করে প্রতিদিন পয়েন্ট অর্জন করুন।" />
            
            <Card className="bg-primary/10 border-primary">
                <CardHeader>
                    <CardTitle>করণীয়</CardTitle>
                    <CardDescription className="text-lg font-semibold text-primary">{getInstruction()}</CardDescription>
                </CardHeader>
            </Card>

            {taskCompletedToday && (
                 <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
                    <CardContent className="p-6 text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <p className="text-xl font-bold">আজকের টাস্ক সম্পন্ন!</p>
                        <p className="text-muted-foreground">নতুন টাস্কের জন্য আগামীকাল আবার আসুন।</p>
                    </CardContent>
                </Card>
            )}

            {isWaiting && (
                <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                    <CardContent className="p-6 text-center">
                         <div className="text-6xl font-bold text-yellow-500 mb-4">{countdown}</div>
                         <p className="text-lg font-semibold">অনুগ্রহ করে অপেক্ষা করুন...</p>
                         <p className="text-muted-foreground">পয়েন্ট যোগ হওয়ার জন্য এই পেজটি খোলা রাখুন।</p>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {(adTaskPoints || []).slice(0, TOTAL_ADS_TO_VIEW + 1).map((points, index) => (
                    <Card 
                        key={index}
                        className={cn("text-center transition-all", isCardDisabled(index) && "opacity-50 cursor-not-allowed")}
                    >
                        <CardHeader>
                            <div className={cn("mx-auto flex h-16 w-16 items-center justify-center rounded-full",
                                index < CLICK_AD_INDEX ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'
                            )}>
                               {index < CLICK_AD_INDEX 
                                    ? <Tv className="h-8 w-8 text-blue-500" />
                                    : <MousePointerClick className="h-8 w-8 text-green-500" />
                               }
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardTitle>
                                {index < CLICK_AD_INDEX ? `বিজ্ঞাপন ${index + 1}` : `বিজ্ঞাপনে ক্লিক`}
                            </CardTitle>
                             <CardDescription>
                                {index < CLICK_AD_INDEX ? 'দেখুন' : 'ক্লিক করুন'}
                            </CardDescription>
                        </CardContent>
                        <CardFooter className="flex-col gap-4">
                            <div className="flex items-center justify-center gap-2 text-xl font-bold text-primary">
                                <Star className="w-5 h-5" />
                                <span>{points ?? 0} পয়েন্ট</span>
                            </div>
                            <Button 
                                className="w-full" 
                                onClick={() => handleAdClick(index)}
                                disabled={isCardDisabled(index)}
                            >
                                {viewedAds.includes(index) ? 'দেখা হয়েছে' : 'কাজ শুরু করুন'}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
