"use client";

import { FirebaseApp } from "firebase/app";
import { Auth } from "firebase/auth";
import { Firestore } from "firebase/firestore";
import { createContext, useContext } from "react";
import { UserProvider } from "./auth/use-user";

type FirebaseContext = {
    app: FirebaseApp | undefined;
    firestore: Firestore | undefined;
    auth: Auth | undefined;
};

const FirebaseContext = createContext<FirebaseContext>({
    app: undefined,
    firestore: undefined,
    auth: undefined,
});

export const useFirebaseApp = () => useContext(FirebaseContext).app;
export const useFirestore = () => useContext(FirebaseContext).firestore;
export const useAuth = () => useContext(FirebaseContext).auth;

export function FirebaseProvider({
    children,
    app,
    firestore,
    auth
}: {
    children: React.ReactNode;
    app: FirebaseApp | undefined;
    firestore: Firestore | undefined;
    auth: Auth | undefined;
}) {
    return (
        <FirebaseContext.Provider
            value={{
                app,
                firestore,
                auth
            }}
        >
            <UserProvider>
                {children}
            </UserProvider>
        </FirebaseContext.Provider>
    );
}