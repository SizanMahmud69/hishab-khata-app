
"use client";

import Script from 'next/script';
import { useBudget } from '@/context/budget-context';

export function GlobalAdScripts() {
    const { premiumStatus, isLoading, isAdmin } = useBudget();
    
    // Don't render ad scripts if the context is loading, user is premium, or user is an admin.
    if (isLoading || premiumStatus === 'premium' || isAdmin) {
        return null;
    }

    return (
        <Script
            id="social-bar-ad"
            src="https://pl28457235.effectivegatecpm.com/8e/dd/54/8edd54854e77a6161245532c7f56ec4b.js"
            strategy="afterInteractive"
        />
    );
}

    