
"use client";

import { useEffect } from 'react';
import { useBudget } from '@/context/budget-context';
import { usePathname } from 'next/navigation';

const SOCIAL_BAR_AD_URL = "https://pl28457235.effectivegatecpm.com/8e/dd/54/8edd54854e77a6161245532c7f56ec4b.js";

export function GlobalAdScripts() {
    const { premiumStatus } = useBudget();
    const pathname = usePathname();

    const noLayoutRoutes = ['/login', '/register', '/forgot-password', '/terms-and-conditions', '/privacy-policy'];
    const isPublicRoute = noLayoutRoutes.includes(pathname) || pathname === '/';

    useEffect(() => {
        // Condition to show ads: NOT a public route AND user is NOT premium.
        const shouldShowAds = !isPublicRoute && premiumStatus !== 'premium';

        // Find if the script already exists
        let scriptElement = document.querySelector(`script[src="${SOCIAL_BAR_AD_URL}"]`);

        if (shouldShowAds) {
            // If ads should be shown and script doesn't exist, create and append it.
            if (!scriptElement) {
                scriptElement = document.createElement('script');
                scriptElement.src = SOCIAL_BAR_AD_URL;
                scriptElement.async = true;
                document.body.appendChild(scriptElement);
            }
        } else {
            // If ads should NOT be shown and script exists, remove it.
            if (scriptElement) {
                scriptElement.remove();
            }
        }

        // Cleanup function to remove the script when the component unmounts or dependencies change
        return () => {
            const scriptToRemove = document.querySelector(`script[src="${SOCIAL_BAR_AD_URL}"]`);
            if (scriptToRemove) {
                scriptToRemove.remove();
            }
        };
    }, [premiumStatus, isPublicRoute]); // Re-run effect if premiumStatus or route changes

    // This component renders nothing itself.
    return null;
}
