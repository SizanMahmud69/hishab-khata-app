
"use client";

import { useEffect } from 'react';
import { useBudget } from '@/context/budget-context';
import { usePathname } from 'next/navigation';

const SOCIAL_BAR_AD_URL = "https://pl28457235.effectivegatecpm.com/8e/dd/54/8edd54854e77a6161245532c7f56ec4b.js";

declare global {
    interface Window {
        show_10446368: (options?: any) => Promise<void>;
    }
}

export function GlobalAdScripts() {
    const { premiumStatus } = useBudget();
    const pathname = usePathname();

    const noLayoutRoutes = ['/login', '/register', '/forgot-password', '/terms-and-conditions', '/privacy-policy'];
    const isPublicRoute = noLayoutRoutes.includes(pathname) || pathname === '/';

    // Effect for Social Bar Ad
    useEffect(() => {
        const scriptExists = document.querySelector(`script[src="${SOCIAL_BAR_AD_URL}"]`);

        if (premiumStatus === 'free' && !isPublicRoute) {
            if (!scriptExists) {
                const scriptElement = document.createElement('script');
                scriptElement.src = SOCIAL_BAR_AD_URL;
                scriptElement.async = true;
                document.body.appendChild(scriptElement);
            }
        }

        return () => {
            const scriptToRemove = document.querySelector(`script[src="${SOCIAL_BAR_AD_URL}"]`);
            if (scriptToRemove) {
                scriptToRemove.remove();
            }
            const adzillaContainer = document.getElementById('adzilla-container');
            if (adzillaContainer) {
                adzillaContainer.remove();
            }
        };
    }, [premiumStatus, isPublicRoute]);

    // Effect for In-App Interstitial Ad
    useEffect(() => {
        if (premiumStatus === 'free' && !isPublicRoute && typeof window.show_10446368 === 'function') {
            try {
                window.show_10446368({
                    type: 'inApp',
                    inAppSettings: {
                        frequency: 2,
                        capping: 0.1,
                        interval: 30,
                        timeout: 5,
                        everyPage: false
                    }
                });
            } catch (error) {
                console.error("In-App Interstitial ad error:", error);
            }
        }
    }, [premiumStatus, isPublicRoute, pathname]); // Rerun on pathname change to check logic on new pages

    return null;
}
