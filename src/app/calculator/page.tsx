
"use client";

import React, { useState, useMemo } from 'react';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Calculator, ArrowRight } from "lucide-react";

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
        <div className="flex-1 space-y-4 max-w-lg mx-auto">
            <PageHeader 
                title="হিসাব ক্যালকুলেটর" 
                description="নোটের সংখ্যা লিখে দ্রুত মোট টাকা গণনা করুন।" 
            />

            <Card className="shadow-lg border-primary/20 overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Calculator className="h-5 w-5 text-primary" />
                            ক্যাশ কাউন্টার
                        </CardTitle>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={resetCalculator} 
                            className="text-red-400 hover:text-red-300 hover:bg-white/10"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            পরিষ্কার
                        </Button>
                    </div>
                </CardHeader>
                
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        {denominations.map((den) => (
                            <div key={den} className="flex items-center p-3 gap-2 hover:bg-slate-50/50 transition-colors">
                                <div className="w-16 flex flex-col">
                                    <span className="text-sm font-black text-slate-700">{den}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase leading-none">টাকা</span>
                                </div>
                                
                                <div className="flex-shrink-0 text-slate-300 text-xs">×</div>
                                
                                <div className="flex-1 px-2">
                                    <Input
                                        type="number"
                                        inputMode="numeric"
                                        placeholder="০"
                                        value={counts[den]}
                                        onChange={(e) => handleCountChange(e.target.value, den)}
                                        className="h-9 text-center font-bold text-slate-900 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                
                                <div className="flex-shrink-0 text-slate-300 text-xs">
                                    <ArrowRight className="h-3 w-3" />
                                </div>
                                
                                <div className="w-24 text-right">
                                    <p className="font-bold text-sm text-slate-900">
                                        {formatCurrency(parseInt(counts[den] || "0", 10) * den).replace('৳', '')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>

                <CardFooter className="bg-slate-50 flex flex-col items-center justify-center p-4 border-t-2 border-primary/20">
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">সর্বমোট টাকা</p>
                        <p className="text-4xl font-black text-slate-900 drop-shadow-sm">
                            {formatCurrency(totals.grandTotal)}
                        </p>
                    </div>
                </CardFooter>
            </Card>

            <div className="bg-white/50 backdrop-blur-sm border rounded-lg p-3 text-center">
                <p className="text-[10px] text-muted-foreground italic">
                    * এই হিসাবটি শুধুমাত্র আপনার তাৎক্ষণিক গণনার জন্য। এটি আপনার মূল ব্যালেন্সের কোনো পরিবর্তন করবে না।
                </p>
            </div>
        </div>
    );
}
