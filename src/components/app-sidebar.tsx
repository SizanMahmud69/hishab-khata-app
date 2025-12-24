
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Award,
  Bell,
  HandCoins,
  History,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MinusCircle,
  PlusCircle,
  Settings,
  Store,
  User,
} from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { ScrollArea } from "./ui/scroll-area"
import { useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { Button } from "./ui/button"

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
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    if (!auth) return
    try {
      await signOut(auth)
      toast({
        title: "লগ-আউট সফল হয়েছে",
        description: "আপনাকে লগইন পেজে নিয়ে যাওয়া হচ্ছে।",
      })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        variant: "destructive",
        title: "লগ-আউট ব্যর্থ হয়েছে",
        description: "লগ-আউট করার সময় একটি সমস্যা হয়েছে।",
      })
    }
  }

  return (
    <Sidebar>
      <SidebarContent>
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
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
           <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === "/profile"}
                    tooltip="প্রোফাইল"
                    size="lg"
                >
                    <Link href="/profile" onClick={onLinkClick}>
                        <User />
                        <span className="text-base">প্রোফাইল</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={handleLogout}
                    tooltip="লগ-আউট"
                    size="lg"
                >
                    <LogOut />
                    <span className="text-base">লগ-আউট</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
