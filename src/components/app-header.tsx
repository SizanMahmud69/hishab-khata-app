"use client"
import Link from "next/link"
import { type ReactNode, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Bell, BookMarked, CalendarDays, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


function DesktopHeader() {
    return (
        <header className="sticky top-0 z-40 hidden h-16 shrink-0 items-center justify-end gap-2 border-b bg-background px-4 sm:px-6 md:flex">
             <Button variant="ghost" size="icon">
                <CalendarDays className="h-5 w-5" />
                <span className="sr-only">Select date</span>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5" />
                        <span className="sr-only">Notifications</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>বিজ্ঞপ্তি</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>আপনার বাজেট প্রায় শেষ।</DropdownMenuItem>
                    <DropdownMenuItem>নতুন বিল যোগ হয়েছে।</DropdownMenuItem>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem asChild className="justify-center">
                        <Link href="/history">সব দেখুন</Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}


export function AppHeader({children}: {children: ReactNode}) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleLinkClick = () => {
        setIsSheetOpen(false);
    }
    return (
        <SidebarProvider>
             <AppSidebar onLinkClick={handleLinkClick} />
             <div className="flex flex-1 flex-col">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6 md:hidden">
                        <div className="flex items-center gap-2">
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Open sidebar</span>
                                </Button>
                            </SheetTrigger>
                            <Link href="/dashboard" className="flex items-center gap-2 font-bold" onClick={handleLinkClick}>
                                <BookMarked className="h-6 w-6 text-primary" />
                                <span>হিসাব খাতা</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                                <CalendarDays className="h-5 w-5" />
                                <span className="sr-only">Select date</span>
                            </Button>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Bell className="h-5 w-5" />
                                        <span className="sr-only">Notifications</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>বিজ্ঞপ্তি</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>আপনার বাজেট প্রায় শেষ।</DropdownMenuItem>
                                    <DropdownMenuItem>নতুন বিল যোগ হয়েছে।</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild className="justify-center">
                                        <Link href="/history">সব দেখুন</Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>
                    <SheetContent side="left" className="p-0">
                         <SheetHeader className="p-4">
                          <SheetTitle className="sr-only">মেনু</SheetTitle>
                          <SheetDescription className="sr-only">অ্যাপ্লিকেশনের প্রধান নেভিগেশন মেনু।</SheetDescription>
                        </SheetHeader>
                        <AppSidebar onLinkClick={handleLinkClick} />
                    </SheetContent>
                </Sheet>

                <DesktopHeader />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
                    {children}
                </main>
             </div>
        </SidebarProvider>
    )
}
