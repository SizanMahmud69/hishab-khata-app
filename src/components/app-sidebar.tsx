
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Award,
  Bell,
  HandCoins,
  History,
  LayoutDashboard,
  MinusCircle,
  PlusCircle,
  Store,
} from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { ScrollArea } from "./ui/scroll-area"

const menuItems = [
    {
        href: "/dashboard",
        label: "ড্যাশবোর্ড",
        icon: LayoutDashboard,
    },
    {
        href: "/income",
        label: "আয়ের হিসাব",
        icon: PlusCircle,
    },
    {
        href: "/expenses",
        label: "ব্যয়ের হিসাব",
        icon: MinusCircle,
    },
    {
        href: "/debts",
        label: "ধারের হিসাব",
        icon: HandCoins,
    },
    {
        href: "/shop-dues",
        label: "দোকান বাকি",
        icon: Store,
    },
    {
        href: "/history",
        label: "হিস্টোরি",
        icon: History,
    },
    {
        href: "/rewards",
        label: "রিওয়ার্ড",
        icon: Award,
    },
]

export function AppSidebar({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
        <ScrollArea className="flex-1">
            <SidebarMenu>
            {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    size="lg"
                >
                    <Link href={item.href} onClick={onLinkClick}>
                    <item.icon />
                    <span className="text-base">{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </ScrollArea>
    </div>
  )
}
