"use client"
import Link from "next/link"
import type { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { BookMarked, CalendarDays, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"


function MobileHeader() {
    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6 md:hidden">
            <div className="flex items-center gap-2">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Open sidebar</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0">
                      <SheetHeader>
                          <SheetTitle className="sr-only">Sidebar Navigation</SheetTitle>
                          <SheetDescription className="sr-only">Main application navigation menu.</SheetDescription>
                      </SheetHeader>
                      <AppSidebar />
                    </SheetContent>
                </Sheet>
                <Link href="/dashboard" className="flex items-center gap-2 font-bold">
                    <BookMarked className="h-6 w-6 text-primary" />
                    <span>হিসাব খাতা</span>
                </Link>
            </div>
            <Button variant="ghost" size="icon">
                <CalendarDays className="h-5 w-5" />
                <span className="sr-only">Select date</span>
            </Button>
        </header>
    )
}

function DesktopHeader() {
    return (
        <header className="sticky top-0 z-40 hidden h-16 shrink-0 items-center justify-end border-b bg-background px-4 sm:px-6 md:flex">
             <Button variant="ghost" size="icon">
                <CalendarDays className="h-5 w-5" />
                <span className="sr-only">Select date</span>
            </Button>
        </header>
    )
}


export function AppHeader({children}: {children: ReactNode}) {
    return (
        <SidebarProvider>
             <div className="hidden md:block">
                <AppSidebar />
             </div>
             <div className="flex flex-1 flex-col">
                <MobileHeader />
                <DesktopHeader />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
                    {children}
                </main>
             </div>
        </SidebarProvider>
    )
}
