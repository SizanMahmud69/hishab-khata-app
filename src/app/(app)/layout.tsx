import type { ReactNode } from "react"
import { AppHeader } from "@/components/app-header"
import { BudgetClientProvider } from "@/context/budget-context-provider"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <BudgetClientProvider>
        <div className="flex min-h-screen w-full flex-col">
        <AppHeader>
            {children}
        </AppHeader>
        </div>
    </BudgetClientProvider>
  )
}
