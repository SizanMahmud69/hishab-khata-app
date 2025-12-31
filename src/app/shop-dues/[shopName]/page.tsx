

"use client";

import { useMemo } from "react";
import { useParams, notFound } from 'next/navigation';
import { useBudget, type DebtNote } from "@/context/budget-context";
import PageHeader from "@/components/page-header"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopDetailsPage() {
    const { shopName: encodedShopName } = useParams();
    const { debtNotes, isLoading } = useBudget();
    
    const shopName = useMemo(() => {
        if (!encodedShopName) return "";
        try {
            return decodeURIComponent(encodedShopName as string);
        } catch (e) {
            console.error("Failed to decode shop name:", e);
            return "";
        }
    }, [encodedShopName]);

    const shopEntries = useMemo(() => {
        return debtNotes
            .filter(d => d.type === 'shopDue' && d.person === shopName)
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [debtNotes, shopName]);

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
                return <Badge className="bg-green-500 hover:bg-green-500/80">পরিশোধিত</Badge>;
            case 'partially-paid':
                return <Badge variant="outline" className="border-yellow-500 text-yellow-600">আংশিক</Badge>;
            case 'unpaid':
            default:
                return <Badge variant="destructive">অপরিশোধিত</Badge>;
        }
    }
    
    if (isLoading) {
        return (
             <div className="flex-1 space-y-4">
                <PageHeader title="দোকানের বিস্তারিত" description="লোড হচ্ছে..." />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                       <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!isLoading && !shopName) {
        notFound();
    }
    
    return (
        <div className="flex-1 space-y-4">
            <PageHeader 
                title={shopName} 
                description="এই দোকানের সমস্ত বাকির তালিকা।" 
            />
            <Card>
                <CardHeader>
                    <CardTitle>লেনদেনের তালিকা</CardTitle>
                    <CardDescription>এখানে আপনার প্রতিটি বাকির হিসাব বিস্তারিতভাবে দেখানো হয়েছে।</CardDescription>
                </CardHeader>
                <CardContent>
                     {shopEntries.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>তারিখ</TableHead>
                                    <TableHead>বিবরণ</TableHead>
                                    <TableHead>পরিমাণ</TableHead>
                                    <TableHead>পরিশোধিত</TableHead>
                                    <TableHead className="text-right">স্ট্যাটাস</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {shopEntries.map(entry => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="whitespace-nowrap">{format(new Date(entry.date), "d MMM, yyyy", { locale: bn })}</TableCell>
                                        <TableCell className="text-muted-foreground whitespace-nowrap">{entry.description || "-"}</TableCell>
                                        <TableCell className="font-medium whitespace-nowrap">{formatCurrency(entry.amount)}</TableCell>
                                        <TableCell className="text-green-600 whitespace-nowrap">{formatCurrency(entry.paidAmount)}</TableCell>
                                        <TableCell className="text-right">{getStatusBadge(entry.status)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>এই দোকানে কোনো বাকির হিসাব পাওয়া যায়নি।</p>
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
    )
}
