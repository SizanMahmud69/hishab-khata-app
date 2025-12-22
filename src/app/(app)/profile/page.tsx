"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { Mail, Phone, UserCheck, XCircle, CheckCircle, User as UserIcon, MapPin, Cake, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge";
import { doc, setDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    phoneNumber?: string;
    isNidVerified?: boolean;
    nidApplicationPending?: boolean;
    nidName?: string;
    nidNumber?: string;
    nidDob?: string;
    nidAddress?: string;
    rewardPoints?: number;
    nidRejectionReason?: string;
}

export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading } = useDoc<UserProfile>(userDocRef);

  const handleNidSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userDocRef) return;

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const nid = formData.get('nid') as string;
    const phone = formData.get('phone') as string;
    const dob = formData.get('dob') as string;
    const address = formData.get('address') as string;

    if (!name || !nid || !phone || !dob || !address) {
      toast({
        variant: "destructive",
        title: "ফর্ম পূরণ আবশ্যক",
        description: "অনুগ্রহ করে সকল তথ্য পূরণ করুন।",
      });
      return;
    }
    
    setIsVerificationDialogOpen(false);

    try {
        await setDoc(userDocRef, {
            isNidVerified: false,
            nidApplicationPending: true,
            nidRejectionReason: '', // Clear previous rejection reason
            nidName: name,
            nidNumber: nid,
            nidDob: dob,
            nidAddress: address,
            phoneNumber: phone
        }, { merge: true });

        toast({
          title: "আবেদন জমা হয়েছে",
          description: "আপনার এনআইডি ভেরিফিকেশনের আবেদনটি প্রক্রিয়াধীন আছে।",
        });

    } catch (error) {
        console.error("Error submitting NID application:", error);
        toast({
            variant: "destructive",
            title: "ত্রুটি",
            description: "আবেদন জমা দেওয়ার সময় একটি সমস্যা হয়েছে।",
        });
    }
  };

  const VerificationStatus = () => {
    if (userProfile?.isNidVerified) {
      return (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <UserIcon className="w-6 h-6 text-muted-foreground mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium">নাম (এনআইডি অনুযায়ী)</p>
              <p className="text-muted-foreground">{userProfile.nidName}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <UserCheck className="w-6 h-6 text-muted-foreground mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium">এনআইডি নম্বর</p>
              <p className="text-muted-foreground">{userProfile.nidNumber}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Cake className="w-6 h-6 text-muted-foreground mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium">জন্ম তারিখ</p>
              <p className="text-muted-foreground">{userProfile.nidDob ? new Date(userProfile.nidDob).toLocaleDateString('bn-BD') : 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <MapPin className="w-6 h-6 text-muted-foreground mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium">ঠিকানা (এনআইডি অনুযায়ী)</p>
              <p className="text-muted-foreground">{userProfile.nidAddress}</p>
            </div>
          </div>
        </div>
      );
    }

    if (userProfile?.nidApplicationPending) {
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

    return (
        <div>
            {userProfile?.nidRejectionReason && (
                 <Alert variant="destructive" className="mb-4">
                    <Info className="h-4 w-4" />
                    <AlertTitle>আবেদন বাতিল হয়েছে</AlertTitle>
                    <AlertDescription>
                       কারণ: {userProfile.nidRejectionReason}
                    </AlertDescription>
                </Alert>
            )}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <XCircle className="w-8 h-8 text-red-500" />
                    <div>
                        <p className="font-semibold text-red-500">এনআইডি ভেরিফাইড নয়</p>
                        <p className="text-sm text-muted-foreground">অতিরিক্ত সুবিধা পেতে আপনার এনআইডি ভেরিফাই করুন।</p>
                    </div>
                </div>
                 <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserCheck className="mr-2 h-4 w-4" />
                      এখনই ভেরিফাই করুন
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>এনআইডি ভেরিফিকেশন</DialogTitle>
                      <DialogDescription>
                        আপনার এনআইডি কার্ড অনুযায়ী সঠিক তথ্য প্রদান করুন।
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleNidSubmit}>
                        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-2">
                          <div className="space-y-1.5">
                            <Label htmlFor="name">পুরো নাম (এনআইডি অনুযায়ী)</Label>
                            <Input id="name" name="name" placeholder="আপনার পুরো নাম লিখুন" required />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="nid">এনআইডি নম্বর</Label>
                            <Input id="nid" name="nid" type="number" placeholder="আপনার এনআইডি নম্বর" required />
                          </div>
                           <div className="space-y-1.5">
                            <Label htmlFor="dob">জন্ম তারিখ</Label>
                            <Input id="dob" name="dob" type="date" required />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="phone">ফোন নম্বর</Label>
                            <Input id="phone" name="phone" placeholder="আপনার ফোন নম্বর" required />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="address">ঠিকানা</Label>
                            <Input id="address" name="address" placeholder="আপনার ঠিকানা লিখুন" required />
                          </div>
                        </div>
                        <DialogFooter className="pt-4">
                          <Button type="submit">জমা দিন</Button>
                        </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
            </div>
        </div>
    )
  }
  
  if (isLoading) {
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
        <div className="h-24 bg-primary/20" />
        <div className="relative -mt-16 flex justify-center">
             <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={userProfile?.photoURL ?? user?.photoURL ?? `https://i.pravatar.cc/150?u=${user?.email}`} alt="User avatar" data-ai-hint="profile avatar" />
                <AvatarFallback className="text-4xl">{userProfile?.displayName?.charAt(0) ?? user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
        </div>
        <CardContent className="text-center pt-6 pb-6 px-4 sm:px-6">
            <div className="flex items-center justify-center gap-2">
                <h2 className="text-3xl font-bold">{userProfile?.displayName ?? user?.displayName ?? 'ব্যবহারকারী'}</h2>
                 {userProfile?.isNidVerified && <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100/80"><CheckCircle className="w-3.5 h-3.5 mr-1.5" />ভেরিফাইড</Badge>}
                 {userProfile?.nidApplicationPending && <Badge variant="outline" className="text-yellow-600 border-yellow-400">প্রসেসিং...</Badge>}
            </div>
             <p className="text-sm text-muted-foreground mt-2">রিওয়ার্ড পয়েন্ট: {userProfile?.rewardPoints ?? 0}</p>
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
                        <p className="text-muted-foreground">{userProfile?.email ?? user?.email ?? 'ইমেইল পাওয়া যায়নি'}</p>
                        {user?.emailVerified ? 
                            <Badge className="bg-green-100 text-green-800 border-green-300">ভেরিফাইড</Badge> : 
                            <Badge variant="destructive">ভেরিফাইড নয়</Badge>
                        }
                     </div>
                </div>
            </div>

            <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-muted-foreground mt-1" />
                <div className="flex-1">
                    <p className="text-sm font-medium">ফোন নম্বর</p>
                    <p className="text-muted-foreground">{userProfile?.phoneNumber ?? user?.phoneNumber ?? 'ফোন নম্বর সেট করা নেই'}</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-muted-foreground mt-1" />
                <div className="flex-1">
                    <p className="text-sm font-medium">ঠিকানা</p>
                    <p className="text-muted-foreground">{userProfile?.nidAddress ?? 'ঠিকানা সেট করা নেই'}</p>
                </div>
            </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
            <CardTitle>এনআইডি ভেরিফিকেশন</CardTitle>
            {!userProfile?.isNidVerified && <CardDescription>আপনার অ্যাকাউন্টের নিরাপত্তা এবং বিশ্বাসযোগ্যতা বাড়ান।</CardDescription>}
        </CardHeader>
        <CardContent>
            <VerificationStatus />
        </CardContent>
      </Card>
    </div>
  )
}
