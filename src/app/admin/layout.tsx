"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';
import { BookMarked, Home, ShieldCheck, Banknote, Users2, PanelLeft, Package, Crown, Megaphone, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase'; // The only hook we need for auth check

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useUser();
    const router = useRouter();

    // Directly check for admin status here.
    const isAdmin = user?.email === 'hisabkhata.maintanance@gmail.com';

    useEffect(() => {
        // If loading is finished and there's no user, or the user is not an admin, redirect.
        if (!isLoading) {
            if (!user || !isAdmin) {
                router.replace('/dashboard');
            }
        }
    }, [user, isAdmin, isLoading, router]);

    // Show a loader while we verify the user's status.
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-muted/40">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    // Only render the admin layout if the user is an admin.
    if (isAdmin) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <AdminSidebar />
                <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                        {/* Mobile Menu */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button size="icon" variant="outline" className="sm:hidden">
                                    <PanelLeft className="h-5 w-5" />
                                    <span className="sr-only">Toggle Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="sm:max-w-xs">
                                 <SheetHeader>
                                    <SheetTitle className="sr-only">Admin Menu</SheetTitle>
                                 </SheetHeader>
                                <nav className="grid gap-6 text-lg font-medium">
                                    <Link
                                        href="/admin"
                                        className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                                    >
                                        <BookMarked className="h-5 w-5 transition-all group-hover:scale-110" />
                                        <span className="sr-only">Hishab Khata Admin</span>
                                    </Link>
                                    <Link href="/admin/dashboard" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"><Home className="h-5 w-5" />Dashboard</Link>
                                    <Link href="/admin/verifications" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"><ShieldCheck className="h-5 w-5" />Verifications</Link>
                                    <Link href="/admin/withdrawals" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"><Banknote className="h-5 w-5" />Withdrawals</Link>
                                    <Link href="/admin/users" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"><Users2 className="h-5 w-5" />Users</Link>
                                    <Link href="/admin/subscriptions" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"><Crown className="h-5 w-5" />Subscriptions</Link>
                                    <Link href="/admin/ads" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"><Megaphone className="h-5 w-5" />Ads</Link>
                                    <Link href="/admin/config" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"><SlidersHorizontal className="h-5 w-5" />App Config</Link>
                                    <Link href="/dashboard" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"><Package className="h-5 w-5" />Back to App</Link>
                                </nav>
                            </SheetContent>
                        </Sheet>
                        
                        <h1 className="text-xl font-semibold">Admin Panel</h1>
                    </header>
                    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    // This part should ideally not be reached if the redirect works correctly, but it's a good fallback.
    return null;
}
