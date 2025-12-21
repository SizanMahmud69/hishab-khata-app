
"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react"
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
import { type Debt } from "@/lib/data"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function DebtsPage() {
    const { debts, setDebts, isLoading, addExpense, addIncome, totalIncome, totalExpense } = useBudget();
    const { toast } = useToast();
    const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const balance = totalIncome - totalExpense;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
    }

    const handleAddNewDebt = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const type = formData.get('type') as 'lent' | 'borrowed';
        const person = formData.get('person') as string;
        const amount = Number(formData.get('amount'));
        const date = formData.get('date') as string;
        const repaymentDate = formData.get('repayment-date') as string;
        const description = formData.get('description') as string;

        if (!type || !person || !amount || !date) {
            toast({
                variant: "destructive",
                title: "ফর্ম পূরণ আবশ্যক",
                description: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।",
            });
            return;
        }

        if (type === 'lent' && amount > balance) {
            toast({
                variant: "destructive",
                title: "অপর্যাপ্ত ব্যালেন্স",
                description: `আপনি ${formatCurrency(amount)} ধার দিতে পারবেন না। আপনার বর্তমান ব্যালেন্স ${formatCurrency(balance)}।`,
            });
            return;
        }

        const newDebt: Debt = {
            id: Date.now(),
            type,
            person,
            amount,
            date,
            repaymentDate,
            description,
            paidAmount: 0,
            status: 'unpaid'
        };

        if (type === 'lent') {
            addExpense({
                id: Date.now(),
                category: 'ধার প্রদান',
                amount: amount,
                date: date,
                description: `${person} কে ধার দেওয়া হলো`,
            });
        } else {
            addIncome({
                source: 'ধার গ্রহণ',
                amount: amount,
                date: date,
                description: `${person} এর থেকে ধার নেওয়া হলো`,
            });
        }
        
        setDebts(prev => [newDebt, ...prev]);

        toast({
            title: "সফল!",
            description: "নতুন ধারের হিসাব সফলভাবে যোগ করা হয়েছে।",
        });

        setIsAddDialogOpen(false);
    }

    const openPaymentDialog = (debt: Debt) => {
        setSelectedDebt(debt);
        setPaymentAmount(debt.amount - debt.paidAmount);
        setIsPaymentDialogOpen(true);
    }

    const handlePaymentConfirm = () => {
        if (!selectedDebt) return;

        const remainingAmount = selectedDebt.amount - selectedDebt.paidAmount;
        if (paymentAmount <= 0 || paymentAmount > remainingAmount) {
            toast({
                variant: "destructive",
                title: "ভুল পরিমাণ",
                description: `অনুগ্রহ করে সঠিক পরিমাণ লিখুন (সর্বোচ্চ: ${formatCurrency(remainingAmount)})।`,
            });
            return;
        }

        setDebts(debts.map(debt => {
            if (debt.id === selectedDebt.id) {
                const newPaidAmount = debt.paidAmount + paymentAmount;
                const newStatus = newPaidAmount >= debt.amount ? 'paid' : 'partially-paid';
                return { ...debt, paidAmount: newPaidAmount, status: newStatus };
            }
            return debt;
        }));

        toast({
            title: "সফল!",
            description: "পরিশোধের হিসাব সফলভাবে আপডেট করা হয়েছে।",
        });

        setIsPaymentDialogOpen(false);
        setSelectedDebt(null);
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

    const lentDebts = debts.filter(d => d.type === 'lent');
    const borrowedDebts = debts.filter(d => d.type === 'borrowed');

    if (isLoading) {
        return <DebtsSkeleton />;
    }

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="ধারের হিসাব" description="আপনার সকল দেনা-পাওনার হিসাব রাখুন।">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              নতুন ধার যোগ করুন
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>নতুন ধারের হিসাব</DialogTitle>
              <DialogDescription>
                সম্পর্কিত ব্যক্তির নাম এবং অর্থের পরিমাণ লিখুন।
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddNewDebt}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">ধরন</Label>
                        <RadioGroup defaultValue="lent" name="type" className="col-span-3 flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="lent" id="r-lent" />
                                <Label htmlFor="r-lent">ধার দিয়েছি</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="borrowed" id="r-borrowed" />
                                <Label htmlFor="r-borrowed">ধার নিয়েছি</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="person" className="text-right">ব্যক্তির নাম</Label>
                        <Input id="person" name="person" placeholder="সোহেল" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                        পরিমাণ
                        </Label>
                        <Input id="amount" name="amount" type="number" placeholder="2000" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="debt-date" className="text-right">
                        ধারের তারিখ
                        </Label>
                        <Input id="debt-date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="repayment-date" className="text-right">
                        পরিশোধের তারিখ
                        </Label>
                        <Input id="repayment-date" name="repayment-date" type="date" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="description" className="text-right pt-2">
                            বিবরণ
                        </Label>
                        <Textarea id="description" name="description" placeholder="ধার সম্পর্কিত কোনো নোট" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                  <Button type="submit">সংরক্ষণ করুন</Button>
                </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>
      
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
                                <span className="font-bold text-sm">{formatCurrency(debt.amount)}</span>
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
                                <span className="font-bold text-sm">{formatCurrency(debt.amount)}</span>
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
                        {selectedDebt?.person} কে পরিশোধ করার জন্য পরিমাণ লিখুন।
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="payment-amount" className="text-right">
                            পরিমাণ
                        </Label>
                        <Input 
                            id="payment-amount" 
                            type="number" 
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                            className="col-span-3"
                        />
                    </div>
                     <p className="text-sm text-muted-foreground col-start-2 col-span-3">
                        বাকি আছে: {formatCurrency(selectedDebt ? selectedDebt.amount - selectedDebt.paidAmount : 0)}
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

function DebtsSkeleton() {
    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between mb-6">
                <div className="grid gap-1">
                    <Skeleton className="h-9 w-40" />
                    <Skeleton className="h-5 w-72" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="space-y-4 mt-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        </div>
    );
}

    

    