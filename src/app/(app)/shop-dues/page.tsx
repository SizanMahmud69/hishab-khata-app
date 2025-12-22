
"use client";

import { useState } from "react";
import { PlusCircle, ShoppingBag, Banknote } from "lucide-react"
import { useBudget } from "@/context/budget-context";
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
import { type ShopDue } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

export default function ShopDuesPage() {
    const { shopDues, setShopDues, isLoading } = useBudget();
    const { toast } = useToast();
    const [selectedDue, setSelectedDue] = useState<ShopDue | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
    }

    const handleAddNewDue = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const shopName = formData.get('shopName') as string;
        const amount = Number(formData.get('amount'));
        const date = formData.get('date') as string;
        const description = formData.get('description') as string;

        if (!shopName || !amount || !date) {
            toast({
                variant: "destructive",
                title: "ফর্ম পূরণ আবশ্যক",
                description: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।",
            });
            return;
        }

        const newDue: ShopDue = {
            id: Date.now(),
            shopName,
            amount,
            date,
            description,
            paidAmount: 0,
            status: 'unpaid'
        };
        
        setShopDues(prev => [newDue, ...prev]);

        toast({
            title: "সফল!",
            description: "নতুন দোকানের বাকি সফলভাবে যোগ করা হয়েছে।",
        });

        setIsAddDialogOpen(false);
    }

    const openPaymentDialog = (due: ShopDue) => {
        setSelectedDue(due);
        setPaymentAmount(due.amount - due.paidAmount);
        setIsPaymentDialogOpen(true);
    }

    const handlePaymentConfirm = () => {
        if (!selectedDue) return;

        const remainingAmount = selectedDue.amount - selectedDue.paidAmount;
        if (paymentAmount <= 0 || paymentAmount > remainingAmount) {
            toast({
                variant: "destructive",
                title: "ভুল পরিমাণ",
                description: `অনুগ্রহ করে সঠিক পরিমাণ লিখুন (সর্বোচ্চ: ${formatCurrency(remainingAmount)})।`,
            });
            return;
        }

        setShopDues(shopDues.map(due => {
            if (due.id === selectedDue.id) {
                const newPaidAmount = due.paidAmount + paymentAmount;
                const newStatus = newPaidAmount >= due.amount ? 'paid' : 'partially-paid';
                return { ...due, paidAmount: newPaidAmount, status: newStatus };
            }
            return due;
        }));

        toast({
            title: "সফল!",
            description: "পরিশোধের হিসাব সফলভাবে আপডেট করা হয়েছে।",
        });

        setIsPaymentDialogOpen(false);
        setSelectedDue(null);
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


    if (isLoading) {
        return <DuesSkeleton />;
    }

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="আমার দোকানের বাকি" description="বিভিন্ন দোকানে আপনার বাকির হিসাব রাখুন।">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
            <form onSubmit={handleAddNewDue}>
                <div className="grid gap-4 py-4 px-1 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-1.5">
                        <Label htmlFor="shopName">দোকানের নাম</Label>
                        <Input id="shopName" name="shopName" placeholder="করিম স্টোর" required />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="amount">পরিমাণ</Label>
                        <Input id="amount" name="amount" type="number" placeholder="500" required />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="due-date">বাকির তারিখ</Label>
                        <Input id="due-date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="description">বিবরণ</Label>
                        <Textarea id="description" name="description" placeholder="বাকি সম্পর্কিত কোনো নোট" />
                    </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit">সংরক্ষণ করুন</Button>
                </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
        {shopDues.map((due) => (
            <Card key={due.id}>
                <CardContent className="p-4">
                   <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold">{due.shopName}</p>
                            <p className="text-sm text-muted-foreground">{new Date(due.date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <span className={cn(
                            "font-bold text-base",
                            due.status !== 'paid' ? 'text-red-500' : 'text-green-500'
                        )}>{formatCurrency(due.amount)}</span>
                   </div>
                    {due.status === 'partially-paid' && (
                        <p className="text-xs text-muted-foreground mt-2">
                            পরিশোধিত: {formatCurrency(due.paidAmount)} | বাকি: {formatCurrency(due.amount - due.paidAmount)}
                        </p>
                    )}
                </CardContent>
                <CardFooter className="bg-muted/50 p-3 flex items-center justify-between">
                     {getStatusBadge(due.status)}
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
        ))}
         {shopDues.length === 0 && (
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
                        {selectedDue?.shopName} কে পরিশোধ করার জন্য পরিমাণ লিখুন।
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
                    <Button type="submit" onClick={handlePaymentConfirm}>নিশ্চিত করুন</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}

function DuesSkeleton() {
    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between mb-6">
                <div className="grid gap-1">
                    <Skeleton className="h-9 w-40" />
                    <Skeleton className="h-5 w-72" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    );
}

    