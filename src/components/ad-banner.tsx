"use client";

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const adConfigs = {
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

interface AdBannerProps {
    adIndex?: number;
    variant?: keyof typeof adConfigs;
    className?: string;
}

export function AdBanner({ adIndex = 1, variant = 'inline', className }: AdBannerProps) {
    const adContainerRef = useRef<HTMLDivElement>(null);
    const config = adConfigs[variant];
    const key = `ad-banner-${config?.key}-${adIndex}`;

    useEffect(() => {
        const container = adContainerRef.current;
        if (!container || !config) return;

        container.innerHTML = '';

        const optionsScript = document.createElement('script');
        optionsScript.type = 'text/javascript';
        optionsScript.innerHTML = `
            atOptions = {
                'key' : '${config.key}',
                'format' : 'iframe',
                'height' : ${config.height},
                'width' : ${config.width},
                'params' : {}
            };
        `;

        const invokeScript = document.createElement('script');
        invokeScript.src = `https://www.highperformanceformat.com/${config.key}/invoke.js`;

        container.appendChild(optionsScript);
        container.appendChild(invokeScript);

        return () => {
            if (container) {
                container.innerHTML = '';
            }
        };
    }, [key, config]);

    if (!config) return null;

    return (
        <div 
            key={key}
            ref={adContainerRef}
            className={cn(
                "flex items-center justify-center my-2 mx-auto",
                className
            )}
            style={{ height: `${config.height}px`, width: `${config.width}px` }}
        >
        </div>
    );
}
