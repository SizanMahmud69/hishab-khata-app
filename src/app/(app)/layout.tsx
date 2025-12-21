import type { ReactNode } from "react"
import { AppHeader } from "@/components/app-header"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <AppHeader />
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
          {/* Mobile menu button will go here if needed, or other header content */}
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
