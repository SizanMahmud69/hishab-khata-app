
"use client";

import { useMemo } from "react";
import { ShoppingBag, Banknote, PlusCircle, Settings } from "lucide-react"
import { useBudget } from "@/context/budget-context";
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/page-header"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils";
import Link from "next/link";
import ShopDueForm from "@/components/shop-due-form";

export default function ShopDuesPage() {
    const { debtNotes } = useBudget();

    const shopDues = useMemo(() => debtNotes.filter(d => d.type === 'shopDue'), [debtNotes]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
    }

    const groupedDues = useMemo(() => {
        const groups: { [key: string]: { totalDue: number; totalPaid: number; } } = {};
        shopDues.forEach(due => {
            if (!groups[due.person]) {
                groups[due.person] = { totalDue: 0, totalPaid: 0 };
            }
            groups[due.person].totalDue += due.amount;
            groups[due.person].totalPaid += due.paidAmount;
        });
        return Object.entries(groups).map(([shopName, totals]) => ({
            shopName,
            remainingDue: totals.totalDue - totals.totalPaid
        }));
    }, [shopDues]);
    
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
        {groupedDues.length > 0 ? (
          groupedDues.map(({ shopName, remainingDue }) => (
            <Link key={shopName} href={`/shop-dues/${encodeURIComponent(shopName)}`} passHref>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex justify-between items-center">
                        <p className="font-semibold text-lg">{shopName}</p>
                        <div className="text-right">
                           <p className={cn("font-bold text-lg", remainingDue > 0 ? 'text-red-500' : 'text-green-500')}>
                                {formatCurrency(remainingDue)}
                           </p>
                           <p className="text-xs text-muted-foreground">
                                {remainingDue > 0 ? 'বাকি' : 'পরিশোধিত'}
                           </p>
                        </div>
                    </CardContent>
                </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground border rounded-lg">
            <p>এখনও কোনো বাকি যোগ করা হয়নি।</p>
          </div>
        )}
      </div>
    </div>
  )
}
