
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Award,
  Bell,
  HandCoins,
  History,
  LayoutDashboard,
  LogOut,
  MinusCircle,
  PlusCircle,
  Store,
  Banknote,
  Settings,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { ScrollArea } from "./ui/scroll-area"
import { useUser } from "@/firebase"
import { getAuth, signOut } from "firebase/auth"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"

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

const settingsItems = [
    {
        href: "/settings/shops",
        label: "দোকানের তালিকা",
    }
]

export function AppSidebar({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()
  const { user } = useUser();
  const auth = getAuth();

  const handleLogout = () => {
    signOut(auth);
    if (onLinkClick) {
        onLinkClick();
    }
  }

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
            <Accordion type="single" collapsible className="w-full px-3">
                <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger className="hover:no-underline text-base font-normal hover:bg-sidebar-accent rounded-md px-2 py-2.5">
                        <div className="flex items-center gap-2">
                             <Settings />
                            <span>সেটিংস</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-6">
                        <ul className="flex flex-col gap-1">
                           {settingsItems.map((item) => (
                             <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={onLinkClick}
                                    className={`flex items-center p-2 rounded-md hover:bg-sidebar-accent ${pathname === item.href ? 'bg-sidebar-accent font-medium' : ''}`}
                                >
                                    {item.label}
                                </Link>
                             </li>
                           ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </ScrollArea>
        <div className="mt-auto flex flex-col p-4 gap-2">
            <SidebarSeparator />
            <Link href="/profile" className="flex items-center gap-3 rounded-md px-2 py-3 transition-colors hover:bg-sidebar-accent" onClick={onLinkClick}>
                <Avatar className="h-9 w-9">
                <AvatarImage src={user?.photoURL ?? `https://i.pravatar.cc/150?u=${user?.email}`} alt="User Avatar" data-ai-hint="profile avatar" />
                <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-medium">{user?.displayName ?? 'ব্যবহারকারী'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
            </Link>
            <SidebarMenuButton asChild tooltip="লগআউট" size="lg" onClick={handleLogout} className="w-full">
                <Link href="/login">
                    <LogOut />
                    <span>লগআউট</span>
                </Link>
            </SidebarMenuButton>
        </div>
    </div>
  )
}
