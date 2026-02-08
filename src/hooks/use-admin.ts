
"use client";

import { useUser } from '@/firebase';

export function useAdmin() {
    const { user, isLoading: isUserLoading } = useUser();
    
    // Hardcode admin check based on email
    const isAdmin = user?.email === 'hisabkhata.maintanance@gmail.com';
    const isLoading = isUserLoading;

    return { isAdmin, isLoading };
}
