"use client";

import React, { useState } from 'react';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { useBudget } from "@/context/budget-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function PointIncomePage() {
    const { toast } = useToast();
    const { awardPointsForTask, remainingSpins, isTaskLoading } = useBudget();
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinResult, setSpinResult] = useState<number | null>(null);

    const handleSpin = async () => {
        if (remainingSpins <= 0 || isTaskLoading || isSpinning) return;

        setIsSpinning(true);
        setSpinResult(null);
        const result = await awardPointsForTask('spin');
        
        if (result.success) {
            setSpinResult(result.points);
            setTimeout(() => {
                toast({
                    title: "অভিনন্দন!",
                    description: `স্পিন করে আপনি ${result.points} পয়েন্ট জিতেছেন!`,
                });
                setIsSpinning(false);
            }, 2000);
        } else {
            toast({
                variant: "destructive",
                title: "ব্যর্থ",
                description: result.message,
            });
            setIsSpinning(false);
        }
    };

    return (
        <div className="flex-1 space-y-6 animate-slide-in-right">
            <PageHeader title="পয়েন্ট ইনকাম" description="প্রতিদিন স্পিন করে পয়েন্ট অর্জন করুন।" />

            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>চাকা ঘোরান</CardTitle>
                        <CardDescription>আপনার ভাগ্য পরীক্ষা করুন এবং আকর্ষণীয় পয়েন্ট জিতে নিন।</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center p-8">
                        <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                             <RefreshCw className={cn("w-24 h-24 text-primary", isSpinning && "animate-spin-slow")} />
                             {spinResult !== null && !isSpinning && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-green-600 animate-ping-once">+{spinResult}</span>
                                </div>
                             )}
                        </div>
                         <p className="text-muted-foreground mb-4">
                            আজকের জন্য স্পিন বাকি: {remainingSpins}
                        </p>
                        <Button
                            size="lg"
                            className="w-full"
                            onClick={handleSpin}
                            disabled={remainingSpins <= 0 || isTaskLoading || isSpinning}
                        >
                            {isTaskLoading || isSpinning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            {isSpinning ? 'ঘোরানো হচ্ছে...' : (remainingSpins > 0 ? 'স্পিন করুন' : 'আজকের জন্য সম্পন্ন')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
             <style jsx>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(1080deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 2s cubic-bezier(0.25, 1, 0.5, 1);
                }
                 @keyframes ping-once {
                  0% {
                    transform: scale(1);
                    opacity: 1;
                  }
                  75%, 100% {
                    transform: scale(2);
                    opacity: 0;
                  }
                }
                .animate-ping-once {
                  animation: ping-once 1s cubic-bezier(0, 0, 0.2, 1);
                }
            `}</style>
        </div>
    );
}
