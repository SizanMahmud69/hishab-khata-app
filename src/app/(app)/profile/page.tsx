
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useFirestore, useMemoFirebase, useCollection, useDoc } from "@/firebase";
import { Mail, Phone, UserCheck, XCircle, CheckCircle, User as UserIcon, MapPin, Cake, AlertTriangle, Info, Loader2 } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createNotification } from "@/components/app-header";

interface UserProfile {
    id: string;
    userId: string;
    email: string;
    name: string;
    avatar?: string;
    phone?: string;
    address?: string;
    points?: number;
    joinDate?: string;
    lastCheckIn?: string;
    checkInStreak?: number;
    verificationRequestId?: string;
}

// Corresponds to the new VerificationRequest entity
interface VerificationRequest {
    id: string;
    userId: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: any;
    reviewedAt?: any;
    rejectionReason?: string;
    nidName: string;
    nidNumber: string;
    nidDob: string;
    nidAddress: string;
    phone: string;
}


export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfileData, isLoading: isUserLoading } = useDoc<UserProfile>(userDocRef);

  const latestVerificationRequestQuery = useMemoFirebase(() => {
      if (!user || !firestore) return null;
      return query(
          collection(firestore, `users/${user.uid}/verificationRequests`),
          orderBy("submittedAt", "desc"),
          limit(1)
      );
  }, [user, firestore]);

  const { data: latestRequestData, isLoading: isRequestLoading } = useCollection<VerificationRequest>(
      latestVerificationRequestQuery
  );

  const verificationRequest = useMemo(() => latestRequestData?.[0], [latestRequestData]);
  const verificationStatus = verificationRequest?.status;

  useEffect(() => {
    if (verificationRequest && user && firestore) {
        const notificationKey = `nid-status-${verificationRequest.id}`;
        
        if (verificationStatus === 'approved') {
            createNotification({
                id: notificationKey,
                title: 'এনআইডি ভেরিফিকেশন সফল হয়েছে',
                description: 'অভিনন্দন! আপনার অ্যাকাউন্ট এখন সম্পূর্ণ ভেরিফাইড।',
                link: '/profile'
            }, user.uid, firestore);
        } else if (verificationStatus === 'rejected') {
            createNotification({
                id: notificationKey,
                title: 'এনআইডি ভেরিফিকেশন সফল হয়নি',
                description: `আপনার আবেদনটি বাতিল করা হয়েছে। কারণ: ${verificationRequest.rejectionReason || 'অজানা'}`,
                link: '/profile'
            }, user.uid, firestore);
        }
    }
  }, [verificationRequest, verificationStatus, user, firestore]);


  const VerificationStatus = () => {
    if (isRequestLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      )
    }

    if (verificationStatus === 'approved' && verificationRequest) {
      return (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <UserIcon className="w-6 h-6 text-muted-foreground mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium">নাম (এনআইডি অনুযায়ী)</p>
              <p className="text-muted-foreground">{verificationRequest.nidName}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <UserCheck className="w-6 h-6 text-muted-foreground mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium">এনআইডি নম্বর</p>
              <p className="text-muted-foreground">{verificationRequest.nidNumber}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Cake className="w-6 h-6 text-muted-foreground mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium">জন্ম তারিখ</p>
              <p className="text-muted-foreground">{verificationRequest.nidDob ? new Date(verificationRequest.nidDob).toLocaleDateString('bn-BD') : 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <MapPin className="w-6 h-6 text-muted-foreground mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium">ঠিকানা (এনআইডি অনুযায়ী)</p>
              <p className="text-muted-foreground">{verificationRequest.nidAddress}</p>
            </div>
          </div>
        </div>
      );
    }

    if (verificationStatus === 'pending') {
        return (
             <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertTitle className="text-yellow-700 dark:text-yellow-300">আবেদন প্রক্রিয়াধীন</AlertTitle>
                <AlertDescription className="text-yellow-600 dark:text-yellow-400">
                    আপনার এনআইডি ভেরিফিকেশনের আবেদনটি পর্যালোচনার অধীনে আছে। অনুমোদন হতে ২৪-৪৮ ঘন্টা সময় লাগতে পারে।
                </AlertDescription>
            </Alert>
        )
    }

    // This covers 'rejected' status and the case where no request has been made yet
    return (
        <div>
            {verificationStatus === 'rejected' && verificationRequest?.rejectionReason && (
                 <Alert variant="destructive" className="mb-4">
                    <Info className="h-4 w-4" />
                    <AlertTitle>আবেদন বাতিল হয়েছে</AlertTitle>
                    <AlertDescription>
                       কারণ: {verificationRequest.rejectionReason}
                    </AlertDescription>
                </Alert>
            )}
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
        </div>
    )
  }
  
  if (isUserLoading || !userProfileData) {
      return (
          <div className="flex-1 space-y-6">
              <Skeleton className="h-48 w-full" />
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
                <AvatarImage src={userProfileData?.avatar ?? user?.photoURL ?? `https://i.pravatar.cc/150?u=${user?.email}`} alt="User avatar" data-ai-hint="profile avatar" />
                <AvatarFallback className="text-4xl">{userProfileData?.name?.charAt(0) ?? user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
        </div>
        <CardContent className="text-center pt-6 pb-6 px-4 sm:px-6 bg-gradient-to-t from-purple-100/30 to-green-100/10">
            <div className="flex items-center justify-center gap-2">
                <h2 className="text-3xl font-bold">{userProfileData?.name ?? user?.displayName ?? 'ব্যবহারকারী'}</h2>
                 {verificationStatus === 'approved' && <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100/80"><CheckCircle className="w-3.5 h-3.5 mr-1.5" />ভেরিফাইড</Badge>}
                 {verificationStatus === 'pending' && <Badge variant="outline" className="text-yellow-600 border-yellow-400">প্রসেসিং...</Badge>}
            </div>
             <p className="text-sm text-muted-foreground mt-2">{userProfileData?.userId ?? 'আইডি পাওয়া যায়নি'}</p>
        </CardContent>
      </Card>

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
                        <p className="text-muted-foreground">{userProfileData?.email ?? user?.email ?? 'ইমেইল পাওয়া যায়নি'}</p>
                        {user?.emailVerified && 
                            <Badge className="bg-green-100 text-green-800 border-green-300">ভেরিফাইড</Badge>
                        }
                     </div>
                </div>
            </div>

            <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-muted-foreground mt-1" />
                <div className="flex-1">
                    <p className="text-sm font-medium">ফোন নম্বর</p>
                    <p className="text-muted-foreground">{userProfileData?.phone ?? user?.phoneNumber ?? 'ফোন নম্বর সেট করা নেই'}</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-muted-foreground mt-1" />
                <div className="flex-1">
                    <p className="text-sm font-medium">ঠিকানা</p>
                    <p className="text-muted-foreground">{userProfileData?.address ?? 'ঠিকানা সেট করা নেই'}</p>
                </div>
            </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
            <CardTitle>এনআইডি ভেরিফিকেশন</CardTitle>
            {verificationStatus !== 'approved' && <CardDescription>আপনার অ্যাকাউন্টের নিরাপত্তা এবং বিশ্বাসযোগ্যতা বাড়ান।</CardDescription>}
        </CardHeader>
        <CardContent>
            <VerificationStatus />
        </CardContent>
      </Card>
    </div>
  )
}
    

    

    

    