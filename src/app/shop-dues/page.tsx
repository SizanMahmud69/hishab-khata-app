

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Banknote, PlusCircle, Eye } from "lucide-react"
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
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ShopDueSummary {
    shopName: string;
    totalAmount: number;
    totalPaid: number;
    remainingDue: number;
    entryCount: number;
}

export default function ShopDuesPage() {
    const { debtNotes } = useBudget();
    
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

        return Object.entries(duesByShop).map(([shopName, cycles]) => {
            const totalAmount = cycles.reduce((sum, cycle) => sum + cycle.amount, 0);
            const totalPaid = cycles.reduce((sum, cycle) => sum + cycle.paidAmount, 0);
            const totalEntries = cycles.reduce((sum, cycle) => sum + (cycle.entries?.length || 0), 0)
            return {
                shopName,
                totalAmount,
                totalPaid,
                remainingDue: totalAmount - totalPaid,
                entryCount: totalEntries,
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

    const totalRemainingDue = shopDuesSummary.reduce((sum, due) => sum + due.remainingDue, 0);
    const totalPaidAmount = shopDuesSummary.reduce((sum, due) => sum + due.totalPaid, 0);

    const getStatusBadge = (remaining: number, paid: number) => {
        if (remaining <= 0) {
             return <Badge className="bg-green-700 hover:bg-green-700/80">পরিশোধিত</Badge>;
        }
        if (paid > 0) {
             return <Badge variant="outline" className="border-yellow-500 text-yellow-600">আংশিক</Badge>;
        }
        return <Badge variant="destructive">অপরিশোধিত</Badge>;
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
                         <Button asChild variant="outline">
                            <Link href={`/shop-dues/${encodeURIComponent(due.shopName)}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                বিস্তারিত দেখুন
                            </Link>
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
    </div>
  )
}
