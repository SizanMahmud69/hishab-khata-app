
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
        // This effect runs only once when the component mounts.
        // It decides whether to load the ad script based on the initial premium status.
        if (isPublicRoute || premiumStatus === 'premium') {
            // Do not load ads on public routes or for premium users.
            return;
        }

        // If the user is not premium and not on a public route, load the ad script.
        const scriptElement = document.createElement('script');
        scriptElement.src = SOCIAL_BAR_AD_URL;
        scriptElement.async = true;
        document.body.appendChild(scriptElement);

        // The cleanup function will remove the script when the user navigates
        // away from the app pages (e.g., to a public route), or when the component unmounts.
        return () => {
            const scriptToRemove = document.querySelector(`script[src="${SOCIAL_BAR_AD_URL}"]`);
            if (scriptToRemove) {
                scriptToRemove.remove();
            }
             // Ad networks might inject other elements, we need a robust cleanup.
            const adzillaContainer = document.getElementById('adzilla-container');
            if (adzillaContainer) {
                adzillaContainer.remove();
            }
        };
        // We only want this to run based on the initial state when the layout loads.
        // Re-running this on `premiumStatus` or `pathname` change causes issues
        // where the script is not properly cleaned up or is re-injected.
    }, []); 

    // This component renders nothing itself.
    return null;
}
