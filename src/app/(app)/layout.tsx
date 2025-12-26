

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
                <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-gradient-to-r from-blue-400 to-green-400 text-white px-4">
                    <div className="flex items-center gap-2">
                         <Skeleton className="h-8 w-8" />
                         <Skeleton className="h-6 w-32" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-500 to-green-500">
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

    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader>{children}</AppHeader>
             <footer className="py-4 mt-auto w-full shrink-0 items-center px-4 md:px-6 border-t border-white/20 bg-gradient-to-r from-blue-400 to-green-400 text-white">
                <div className="container mx-auto flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:justify-between">
                    <p className='text-xs text-blue-100'>
                        © 2025 <span className='font-bold'>হিসাব খাতা</span>. All rights reserved.
                    </p>
                    <div className='text-xs text-blue-100'>
                        Developer: <span className="font-semibold">Sizan Mahmud</span> & Designer: <span className="font-semibold">Black Dimond</span>
                    </div>
                </div>
            </footer>
        </div>
    )
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
