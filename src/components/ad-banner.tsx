
"use client";

import Script from 'next/script';
import { useBudget } from '@/context/budget-context';
import { useEffect } from 'react';

declare global {
    interface Window {
        atOptions: any;
        atAsyncOptions: any;
    }
}

export function AdBanner({ page, adIndex = 1 }: { page: string; adIndex?: number }) {
    const { premiumStatus } = useBudget();

    if (premiumStatus === 'premium') {
        return null;
    }

    const adKey = '3ba7137cf83e3b9991ea29595a11120e';
    const adContainerId = `ad-container-${page}-${adIndex}`;

     useEffect(() => {
        // Ensure the container is empty before appending scripts
        const container = document.getElementById(adContainerId);
        if (!container) return;
        container.innerHTML = '';

        const adScript = document.createElement('script');
        adScript.type = 'text/javascript';
        adScript.innerHTML = `
            var atOptions = {
                'key' : '${adKey}',
                'format' : 'iframe',
                'height' : 50,
                'width' : 320,
                'params' : {}
            };
        `;
        container.appendChild(adScript);

        const invokeScript = document.createElement('script');
        invokeScript.type = 'text/javascript';
        invokeScript.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
        invokeScript.async = true;
        container.appendChild(invokeScript);

        return () => {
             if(container) {
                container.innerHTML = '';
             }
        }
    }, [adKey, adContainerId]);


    return (
        <div id={adContainerId} className="flex justify-center items-center my-4 min-h-[50px] min-w-[320px]">
        </div>
    );
}
