"use client";

import React, { useState, useMemo } from 'react';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Calculator } from "lucide-react";

const denominations = [1000, 500, 200, 100, 50, 20, 10, 5, 2];

export default function CalculatorPage() {
    const [counts, setCounts] = useState<{ [key: number]: string }>(
        denominations.reduce((acc, curr) => ({ ...acc, [curr]: "" }), {})
    );

    const handleCountChange = (val: string, den: number) => {
        // Only allow numbers
        if (val !== "" && !/^\d+$/.test(val)) return;
        setCounts(prev => ({ ...prev, [den]: val }));
    };

    const totals = useMemo(() => {
        const subTotals = denominations.map(den => {
            const count = parseInt(counts[den] || "0", 10);
            return { den, total: den * count };
        });
        const grandTotal = subTotals.reduce((sum, item) => sum + item.total, 0);
        return { subTotals, grandTotal };
    }, [counts]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
            style: "currency",
            currency: "BDT",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const resetCalculator = () => {
        setCounts(denominations.reduce((acc, curr) => ({ ...acc, [curr]: "" }), {}));
    };

    return (
        <div className="flex-1 space-y-6">
            <PageHeader 
                title="হিসাব ক্যালকুলেটর" 
                description="নোটের সংখ্যা লিখে আপনার ক্যাশ দ্রুত গণনা করুন।" 
            />

            <Card className="max-w-2xl mx-auto shadow-lg border-primary/20">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="text-primary h-5 w-5" />
                        ক্যাশ কাউন্টার
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    {denominations.map((den) => (
                        <div key={den} className="flex items-center gap-4 border-b pb-3 last:border-0 last:pb-0">
                            <div className="w-24 text-right">
                                <Label className="text-lg font-bold">
                                    {den} <span className='text-xs font-normal text-muted-foreground'>টাকা</span>
                                </Label>
                            </div>
                            <div className="flex-shrink-0 text-muted-foreground">×</div>
                            <div className="flex-1">
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="০"
                                    value={counts[den]}
                                    onChange={(e) => handleCountChange(e.target.value, den)}
                                    className="text-center font-bold text-lg h-12 border-primary/30 focus:border-primary"
                                />
                            </div>
                            <div className="flex-shrink-0 text-muted-foreground">=</div>
                            <div className="w-32 text-right">
                                <p className="font-bold text-lg text-primary">
                                    {formatCurrency(parseInt(counts[den] || "0", 10) * den)}
                                </p>
                            </div>
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="bg-muted/30 border-t flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
                    <Button variant="outline" onClick={resetCalculator} className="w-full sm:w-auto text-red-500 border-red-200 hover:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" />
                        সব পরিষ্কার করুন
                    </Button>
                    <div className="text-center sm:text-right w-full sm:w-auto">
                        <p className="text-sm text-muted-foreground">সর্বমোট টাকা</p>
                        <p className="text-3xl font-black text-primary drop-shadow-sm">
                            {formatCurrency(totals.grandTotal)}
                        </p>
                    </div>
                </CardFooter>
            </Card>

            <Card className="max-w-2xl mx-auto bg-blue-50/50 border-blue-100 border-dashed">
                <CardContent className="p-4 text-center">
                    <p className="text-xs text-blue-600 font-medium italic">
                        * এই ক্যালকুলেটরটি শুধুমাত্র আপনার ব্যক্তিগত ব্যবহারের জন্য। এটি আপনার মূল ব্যালেন্স বা ট্রানজিশনে কোনো পরিবর্তন করবে না।
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
