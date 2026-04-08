
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Calculator, ArrowRight } from "lucide-react";

const denominations = [1000, 500, 200, 100, 50, 20, 10, 5, 2];

export default function CalculatorPage() {
    const [counts, setCounts] = useState<{ [key: number]: string }>(
        denominations.reduce((acc, curr) => ({ ...acc, [curr]: "" }), {})
    );

    const handleCountChange = (val: string, den: number) => {
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
        <div className="flex flex-col h-full max-w-md mx-auto space-y-2 pb-4">
            <div className="flex items-center justify-between px-1">
                <h1 className="text-xl font-bold text-white drop-shadow-sm">হিসাব ক্যালকুলেটর</h1>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetCalculator} 
                    className="h-8 text-white hover:bg-white/20 px-2"
                >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span className="text-xs">পরিষ্কার</span>
                </Button>
            </div>

            <Card className="shadow-2xl border-none overflow-hidden bg-white/95 backdrop-blur-sm flex-1 flex flex-col">
                <CardHeader className="bg-slate-900 text-white py-2 px-4 shrink-0">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Calculator className="h-4 w-4 text-primary" />
                        ক্যাশ কাউন্টার
                    </CardTitle>
                </CardHeader>
                
                <CardContent className="p-0 flex-1 overflow-y-auto">
                    <div className="divide-y divide-slate-100">
                        {denominations.map((den) => (
                            <div key={den} className="flex items-center px-3 py-1 gap-2 hover:bg-slate-50 transition-colors">
                                <div className="w-12 shrink-0">
                                    <span className="text-sm font-black text-slate-800">{den}</span>
                                    <span className="text-[8px] text-muted-foreground block leading-none">টাকা</span>
                                </div>
                                
                                <div className="text-slate-400 text-[10px]">×</div>
                                
                                <div className="flex-1">
                                    <Input
                                        type="number"
                                        inputMode="numeric"
                                        placeholder="০"
                                        value={counts[den]}
                                        onChange={(e) => handleCountChange(e.target.value, den)}
                                        className="h-7 text-center font-bold text-slate-900 border-slate-200 focus:border-primary px-1 text-sm"
                                    />
                                </div>
                                
                                <div className="text-slate-300">
                                    <ArrowRight className="h-3 w-3" />
                                </div>
                                
                                <div className="w-20 text-right">
                                    <p className="font-bold text-xs text-slate-900">
                                        {formatCurrency(parseInt(counts[den] || "0", 10) * den).replace('৳', '')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>

                <CardFooter className="bg-slate-100 flex flex-col items-center justify-center py-2 px-4 border-t-2 border-primary/20 shrink-0">
                    <div className="text-center w-full">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">সর্বমোট টাকা</p>
                        <div className="bg-white px-4 py-1 rounded-full border border-primary/30 inline-block shadow-sm">
                            <p className="text-2xl font-black text-slate-900">
                                {formatCurrency(totals.grandTotal)}
                            </p>
                        </div>
                    </div>
                </CardFooter>
            </Card>

            <div className="bg-black/10 backdrop-blur-sm rounded p-1 text-center shrink-0">
                <p className="text-[9px] text-white/80 italic leading-none">
                    * এটি শুধুমাত্র তাৎক্ষণিক গণনার জন্য। এটি মূল ব্যালেন্স পরিবর্তন করবে না।
                </p>
            </div>
        </div>
    );
}
