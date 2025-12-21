import type { ReactNode } from "react"
import { AppHeader } from "@/components/app-header"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </>
  )
}
