import type { ReactNode } from "react"
import { AppHeader } from "@/components/app-header"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader>
        {children}
      </AppHeader>
    </div>
  )
}
