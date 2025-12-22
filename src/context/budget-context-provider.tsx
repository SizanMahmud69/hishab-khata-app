"use client";

import { BudgetProvider, useBudget } from "./budget-context";

export function BudgetClientProvider({ children }: { children: React.ReactNode }) {
    return <BudgetProvider>{children}</BudgetProvider>
}

export { useBudget };
