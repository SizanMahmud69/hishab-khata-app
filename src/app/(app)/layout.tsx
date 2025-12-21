import type { ReactNode } from "react"
import { AppHeader } from "@/components/app-header"
import { BudgetProvider } from "@/context/budget-context"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <BudgetProvider>
        <div className="flex min-h-screen w-full flex-col">
        <AppHeader>
            {children}
        </AppHeader>
        </div>
    </BudgetProvider>
  )
}
