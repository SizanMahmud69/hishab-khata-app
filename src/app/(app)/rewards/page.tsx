"use client";

import PageHeader from "@/components/page-header"
import { Gift, Star } from "lucide-react"
import { useBudget } from "@/context/budget-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RewardsPage() {
    const { rewardPoints } = useBudget();

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="রিওয়ার্ড" description="আপনার অর্জিত রিওয়ার্ড এবং পয়েন্ট দেখুন।" />
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Star className="text-yellow-500" />
                আপনার পয়েন্ট
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-4xl font-bold text-center p-8">{rewardPoints}</div>
            <p className="text-center text-muted-foreground">নিয়মিত অ্যাপ ব্যবহার করে আরও পয়েন্ট অর্জন করুন।</p>
        </CardContent>
      </Card>
      <div className="flex flex-col items-center justify-center h-60 border rounded-lg bg-card text-card-foreground shadow-sm mt-6">
        <Gift className="w-16 h-16 text-primary mb-4" />
        <p className="text-muted-foreground">পয়েন্ট দিয়ে আকর্ষণীয় অফার রিডিম করুন।</p>
        <p className="text-sm text-muted-foreground">শীঘ্রই আসছে!</p>
      </div>
    </div>
  )
}
