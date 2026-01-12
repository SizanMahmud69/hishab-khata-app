
"use client";

import Script from 'next/script';
import { useBudget } from '@/context/budget-context';
import { usePathname } from 'next/navigation';

export function GlobalAdScripts() {
    const { premiumStatus } = useBudget();
    const pathname = usePathname();

    const noLayoutRoutes = ['/login', '/register', '/forgot-password', '/terms-and-conditions', '/privacy-policy'];
    const isPublicRoute = noLayoutRoutes.includes(pathname) || pathname === '/';

    // Don't show ads on public routes or for premium users
    if (isPublicRoute || premiumStatus === 'premium') {
        return null;
    }

    return (
        <>
            {/* Social Bar Ad */}
            <Script src="https://pl28457235.effectivegatecpm.com/8e/dd/54/8edd54854e77a6161245532c7f56ec4b.js" />
        </>
    );
}
