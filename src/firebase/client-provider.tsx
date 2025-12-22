"use client";

import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config";
import { FirebaseProvider } from "./provider";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;

export function FirebaseClientProvider({ children }: { children: React.ReactNode; }) {
    if (!app) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        firestore = getFirestore(app);
    }
    
    return (
        <FirebaseProvider app={app} auth={auth} firestore={firestore}>
            {children}
        </FirebaseProvider>
    );
}