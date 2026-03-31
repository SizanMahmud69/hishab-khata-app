
"use client";

import Script from 'next/script';
import { useBudget } from '@/context/budget-context';

export function LiveSupport() {
    const { adConfig, isLoading } = useBudget();
    
    // Default property ID if not loaded from Firebase yet
    const propertyId = adConfig?.tawkToPropertyId || '69cbfd719c82221c37327fe6';

    if (isLoading && !adConfig) return null;

    return (
        <Script id="tawk-to" strategy="afterInteractive">
            {`
                var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/${propertyId}/default';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
                })();
            `}
        </Script>
    );
}
