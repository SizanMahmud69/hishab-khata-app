
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { Mail, Phone, UserCheck, XCircle, CheckCircle, User as UserIcon, Loader2, Crown, Info } from "lucide-react";
import React, { useMemo } from "react";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { bn } from "date-fns/locale";
import { useBudget } from "@/context/budget-context";
import { doc } from "firebase/firestore";
import { AdBanner } from "@/components/ad-banner";

interface VerificationRequest {
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    nidName?: string;
    nidNumber?: string;
    nidDob?: string;
    nidAddress?: string;
}

export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { 
      userProfile, 
      isLoading,
      premiumStatus, 
      premiumExpiryDate,
      activePremiumPlan,
      pendingSubscriptionPlanIds,
      isSubscriptionsLoading,
  } = useBudget();
  
  const verificationRequestRef = useMemoFirebase(() => {
    if (!user || !firestore || !userProfile?.verificationRequestId) return null;
    return doc(firestore, `users/${user.uid}/verificationRequests`, userProfile.verificationRequestId);
  }, [user, firestore, userProfile?.verificationRequestId]);

  const { data: verificationRequest, isLoading: isVerificationLoading } = useDoc<VerificationRequest>(verificationRequestRef);

  const pendingPremiumRequest = pendingSubscriptionPlanIds.length > 0;

  const VerificationStatus = () => {
    if (isVerificationLoading) {
        return (
            <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-24" />
            </div>
        )
    }

    if (verificationRequest?.status === 'approved') {
        return (
            <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                <CheckCircle className="w-8 h-8" />
                <div>
                    <p className="font-semibold">এনআইডি ভেরিফাইড</p>
                    <p className="text-sm text-muted-foreground">আপনার অ্যাকাউন্টটি এখন সম্পূর্ণ সুরক্ষিত।</p>
                </div>
            </div>
        )
    }
    
    if (verificationRequest?.status === 'pending') {
        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-yellow-600 dark:text-yellow-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <div>
                        <p className="font-semibold">ভেরিফিকেশন পেন্ডিং</p>
                        <p className="text-sm text-muted-foreground">আপনার আবেদনটি পর্যালোচনার অধীনে আছে।</p>
                    </div>
                </div>
            </div>
        )
    }
    
    if (verificationRequest?.status === 'rejected') {
        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-red-500">
                    <XCircle className="w-8 h-8" />
                    <div>
                        <p className="font-semibold">ভেরিফিকেশন বাতিল হয়েছে</p>
                        <p className="text-sm text-muted-foreground">কারণ: {verificationRequest.rejectionReason || 'অজানা কারণ'}</p>
                    </div>
                </div>
                 <Button asChild className="w-full sm:w-auto" variant="destructive">
                    <Link href="/profile/verify">
                        আবার চেষ্টা করুন
                    </Link>
                 </Button>
            </div>
        )
    }

    // Default: Not verified
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-red-500">এনআইডি ভেরিফাইড নয়</p>
                    <p className="text-sm text-muted-foreground">অতিরিক্ত সুবিধা পেতে আপনার এনআইডি ভেরিফাই করুন।</p>
                </div>
            </div>
             <Button asChild className="w-full sm:w-auto">
                <Link href="/profile/verify">
                    <UserCheck className="mr-2 h-4 w-4" />
                    এখনই ভেরিফাই করুন
                </Link>
             </Button>
        </div>
    )
  }
  
  if (isLoading || isSubscriptionsLoading || isVerificationLoading) {
      return (
          <div className="flex-1 space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
          </div>
      )
  }
  
  return (
    <div className="flex-1 space-y-6">
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-green-400 to-blue-500" />
        <div className="relative -mt-16 flex justify-center">
             <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={userProfile?.avatar ?? user?.photoURL ?? `https://i.pravatar.cc/150?u=${user?.email}`} alt="User avatar" data-ai-hint="profile avatar" />
                <AvatarFallback className="text-4xl">{userProfile?.name?.charAt(0) ?? user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
        </div>
        <CardContent className="text-center pt-6 pb-6 px-4 sm:px-6 bg-gradient-to-t from-purple-100/30 to-green-100/10">
            <div className="flex flex-col items-center justify-center gap-2">
                <h2 className="text-2xl md:text-3xl font-bold whitespace-nowrap truncate">{userProfile?.name ?? user?.displayName ?? 'ব্যবহারকারী'}</h2>
                 {premiumStatus === 'premium' && (
                    <Badge className="bg-yellow-200 text-yellow-800 border-yellow-400 hover:bg-yellow-200/80">
                        <Crown className="w-3.5 h-3.5 mr-1.5" />
                        {activePremiumPlan?.title || 'প্রিমিয়াম'}
                    </Badge>
                 )}
            </div>
             <p className="text-sm text-muted-foreground mt-2">{userProfile?.userId ?? 'আইডি পাওয়া যায়নি'}</p>
        </CardContent>
      </Card>
      
       {premiumStatus === 'premium' ? (
         <Card className="border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20">
            <CardHeader>
                <CardTitle>প্রিমিয়াম স্ট্যাটাস</CardTitle>
            </CardHeader>
            <CardContent>
                <p>আপনার বর্তমান প্ল্যান: <span className="font-bold">{activePremiumPlan?.title || 'প্রিমিয়াম'}</span></p>
                <p>মেয়াদ শেষ হবে: <span className="font-bold">
                    {premiumExpiryDate ? format(premiumExpiryDate, "d MMMM, yyyy", { locale: bn }) : 'লাইফটাইম'}
                </span></p>
            </CardContent>
         </Card>
       ): pendingSubscriptionPlanIds.length > 0 ? (
        <Card className="border-blue-400 bg-blue-50 dark:bg-blue-900/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    প্রিমিয়াম স্ট্যাটাস: পেন্ডিং
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>আপনার সাবস্ক্রিপশন অনুরোধ পর্যালোচনা করা হচ্ছে। ২৪ ঘণ্টার মধ্যে এটি সক্রিয় করা হবে।</p>
            </CardContent>
         </Card>
       ) : (
        <Card>
            <CardContent className="p-6">
                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Crown className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-yellow-600">প্রিমিয়াম সাবস্ক্রিপশন</p>
                            <p className="text-sm text-muted-foreground">বিজ্ঞাপন-মুক্ত অভিজ্ঞতা এবং বিশেষ ফিচার পেতে আপগ্রেড করুন।</p>
                        </div>
                    </div>
                    <Button asChild className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white">
                        <Link href="/premium">
                            আপগ্রেড করুন
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
       )}


      <Card>
        <CardHeader>
            <CardTitle>যোগাযোগের তথ্য</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-muted-foreground mt-1" />
                <div className="flex-1">
                     <p className="text-sm font-medium">ইমেইল</p>
                     <div className="flex items-center gap-2">
                        <p className="text-muted-foreground">{userProfile?.email ?? user?.email ?? 'ইমেইল পাওয়া যায়নি'}</p>
                        {user?.emailVerified && 
                            <Badge className="bg-green-200 text-green-800 border-green-400">ভেরিফাইড</Badge>
                        }
                     </div>
                </div>
            </div>

            <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-muted-foreground mt-1" />
                <div className="flex-1">
                    <p className="text-sm font-medium">ফোন নম্বর</p>
                    <p className="text-muted-foreground">{userProfile?.phone ?? user?.phoneNumber ?? 'ফোন নম্বর সেট করা নেই'}</p>
                </div>
            </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
            <CardTitle>এনআইডি ভেরিফিকেশন</CardTitle>
            <CardDescription>আপনার অ্যাকাউন্টের নিরাপত্তা এবং বিশ্বাসযোগ্যতা বাড়ান।</CardDescription>
        </CardHeader>
        <CardContent>
            <VerificationStatus />
        </CardContent>
      </Card>

      {verificationRequest?.status === 'approved' && verificationRequest.nidName && (
        <Card>
            <CardHeader>
                <CardTitle>ভেরিফাইড তথ্য</CardTitle>
                <CardDescription>আপনার এনআইডি অনুযায়ী ভেরিফাই হওয়া তথ্যসমূহ।</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">নাম</span>
                    <span className="font-medium">{verificationRequest.nidName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">এনআইডি নম্বর</span>
                    <span className="font-medium">{verificationRequest.nidNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">জন্ম তারিখ</span>
                    <span className="font-medium">{verificationRequest.nidDob ? format(parseISO(verificationRequest.nidDob), 'd MMMM, yyyy', { locale: bn }) : '-'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">ঠিকানা</span>
                    <span className="font-medium text-right">{verificationRequest.nidAddress}</span>
                </div>
            </CardContent>
        </Card>
      )}
       <AdBanner page="profile" adIndex={1} />
    </div>
  )
}
