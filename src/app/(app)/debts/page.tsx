
"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react"
import { useBudget } from "@/context/budget-context";
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/page-header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardDescription,
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
import { debts as initialDebts, type Debt } from "@/lib/data"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function DebtsPage() {
    const { isLoading } = useBudget();
    const { toast } = useToast();
    const [debts, setDebts] = useState<Debt[]>(initialDebts);
    const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
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
                return <Badge variant="outline" className="border-yellow-500 text-yellow-600">আংশিক পরিশোধিত</Badge>;
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
        <Dialog>
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
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="person" className="text-right">ব্যক্তির নাম</Label>
                    <Input id="person" placeholder="সোহেল" className="col-span-3" />
                </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  পরিমাণ
                </Label>
                <Input id="amount" type="number" placeholder="2000" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">ধরন</Label>
                <RadioGroup defaultValue="lent" className="col-span-3 flex gap-4">
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
                <Label htmlFor="date" className="text-right">
                  তারিখ
                </Label>
                <Input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">সংরক্ষণ করুন</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>
      
      <Tabs defaultValue="lent" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lent">ধার দিয়েছি</TabsTrigger>
          <TabsTrigger value="borrowed">ধার নিয়েছি</TabsTrigger>
        </TabsList>
        <TabsContent value="lent">
          <Card>
              <CardHeader>
                  <CardTitle>ধার দিয়েছি</CardTitle>
                  <CardDescription>আপনি অন্যদের যে টাকা ধার দিয়েছেন।</CardDescription>
              </CardHeader>
              <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>নাম</TableHead>
                          <TableHead>পরিমাণ</TableHead>
                          <TableHead>স্ট্যাটাস</TableHead>
                          <TableHead className="text-right">অ্যাকশন</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                  {lentDebts.map((debt) => (
                      <TableRow key={debt.id}>
                          <TableCell className="font-medium">{debt.person}</TableCell>
                          <TableCell>
                            <div className="font-semibold">{formatCurrency(debt.amount)}</div>
                            {debt.status !== 'unpaid' && (
                                <p className="text-xs text-muted-foreground">
                                    পরিশোধিত: {formatCurrency(debt.paidAmount)}
                                </p>
                            )}
                          </TableCell>
                          <TableCell>
                              {getStatusBadge(debt.status)}
                          </TableCell>
                           <TableCell className="text-right">
                            <Button 
                                size="sm" 
                                onClick={() => openPaymentDialog(debt)}
                                disabled={debt.status === 'paid'}
                                variant={debt.status === 'paid' ? 'ghost' : 'outline'}
                            >
                                {debt.status === 'paid' ? 'পরিশোধিত' : 'পরিশোধ করুন'}
                            </Button>
                          </TableCell>
                      </TableRow>
                  ))}
                  </TableBody>
              </Table>
              </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="borrowed">
          <Card>
              <CardHeader>
                  <CardTitle>ধার নিয়েছি</CardTitle>
                  <CardDescription>আপনি অন্যদের থেকে যে টাকা ধার নিয়েছেন।</CardDescription>
              </CardHeader>
              <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>নাম</TableHead>
                          <TableHead>পরিমাণ</TableHead>
                          <TableHead>স্ট্যাটাস</TableHead>
                          <TableHead className="text-right">অ্যাকশন</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                  {borrowedDebts.map((debt) => (
                      <TableRow key={debt.id}>
                          <TableCell className="font-medium">{debt.person}</TableCell>
                          <TableCell>
                            <div className="font-semibold">{formatCurrency(debt.amount)}</div>
                            {debt.status !== 'unpaid' && (
                                <p className="text-xs text-muted-foreground">
                                    পরিশোধিত: {formatCurrency(debt.paidAmount)}
                                </p>
                            )}
                          </TableCell>
                          <TableCell>
                               {getStatusBadge(debt.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                                size="sm" 
                                onClick={() => openPaymentDialog(debt)} 
                                disabled={debt.status === 'paid'}
                                variant={debt.status === 'paid' ? 'ghost' : 'outline'}
                            >
                                {debt.status === 'paid' ? 'পরিশোধিত' : 'পরিশোধ করুন'}
                            </Button>
                          </TableCell>
                      </TableRow>
                  ))}
                  </TableBody>
              </Table>
              </CardContent>
          </Card>
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
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-5 w-64" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    