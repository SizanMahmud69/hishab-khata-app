
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useBudget } from '@/context/budget-context';

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
    leaderboard: {
        key: '18077c532637bbe2ddcab04535aa15bf',
        height: 60,
        width: 468,
    },
};

interface AdBannerProps {
    adIndex?: number;
    variant?: keyof typeof adConfigs;
    className?: string;
}

export function AdBanner({ adIndex = 1, variant = 'inline', className }: AdBannerProps) {
    const { premiumStatus } = useBudget();
    const config = adConfigs[variant];

    if (premiumStatus === 'premium' || !config) {
        return null;
    }

    const adHtml = `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    body { margin: 0; padding: 0; overflow: hidden; display: flex; justify-content: center; align-items: center; background: transparent; }
                </style>
            </head>
            <body>
                <script type="text/javascript">
                    atOptions = {
                        'key' : '${config.key}',
                        'format' : 'iframe',
                        'height' : ${config.height},
                        'width' : ${config.width},
                        'params' : {}
                    };
                </script>
                <script type="text/javascript" src="https://www.profitablecreativeformat.com/${config.key}/invoke.js"></script>
            </body>
        </html>
    `;

    return (
        <div 
            className={cn(
                "flex items-center justify-center mx-auto bg-transparent overflow-hidden my-2",
                className
            )}
            style={{ 
                minHeight: `${config.height}px`,
                width: '100%',
                maxWidth: `${config.width}px`
            }}
        >
            <iframe
                title={`ad-${variant}-${adIndex}`}
                srcDoc={adHtml}
                width={config.width}
                height={config.height}
                frameBorder="0"
                scrolling="no"
                style={{ border: 'none', width: '100%', height: `${config.height}px` }}
            />
        </div>
    );
}
