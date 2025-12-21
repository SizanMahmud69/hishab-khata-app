"use client";

import { BudgetProvider } from "./budget-context";

export function BudgetClientProvider({ children }: { children: React.ReactNode }) {
    return <BudgetProvider>{children}</BudgetProvider>
}
