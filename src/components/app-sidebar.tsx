"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Award,
  BookMarked,
  HandCoins,
  History,
  LayoutDashboard,
  LogOut,
  MinusCircle,
  PlusCircle,
  Store,
  Target,
  LifeBuoy,
  User,
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
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { ScrollArea } from "./ui/scroll-area"
import { useUser } from "@/firebase/auth/use-user"
import { getAuth, signOut } from "firebase/auth"

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
        </ScrollArea>
        <div className="mt-auto p-4">
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
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="সাপোর্ট" size="lg">
                        <Link href="#" onClick={onLinkClick}>
                            <LifeBuoy />
                            <span>সাপোর্ট</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="লগআউট" size="lg" onClick={handleLogout}>
                        <Link href="/login">
                            <LogOut />
                            <span>লগআউট</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </div>
    </div>
  )
}
