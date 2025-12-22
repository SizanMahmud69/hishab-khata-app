
"use client";

import React, { useState } from 'react';
import PageHeader from "@/components/page-header"
import { Banknote, Gift, Medal, Star, Trophy } from "lucide-react"
import { useBudget } from "@/context/budget-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createNotification } from '@/components/app-header';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { paymentMethods } from '@/lib/data';
import { Slider } from '@/components/ui/slider';

const WITHDRAW_THRESHOLD = 100;
const CONVERSION_RATE = 0.05; // 100 points = 5 BDT

interface UserProfile {
    rewardPoints?: number;
}

export default function RewardsPage() {
    const { deductRewardPoints } = useBudget();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { user } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading } = useDoc<UserProfile>(userDocRef);
    const rewardPoints = userProfile?.rewardPoints ?? 0;
    
    const [pointsToWithdraw, setPointsToWithdraw] = useState(rewardPoints);

    const canWithdraw = rewardPoints >= WITHDRAW_THRESHOLD;
    const withdrawableAmountBdt = Math.floor(rewardPoints / 100) * 5;
    const selectedAmountBdt = Math.floor(pointsToWithdraw / 100) * 5;

    const handlePointsChange = (value: number) => {
        if (value > rewardPoints) {
            setPointsToWithdraw(rewardPoints);
        } else if (value < 0) {
            setPointsToWithdraw(0);
        } else {
            setPointsToWithdraw(value);
        }
    }
    
    const handleWithdraw = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const paymentMethod = formData.get('payment-method') as string;
        const accountNumber = formData.get('account-number') as string;

        if (!paymentMethod || !accountNumber) {
             toast({
                variant: "destructive",
                title: "ফর্ম পূরণ আবশ্যক",
                description: "অনুগ্রহ করে পেমেন্ট মাধ্যম এবং অ্যাকাউন্ট নম্বর দিন।",
            });
            return;
        }
        
        const pointsToDeduct = Math.floor(pointsToWithdraw / 100) * 100;
        
        if (pointsToDeduct < WITHDRAW_THRESHOLD) {
             toast({
                variant: "destructive",
                title: "অপর্যাপ্ত পয়েন্ট",
                description: `উইথড্র করার জন্য কমপক্ষে ${WITHDRAW_THRESHOLD} পয়েন্ট প্রয়োজন।`,
            });
            return;
        }

        const withdrawnTkAmount = (pointsToDeduct / 100) * 5;

        deductRewardPoints(pointsToDeduct);

        createNotification({
            title: "উইথড্র সফল হয়েছে",
            description: `${pointsToDeduct} পয়েন্টের বিনিময়ে ${withdrawnTkAmount} টাকা আপনার অ্যাকাউন্টে পাঠানো হয়েছে।`,
            link: "/rewards",
        });

        toast({
            title: "সফল!",
            description: `আপনার উইথড্র সফল হয়েছে। ${pointsToDeduct} পয়েন্ট আপনার অ্যাকাউন্ট থেকে কেটে নেওয়া হয়েছে।`,
        });
        setIsDialogOpen(false);
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
    }

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
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">মোট উইথড্র করার মতো পরিমাণ</p>
                    <p className="text-3xl font-bold">{formatCurrency(withdrawableAmountBdt)}</p>
                    <p className="text-xs text-muted-foreground">১০০ পয়েন্ট = ৫ টাকা</p>
                </div>
            </CardContent>
            <CardFooter>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full" disabled={withdrawableAmountBdt <= 0}>
                            উইথড্র করুন
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle>উইথড্র কনফার্মেশন</DialogTitle>
                        <DialogDescription>
                            আপনার পেমেন্ট বিবরণ দিন। টাকা ২৪ ঘন্টার মধ্যে পাঠানো হবে।
                        </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleWithdraw}>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="points-to-withdraw">কত পয়েন্ট উইথড্র করবেন?</Label>
                                    <Input 
                                        id="points-to-withdraw"
                                        type="number"
                                        value={pointsToWithdraw}
                                        onChange={(e) => handlePointsChange(Number(e.target.value))}
                                        max={rewardPoints}
                                        min="0"
                                    />
                                    <Slider
                                        value={[pointsToWithdraw]}
                                        max={rewardPoints}
                                        step={100}
                                        onValueChange={(value) => handlePointsChange(value[0])}
                                    />
                                    <p className="text-sm text-muted-foreground text-center pt-1">
                                        আপনি পাবেন: <span className="font-bold text-primary">{formatCurrency(selectedAmountBdt)}</span>
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="payment-method">মাধ্যম</Label>
                                    <Select name="payment-method" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="একটি মাধ্যম নির্বাচন করুন" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentMethods.map(method => <SelectItem key={method} value={method}>{method}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="account-number">অ্যাকাউন্ট নম্বর</Label>
                                    <Input id="account-number" name="account-number" placeholder="017********" required />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">নিশ্চিত করুন</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
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
