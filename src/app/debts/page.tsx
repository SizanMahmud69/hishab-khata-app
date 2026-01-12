
"use client";

import Link from "next/link";
import { PlusCircle, TrendingDown, TrendingUp, Eye } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { InterstitialAd } from "@/components/ad-banner";

export default function DebtsPage() {
    const { debtNotes } = useBudget();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
    }

    const getStatusBadge = (status: 'unpaid' | 'paid' | 'partially-paid') => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-700 hover:bg-green-700/80">পরিশোধিত</Badge>;
            case 'partially-paid':
                return <Badge variant="outline" className="border-yellow-500 text-yellow-600">আংশিক</Badge>;
            case 'unpaid':
            default:
                return <Badge variant="destructive">অপরিশোধিত</Badge>;
        }
    }

    const lentDebts = debtNotes.filter(d => d.type === 'lent');
    const borrowedDebts = debtNotes.filter(d => d.type === 'borrowed');

    const totalLent = lentDebts.reduce((sum, debt) => sum + (debt.amount - debt.paidAmount), 0);
    const totalBorrowed = borrowedDebts.reduce((sum, debt) => sum + (debt.amount - debt.paidAmount), 0);

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="ধারের হিসাব" description="আপনার সকল দেনা-পাওনার হিসাব রাখুন।">
        <Button asChild>
            <Link href="/debts/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                নতুন ধার যোগ করুন
            </Link>
        </Button>
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
                <div className="text-2xl font-bold text-green-700">{formatCurrency(totalBorrowed)}</div>
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
                                asChild
                                disabled={debt.status === 'paid'}
                                variant={debt.status === 'paid' ? 'ghost' : 'outline'}
                            >
                                {debt.id ? (
                                    <Link href={`/debts/pay/${debt.id}`}>
                                        {debt.status === 'paid' ? 'সম্পূর্ণ পরিশোধিত' : 'পরিশোধ করুন'}
                                    </Link>
                                ) : (
                                    <span>{debt.status === 'paid' ? 'সম্পূর্ণ পরিশোধিত' : 'পরিশোধ করুন'}</span>
                                )}
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
                                    debt.status !== 'paid' ? 'text-green-700' : 'text-foreground'
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
                                asChild
                                disabled={debt.status === 'paid'}
                                variant={debt.status === 'paid' ? 'ghost' : 'outline'}
                            >
                                {debt.id ? (
                                    <Link href={`/debts/pay/${debt.id}`}>
                                        {debt.status === 'paid' ? 'সম্পূর্ণ পরিশোধিত' : 'পরিশোধ করুন'}
                                    </Link>
                                ) : (
                                    <span>{debt.status === 'paid' ? 'সম্পূর্ণ পরিশোধিত' : 'পরিশোধ করুন'}</span>
                                )}
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
      <InterstitialAd />
    </div>
  )
}
