
"use client";

import { useState, useMemo } from "react";
import { PlusCircle, ShoppingBag, Banknote, Loader2, Settings, Plus, Trash2 } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useShops } from "@/hooks/use-shops";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


export default function ShopDuesPage() {
    const { debtNotes, addDebtNote, updateDebtNote } = useBudget();
    const { toast } = useToast();
    const [selectedDue, setSelectedDue] = useState<DebtNote | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { shops, addShop: addNewShopToList, removeShop, isLoading: areShopsLoading } = useShops();
    const [isAddShopDialogOpen, setIsAddShopDialogOpen] = useState(false);
    const [isDeleteShopDialogOpen, setIsDeleteShopDialogOpen] = useState(false);
    const [newShopName, setNewShopName] = useState("");

    const shopDues = debtNotes.filter(d => d.type === 'shopDue');

    const groupedDues = useMemo(() => {
        return shopDues.reduce((acc, due) => {
            const shopName = due.person;
            if (!acc[shopName]) {
                acc[shopName] = [];
            }
            acc[shopName].push(due);
            return acc;
        }, {} as Record<string, DebtNote[]>);
    }, [shopDues]);


    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
    }

    const handleAddNewDue = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
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
            setIsSubmitting(false);
            return;
        }

        try {
            const newDue: Omit<DebtNote, 'id' | 'userId' | 'createdAt'> = {
                person: shopName,
                type: 'shopDue',
                amount,
                date: new Date(date).toISOString(),
                description,
                paidAmount: 0,
                status: 'unpaid'
            };
            
            await addDebtNote(newDue);

            toast({
                title: "সফল!",
                description: "নতুন দোকানের বাকি সফলভাবে যোগ করা হয়েছে।",
            });

            setIsAddDialogOpen(false);
            (event.target as HTMLFormElement).reset();
        } catch (error) {
            console.error("Error adding new due:", error);
            toast({ variant: "destructive", title: "ত্রুটি", description: "একটি সমস্যা হয়েছে।" });
        } finally {
            setIsSubmitting(false);
        }
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
        } catch (error) => {
            console.error("Error confirming payment:", error);
            toast({ variant: "destructive", title: "ত্রুটি", description: "একটি সমস্যা হয়েছে।" });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const handleAddNewShop = () => {
        if (newShopName.trim()) {
            const success = addNewShopToList(newShopName.trim());
            if (success) {
                setNewShopName("");
                toast({
                    title: "সফল!",
                    description: `"${newShopName.trim()}" দোকানে যোগ করা হয়েছে।`,
                });
                setIsAddShopDialogOpen(false);
            } else {
                 toast({
                    variant: "destructive",
                    title: "ব্যর্থ",
                    description: "এই দোকানটি ইতিমধ্যে তালিকায় রয়েছে।",
                });
            }
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
      <PageHeader title="আমার দোকানের বাকি" description="বিভিন্ন দোকানে আপনার বাকির হিসাব রাখুন।">
        <div className="flex items-center gap-2">
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
                            <div className="flex items-center justify-between">
                                <Label htmlFor="shopName">দোকানের নাম</Label>
                                <div className="flex items-center">
                                    <Dialog open={isAddShopDialogOpen} onOpenChange={setIsAddShopDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>নতুন দোকান যোগ করুন</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-2">
                                                <Label htmlFor="new-shop-name">দোকানের নাম</Label>
                                                <Input
                                                    id="new-shop-name"
                                                    value={newShopName}
                                                    onChange={(e) => setNewShopName(e.target.value)}
                                                    placeholder="করিম স্টোর"
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={handleAddNewShop}>সংরক্ষণ করুন</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                    <Dialog open={isDeleteShopDialogOpen} onOpenChange={setIsDeleteShopDialogOpen}>
                                        <DialogTrigger asChild>
                                             <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>দোকানের তালিকা পরিচালনা করুন</DialogTitle>
                                                <DialogDescription>তালিকা থেকে দোকান মুছে ফেলুন।</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {shops.map(shop => (
                                                    <div key={shop} className="flex items-center justify-between p-2 border rounded-md">
                                                        <span>{shop}</span>
                                                        <Button variant="ghost" size="icon" onClick={() => removeShop(shop)}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                            <Select name="shopName" required disabled={shops.length === 0}>
                                <SelectTrigger>
                                    <SelectValue placeholder={shops.length > 0 ? "একটি দোকান নির্বাচন করুন" : "প্রথমে একটি দোকান যোগ করুন"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {shops.map(shop => <SelectItem key={shop} value={shop}>{shop}</SelectItem>)}
                                </SelectContent>
                            </Select>
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
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'প্রসেসিং...' : 'সংরক্ষণ করুন'}
                      </Button>
                    </DialogFooter>
                </form>
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

       <Accordion type="single" collapsible className="w-full space-y-3">
        {Object.entries(groupedDues).map(([shopName, dues]) => {
          const totalShopDue = dues.reduce((sum, due) => sum + due.amount, 0);
          const totalShopPaid = dues.reduce((sum, due) => sum + due.paidAmount, 0);
          const remainingShopDue = totalShopDue - totalShopPaid;

          return (
            <AccordionItem value={shopName} key={shopName} className="border-b-0">
                <Card className="overflow-hidden">
                    <AccordionTrigger className="p-4 hover:no-underline text-left">
                        <div className="flex justify-between items-center w-full">
                           <div>
                                <p className="font-semibold text-lg">{shopName}</p>
                                <p className="text-sm text-muted-foreground">মোট লেনদেন: {dues.length}</p>
                            </div>
                            <div>
                                {remainingShopDue > 0 ? (
                                    <p className="font-bold text-red-500">{formatCurrency(remainingShopDue)}</p>
                                ) : (
                                    <p className="font-semibold text-green-500">পরিশোধিত</p>
                                )}
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0 pb-0">
                        <div className="space-y-2 p-4 pt-0">
                        {dues.map(due => (
                            <Card key={due.id} className="bg-muted/30">
                                <CardContent className="p-3">
                                   <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-muted-foreground">{new Date(due.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            {due.description && <p className="text-xs text-muted-foreground/80">{due.description}</p>}
                                        </div>
                                        <span className="font-semibold text-base">{formatCurrency(due.amount)}</span>
                                   </div>
                                    {due.status === 'partially-paid' && (
                                        <div className="text-xs text-muted-foreground mt-2">
                                            পরিশোধিত: {formatCurrency(due.paidAmount)} | বাকি: {formatCurrency(due.amount - due.paidAmount)}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="bg-muted/50 p-2 flex items-center justify-between">
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
                        </div>
                    </AccordionContent>
                </Card>
            </AccordionItem>
          );
        })}
      </Accordion>

      {Object.keys(groupedDues).length === 0 && (
        <div className="text-center py-10 text-muted-foreground border rounded-lg">
            <p>এখনও কোনো বাকি যোগ করা হয়নি।</p>
        </div>
      )}
      
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

    