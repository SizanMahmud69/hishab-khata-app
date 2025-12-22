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

interface Notification {
    id: number;
    title: string;
    description: string;
    read: boolean;
    link: string;
    createdAt: string;
}

const initialNotifications: Notification[] = [
    { id: 1, title: "আপনার বাজেট প্রায় শেষ।", description: "মাসিক খরচের সীমা অতিক্রম করতে চলেছে।", read: false, link: "/expenses", createdAt: new Date().toISOString() },
    { id: 2, title: "নতুন বিল যোগ হয়েছে।", description: "ইন্টারনেট বিল পরিশোধ করুন।", read: false, link: "/expenses", createdAt: new Date().toISOString() },
    { id: 3, title: "রিওয়ার্ড পয়েন্ট আপডেট!", description: "আপনি সফলভাবে ৫০ পয়েন্ট অর্জন করেছেন।", read: false, link: "/rewards", createdAt: new Date().toISOString() },
];

export function AppHeader({children}: {children: ReactNode}) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const router = useRouter();

    useEffect(() => {
        const storedNotifications = localStorage.getItem('notifications');
        const data = storedNotifications ? JSON.parse(storedNotifications) : initialNotifications;
        setNotifications(data);
        if (!storedNotifications) {
            localStorage.setItem('notifications', JSON.stringify(data));
        }

        const handleStorageChange = () => {
            const updatedStorage = localStorage.getItem('notifications');
            if (updatedStorage) {
                setNotifications(JSON.parse(updatedStorage));
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        }
    }, []);

    const notificationCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const checkStatus = () => {
            const lastCheckIn = localStorage.getItem('lastCheckInDate');
            if (!lastCheckIn) {
                setIsCheckedIn(false);
                return;
            }
            const today = new Date().toDateString();
            const lastCheckInDate = new Date(lastCheckIn).toDateString();
            setIsCheckedIn(today === lastCheckInDate);
        };

        checkStatus();
        window.addEventListener('storage', checkStatus);
        window.addEventListener('focus', checkStatus);

        return () => {
            window.removeEventListener('storage', checkStatus);
            window.removeEventListener('focus', checkStatus);
        };
    }, []);

    const handleLinkClick = () => {
        setIsSheetOpen(false);
    }
    
    const markAsRead = (id: number) => {
        const updatedNotifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        setNotifications(updatedNotifications);
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        window.dispatchEvent(new Event('storage')); // Trigger update for other components
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
                            <SheetHeader className="p-4 border-b">
                              <SheetTitle asChild>
                                <Link href="/dashboard" className="flex items-center gap-2 font-bold" onClick={handleLinkClick}>
                                    <BookMarked className="h-6 w-6 text-primary" />
                                    <span>হিসাব খাতা</span>
                                </Link>
                              </SheetTitle>
                              <SheetDescription className="sr-only">অ্যাপ্লিকেশনের প্রধান নেভিগেশন মেনু।</SheetDescription>
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
                     <Button variant="ghost" size="icon" asChild className={cn(!isCheckedIn && "animate-glow rounded-full")}>
                        <Link href="/check-in">
                            <CalendarDays className={cn("h-5 w-5", isCheckedIn && "text-green-500")} />
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
                                        <div className="flex flex-col gap-1">
                                            <p className="font-semibold">{notification.title}</p>
                                            <p className="text-xs text-muted-foreground">{notification.description}</p>
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
