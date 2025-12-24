
"use client"
import Link from "next/link"
import { type ReactNode, useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Bell, BookMarked, Menu, CalendarDays } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
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

interface Notification {
    id: string;
    title: string;
    description: string;
    read: boolean;
    link?: string;
    createdAt: string;
}

const getNotifications = (): Notification[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('notifications');
    return stored ? JSON.parse(stored) : [];
}

const saveNotifications = (notifications: Notification[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('notifications', JSON.stringify(notifications));
    window.dispatchEvent(new Event('storage'));
}

export const createNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
        ...notification,
        id: new Date().getTime().toString(),
        createdAt: new Date().toISOString(),
        read: false,
    };
    const existingNotifications = getNotifications();
    // Avoid creating duplicate notifications
    const isDuplicate = existingNotifications.some(n => n.title === newNotification.title && n.description === newNotification.description);
    if (!isDuplicate) {
        saveNotifications([newNotification, ...existingNotifications]);
    }
};


export function AppHeader({children}: {children: ReactNode}) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const router = useRouter();
    const { debtNotes } = useBudget(); 

    useEffect(() => {
        const checkStatus = () => {
            const storedLastCheckIn = localStorage.getItem('lastCheckInDate');
            if (storedLastCheckIn) {
                const today = new Date().toDateString();
                const lastDate = new Date(storedLastCheckIn).toDateString();
                setIsCheckedIn(today === lastDate);
            } else {
                setIsCheckedIn(false);
            }
        };

        checkStatus();

        const checkDailyNotifications = () => {
            const lastNotificationDate = localStorage.getItem('dailyCheckinNotificationDate');
            const todayStr = new Date().toDateString();

            if (lastNotificationDate !== todayStr) {
                // Daily Check-in Notification
                const allNotifications = getNotifications();
                const hasTodayCheckinNotification = allNotifications.some(n => 
                    n.title === "দৈনিক চেক-ইন" && isToday(parseISO(n.createdAt))
                );

                if (!hasTodayCheckinNotification && !isCheckedIn) {
                    createNotification({
                        title: "দৈনিক চেক-ইন",
                        description: "আজকের চেক-ইন করে রিওয়ার্ড পয়েন্ট অর্জন করুন।",
                        link: "/check-in",
                    });
                }

                // Debt Repayment Reminders
                const today = startOfToday();
                debtNotes.forEach(debt => {
                    if (debt.repaymentDate && debt.status !== 'paid') {
                        const repaymentDate = parseISO(debt.repaymentDate);
                        if (isBefore(repaymentDate, today) || isToday(repaymentDate)) {
                             createNotification({
                                title: "ধার পরিশোধের রিমাইন্ডার",
                                description: `${debt.person}-এর সাথে আপনার একটি ধার লেনদেন রয়েছে যা পরিশোধের সময় হয়েছে।`,
                                link: "/debts",
                            });
                        }
                    }
                });

                localStorage.setItem('dailyCheckinNotificationDate', todayStr);
            }
        };

        checkDailyNotifications();
        
        const data = getNotifications();
        setNotifications(data);

        const handleStorageChange = () => {
            const updatedStorage = localStorage.getItem('notifications');
            if (updatedStorage) {
                setNotifications(JSON.parse(updatedStorage));
            }
            checkStatus(); // Re-check check-in status on any storage change
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        }
    }, [debtNotes]); // Removed isCheckedIn from dependency array


    const notificationCount = notifications.filter(n => !n.read).length;

    const handleLinkClick = () => {
        setIsSheetOpen(false);
    }
    
    const markAsRead = (id: string) => {
        const allNotifications = getNotifications();
        const updatedNotifications = allNotifications.map(n => n.id === id ? { ...n, read: true } : n);
        saveNotifications(updatedNotifications);
    }

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
        }
    }

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
                           <CalendarDays className={cn("h-5 w-5", isCheckedIn ? "text-green-500" : "text-primary")} />
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
                             {notificationCount > 0 ? (
                                notifications.filter(n => !n.read).map(notification => (
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
