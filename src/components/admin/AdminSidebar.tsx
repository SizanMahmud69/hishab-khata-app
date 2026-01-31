
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  ShieldCheck,
  Banknote,
  Users2,
  BookMarked,
  Package,
  Crown,
  Megaphone,
  SlidersHorizontal,
} from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function AdminSidebar() {
    const pathname = usePathname();

    const menuItems = [
        { href: "/admin/dashboard", label: "Dashboard", icon: Home },
        { href: "/admin/verifications", label: "Verifications", icon: ShieldCheck },
        { href: "/admin/withdrawals", label: "Withdrawals", icon: Banknote },
        { href: "/admin/users", label: "Users", icon: Users2 },
        { href: "/admin/subscriptions", label: "Subscriptions", icon: Crown },
        { href: "/admin/ads", label: "Ads", icon: Megaphone },
        { href: "/admin/config", label: "App Config", icon: SlidersHorizontal },
    ];
  
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <TooltipProvider>
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/admin"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <BookMarked className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Hishab Khata Admin</span>
        </Link>
        {menuItems.map(item => (
            <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                    <Link
                    href={item.href}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${pathname.startsWith(item.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'} transition-colors hover:text-foreground md:h-8 md:w-8`}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="sr-only">{item.label}</span>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
        ))}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Package className="h-5 w-5" />
              <span className="sr-only">Back to App</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Back to App</TooltipContent>
        </Tooltip>
      </nav>
      </TooltipProvider>
    </aside>
  )
}
