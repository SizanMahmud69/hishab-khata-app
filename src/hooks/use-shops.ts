
"use client";

import { useState, useEffect, useCallback } from 'react';

const SHOPS_STORAGE_KEY = 'hishab_khata_shops';

export const useShops = () => {
    const [shops, setShops] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedShops = localStorage.getItem(SHOPS_STORAGE_KEY);
            if (storedShops) {
                setShops(JSON.parse(storedShops));
            }
        } catch (error) {
            console.error("Failed to load shops from localStorage", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateShops = useCallback((newShops: string[]) => {
        try {
            const uniqueShops = [...new Set(newShops)]; // Ensure no duplicates
            setShops(uniqueShops);
            localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(uniqueShops));
        } catch (error) {
            console.error("Failed to save shops to localStorage", error);
        }
    }, []);

    const addShop = useCallback((newShop: string) => {
        if (newShop && !shops.includes(newShop)) {
            const updatedShops = [...shops, newShop];
            updateShops(updatedShops);
            return true;
        }
        return false;
    }, [shops, updateShops]);

    const removeShop = useCallback((shopToRemove: string) => {
        const updatedShops = shops.filter(shop => shop !== shopToRemove);
        updateShops(updatedShops);
    }, [shops, updateShops]);

    return { shops, addShop, removeShop, isLoading };
};
