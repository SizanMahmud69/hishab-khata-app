
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

    return null;
}
