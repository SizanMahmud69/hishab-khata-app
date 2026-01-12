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

    useEffect(() => {
        if (premiumStatus === 'premium') {
            return;
        }

        const handleError = (event: PromiseRejectionEvent) => {
            // Prevent the error from crashing the app
            event.preventDefault();
            console.error("Caught unhandled ad rejection:", event.reason);
        };
        
        window.addEventListener('unhandledrejection', handleError);

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

        // Cleanup the event listener when the component unmounts
        return () => {
            window.removeEventListener('unhandledrejection', handleError);
        };

    }, [premiumStatus]);


    // This component does not render anything visible itself.
    return null;
}
