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

    const adKey = '23a22d63f1824f6a206935229e119cc5';
    const adContainerId = `ad-container-${page}-${adIndex}`;

     useEffect(() => {
        const adScript = document.createElement('script');
        adScript.innerHTML = `
            atOptions = {
                'key' : '${adKey}',
                'format' : 'iframe',
                'height' : 300,
                'width' : 160,
                'params' : {}
            };
        `;
        document.getElementById(adContainerId)?.appendChild(adScript);

        const invokeScript = document.createElement('script');
        invokeScript.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;
        document.getElementById(adContainerId)?.appendChild(invokeScript);

        return () => {
             const container = document.getElementById(adContainerId);
             if(container) {
                container.innerHTML = '';
             }
        }
    }, [adKey, adContainerId]);


    return (
        <div id={adContainerId} className="flex justify-center items-center my-4 min-h-[300px] min-w-[160px]">
        </div>
    );
}
