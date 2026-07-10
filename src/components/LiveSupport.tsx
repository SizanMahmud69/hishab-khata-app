
"use client";

import Script from 'next/script';
import { useBudget } from '@/context/budget-context';

export function LiveSupport() {
    const { adConfig, isLoading } = useBudget();
    
    // Default property ID if not loaded from Firebase yet
    const propertyId = adConfig?.tawkToPropertyId || '69cc0cd7ecf7021c366810cd';

    if (isLoading && !adConfig) return null;

    return (
        <>
            <Script id="tawk-init" strategy="afterInteractive">
                {`
                    var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                `}
            </Script>
            <Script 
                id="tawk-script"
                src={`https://embed.tawk.to/${propertyId}/default`}
                strategy="afterInteractive"
            />
        </>
    );
}
