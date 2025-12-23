
"use client";

import { useMemo, useState } from "react";
import { ShoppingBag, Banknote, PlusCircle, Trash2, ChevronDown, Loader2 } from "lucide-react"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils";
import ShopDueForm from "@/components/shop-due-form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export default function ShopDuesPage() {
    const { debtNotes, updateDebtNote } = useBudget();
    const { toast } = useToast();

    const [selectedDue, setSelectedDue] = useState<DebtNote | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const shopDues = useMemo(() => 
        debtNotes.filter(d => d.type === 'shopDue')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [debtNotes]);

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
      <PageHeader title="আমার দোকানের বাকি" description="বিভিন্ন দোকানে আপনার মোট বাকির একটি সারসংক্ষেপ।">
        <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  নতুন বাকি যোগ করুন
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>নতুন বাকির হিসাব</DialogTitle>
                  <DialogDescription>
                    দোকানের নাম এবং বাকির পরিমাণ লিখুন।
                  </DialogDescription>
                </DialogHeader>
                <ShopDueForm />
              </DialogContent>
            </Dialog>
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
                <div className="text-2xl font-bold text-green-500">{formatCurrency(totalPaidAmount)}</div>
                <p className="text-xs text-muted-foreground">এই পর্যন্ত মোট পরিশোধ</p>
            </CardContent>
        </Card>
      </div>

       <div className="space-y-3">
        {shopDues.length > 0 ? (
            shopDues.map((due) => (
            <Collapsible key={due.id} asChild>
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">{due.person}</p>
                       <p className="text-sm text-muted-foreground">{new Date(due.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                     <div className="text-right">
                        <p className={cn("font-bold text-lg", due.status !== 'paid' ? 'text-red-500' : 'text-green-500')}>
                            {formatCurrency(due.amount)}
                        </p>
                        {getStatusBadge(due.status)}
                     </div>
                  </div>
                </CardContent>

                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-2 text-sm text-muted-foreground border-t mt-2 pt-2">
                    {due.status === 'partially-paid' && (
                      <p>
                        পরিশোধিত: {formatCurrency(due.paidAmount)} | বাকি: {formatCurrency(due.amount - due.paidAmount)}
                      </p>
                    )}
                    {due.description && (
                      <p>নোট: {due.description}</p>
                    )}
                     {!due.description && due.status !== 'partially-paid' && (
                      <p>কোনো বিস্তারিত তথ্য নেই।</p>
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
            <p>এখনও কোনো বাকি যোগ করা হয়নি।</p>
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
