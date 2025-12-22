"use client";

import type { ReactNode } from "react"
import { AppHeader } from "@/components/app-header"
import { BudgetClientProvider, useBudget } from "@/context/budget-context-provider"
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/firebase";


function AppContent({ children }: { children: ReactNode }) {
    const { user, isUserLoading: isAuthLoading } = useUser();
    const { isLoading: isDataLoading } = useBudget();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/login');
        }
    }, [user, isAuthLoading, router]);

    const isLoading = isAuthLoading || !user || isDataLoading;

    if (isLoading) {
        return (
             <div className="flex flex-col h-screen">
                <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
                    <div className="flex items-center gap-2">
                         <Skeleton className="h-8 w-8" />
                         <Skeleton className="h-6 w-32" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
                    <div className="flex-1 space-y-4">
                        <div className="grid gap-4 grid-cols-2">
                            <Skeleton className="h-28" />
                            <Skeleton className="h-28" />
                        </div>
                        <Skeleton className="h-36" />
                        <Skeleton className="h-72" />
                    </div>
                </main>
            </div>
        );
    }

    return <AppHeader>{children}</AppHeader>
}


export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <BudgetClientProvider>
        <AppContent>
            {children}
        </AppContent>
    </BudgetClientProvider>
  )
}
