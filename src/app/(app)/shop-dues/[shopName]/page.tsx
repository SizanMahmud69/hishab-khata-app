
"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { useBudget, type DebtNote } from "@/context/budget-context";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/page-header";
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Link from "next/link";

export default function ShopDueDetailPage() {
    const params = useParams();
    const router = useRouter();
    const shopName = useMemo(() => decodeURIComponent(params.shopName as string), [params.shopName]);
    
    const { debtNotes, updateDebtNote } = useBudget();
    const { toast } = useToast();
    
    const [selectedDue, setSelectedDue] = useState<DebtNote | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const shopDues = useMemo(() => 
        debtNotes.filter(d => d.type === 'shopDue' && d.person === shopName)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [debtNotes, shopName]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
    }

    const openPaymentDialog = (due: DebtNote) => {
        setSelectedDue(due);
        setPaymentAmount(due.amount - due.paidAmount);
        setIsPaymentDialogOpen(true);
    }

    const handlePaymentConfirm = async () => {
        if (!selectedDue) return;

        setIsSubmitting(true);
        const remainingAmount = selectedDue.amount - selectedDue.paidAmount;
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
            const newPaidAmount = selectedDue.paidAmount + paymentAmount;
            const newStatus = newPaidAmount >= selectedDue.amount ? 'paid' : 'partially-paid';
            const updatedDue: DebtNote = { ...selectedDue, paidAmount: newPaidAmount, status: newStatus };
            
            await updateDebtNote(updatedDue);

            toast({
                title: "সফল!",
                description: "পরিশোধের হিসাব সফলভাবে আপডেট করা হয়েছে।",
            });

            setIsPaymentDialogOpen(false);
            setSelectedDue(null);
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
    
    const totalDueAmount = shopDues.reduce((sum, due) => sum + due.amount, 0);
    const totalPaidAmount = shopDues.reduce((sum, due) => sum + due.paidAmount, 0);
    const totalRemainingDue = totalDueAmount - totalPaidAmount;

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title={shopName} description={`মোট বাকি: ${formatCurrency(totalRemainingDue)}`}>
         <Button variant="outline" asChild>
            <Link href="/shop-dues">
                <ArrowLeft className="mr-2 h-4 w-4" />
                ফিরে যান
            </Link>
        </Button>
      </PageHeader>
      
       <div className="space-y-3">
        {shopDues.length > 0 ? (
          shopDues.map((due) => (
            <Collapsible key={due.id} asChild>
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">{formatCurrency(due.amount)}</p>
                      <p className="text-sm text-muted-foreground">{new Date(due.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                     <div className="flex items-center gap-4">
                        {getStatusBadge(due.status)}
                     </div>
                  </div>
                </CardContent>

                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-2 text-sm text-muted-foreground">
                    {due.status === 'partially-paid' && (
                      <p>
                        পরিশোধিত: {formatCurrency(due.paidAmount)} | বাকি: {formatCurrency(due.amount - due.paidAmount)}
                      </p>
                    )}
                    {due.description && (
                      <p className="border-t pt-2">নোট: {due.description}</p>
                    )}
                  </div>
                </CollapsibleContent>

                <CardFooter className="bg-muted/50 p-3 flex items-center justify-between">
                  <CollapsibleTrigger asChild>
                       <Button variant="ghost" size="sm" className="text-xs">
                        বিস্তারিত দেখুন
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </CollapsibleTrigger>
                  <Button
                    size="sm"
                    onClick={() => openPaymentDialog(due)}
                    disabled={due.status === 'paid'}
                    variant={due.status === 'paid' ? 'ghost' : 'outline'}
                  >
                    {due.status === 'paid' ? 'সম্পূর্ণ পরিশোধিত' : 'পরিশোধ করুন'}
                  </Button>
                </CardFooter>
              </Card>
            </Collapsible>
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground border rounded-lg">
            <p>এই দোকানে কোনো বাকি লেনদেন নেই।</p>
          </div>
        )}
      </div>
      
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>পরিশোধ নিশ্চিত করুন</DialogTitle>
                    <DialogDescription>
                        {selectedDue?.person} কে পরিশোধ করার জন্য পরিমাণ লিখুন।
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
                            max={selectedDue ? selectedDue.amount - selectedDue.paidAmount : 0}
                        />
                    </div>
                    <div className="space-y-1.5">
                         <Label>স্লাইডার</Label>
                         <Slider
                            value={[paymentAmount]}
                            max={selectedDue ? selectedDue.amount - selectedDue.paidAmount : 0}
                            step={10}
                            onValueChange={(value) => setPaymentAmount(value[0])}
                        />
                    </div>
                     <p className="text-sm text-muted-foreground text-right pr-1">
                        বাকি আছে: {formatCurrency(selectedDue ? selectedDue.amount - selectedDue.paidAmount : 0)}
                     </p>
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
