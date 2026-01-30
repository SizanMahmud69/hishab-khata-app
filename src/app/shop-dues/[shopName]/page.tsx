

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, notFound } from 'next/navigation';
import { useBudget, type DebtNote } from "@/context/budget-context";
import PageHeader from "@/components/page-header"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card"
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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

    const shopCycles = useMemo(() => {
        return debtNotes
            .filter(d => d.type === 'shopDue' && d.person === shopName)
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [debtNotes, shopName]);

    const processedShopCycles = useMemo(() => {
        return shopCycles.map(cycle => {
            let remainingPaid = cycle.paidAmount;
            const sortedEntries = [...(cycle.entries || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            const entriesWithStatus = sortedEntries.map(entry => {
                const paidForThisEntry = Math.min(remainingPaid, entry.amount);
                remainingPaid -= paidForThisEntry;
                
                let status: 'paid' | 'partial' | 'unpaid' = 'unpaid';
                if (paidForThisEntry >= entry.amount) {
                    status = 'paid';
                } else if (paidForThisEntry > 0) {
                    status = 'partial';
                }

                return {
                    ...entry,
                    status: status,
                };
            });

            // Re-sort to display newest first
            return {
                ...cycle,
                processedEntries: entriesWithStatus.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            };
        });
    }, [shopCycles]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
    }

    const formatCycle = (cycleId?: string) => {
        if (!cycleId) return "মাসিক বিল";
        try {
            return format(new Date(cycleId + "-06"), "MMMM yyyy", { locale: bn });
        } catch {
            return "মাসিক বিল";
        }
    };

    const getStatusBadge = (status: 'unpaid' | 'paid' | 'partially-paid') => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-600 hover:bg-green-600/80">পরিশোধিত</Badge>;
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
                 <div className="space-y-4">
                    <Skeleton className="h-60 w-full" />
                    <Skeleton className="h-60 w-full" />
                 </div>
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
                description="এই দোকানের সমস্ত মাসিক বাকির তালিকা।" 
            />
            <div className="space-y-4">
                {processedShopCycles.length > 0 ? (
                    processedShopCycles.map(cycle => (
                         <Card key={cycle.id}>
                            <CardHeader>
                                <CardTitle>{formatCycle(cycle.cycleId)}</CardTitle>
                                <CardDescription>
                                    বাকি আছে: <span className="font-bold text-primary">{formatCurrency(cycle.amount - cycle.paidAmount)}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {cycle.processedEntries && cycle.processedEntries.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>তারিখ</TableHead>
                                                <TableHead>বিবরণ</TableHead>
                                                <TableHead className="text-right">পরিমাণ</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {cycle.processedEntries.map((entry, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="whitespace-nowrap">{format(new Date(entry.date), "d MMM, yy", { locale: bn })}</TableCell>
                                                    <TableCell className="text-muted-foreground">{entry.description || "-"}</TableCell>
                                                    <TableCell className="font-medium text-right space-x-2">
                                                        <span>{formatCurrency(entry.amount)}</span>
                                                        {entry.status === 'paid' && <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700">পরিশোধিত</Badge>}
                                                        {entry.status === 'partial' && <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700">আংশিক</Badge>}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">এই মাসে কোনো লেনদেন নেই।</p>
                                )}
                            </CardContent>
                             <CardFooter className="bg-muted/50 p-3 flex justify-between items-center">
                                {getStatusBadge(cycle.status)}
                                <Button asChild size="sm" disabled={cycle.status === 'paid'}>
                                    <Link href={`/debts/pay/${cycle.id}`}>
                                        {cycle.status === 'paid' ? 'সম্পূর্ণ পরিশোধিত' : 'পরিশোধ করুন'}
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="text-center py-10 text-muted-foreground">
                            <p>এই দোকানে কোনো বাকির হিসাব পাওয়া যায়নি।</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
