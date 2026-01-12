

"use client";

import React, { useState, useMemo, useEffect, useRef, Fragment } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from "@/components/page-header"
import { Banknote, History, Gift, Info, Loader2 } from "lucide-react"
import { useBudget } from "@/context/budget-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createNotification } from '@/components/app-header';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection, FirestorePermissionError } from '@/firebase';
import { doc, addDoc, collection, serverTimestamp, query, orderBy, writeBatch, increment } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { paymentMethods } from '@/lib/data';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { errorEmitter } from '@/firebase/error-emitter';
import { AdBanner } from '@/components/ad-banner';

interface UserProfile {
    points?: number;
}

export interface WithdrawalRequest {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    points: number;
    amountBdt: number;
    paymentMethod: string;
    accountNumber: string;
    requestedAt: any;
    processedAt?: any;
    rejectionReason?: string;
    isRefunded?: boolean;
}

export default function WithdrawPage() {
    const { minWithdrawalPoints, bdtPer100Points } = useBudget();
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const searchParams = useSearchParams();
    const historyRef = useRef<HTMLDivElement>(null);


    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isUserLoading } = useDoc<UserProfile>(userDocRef);
    const rewardPoints = userProfile?.points ?? 0;
    
    const [pointsToWithdraw, setPointsToWithdraw] = useState(rewardPoints);

    const withdrawalHistoryQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/withdrawalRequests`), orderBy("requestedAt", "desc"));
    }, [user, firestore]);

    const { data: history, isLoading: isHistoryLoading } = useCollection<WithdrawalRequest>(withdrawalHistoryQuery);

    const canWithdraw = rewardPoints >= minWithdrawalPoints;
    const selectedAmountBdt = Math.floor(pointsToWithdraw / 100) * bdtPer100Points;

     useEffect(() => {
        if (searchParams.get('section') === 'history' && historyRef.current) {
            historyRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [searchParams, isHistoryLoading]);

    const handlePointsChange = (value: number) => {
        if (value > rewardPoints) {
            setPointsToWithdraw(rewardPoints);
        } else if (value < 0) {
            setPointsToWithdraw(0);
        } else {
            setPointsToWithdraw(value);
        }
    }
    
    const handleWithdraw = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user || !firestore || !userDocRef) return;
        
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        const paymentMethod = formData.get('payment-method') as string;
        const accountNumber = formData.get('account-number') as string;

        if (!paymentMethod || !accountNumber) {
             toast({
                variant: "destructive",
                title: "ফর্ম পূরণ আবশ্যক",
                description: "অনুগ্রহ করে পেমেন্ট মাধ্যম এবং অ্যাকাউন্ট নম্বর দিন।",
            });
            setIsSubmitting(false);
            return;
        }
        
        const pointsToDeduct = Math.floor(pointsToWithdraw / 100) * 100;
        
        if (pointsToDeduct < minWithdrawalPoints) {
             toast({
                variant: "destructive",
                title: "অপর্যাপ্ত পয়েন্ট",
                description: `উইথড্র করার জন্য কমপক্ষে ${minWithdrawalPoints} পয়েন্ট প্রয়োজন।`,
            });
            setIsSubmitting(false);
            return;
        }

        const withdrawnTkAmount = (pointsToDeduct / 100) * bdtPer100Points;
        
        const batch = writeBatch(firestore);
            
        const withdrawalRequestRef = doc(collection(firestore, `users/${user.uid}/withdrawalRequests`));
        batch.set(withdrawalRequestRef, {
            userId: user.uid,
            status: 'pending',
            points: pointsToDeduct,
            amountBdt: withdrawnTkAmount,
            paymentMethod: paymentMethod,
            accountNumber: accountNumber,
            requestedAt: serverTimestamp(),
            isRefunded: false,
        });

        batch.update(userDocRef, { points: increment(-pointsToDeduct) });

        try {
            await batch.commit();

            createNotification({
                id: `withdraw-request-${withdrawalRequestRef.id}`,
                title: "উইথড্র অনুরোধ সফল হয়েছে",
                description: `${pointsToDeduct} পয়েন্টের বিনিময়ে ${withdrawnTkAmount} টাকা পাঠানোর অনুরোধ প্রক্রিয়াধীন আছে।`,
                link: "/withdraw?section=history",
            }, user.uid, firestore);

            toast({
                title: "সফল!",
                description: `আপনার উইথড্র অনুরোধ সফল হয়েছে। ${pointsToDeduct} পয়েন্ট আপনার অ্যাকাউন্ট থেকে কেটে নেওয়া হয়েছে।`,
            });
            
            setPointsToWithdraw(rewardPoints - pointsToDeduct);

        } catch (error) {
            console.error("Withdrawal error: ", error);
             if (error instanceof FirestorePermissionError) {
                errorEmitter.emit('permission-error', error);
            } else {
                 toast({
                    variant: "destructive",
                    title: "ত্রুটি",
                    description: "আপনার উইথড্র অনুরোধ প্রক্রিয়া করার সময় একটি সমস্যা হয়েছে।",
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
    }

    const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-500 hover:bg-green-500/80">অনুমোদিত</Badge>;
            case 'rejected':
                return <Badge variant="destructive">বাতিল</Badge>;
            case 'pending':
            default:
                return <Badge variant="outline" className="border-yellow-500 text-yellow-600">পেন্ডিং</Badge>;
        }
    }

  if (isUserLoading) {
    return (
        <div className="flex-1 space-y-4">
            <PageHeader title="পয়েন্ট উইথড্র" description="আপনার অর্জিত পয়েন্ট টাকাতে রূপান্তর করুন।" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-60 w-full" />
        </div>
    )
  }

  return (
    <div className="flex-1 space-y-6">
      <PageHeader title="পয়েন্ট উইথড্র" description="আপনার অর্জিত পয়েন্ট টাকাতে রূপান্তর করুন।" />
      
      {canWithdraw ? (
        <Card className="border-primary">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Banknote className="text-primary" />
                    নতুন উইথড্র অনুরোধ
                </CardTitle>
                <CardDescription>
                    আপনার বর্তমান পয়েন্ট: <span className='font-bold text-primary'>{rewardPoints}</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleWithdraw} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
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
                            <p className="text-sm text-muted-foreground text-center pt-2">
                                আপনি পাবেন: <span className="font-bold text-primary text-lg">{formatCurrency(selectedAmountBdt)}</span>
                            </p>
                        </div>
                        <div className='space-y-6'>
                            <div className="space-y-2">
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
                            <div className="space-y-2">
                                <Label htmlFor="account-number">অ্যাকাউন্ট নম্বর</Label>
                                <Input id="account-number" name="account-number" placeholder="017********" required />
                            </div>
                        </div>
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'প্রসেসিং...' : 'অনুরোধ নিশ্চিত করুন'}
                    </Button>
                </form>
            </CardContent>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center h-60 text-card-foreground">
            <Gift className="w-16 h-16 text-primary mb-4" />
            <p className="font-semibold text-lg">অপর্যাপ্ত পয়েন্ট</p>
            <p className="text-muted-foreground">
                উইথড্র করার জন্য আপনার কমপক্ষে {minWithdrawalPoints} পয়েন্ট প্রয়োজন।
            </p>
        </Card>
      )}

      <Card ref={historyRef}>
        <CardHeader>
            <CardTitle className='flex items-center gap-2'>
                <History className='w-5 h-5' />
                উইথড্র হিস্টোরি
            </CardTitle>
            <CardDescription>আপনার সাম্প্রতিক উইথড্র অনুরোধের তালিকা।</CardDescription>
        </CardHeader>
        <CardContent>
            {isHistoryLoading ? <Skeleton className="h-40 w-full" /> : 
            history && history.length > 0 ? (
                <TooltipProvider>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>তারিখ</TableHead>
                                <TableHead>মাধ্যম</TableHead>
                                <TableHead>পয়েন্ট</TableHead>
                                <TableHead>টাকা</TableHead>
                                <TableHead className='text-right'>স্ট্যাটাস</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map((req, index) => (
                                <Fragment key={req.id}>
                                    <TableRow>
                                        <TableCell className='font-medium'>
                                            {req.requestedAt ? format(req.requestedAt.toDate(), "d MMM, yyyy", { locale: bn }) : '-'}
                                        </TableCell>
                                        <TableCell>{req.paymentMethod}</TableCell>
                                        <TableCell className='text-muted-foreground'>{req.points}</TableCell>
                                        <TableCell className='font-semibold'>{formatCurrency(req.amountBdt)}</TableCell>
                                        <TableCell className='text-right flex justify-end items-center gap-2'>
                                            {getStatusBadge(req.status)}
                                            {req.status === 'rejected' && req.rejectionReason && (
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{req.rejectionReason}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                </Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </TooltipProvider>
            ) : (
                <p className='text-sm text-muted-foreground text-center py-4'>কোনো হিস্টোরি পাওয়া যায়নি।</p>
            )}
        </CardContent>
      </Card>
      <AdBanner page="withdraw" />
    </div>
  )
}
