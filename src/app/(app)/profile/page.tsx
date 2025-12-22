
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useFirestore, useMemoFirebase } from "@/firebase/provider";
import { Mail, Phone, UserCheck, XCircle, CheckCircle, User as UserIcon, MapPin, Cake } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect } from "react";
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
import { useDoc } from "@/firebase/firestore/use-doc";
import { Skeleton } from "@/components/ui/skeleton";

interface NidData {
    name: string;
    nid: string;
    phone: string;
    dob: string;
    address: string;
}

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
}

export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isVerificationPending, setIsVerificationPending] = useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (userProfile?.nidApplicationPending) {
        setIsVerificationPending(true);
    } else {
        setIsVerificationPending(false);
    }
  }, [userProfile]);


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
    setIsVerificationPending(true);

    try {
        await setDoc(userDocRef, {
            nidApplicationPending: true,
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

        // Simulate manual verification process
        setTimeout(async () => {
            await setDoc(userDocRef, {
                isNidVerified: true,
                nidApplicationPending: false,
            }, { merge: true });

            toast({
                title: "এনআইডি ভেরিফাইড!",
                description: "আপনার অ্যাকাউন্টটি সফলভাবে ভেরিফাই করা হয়েছে।",
            });
            setIsVerificationPending(false);
        }, 5000);

    } catch (error) {
        console.error("Error submitting NID application:", error);
        toast({
            variant: "destructive",
            title: "ত্রুটি",
            description: "আবেদন জমা দেওয়ার সময় একটি সমস্যা হয়েছে।",
        });
        setIsVerificationPending(false);
    }
  };
  
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
                {userProfile?.isNidVerified && <CheckCircle className="w-7 h-7 text-green-500" />}
            </div>
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
            {userProfile?.isNidVerified && userProfile.nidName ? (
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
            ) : (
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
                        <Button disabled={isVerificationPending}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          {isVerificationPending ? 'প্রসেসিং...' : 'এনআইডি ভেরিফাই করুন'}
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
            )}
        </CardContent>
      </Card>
    </div>
  )
}

    