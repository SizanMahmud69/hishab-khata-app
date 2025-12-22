
"use client";

import { useState } from "react";
import { PlusCircle, TrendingDown, TrendingUp } from "lucide-react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

export default function DebtsPage() {
    const { debtNotes, addDebtNote, updateDebtNote, addTransaction, totalIncome, totalExpense } = useBudget();
    const { toast } = useToast();
    const [selectedDebt, setSelectedDebt] = useState<DebtNote | null>(null);
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

    const handleAddNewDebt = async (event: React.FormEvent<HTMLFormElement>) => {
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

        const newDebtNote: Omit<DebtNote, 'id' | 'userId' | 'createdAt'> = {
            type,
            person,
            amount,
            date: new Date(date).toISOString(),
            repaymentDate: repaymentDate ? new Date(repaymentDate).toISOString() : undefined,
            description,
            paidAmount: 0,
            status: 'unpaid'
        };

        if (type === 'lent') {
            await addTransaction({
                type: 'expense',
                category: 'ধার প্রদান',
                amount: amount,
                date: new Date(date).toISOString(),
                description: `${person} কে ধার দেওয়া হলো`,
            });
        } else {
            await addTransaction({
                type: 'income',
                category: 'ধার গ্রহণ',
                amount: amount,
                date: new Date(date).toISOString(),
                description: `${person} এর থেকে ধার নেওয়া হলো`,
            });
        }
        
        await addDebtNote(newDebtNote);

        toast({
            title: "সফল!",
            description: "নতুন ধারের হিসাব সফলভাবে যোগ করা হয়েছে।",
        });

        setIsAddDialogOpen(false);
        (event.target as HTMLFormElement).reset();
    }

    const openPaymentDialog = (debt: DebtNote) => {
        setSelectedDebt(debt);
        setPaymentAmount(debt.amount - debt.paidAmount);
        setIsPaymentDialogOpen(true);
    }

    const handlePaymentConfirm = async () => {
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

        const newPaidAmount = selectedDebt.paidAmount + paymentAmount;
        const newStatus = newPaidAmount >= selectedDebt.amount ? 'paid' : 'partially-paid';
        const updatedDebt = { ...selectedDebt, paidAmount: newPaidAmount, status: newStatus };
        
        await updateDebtNote(updatedDebt);

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

    const lentDebts = debtNotes.filter(d => d.type === 'lent');
    const borrowedDebts = debtNotes.filter(d => d.type === 'borrowed');

    const totalLent = lentDebts.reduce((sum, debt) => sum + debt.amount, 0);
    const totalBorrowed = borrowedDebts.reduce((sum, debt) => sum + debt.amount, 0);


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
                <div className="grid gap-4 py-4 px-1 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-1.5">
                        <Label>ধরন</Label>
                        <RadioGroup defaultValue="lent" name="type" className="flex gap-4">
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
                    <div className="space-y-1.5">
                        <Label htmlFor="person">ব্যক্তির নাম</Label>
                        <Input id="person" name="person" placeholder="সোহেল" required />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="amount">পরিমাণ</Label>
                        <Input id="amount" name="amount" type="number" placeholder="2000" required />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="debt-date">ধারের তারিখ</Label>
                        <Input id="debt-date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="repayment-date">পরিশোধের তারিখ</Label>
                        <Input id="repayment-date" name="repayment-date" type="date" />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="description">বিবরণ</Label>
                        <Textarea id="description" name="description" placeholder="ধার সম্পর্কিত কোনো নোট" />
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
                        {selectedDebt?.person} কে পরিশোধ করার জন্য পরিমাণ লিখুন।
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
