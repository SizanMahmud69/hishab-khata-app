"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BookMarked,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Target,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const menuItems = [
  {
    href: "/dashboard",
    label: "ড্যাশবোর্ড",
    icon: LayoutDashboard,
  },
  {
    href: "/income",
    label: "আয়",
    icon: ArrowUpCircle,
  },
  {
    href: "/expenses",
    label: "খরচ",
    icon: ArrowDownCircle,
  },
  {
    href: "/budgets",
    label: "বাজেট",
    icon: Target,
  },
  {
    href: "/debts",
    label: "ধারের হিসাব",
    icon: HandCoins,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <BookMarked className="size-8 text-primary" />
          <h2 className="text-xl font-bold font-headline group-data-[collapsible=icon]:hidden">
            হিসাব খাতা
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:-ml-1">
        <div className="flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://picsum.photos/seed/1/100/100" alt="@shadcn" data-ai-hint="profile avatar" />
              <AvatarFallback>ইউ</AvatarFallback>
            </Avatar>
            <div className="grid group-data-[collapsible=icon]:hidden">
                <p className="font-medium text-sidebar-foreground">ব্যবহারকারী</p>
                <p className="text-xs text-muted-foreground">user@example.com</p>
            </div>
            <Button asChild variant="ghost" size="icon" className="ml-auto group-data-[collapsible=icon]:hidden">
                <Link href="/">
                    <LogOut className="size-5" />
                </Link>
            </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
