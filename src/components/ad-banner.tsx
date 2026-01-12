"use client";

import { useBudget } from '@/context/budget-context';
import { useEffect } from 'react';

declare global {
    interface Window {
        show_10446368: (options: any) => void;
    }
}

export function AdBanner({ page, adIndex }: { page: string, adIndex?: number }) {
    const { premiumStatus } = useBudget();

    useEffect(() => {
        if (premiumStatus === 'premium') {
            return;
        }

        const adElement = document.getElementById(`ad-unit-${page}-${adIndex || 0}`);
        if (!adElement) return;

        // Use requestAnimationFrame to ensure the main thread is not blocked
        // and the script runs after the paint.
        const animationFrameId = requestAnimationFrame(() => {
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
        });

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [premiumStatus, page, adIndex]);

    // Render an empty div for the script to potentially anchor to, but keep it non-blocking.
    return <div id={`ad-unit-${page}-${adIndex || 0}`} style={{ display: 'none' }}></div>;
}
