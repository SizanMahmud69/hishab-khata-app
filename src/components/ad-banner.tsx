"use client";

import { useBudget } from '@/context/budget-context';
import { useEffect }from 'react';

declare global {
    interface Window {
        show_10446368?: (options: any) => void;
    }
}

export function AdBanner({ page, adIndex }: { page: string; adIndex?: number }) {
    const { premiumStatus } = useBudget();

    if (premiumStatus === 'premium') {
        return null;
    }

    try {
        if (typeof window.show_10446368 === 'function') {
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
        }
    } catch (e) {
        console.error("Ad script error:", e);
    }

    // This component does not render anything visible itself.
    return null;
}
