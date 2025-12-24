"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useToast } from './use-toast';

interface UserProfile {
    shops?: string[];
}

export const useShops = () => {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading } = useDoc<UserProfile>(userDocRef);

    const shops = useMemo(() => userProfile?.shops || [], [userProfile]);

    const addShop = useCallback(async (newShop: string) => {
        if (!userDocRef) return false;
        if (newShop.trim() === '') return false;
        if (shops.includes(newShop.trim())) {
             toast({
                variant: "destructive",
                title: "ব্যর্থ",
                description: "এই দোকানটি ইতিমধ্যে তালিকায় রয়েছে।",
            });
            return false;
        }

        try {
            await updateDoc(userDocRef, {
                shops: arrayUnion(newShop.trim())
            });
             toast({
                title: "সফল!",
                description: `"${newShop.trim()}" দোকানে যোগ করা হয়েছে।`,
            });
            return true;
        } catch (error) {
            console.error("Failed to add shop to Firestore", error);
            toast({
                variant: "destructive",
                title: "ত্রুটি",
                description: "দোকান যোগ করার সময় একটি সমস্যা হয়েছে।",
            });
            return false;
        }
    }, [userDocRef, shops, toast]);

    const removeShop = useCallback(async (shopToRemove: string) => {
        if (!userDocRef) return;

        try {
            await updateDoc(userDocRef, {
                shops: arrayRemove(shopToRemove)
            });
            toast({
                title: "সফল!",
                description: `"${shopToRemove}" দোকানটি মুছে ফেলা হয়েছে।`,
            });
        } catch (error) {
            console.error("Failed to remove shop from Firestore", error);
             toast({
                variant: "destructive",
                title: "ত্রুটি",
                description: "দোকান মুছে ফেলার সময় একটি সমস্যা হয়েছে।",
            });
        }
    }, [userDocRef, toast]);

    return { shops, addShop, removeShop, isLoading };
};
