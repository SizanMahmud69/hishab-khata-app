

"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, TrendingDown, TrendingUp, Loader2, Calendar as CalendarIcon } from "lucide-react"
import { useBudget, type DebtNote } from "@/context/budget-context";
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/page-header"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function DebtsPage() {
    const { debtNotes, updateDebtNote } = useBudget();
    const { toast } = useToast();
    const [selectedDebt, setSelectedDebt] = useState<DebtNote | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
    }

    const openPaymentDialog = (debt: DebtNote) => {
        setSelectedDebt(debt);
        setPaymentAmount(debt.amount - debt.paidAmount);
        setPaymentDate(new Date());
        setIsPaymentDialogOpen(true);
    }

    const handlePaymentConfirm = async () => {
        if (!selectedDebt || !paymentDate) return;
        
        setIsSubmitting(true);
        const remainingAmount = selectedDebt.amount - selectedDebt.paidAmount;
        if (paymentAmount <= 0 || paymentAmount > remainingAmount) {
            toast({
                variant: "destructive",
                title: "ভুল পরিমাণ",
                description: `অনুগ্রহ করে সঠিক পরিমাণ লিখুন (সর্বোচ্চ: ${formatCurrency(remainingAmount)})।`,
            });
            setIsSubmitting(false);
            return;
        }

        try {
            const newPaidAmount = selectedDebt.paidAmount + paymentAmount;
            const newStatus = newPaidAmount >= selectedDebt.amount ? 'paid' : 'partially-paid';
            const updatedDebt = { ...selectedDebt, paidAmount: newPaidAmount, status: newStatus };
            
            await updateDebtNote(updatedDebt, paymentAmount, paymentDate);

            toast({
                title: "সফল!",
                description: "পরিশোধের হিসাব সফলভাবে আপডেট করা হয়েছে।",
            });

            setIsPaymentDialogOpen(false);
            setSelectedDebt(null);
        } catch (error) {
            console.error("Error confirming payment:", error);
            toast({ variant: "destructive", title: "ত্রুটি", description: "একটি সমস্যা হয়েছে।" });
        } finally {
            setIsSubmitting(false);
        }
    }

    const getStatusBadge = (status: 'unpaid' | 'paid' | 'partially-paid') => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-500 hover:bg-green-500/80">পরিশোধিত</Badge>;
            case 'partially-paid':
                return <Badge variant="outline" className="border-yellow-500 text-yellow-600">আংশিক</Badge>;
            case 'unpaid':
            default:
                return <Badge variant="destructive">অপরিশোধিত</Badge>;
        }
    }

    const lentDebts = debtNotes.filter(d => d.type === 'lent');
    const borrowedDebts = debtNotes.filter(d => d.type === 'borrowed');

    const totalLent = lentDebts.reduce((sum, debt) => sum + (debt.amount - debt.paidAmount), 0);
    const totalBorrowed = borrowedDebts.reduce((sum, debt) => sum + (debt.amount - debt.paidAmount), 0);


  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="ধারের হিসাব" description="আপনার সকল দেনা-পাওনার হিসাব রাখুন।">
        <Button asChild>
            <Link href="/debts/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                নতুন ধার যোগ করুন
            </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট ধার দিয়েছেন</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-500">{formatCurrency(totalLent)}</div>
                <p className="text-xs text-muted-foreground">আপনি অন্যদের যে টাকা দিয়েছেন</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট ধার নিয়েছেন</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-500">{formatCurrency(totalBorrowed)}</div>
                <p className="text-xs text-muted-foreground">আপনি অন্যদের থেকে যে টাকা নিয়েছেন</p>
            </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="lent" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lent">ধার দিয়েছি ({lentDebts.length})</TabsTrigger>
          <TabsTrigger value="borrowed">ধার নিয়েছি ({borrowedDebts.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="lent">
            <div className="space-y-3">
                {lentDebts.map((debt) => (
                    <Card key={debt.id}>
                        <CardContent className="p-4">
                           <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{debt.person}</p>
                                    <p className="text-sm text-muted-foreground">{new Date(debt.date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <span className={cn(
                                    "font-bold text-base",
                                    debt.status !== 'paid' ? 'text-red-500' : 'text-foreground'
                                )}>{formatCurrency(debt.amount)}</span>
                           </div>
                            {debt.status === 'partially-paid' && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    পরিশোধিত: {formatCurrency(debt.paidAmount)} | বাকি: {formatCurrency(debt.amount - debt.paidAmount)}
                                </p>
                            )}
                        </CardContent>
                        <CardFooter className="bg-muted/50 p-3 flex items-center justify-between">
                             {getStatusBadge(debt.status)}
                             <Button 
                                size="sm" 
                                onClick={() => openPaymentDialog(debt)}
                                disabled={debt.status === 'paid'}
                                variant={debt.status === 'paid' ? 'ghost' : 'outline'}
                            >
                                {debt.status === 'paid' ? 'সম্পূর্ণ পরিশোধিত' : 'পরিশোধ করুন'}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                 {lentDebts.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>আপনি কাউকে ধার দেননি।</p>
                    </div>
                )}
            </div>
        </TabsContent>
        <TabsContent value="borrowed">
           <div className="space-y-3">
                {borrowedDebts.map((debt) => (
                     <Card key={debt.id}>
                        <CardContent className="p-4">
                           <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{debt.person}</p>
                                    <p className="text-sm text-muted-foreground">{new Date(debt.date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <span className={cn(
                                    "font-bold text-base",
                                    debt.status !== 'paid' ? 'text-green-500' : 'text-foreground'
                                )}>{formatCurrency(debt.amount)}</span>
                           </div>
                           {debt.status === 'partially-paid' && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    পরিশোধিত: {formatCurrency(debt.paidAmount)} | বাকি: {formatCurrency(debt.amount - debt.paidAmount)}
                                </p>
                            )}
                        </CardContent>
                        <CardFooter className="bg-muted/50 p-3 flex items-center justify-between">
                           {getStatusBadge(debt.status)}
                           <Button 
                                size="sm" 
                                onClick={() => openPaymentDialog(debt)}
                                disabled={debt.status === 'paid'}
                                variant={debt.status === 'paid' ? 'ghost' : 'outline'}
                            >
                                {debt.status === 'paid' ? 'সম্পূর্ণ পরিশোধিত' : 'পরিশোধ করুন'}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                 {borrowedDebts.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>আপনি কারো থেকে ধার নেননি।</p>
                    </div>
                )}
            </div>
        </TabsContent>
      </Tabs>
      
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>পরিশোধ নিশ্চিত করুন</DialogTitle>
                    <DialogDescription>
                        {selectedDebt?.person} কে পরিশোধ করার জন্য পরিমাণ ও তারিখ লিখুন।
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="payment-amount">
                            পরিমাণ
                        </Label>
                        <Input 
                            id="payment-amount" 
                            type="number" 
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                            max={selectedDebt ? selectedDebt.amount - selectedDebt.paidAmount : 0}
                        />
                    </div>
                    <div className="space-y-1.5">
                         <Label>স্লাইডার</Label>
                         <Slider
                            value={[paymentAmount]}
                            max={selectedDebt ? selectedDebt.amount - selectedDebt.paidAmount : 0}
                            step={10}
                            onValueChange={(value) => setPaymentAmount(value[0])}
                        />
                    </div>
                     <p className="text-sm text-muted-foreground text-right pr-1">
                        বাকি আছে: {formatCurrency(selectedDebt ? selectedDebt.amount - selectedDebt.paidAmount : 0)}
                     </p>
                     <div className="space-y-1.5">
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
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>বাতিল</Button>
                    <Button type="submit" onClick={handlePaymentConfirm} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'প্রসেসিং...' : 'নিশ্চিত করুন'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}
