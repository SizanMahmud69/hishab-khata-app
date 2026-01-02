

"use client";

import { useMemo, useState } from "react";
import { ShoppingBag, Banknote, PlusCircle, Eye, Loader2 } from "lucide-react"
import { useBudget, type DebtNote } from "@/context/budget-context";
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/page-header"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";


interface ShopDueSummary {
    shopName: string;
    totalAmount: number;
    totalPaid: number;
    remainingDue: number;
    entryCount: number;
    entries: DebtNote[];
}

export default function ShopDuesPage() {
    const { debtNotes, updateDebtNote, addTransaction, totalIncome, totalExpense } = useBudget();
    const { toast } = useToast();
    
    const [paymentShop, setPaymentShop] = useState<ShopDueSummary | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const balance = totalIncome - totalExpense;

    const shopDuesSummary = useMemo((): ShopDueSummary[] => {
        const duesByShop = debtNotes
            .filter(d => d.type === 'shopDue')
            .reduce((acc, due) => {
                if (!acc[due.person]) {
                    acc[due.person] = [];
                }
                acc[due.person].push(due);
                return acc;
            }, {} as Record<string, DebtNote[]>);

        return Object.entries(duesByShop).map(([shopName, entries]) => {
            const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);
            const totalPaid = entries.reduce((sum, entry) => sum + entry.paidAmount, 0);
            return {
                shopName,
                totalAmount,
                totalPaid,
                remainingDue: totalAmount - totalPaid,
                entryCount: entries.length,
                entries: entries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            };
        }).sort((a, b) => b.remainingDue - a.remainingDue);
    }, [debtNotes]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
    }

    const totalDueAmount = shopDuesSummary.reduce((sum, due) => sum + due.totalAmount, 0);
    const totalPaidAmount = shopDuesSummary.reduce((sum, due) => sum + due.totalPaid, 0);
    const totalRemainingDue = totalDueAmount - totalPaidAmount;

    const getStatusBadge = (remaining: number, paid: number) => {
        if (remaining <= 0) {
             return <Badge className="bg-green-700 hover:bg-green-700/80">পরিশোধিত</Badge>;
        }
        if (paid > 0) {
             return <Badge variant="outline" className="border-yellow-500 text-yellow-600">আংশিক</Badge>;
        }
        return <Badge variant="destructive">অপরিশোধিত</Badge>;
    }
    
    const openPaymentDialog = (shop: ShopDueSummary) => {
        setPaymentShop(shop);
        setPaymentAmount(shop.remainingDue > 0 ? shop.remainingDue : 0);
        setIsPaymentOpen(true);
    }
    
    const handlePaymentConfirm = async () => {
        if (!paymentShop) return;

        setIsSubmitting(true);
        if (paymentAmount <= 0 || paymentAmount > paymentShop.remainingDue) {
            toast({
                variant: 'destructive',
                title: 'ভুল পরিমাণ',
                description: `অনুগ্রহ করে সঠিক পরিমাণ লিখুন (সর্বোচ্চ: ${formatCurrency(paymentShop.remainingDue)})।`,
            });
            setIsSubmitting(false);
            return;
        }

        if (paymentAmount > balance) {
            toast({
                variant: "destructive",
                title: "অপর্যাপ্ত ব্যালেন্স",
                description: `আপনার বর্তমান ব্যালেন্স ${formatCurrency(balance)}। আপনি এর বেশি পরিশোধ করতে পারবেন না।`,
            });
            setIsSubmitting(false);
            return;
        }
        
        let amountToSettle = paymentAmount;

        try {
            // Settle unpaid entries first
            const sortedEntries = paymentShop.entries.filter(e => e.status !== 'paid').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            for (const entry of sortedEntries) {
                if (amountToSettle <= 0) break;

                const entryRemaining = entry.amount - entry.paidAmount;
                const paymentForEntry = Math.min(amountToSettle, entryRemaining);
                
                const newPaidAmount = entry.paidAmount + paymentForEntry;
                const newStatus = newPaidAmount >= entry.amount ? 'paid' : 'partially-paid';

                await updateDebtNote({ ...entry, paidAmount: newPaidAmount, status: newStatus });
                amountToSettle -= paymentForEntry;
            }
            
            await addTransaction({
                type: 'expense',
                category: 'দোকান বাকি পরিশোধ',
                amount: paymentAmount,
                date: new Date().toISOString(),
                description: `${paymentShop.shopName}-এর বাকি পরিশোধ`,
            });

            toast({
                title: 'সফল!',
                description: 'পরিশোধের হিসাব সফলভাবে আপডেট করা হয়েছে।',
            });
            
            setIsPaymentOpen(false);
            setPaymentShop(null);

        } catch (error) {
             console.error('Error confirming payment:', error);
             toast({
                variant: 'destructive',
                title: 'ত্রুটি',
                description: 'একটি সমস্যা হয়েছে।',
            });
        } finally {
            setIsSubmitting(false);
        }
    }


  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="আমার দোকানের বাকি" description="বিভিন্ন দোকানে আপনার মোট বাকির একটি সারসংক্ষেপ।">
        <div className="flex items-center gap-2">
            <Button asChild>
                <Link href="/shop-dues/add">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    দোকান বাকি
                </Link>
            </Button>
        </div>
      </PageHeader>
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট বাকি আছে</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-500">{formatCurrency(totalRemainingDue)}</div>
                <p className="text-xs text-muted-foreground">এখনও পরিশোধ করা হয়নি</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট পরিশোধ হয়েছে</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-700">{formatCurrency(totalPaidAmount)}</div>
                <p className="text-xs text-muted-foreground">এই পর্যন্ত মোট পরিশোধ</p>
            </CardContent>
        </Card>
      </div>

       <div className="space-y-3">
        {shopDuesSummary.length > 0 ? (
            shopDuesSummary.map((due) => (
              <Card key={due.shopName}>
                <CardHeader>
                    <CardTitle>{due.shopName}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={cn("font-bold text-xl", due.remainingDue > 0 ? 'text-red-500' : 'text-green-700')}>
                        বাকি: {formatCurrency(due.remainingDue)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {due.entryCount} টি লেনদেন | মোট বাকি: {formatCurrency(due.totalAmount)}
                    </p>
                </CardContent>
                <CardFooter className="bg-muted/50 p-3 flex justify-between items-center">
                    {getStatusBadge(due.remainingDue, due.totalPaid)}
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/shop-dues/${encodeURIComponent(due.shopName)}`}>
                                <Eye className="h-4 w-4" />
                            </Link>
                         </Button>
                         <Button size="sm" onClick={() => openPaymentDialog(due)} disabled={due.remainingDue <= 0}>
                            পরিশোধ করুন
                         </Button>
                    </div>
                </CardFooter>
              </Card>
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground border rounded-lg">
            <p>এখনও কোনো বাকি যোগ করা হয়নি।</p>
          </div>
        )}
      </div>
      
      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>বাকি পরিশোধ</DialogTitle>
            <DialogDescription>
              {paymentShop?.shopName}-এর বকেয়া পরিশোধ করুন।
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="payment-amount">পরিমাণ</Label>
              <Input
                id="payment-amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                max={paymentShop?.remainingDue}
              />
            </div>
            <div className="space-y-1.5">
              <Label>স্লাইডার</Label>
              <Slider
                value={[paymentAmount]}
                max={paymentShop?.remainingDue ?? 0}
                step={10}
                onValueChange={(value) => setPaymentAmount(value[0])}
              />
            </div>
            <p className="text-sm text-muted-foreground text-right pr-1">
              মোট বাকি আছে: {formatCurrency(paymentShop?.remainingDue ?? 0)}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>বাতিল</Button>
            <Button type="submit" onClick={handlePaymentConfirm} disabled={isSubmitting || paymentAmount <= 0}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'প্রসেসিং...' : 'নিশ্চিত করুন'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
