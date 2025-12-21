"use client";

import PageHeader from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useBudget } from "@/context/budget-context";

export default function ShopDuesPage() {
    const { isLoading } = useBudget();
    
    if (isLoading) {
        return (
            <div className="flex-1 space-y-4">
                <div className="grid gap-1 mb-6">
                    <Skeleton className="h-9 w-36" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <div className="flex items-center justify-center h-96">
                    <Skeleton className="h-8 w-96" />
                </div>
            </div>
        );
    }
  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="দোকান বাকি" description="আপনার দোকানের বাকির হিসাব রাখুন।" />
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">এখানে আপনার দোকানের বাকির হিসাব দেখানো হবে।</p>
      </div>
    </div>
  )
}
