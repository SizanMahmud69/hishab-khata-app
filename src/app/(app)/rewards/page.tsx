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
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const WITHDRAW_THRESHOLD = 1000;
const CONVERSION_RATE = 1; // 1 point = 1 BDT

export default function RewardsPage() {
    const { rewardPoints, deductRewardPoints, isLoading } = useBudget();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const canWithdraw = rewardPoints >= WITHDRAW_THRESHOLD;
    const withdrawableAmount = Math.floor(rewardPoints) * CONVERSION_RATE;

    const handleWithdraw = () => {
        deductRewardPoints(rewardPoints);
        toast({
            title: "সফল!",
            description: `আপনার উইথড্র সফল হয়েছে। ${rewardPoints} পয়েন্ট আপনার অ্যাকাউন্ট থেকে কেটে নেওয়া হয়েছে।`,
        });
        setIsDialogOpen(false);
    }
    
    if (isLoading) {
        return <RewardsSkeleton />;
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
                    <p className="text-3xl font-bold">৳{withdrawableAmount}</p>
                </div>
            </CardContent>
            <CardFooter>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full">
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
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="payment-method" className="text-right">
                                    মাধ্যম
                                </Label>
                                <Input id="payment-method" defaultValue="বিকাশ" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="account-number" className="text-right">
                                    অ্যাকাউন্ট নম্বর
                                </Label>
                                <Input id="account-number" placeholder="017********" className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleWithdraw}>নিশ্চিত করুন</Button>
                        </DialogFooter>
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

function RewardsSkeleton() {
    return (
        <div className="flex-1 space-y-4">
             <div className="grid gap-1 mb-6">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-5 w-64" />
            </div>
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-60 w-full mt-6" />
        </div>
    );
}
