"use client";

import { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../provider';

type UserContext = {
    user: User | null;
    isLoading: boolean;
};

const UserContext = createContext<UserContext>({
    user: null,
    isLoading: true,
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const auth = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setIsLoading(false);
            return;
        }
        
        const unsubscribe = auth.onAuthStateChanged(
            (user) => {
                setUser(user);
                setIsLoading(false);
            },
            (error) => {
                console.error("Auth state change error:", error);
                setUser(null);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [auth]);
    
    return (
        <UserContext.Provider
            value={{
                user,
                isLoading
            }}
        >
            {children}
        </UserContext.Provider>
    );
}
