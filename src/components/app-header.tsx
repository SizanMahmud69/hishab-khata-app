"use client"
import Link from "next/link"
import { type ReactNode, useState, useEffect, useMemo } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Bell, BookMarked, Menu, CalendarCheck, CalendarPlus } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { isToday, isBefore, startOfToday, parseISO } from "date-fns"
import { useBudget } from "@/context/budget-context"
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase"
import { collection, query, where, addDoc, serverTimestamp, doc, updateDoc, writeBatch, orderBy, getDocs, setDoc } from 'firebase/firestore'

interface Notification {
    id: string;
    title: string;
    description: string;
    read: boolean;
    link?: string;
    createdAt: string; // ISO String from serverTimestamp
}

interface UserProfile {
    lastCheckIn?: string; // YYYY-MM-DD
}

export const createNotification = async (notification: Omit<Notification, 'createdAt' | 'read'>, userId: string, firestore: any) => {
    if (!userId || !firestore) return;

    try {
        const notificationsRef = collection(firestore, `users/${userId}/notifications`);

        // If an ID is provided, check if a notification with that ID already exists.
        if (notification.id) {
            const docRef = doc(firestore, `users/${userId}/notifications`, notification.id);
            const docSnap = await getDocs(query(collection(firestore, `users/${userId}/notifications`), where('id', '==', notification.id)));
            if (!docSnap.empty) {
                return; // Notification with this ID already exists, so we don't create it.
            }
        }
        
        // Generic check for duplicates in the last 24 hours to avoid spamming for notifications without a specific ID
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const q = query(notificationsRef, 
            where("title", "==", notification.title), 
            where("description", "==", notification.description),
            where("createdAt", ">=", twentyFourHoursAgo)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            if (notification.id) {
                // Use the provided ID to set the document
                const docRef = doc(firestore, `users/${userId}/notifications`, notification.id);
                await setDoc(docRef, {
                    ...notification,
                    createdAt: new Date().toISOString(),
                    read: false,
                });
            } else {
                // Let firestore generate an ID
                await addDoc(notificationsRef, {
                    ...notification,
                    createdAt: new Date().toISOString(),
                    read: false,
                });
            }
        }
    } catch(e) {
        console.error("Error creating notification:", e)
    }
};


export function AppHeader({children}: {children: ReactNode}) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const router = useRouter();
    const { debtNotes } = useBudget();
    const { user } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}`);
    }, [user, firestore]);

    const { data: userProfile } = useDoc<UserProfile>(userDocRef);

    const notificationsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/notifications`), orderBy("createdAt", "desc"));
    }, [user, firestore]);

    const { data: notifications } = useCollection<Notification>(notificationsQuery);
    
    const isCheckedIn = useMemo(() => {
        if (!userProfile?.lastCheckIn) return false;
        try {
            const lastDate = parseISO(userProfile.lastCheckIn);
            return isToday(lastDate);
        } catch {
            return false;
        }
    }, [userProfile]);


    useEffect(() => {
        if (!user || !firestore) return;

        const checkDailyNotifications = () => {
            const lastNotificationDate = localStorage.getItem('dailyNotificationCheckDate');
            const todayStr = new Date().toDateString();

            if (lastNotificationDate !== todayStr) {
                // Daily Check-in Notification if not already checked in
                if (!isCheckedIn) {
                    createNotification({
                        id: `check-in-${todayStr}`,
                        title: "দৈনিক চেক-ইন",
                        description: "আজকের চেক-ইন করে রিওয়ার্ড পয়েন্ট অর্জন করুন।",
                        link: "/check-in",
                    }, user.uid, firestore);
                }

                // Debt Repayment Reminders
                const today = startOfToday();
                debtNotes.forEach(debt => {
                    if (debt.repaymentDate && debt.status !== 'paid') {
                        const repaymentDate = parseISO(debt.repaymentDate);
                        if (isBefore(repaymentDate, today) || isToday(repaymentDate)) {
                             createNotification({
                                id: `debt-reminder-${debt.id}`,
                                title: "ধার পরিশোধের রিমাইন্ডার",
                                description: `${debt.person}-এর সাথে আপনার একটি ধার লেনদেন রয়েছে যা পরিশোধের সময় হয়েছে।`,
                                link: "/debts",
                            }, user.uid, firestore);
                        }
                    }
                });
                
                localStorage.setItem('dailyNotificationCheckDate', todayStr);
            }
        };

        checkDailyNotifications();

    }, [debtNotes, user, firestore, isCheckedIn]);


    const notificationCount = useMemo(() => {
        if (!notifications) return 0;
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    const handleLinkClick = () => {
        setIsSheetOpen(false);
    }
    
    const markAsRead = async (id: string) => {
        if (!user || !firestore) return;
        const notificationRef = doc(firestore, `users/${user.uid}/notifications`, id);
        await updateDoc(notificationRef, { read: true });
    }

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
        }
    }
    
    const unreadNotifications = useMemo(() => {
        if (!notifications) return [];
        return notifications.filter(n => !n.read);
    }, [notifications]);


    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
                <div className="flex items-center gap-2">
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Open sidebar</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0">
                            <SheetHeader>
                                <SheetTitle className="sr-only">মেনু</SheetTitle>
                            </SheetHeader>
                            <AppSidebar onLinkClick={handleLinkClick} />
                        </SheetContent>
                    </Sheet>
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold" onClick={handleLinkClick}>
                        <BookMarked className="h-6 w-6 text-primary" />
                        <span className="hidden sm:inline">হিসাব খাতা</span>
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                     <Button variant="ghost" size="icon" asChild className={cn("rounded-full", !isCheckedIn && "animate-glow")}>
                        <Link href="/check-in">
                           {isCheckedIn ? (
                                <CalendarCheck className="h-5 w-5 text-green-500" />
                            ) : (
                                <CalendarPlus className="h-5 w-5 text-primary" />
                            )}
                            <span className="sr-only">Check In</span>
                        </Link>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative">
                                {notificationCount > 0 && (
                                    <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                        {notificationCount}
                                    </span>

                                )}
                                <Bell className="h-5 w-5" />
                                <span className="sr-only">Notifications</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel className="font-bold">নোটিফিকেশন</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                             {unreadNotifications.length > 0 ? (
                                unreadNotifications.map(notification => (
                                    <DropdownMenuItem key={notification.id} onSelect={() => handleNotificationClick(notification)}>
                                        <div className="flex items-center gap-3">
                                            {!notification.read && <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0"></span>}
                                            <div className="flex flex-col">
                                                <p className="font-semibold">{notification.title}</p>
                                                <p className="text-xs text-muted-foreground">{notification.description}</p>
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                ))
                             ) : (
                                <DropdownMenuItem disabled>কোনো নতুন নোটিফিকেশন নেই।</DropdownMenuItem>
                             )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild className="p-0">
                                <Button variant="outline" className="w-full" onClick={() => router.push('/notifications')}>
                                    <span className="w-full text-center">
                                        সমস্ত নোটিফিকেশন দেখুন
                                    </span>
                                </Button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
                {children}
            </main>
        </div>
    )
}
