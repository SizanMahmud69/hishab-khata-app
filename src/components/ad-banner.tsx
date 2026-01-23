"use client";

import { useBudget } from "@/context/budget-context";
import Script from "next/script";

export function AdBanner({ page, adIndex = 1, variant = 'square' }: { page: string; adIndex?: number, variant?: 'inline' | 'square' }) {
    const { premiumStatus } = useBudget();

    if (premiumStatus === 'premium') {
        return null;
    }

    // These are the banner ads the user wants to keep.
    const key = variant === 'inline' ? '730c4e14f639c4a2c5a7386d497c458d' : '743a0dc9bc3be759b21e51982c52beb6';
    const src = variant === 'inline' 
        ? `https://www.highcpmrevenuegate.com/${key}/invoke.js`
        : `https://www.highperformanceformat.com/${key}/invoke.js`;
    
    const containerId = `container-${key}-${page}-${adIndex}`;

    return (
        <div key={`${page}-${adIndex}-${variant}`} className="my-4 flex justify-center">
            <div id={containerId}></div>
            <Script
                strategy="lazyOnload"
                id={`ad-script-${page}-${adIndex}`}
                dangerouslySetInnerHTML={{
                    __html: `
                        atOptions = {
                            'key' : '${key}',
                            'format' : 'iframe',
                            'height' : ${variant === 'inline' ? 50 : 250},
                            'width' : ${variant === 'inline' ? 320 : 300},
                            'params' : {}
                        };
                        
                        var script = document.createElement('script');
                        script.src = "${src}";
                        try {
                           var container = document.getElementById('${containerId}');
                           if(container) {
                                script.type = 'text/javascript';
                                container.appendChild(script);
                           }
                        } catch(e) {}
                    `,
                }}
            />
        </div>
    );
}
