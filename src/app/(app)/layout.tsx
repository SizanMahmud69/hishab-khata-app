import type { ReactNode } from "react"
import { AppHeader } from "@/components/app-header"
import { BudgetClientProvider } from "@/context/budget-context-provider"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <BudgetClientProvider>
        <AppHeader>
            {children}
        </AppHeader>
    </BudgetClientProvider>
  )
}
