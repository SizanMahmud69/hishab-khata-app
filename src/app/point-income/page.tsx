
"use client";

import React, { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Film, RefreshCw, Loader2 } from "lucide-react";
import { useBudget } from "@/context/budget-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function PointIncomePage() {
    const { toast } = useToast();
    const { awardPointsForTask, canWatchAd, remainingSpins, isTaskLoading, adConfig } = useBudget();
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinResult, setSpinResult] = useState<number | null>(null);
    const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);
    const [adForSpinShown, setAdForSpinShown] = useState(false);

    useEffect(() => {
        if (remainingSpins === 2) {
            setAdForSpinShown(false);
        }
    }, [remainingSpins]);

    const handleWatchAd = async () => {
        setIsAdDialogOpen(true);
        // Simulate watching the ad for a few seconds
        setTimeout(async () => {
            const result = await awardPointsForTask('ad');
            if (result.success) {
                toast({
                    title: "অভিনন্দন!",
                    description: `বিজ্ঞাপন দেখার জন্য আপনি ${result.points} পয়েন্ট পেয়েছেন।`,
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "ব্যর্থ",
                    description: result.message,
                });
            }
            setIsAdDialogOpen(false);
        }, 8000); // 8 seconds ad watch time
    };

    const handleSpin = async () => {
        if (remainingSpins <= 0 || isTaskLoading || isSpinning) return;

        // For the first spin, show an ad and return.
        if (remainingSpins === 2 && !adForSpinShown) {
            const spinAdUrl = adConfig?.spinDirectLink || 'https://www.effectivegatecpm.com/esdyih69?key=7f8888474725ab0962c50482d2412b06';
            window.open(spinAdUrl, '_blank');
            setAdForSpinShown(true);
            toast({
                title: "বিজ্ঞাপন দেখানো হয়েছে",
                description: "স্পিন সম্পন্ন করতে আবার বাটনে ক্লিক করুন।",
            });
            return; // Wait for the user to click again.
        }


        setIsSpinning(true);
        setSpinResult(null);
        const result = await awardPointsForTask('spin');
        
        if (result.success) {
            setSpinResult(result.points);
            // Wait for animation to finish before showing toast
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
        <div className="flex-1 space-y-6">
            <PageHeader title="পয়েন্ট ইনকাম" description="বিজ্ঞাপন দেখে এবং স্পিন করে প্রতিদিন পয়েন্ট অর্জন করুন।" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Watch Ad Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>বিজ্ঞাপন দেখুন</CardTitle>
                        <CardDescription>প্রতিদিন একটি বিজ্ঞাপন দেখে নিশ্চিত পয়েন্ট অর্জন করুন।</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center p-8">
                        <Film className="w-16 h-16 text-primary mb-4" />
                        <p className="text-muted-foreground mb-4">আজকের বিজ্ঞাপন দেখা সম্পন্ন হলে বাটনটি নিষ্ক্রিয় হয়ে যাবে।</p>
                        <Dialog open={isAdDialogOpen} onOpenChange={setIsAdDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    size="lg"
                                    onClick={handleWatchAd}
                                    disabled={!canWatchAd || isTaskLoading || isAdDialogOpen}
                                >
                                    {(isTaskLoading && isAdDialogOpen) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Film className="mr-2 h-4 w-4" />}
                                    {isAdDialogOpen ? 'বিজ্ঞাপন লোড হচ্ছে...' : (canWatchAd ? 'বিজ্ঞাপন দেখুন' : 'আজকের জন্য সম্পন্ন')}
                                </Button>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>বিজ্ঞাপন দেখুন</DialogTitle>
                                    <DialogDescription>
                                       পয়েন্ট পেতে কিছুক্ষণ অপেক্ষা করুন। বিজ্ঞাপনটি দেখা শেষ হলে আপনার পয়েন্ট স্বয়ংক্রিয়ভাবে যোগ হয়ে যাবে।
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex items-center justify-center rounded-md overflow-hidden aspect-square mx-auto w-full max-w-[300px]">
                                    <iframe
                                        src={adConfig?.rewardedIframeUrl || "https://www.effectivegatecpm.com/asn6e88m1?key=f54f7591b556a8df09aa30fadc35caac"}
                                        width="300"
                                        height="250"
                                        scrolling="no"
                                        frameBorder="0"
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>

                {/* Spin Wheel Card */}
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
                            {adForSpinShown && remainingSpins === 2 && <span className='block text-xs'>(বিজ্ঞাপন দেখেছেন, এখন স্পিন করুন)</span>}
                        </p>
                        <Button
                            size="lg"
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
