
"use client";

import { useBudget } from '@/context/budget-context';
import { useCallback, useState } from 'react';

declare global {
    interface Window {
        show_10446368?: (options: any) => void;
    }
}

export function AdBanner({ page, adIndex }: { page: string; adIndex?: number }) {
    const { premiumStatus } = useBudget();
    const [adShown, setAdShown] = useState(false);

    const showAd = useCallback(() => {
        if (adShown || premiumStatus === 'premium' || typeof window.show_10446368 !== 'function') {
            return;
        }

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
            setAdShown(true);
        } catch (e) {
            console.error("Ad script execution error:", e);
        }
    }, [adShown, premiumStatus]);

    if (premiumStatus === 'premium') {
        return null;
    }
    
    // Render a full-viewport div to catch mouse enter events.
    // This is a robust way to ensure the page is interactive before showing an ad.
    return (
        <div 
            onMouseEnter={showAd}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1, // Ensure it doesn't interfere with other UI elements
            }}
        />
    );
}
