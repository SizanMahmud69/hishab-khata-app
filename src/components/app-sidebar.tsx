
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Award,
  BookMarked,
  HandCoins,
  History,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MinusCircle,
  PlusCircle,
  Store,
  User,
  Users,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"

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
    {
        href: "/refer",
        label: "রেফার",
        icon: Users,
    },
]

export function AppSidebar({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const handleLogout = () => {
    if (!auth) return;
    signOut(auth).then(() => {
        toast({
            title: "লগ-আউট সফল হয়েছে",
            description: "আপনাকে আবার দেখা পাওয়ার অপেক্ষায়।",
        });
        if (onLinkClick) onLinkClick();
        router.push('/login');
    }).catch((error) => {
        toast({
            variant: "destructive",
            title: "লগ-আউট ব্যর্থ হয়েছে",
            description: "একটি সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।",
        });
    });
  };

  return (
    <Sidebar>
       <SidebarHeader className="bg-sidebar-accent">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg" onClick={onLinkClick}>
            <BookMarked className="h-7 w-7 text-primary" />
            <span>হিসাব খাতা</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
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
      </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
            <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === "/profile"}
                        size="lg"
                    >
                        <Link href="/profile" onClick={onLinkClick}>
                            <User />
                            <span>প্রোফাইল</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={handleLogout}
                        size="lg"
                    >
                        <LogOut />
                        <span>লগ-আউট</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  )
}
