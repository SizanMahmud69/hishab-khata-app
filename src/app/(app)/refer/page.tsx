"use client";

import React, { useMemo } from 'react';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Copy, Gift, HelpCircle, Loader2, Users } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { useBudget } from '@/context/budget-context';

interface UserProfile {
    userId: string;
    referralCode?: string;
}

interface Referral {
    id: string;
    referredUserName: string;
    bonusPoints: number;
    createdAt: any; // Firestore Timestamp
}


export default function ReferPage() {
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const { referrerBonusPoints, referredUserBonusPoints } = useBudget();


    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isUserLoading } = useDoc<UserProfile>(userDocRef);

    const referralsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/referrals`), orderBy("createdAt", "desc"));
    }, [user, firestore]);

    const { data: referrals, isLoading: areReferralsLoading } = useCollection<Referral>(referralsQuery);

    const copyToClipboard = () => {
        if (userProfile?.referralCode) {
            navigator.clipboard.writeText(userProfile.referralCode);
            toast({
                title: "কপি হয়েছে!",
                description: "আপনার রেফারেল কোড ক্লিপবোর্ডে কপি করা হয়েছে।",
            });
        }
    };
    
    const totalBonusPoints = useMemo(() => {
        if (!referrals) return 0;
        return referrals.reduce((sum, ref) => sum + ref.bonusPoints, 0);
    }, [referrals]);

    const isLoading = isUserLoading || areReferralsLoading;

    if (isLoading) {
        return (
            <div className="flex-1 space-y-6">
                <PageHeader title="রেফার করুন" description="আপনার বন্ধুদের রেফার করে বোনাস পয়েন্ট অর্জন করুন।" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-60 w-full" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6">
            <PageHeader title="রেফার করুন" description="আপনার বন্ধুদের রেফার করে বোনাস পয়েন্ট অর্জন করুন।" />

            <Card className='border-primary'>
                <CardHeader>
                    <CardTitle>আপনার রেফারেল কোড</CardTitle>
                    <CardDescription>এই কোডটি আপনার বন্ধুদের সাথে শেয়ার করুন। তারা নিবন্ধন করার সময় এই কোড ব্যবহার করলে আপনারা উভয়েই বোনাস পয়েন্ট পাবেন।</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-muted border border-dashed">
                        <span className="text-2xl md:text-3xl font-bold tracking-widest text-primary">
                            {userProfile?.referralCode ?? 'লোড হচ্ছে...'}
                        </span>
                        <Button variant="ghost" size="icon" onClick={copyToClipboard} disabled={!userProfile?.referralCode}>
                            <Copy className="h-6 w-6" />
                        </Button>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className='w-full' onClick={copyToClipboard} disabled={!userProfile?.referralCode}>
                        <Copy className="mr-2 h-4 w-4" />
                        কোড কপি করুন
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
                        কিভাবে কাজ করে?
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                    <p>১. আপনার বন্ধুদের সাথে আপনার ইউনিক রেফারেল কোড শেয়ার করুন।</p>
                    <p>২. আপনার বন্ধু নিবন্ধন করার সময় আপনার কোডটি ব্যবহার করবে।</p>
                    <p>৩. সফল নিবন্ধনের পর, আপনি <span className="font-bold text-primary">{referrerBonusPoints}</span> বোনাস পয়েন্ট এবং আপনার বন্ধু <span className="font-bold text-primary">{referredUserBonusPoints}</span> সাইন-আপ বোনাস পয়েন্ট পাবেন।</p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        আপনার রেফারেল
                    </CardTitle>
                    <CardDescription>যাদেরকে আপনি সফলভাবে রেফার করেছেন এবং মোট বোনাস পয়েন্ট পেয়েছেন।</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted mb-4">
                        <span className="font-medium">মোট বোনাস পয়েন্ট</span>
                        <span className="font-bold text-lg text-green-500">+{totalBonusPoints}</span>
                    </div>
                    <div className="space-y-3">
                        {referrals && referrals.length > 0 ? (
                            referrals.map(referral => (
                                <div key={referral.id} className="flex items-center justify-between p-3 rounded-lg border">
                                    <div>
                                        <p className="font-semibold">{referral.referredUserName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {referral.createdAt ? format(referral.createdAt.toDate(), "d MMM, yyyy", { locale: bn }) : ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 font-bold text-green-500">
                                        <Gift className="h-4 w-4" />
                                        <span>+{referral.bonusPoints}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-6">আপনি এখনও কাউকে রেফার করেননি।</p>
                        )}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}

    