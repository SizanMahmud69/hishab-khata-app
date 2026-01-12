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

        // Use setTimeout to delay the execution until after the current render cycle is complete.
        // This helps prevent race conditions with the ad script and DOM readiness.
        const timer = setTimeout(() => {
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
                console.error("Ad script execution error:", e);
            }
        }, 0);


        // Cleanup the event listener and timeout when the component unmounts
        return () => {
            clearTimeout(timer);
            window.removeEventListener('unhandledrejection', handleError);
        };

    }, [premiumStatus]);


    // This component does not render anything visible itself.
    return null;
}
