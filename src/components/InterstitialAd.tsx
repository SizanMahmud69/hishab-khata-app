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

    const handleLoad = () => {
        if (premiumStatus === 'premium') {
            return;
        }

        if (typeof window.show_10446368 === 'function') {
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
            } catch (e) {
                console.error("Ad script error:", e);
            }
        }
    };

    // This component renders a hidden div with an onLoad event.
    // The onLoad event fires after the entire page (including scripts, images, etc.) has loaded.
    // This is a more reliable way to ensure the ad script is ready than using setTimeout.
    return <div style={{ display: 'none' }} onLoad={handleLoad} />;
}
