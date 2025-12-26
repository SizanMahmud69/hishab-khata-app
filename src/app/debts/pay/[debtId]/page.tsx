
"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { useBudget, type DebtNote } from "@/context/budget-context";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function PayDebtPage() {
    const { debtId } = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const { updateDebtNote, totalIncome, totalExpense } = useBudget();

    const debtDocRef = useMemoFirebase(() => {
        if (!user || !firestore || !debtId) return null;
        return doc(firestore, `users/${user.uid}/debtNotes`, debtId as string);
    }, [user, firestore, debtId]);

    const { data: debtNote, isLoading: isDebtLoading } = useDoc<DebtNote>(debtDocRef);

    const remainingAmount = useMemo(() => {
        if (!debtNote) return 0;
        return debtNote.amount - debtNote.paidAmount;
    }, [debtNote]);

    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Set initial payment amount when debtNote loads
    useState(() => {
        if (remainingAmount > 0) {
            setPaymentAmount(remainingAmount);
        }
    });
     
    // Recalculate when debtNote changes
    useMemo(() => {
        if(remainingAmount > 0) {
            setPaymentAmount(remainingAmount);
        }
    }, [remainingAmount]);


    const balance = totalIncome - totalExpense;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
            style: "currency",
            currency: "BDT",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handlePaymentConfirm = async () => {
        if (!debtNote || !paymentDate) return;
        setIsSubmitting(true);

        if (paymentAmount <= 0 || paymentAmount > remainingAmount) {
            toast({
                variant: "destructive",
                title: "ভুল পরিমাণ",
                description: `অনুগ্রহ করে সঠিক পরিমাণ লিখুন (সর্বোচ্চ: ${formatCurrency(remainingAmount)})।`,
            });
            setIsSubmitting(false);
            return;
        }
        
        if (debtNote.type === 'borrowed' && paymentAmount > balance) {
            toast({
                variant: "destructive",
                title: "অপর্যাপ্ত ব্যালেন্স",
                description: `আপনার বর্তমান ব্যালেন্স ${formatCurrency(balance)}। আপনি এর বেশি পরিশোধ করতে পারবেন না।`,
            });
            setIsSubmitting(false);
            return;
        }

        try {
            await updateDebtNote(debtNote, paymentAmount, paymentDate);

            toast({
                title: "সফল!",
                description: "পরিশোধের হিসাব সফলভাবে আপডেট করা হয়েছে।",
            });

            router.push('/debts');
        } catch (error) {
            console.error("Error confirming payment:", error);
            toast({ variant: "destructive", title: "ত্রুটি", description: "একটি সমস্যা হয়েছে।" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isDebtLoading) {
        return (
            <div className="flex-1 space-y-4">
                <PageHeader title="ধার পরিশোধ" description="লোড হচ্ছে..." />
                 <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                     <CardContent className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-12 w-full" />
                    </CardFooter>
                 </Card>
            </div>
        )
    }

    if (!debtNote) {
        notFound();
    }
    
    const headerTitle = debtNote.type === 'lent' ? 'ধার আদায়' : 'ধার পরিশোধ';
    const headerDescription = `${debtNote.person}-এর সাথে আপনার লেনদেন নিষ্পত্তি করুন।`;


    return (
        <div className="flex-1 space-y-4">
            <PageHeader title={headerTitle} description={headerDescription} />
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>পরিশোধের তথ্য</CardTitle>
                    <CardDescription>
                       বাকি আছে: <span className="font-bold text-primary">{formatCurrency(remainingAmount)}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 py-4 px-4">
                     <div className="space-y-2">
                        <Label htmlFor="payment-amount">পরিমাণ</Label>
                        <Input
                            id="payment-amount"
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                            max={remainingAmount}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>স্লাইডার</Label>
                        <Slider
                            value={[paymentAmount]}
                            max={remainingAmount}
                            step={10}
                            onValueChange={(value) => setPaymentAmount(value[0])}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>পরিশোধের তারিখ</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !paymentDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {paymentDate ? format(paymentDate, "PPP") : <span>একটি তারিখ বাছুন</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={paymentDate}
                                    onSelect={setPaymentDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" onClick={handlePaymentConfirm} disabled={isSubmitting || remainingAmount <= 0} className="w-full">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {remainingAmount <= 0 ? 'সম্পূর্ণ পরিশোধিত' : (isSubmitting ? 'প্রসেসিং...' : 'নিশ্চিত করুন')}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
