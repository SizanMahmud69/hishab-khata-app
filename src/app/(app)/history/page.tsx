"use client";

import PageHeader from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useBudget } from "@/context/budget-context";

export default function HistoryPage() {
  const { isLoading } = useBudget();

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4">
        <div className="grid gap-1 mb-6">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-72" />
        </div>
        <div className="flex items-center justify-center h-96">
            <Skeleton className="h-8 w-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="হিস্টোরি" description="আপনার সকল লেনদেনের ইতিহাস দেখুন।" />
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">এখানে আপনার সকল লেনদেনের রেকর্ড দেখানো হবে।</p>
      </div>
    </div>
  )
}
