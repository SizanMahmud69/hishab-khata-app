
"use client";

import { useBudget } from '@/context/budget-context';
import { useEffect } from 'react';

declare global {
    interface Window {
        show_10446368: (options: any) => void;
    }
}

export function InterstitialAd() {
    const { premiumStatus } = useBudget();

    useEffect(() => {
        if (premiumStatus === 'premium') {
            return;
        }

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
    }, [premiumStatus]);

    return null; // This component does not render anything visible
}
