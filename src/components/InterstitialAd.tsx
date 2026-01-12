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

        const handleLoad = () => {
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
        
        // If the page is already loaded, run the script.
        // Otherwise, wait for the 'load' event.
        if (document.readyState === 'complete') {
            handleLoad();
        } else {
            window.addEventListener('load', handleLoad);
        }

        // Cleanup function to remove the event listener when the component unmounts.
        return () => {
            window.removeEventListener('load', handleLoad);
        };
    }, [premiumStatus]);

    return null; // This component does not render anything visible
}
