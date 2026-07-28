"use client";

import { useEffect, useRef } from 'react';
import { useBudget } from '@/context/budget-context';

export function LiveSupport() {
    const { adConfig } = useBudget();
    
    // Default property ID if not loaded from Firebase yet
    const propertyId = adConfig?.tawkToPropertyId || '69cc0cd7ecf7021c366810cd';
    const hasInjected = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined' || hasInjected.current) return;

        // Initialize Tawk global variables
        (window as any).Tawk_API = (window as any).Tawk_API || {};
        (window as any).Tawk_LoadStart = new Date();

        // Inject the script manually to ensure proper ordering and cross-origin attributes
        const s1 = document.createElement("script");
        const s0 = document.getElementsByTagName("script")[0];
        s1.async = true;
        s1.src = `https://embed.tawk.to/${propertyId}/default`;
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        
        if (s0 && s0.parentNode) {
            s0.parentNode.insertBefore(s1, s0);
        } else {
            const firstScript = document.head.getElementsByTagName("script")[0];
            if (firstScript) {
                document.head.insertBefore(s1, firstScript);
            } else {
                document.head.appendChild(s1);
            }
        }

        hasInjected.current = true;
    }, [propertyId]);

    return null;
}
