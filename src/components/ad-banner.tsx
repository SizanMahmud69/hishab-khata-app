"use client";

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// The adIndex prop is crucial for creating unique script environments,
// which helps ad networks serve different ads in different slots on the same page.
export function AdBanner({ adIndex = 1 }: { adIndex?: number }) {
    const adContainerRef = useRef<HTMLDivElement>(null);
    // Use a key to force re-mounting and re-running the effect if the index changes.
    // This ensures that each ad slot is treated independently.
    const key = `ad-banner-${adIndex}`;

    useEffect(() => {
        const container = adContainerRef.current;
        if (!container) return;

        // Clear any previous script to avoid duplicates on re-renders
        container.innerHTML = '';

        const adKey = '3ba7137cf83e3b9991ea29595a11120e';
        
        const optionsScript = document.createElement('script');
        optionsScript.type = 'text/javascript';
        optionsScript.innerHTML = `
            atOptions = {
                'key' : '${adKey}',
                'format' : 'iframe',
                'height' : 50,
                'width' : 320,
                'params' : {}
            };
        `;

        const invokeScript = document.createElement('script');
        invokeScript.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;

        // Append scripts to the container
        container.appendChild(optionsScript);
        container.appendChild(invokeScript);

        // Cleanup function to remove scripts when the component unmounts
        return () => {
            if (container) {
                container.innerHTML = '';
            }
        };
    }, [key]); // Effect depends on the unique key


    return (
        <div 
            key={key} // Use the key here
            ref={adContainerRef}
            className={cn(
                "flex items-center justify-center my-2",
                "h-[50px] w-[320px] mx-auto"
            )}
        >
        </div>
    );
}
