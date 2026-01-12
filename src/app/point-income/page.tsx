
"use client";

import React, { useState, useEffect, useMemo, Fragment } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useBudget } from "@/context/budget-context";
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, increment, serverTimestamp, getDoc, setDoc, addDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { startOfDay, endOfDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, MousePointerClick, Star, Tv } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { createNotification } from '@/components/app-header';

const TOTAL_ADS_TO_VIEW = 4;
const CLICK_AD_INDEX = 4; // The 5th ad (index 4) is for clicking

interface AdTaskStatus {
    lastCompletedDate: string; // YYYY-MM-DD
}

interface AdTask {
    points: number;
    date: Timestamp;
}

declare global {
    interface Window {
        show_10446368: (format?: 'pop') => Promise<void>;
    }
}

export default function PointIncomePage() {
    const { adTaskPoints, isLoading: isBudgetLoading } = useBudget();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [isWaiting, setIsWaiting] = useState(false);
    const [taskCompletedToday, setTaskCompletedToday] = useState(false);
    const [isStatusLoading, setIsStatusLoading] = useState(true);
    const [viewedAdsCount, setViewedAdsCount] = useState(0);

    const todayStr = new Date().toISOString().split('T')[0];

    const adTaskStatusRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/adTaskStatus/daily`);
    }, [user, firestore]);

    useEffect(() => {
        if (!user || !firestore || !adTaskStatusRef) return;

        const checkStatusAndProgress = async () => {
            setIsStatusLoading(true);
            try {
                // Check if the entire task for the day is marked as complete
                const statusDocSnap = await getDoc(adTaskStatusRef);
                if (statusDocSnap.exists() && statusDocSnap.data().lastCompletedDate === todayStr) {
                    setTaskCompletedToday(true);
                    setViewedAdsCount(TOTAL_ADS_TO_VIEW + 1);
                    setIsStatusLoading(false);
                    return;
                }

                // If not fully complete, fetch today's ad tasks to determine progress
                const today = new Date();
                const startOfTodayDate = startOfDay(today);
                const endOfTodayDate = endOfDay(today);

                const adTasksQuery = query(
                    collection(firestore, `users/${user.uid}/adTasks`),
                    where('date', '>=', startOfTodayDate),
                    where('date', '<=', endOfTodayDate)
                );

                const querySnapshot = await getDocs(adTasksQuery);
                setViewedAdsCount(querySnapshot.size);

            } catch (error) {
                console.error("Error fetching ad task status/progress:", error);
            } finally {
                setIsStatusLoading(false);
            }
        };

        checkStatusAndProgress();
    }, [user, firestore, adTaskStatusRef, todayStr]);


    const rewardUser = async () => {
        const rewardPoints = adTaskPoints[viewedAdsCount];
        if (rewardPoints && user && firestore) {
             const completeTask = async () => {
                const userDocRef = doc(firestore, 'users', user.uid);
                await updateDoc(userDocRef, {
                    points: increment(rewardPoints)
                });

                const adTasksCollectionRef = collection(firestore, `users/${user.uid}/adTasks`);
                await addDoc(adTasksCollectionRef, {
                    points: rewardPoints,
                    date: serverTimestamp(), // Use server timestamp for accuracy
                    createdAt: serverTimestamp()
                });
                
                const newViewCount = viewedAdsCount + 1;
                setViewedAdsCount(newViewCount);
                
                if (adTaskStatusRef && newViewCount > TOTAL_ADS_TO_VIEW) {
                    await setDoc(adTaskStatusRef, { lastCompletedDate: todayStr });
                    setTaskCompletedToday(true);
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

            };
            await completeTask();
        }
        setIsWaiting(false);
    }


    const handleAdClick = (index: number) => {
        if (typeof window.show_10446368 === 'function') {
            setIsWaiting(true);
            window.show_10446368('pop').then(() => {
                rewardUser();
            }).catch((error) => {
                console.error("Ad error:", error);
                toast({
                    variant: "destructive",
                    title: "বিজ্ঞাপন দেখাতে সমস্যা",
                    description: "বিজ্ঞাপনটি লোড করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।"
                });
                setIsWaiting(false);
            });
        } else {
            console.error("Ad function not found");
             toast({
                variant: "destructive",
                title: "ত্রুটি",
                description: "বিজ্ঞাপন লোড করার ফাংশনটি পাওয়া যায়নি।"
            });
        }
    };
    
    const getInstruction = () => {
        if (taskCompletedToday) {
            return "আপনি আজকের টাস্ক সম্পন্ন করেছেন। অনুগ্রহ করে আগামীকাল আবার আসুন।";
        }
        if (viewedAdsCount <= TOTAL_ADS_TO_VIEW) {
            return `বিজ্ঞাপন ${viewedAdsCount + 1} দেখুন (${viewedAdsCount + 1}/${TOTAL_ADS_TO_VIEW + 1})`;
        }
        return `আজকের সকল টাস্ক সম্পন্ন।`;
    };

    const isCardDisabled = (index: number) => {
        if (taskCompletedToday || isWaiting) return true;
        if (viewedAdsCount !== index) return true;
        return false;
    }

    if (isBudgetLoading || isStatusLoading) {
        return (
            <div className="flex-1 space-y-4">
                <PageHeader title="পয়েন্ট ইনকাম" description="বিজ্ঞাপন দেখে পয়েন্ট অর্জন করুন।" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {(adTaskPoints || []).slice(0, TOTAL_ADS_TO_VIEW + 1).map((points, index) => (
                    <Card 
                        key={index}
                        className={cn("text-center transition-all", isCardDisabled(index) && "opacity-50 cursor-not-allowed")}
                    >
                        <CardHeader>
                            <div className={cn("mx-auto flex h-16 w-16 items-center justify-center rounded-full",
                               'bg-blue-100 dark:bg-blue-900'
                            )}>
                               <Tv className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardTitle>
                                {`বিজ্ঞাপন ${index + 1}`}
                            </CardTitle>
                             <CardDescription>
                                টাস্ক
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
                                {viewedAdsCount > index ? 'সম্পন্ন' : (isWaiting && viewedAdsCount === index) ? 'লোড হচ্ছে...' : 'কাজ শুরু করুন'}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
