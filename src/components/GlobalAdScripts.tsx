
"use client";

import Script from 'next/script';
import { useBudget } from '@/context/budget-context';

export function GlobalAdScripts() {
    const { premiumStatus, isLoading, adConfig } = useBudget();
    
    // Don't render ad scripts if the context is loading, user is premium, or config is missing.
    if (isLoading || premiumStatus === 'premium' || !adConfig?.socialBarScriptUrl) {
        return null;
    }

    return (
        <Script
            id="social-bar-ad"
            src={adConfig.socialBarScriptUrl}
            strategy="afterInteractive"
        />
    );
}
