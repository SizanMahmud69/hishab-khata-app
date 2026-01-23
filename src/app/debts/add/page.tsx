
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react"
import { useBudget, type DebtNote } from "@/context/budget-context";
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/page-header"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function AddDebtPage() {
    const { addDebtNote, addTransaction, totalIncome, totalExpense } = useBudget();
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        setIsSubmitting(true);
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
            setIsSubmitting(false);
            return;
        }

        if (type === 'lent' && amount > balance) {
            toast({
                variant: "destructive",
                title: "অপর্যাপ্ত ব্যালেন্স",
                description: `আপনি ${formatCurrency(amount)} ধার দিতে পারবেন না। আপনার বর্তমান ব্যালেন্স ${formatCurrency(balance)}।`,
            });
            setIsSubmitting(false);
            return;
        }

        try {
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

            router.push('/debts');
        } catch (error) {
            console.error("Error adding new debt:", error);
            toast({ variant: "destructive", title: "ত্রুটি", description: "একটি সমস্যা হয়েছে।" });
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="নতুন ধারের হিসাব" description="সম্পর্কিত ব্যক্তির নাম এবং অর্থের পরিমাণ লিখুন।" />
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleAddNewDebt}>
            <CardHeader>
                <CardTitle>নতুন ধারের তথ্য</CardTitle>
                <CardDescription>অনুগ্রহ করে নিচের ফর্মটি পূরণ করুন।</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 py-4 px-4 max-h-[70vh] overflow-y-auto">
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
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'সংরক্ষণ করা হচ্ছে...' : 'সংরক্ষণ করুন'}
              </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  )
}
