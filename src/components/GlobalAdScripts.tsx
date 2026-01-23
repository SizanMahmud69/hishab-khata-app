"use client";

import Script from 'next/script';

export function GlobalAdScripts() {
    return (
        <Script
            id="social-bar-ad"
            src="https://pl28457235.effectivegatecpm.com/8e/dd/54/8edd54854e77a6161245532c7f56ec4b.js"
            strategy="afterInteractive"
        />
    );
}
