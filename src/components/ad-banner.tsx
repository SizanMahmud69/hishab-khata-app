
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

interface AdConfig {
    key: string;
    height: number;
    width: number;
}

const adConfigs: Record<string, AdConfig> = {
    inline: {
        key: '3ba7137cf83e3b9991ea29595a11120e',
        height: 50,
        width: 320,
    },
    square: {
        key: '743a0dc9bc3be759b21e51982c52beb6',
        height: 250,
        width: 300,
    },
};

export function AdBanner({ page, adIndex = 1, variant = 'square' }: { page: string; adIndex?: number, variant?: 'inline' | 'square' }) {
    const { premiumStatus } = useBudget();

    if (premiumStatus === 'premium') {
        return null;
    }

    const config = adConfigs[variant];
    const adContainerId = `ad-container-${page}-${variant}-${adIndex}`;

     useEffect(() => {
        // Ensure the container is empty before appending scripts
        const container = document.getElementById(adContainerId);
        if (!container) return;
        container.innerHTML = '';

        const adScript = document.createElement('script');
        adScript.type = 'text/javascript';
        adScript.innerHTML = `
            var atOptions = {
                'key' : '${config.key}',
                'format' : 'iframe',
                'height' : ${config.height},
                'width' : ${config.width},
                'params' : {}
            };
        `;
        container.appendChild(adScript);

        const invokeScript = document.createElement('script');
        invokeScript.type = 'text/javascript';
        invokeScript.src = `//www.highperformanceformat.com/${config.key}/invoke.js`;
        invokeScript.async = true;
        container.appendChild(invokeScript);

        return () => {
             if(container) {
                container.innerHTML = '';
             }
        }
    }, [config, adContainerId]);


    return (
        <div id={adContainerId} className="flex justify-center items-center my-4" style={{ minHeight: `${config.height}px`, minWidth: `${config.width}px`}}>
        </div>
    );
}
