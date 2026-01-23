"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useBudget } from "@/context/budget-context";

// Rewarded ad function is no longer needed as per user request to remove popups.
// declare global {
//     interface Window {
//         adzilla_id: any;
//         show_10446368: (type: 'pop' | 'interstitial') => void;
//     }
// }

export function GlobalAdScripts() {
    const pathname = usePathname();
    const { premiumStatus } = useBudget();

    useEffect(() => {
        // This logic is for the Social Bar ad
        if (premiumStatus !== 'premium') {
            const adzilla_id = {
                cat: '7',
                reShowAfter: 30, // Show ad again after 30 seconds
                is_cat: '1',
            };
            (window as any).adzilla_id = adzilla_id;
        }
    }, [pathname, premiumStatus]);
    
    if (premiumStatus === 'premium') {
        return null;
    }

    return (
        <>
            {/* Social Bar - This is kept as per user clarification */}
            <Script
                id="monetag-social-bar"
                strategy="lazyOnload"
                dangerouslySetInnerHTML={{
                    __html: `
                        (function(d,z,s){s.src='https://'+d+'/401/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('www.highperformancedformats.com','10446370',document.createElement('script'));
                    `
                }}
            />
        </>
    );
}
