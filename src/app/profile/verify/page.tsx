

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, addDoc, collection, serverTimestamp, query, where, getDocs, limit } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function VerifyNidPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const handleNidSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user || !firestore || !userDocRef) return;

        setIsSubmitting(true);
        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        const nid = formData.get('nid') as string;
        const phone = formData.get('phone') as string;
        const dob = formData.get('dob') as string;
        const address = formData.get('address') as string;

        if (!name || !nid || !phone || !dob || !address) {
            toast({
                variant: "destructive",
                title: "ফর্ম পূরণ আবশ্যক",
                description: "অনুগ্রহ করে সকল তথ্য পূরণ করুন।",
            });
            setIsSubmitting(false);
            return;
        }

        try {
            // Check for uniqueness of NID and Phone across all verification requests
            const verificationRequestsRef = collection(firestore, 'verificationRequests');
            
            const nidQuery = query(verificationRequestsRef, where("nidNumber", "==", nid), where("status", "in", ["pending", "approved"]), limit(1));
            const phoneQuery = query(verificationRequestsRef, where("phone", "==", phone), where("status", "in", ["pending", "approved"]), limit(1));

            const [nidSnapshot, phoneSnapshot] = await Promise.all([getDocs(nidQuery), getDocs(phoneQuery)]);

            if (!nidSnapshot.empty) {
                toast({
                    variant: "destructive",
                    title: "NID নম্বরটি ব্যবহৃত",
                    description: "এই NID নম্বরটি দিয়ে ইতিমধ্যে একটি ভেরিফিকেশন অনুরোধ করা হয়েছে।",
                });
                setIsSubmitting(false);
                return;
            }

            if (!phoneSnapshot.empty) {
                toast({
                    variant: "destructive",
                    title: "ফোন নম্বরটি ব্যবহৃত",
                    description: "এই ফোন নম্বরটি দিয়ে ইতিমধ্যে একটি ভেরিফিকেশন অনুরোধ করা হয়েছে।",
                });
                setIsSubmitting(false);
                return;
            }
            
            const requestData = {
                userId: user.uid,
                status: 'pending',
                submittedAt: serverTimestamp(),
                nidName: name,
                nidNumber: nid,
                nidDob: dob,
                nidAddress: address,
                phone: phone,
            };

            // Add to both the user's sub-collection and the root collection
            const userVerificationRequestRef = collection(firestore, `users/${user.uid}/verificationRequests`);
            const newRequestDoc = await addDoc(userVerificationRequestRef, requestData);
            
            // Also add to the root-level collection for admin and uniqueness checks
            const rootRequestDocRef = doc(verificationRequestsRef, newRequestDoc.id);
            await setDoc(rootRequestDocRef, requestData);

            await setDoc(userDocRef, {
                verificationRequestId: newRequestDoc.id,
                phone: phone,
            }, { merge: true });

            toast({
                title: "আবেদন জমা হয়েছে",
                description: "আপনার এনআইডি ভেরিফিকেশনের আবেদনটি প্রক্রিয়াধীন আছে।",
            });
            
            router.push('/profile');

        } catch (error) {
            console.error("Error submitting NID application:", error);
            toast({
                variant: "destructive",
                title: "ত্রুটি",
                description: "আবেদন জমা দেওয়ার সময় একটি সমস্যা হয়েছে।",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 space-y-4">
            <PageHeader title="এনআইডি ভেরিফিকেশন" description="আপনার এনআইডি কার্ড অনুযায়ী সঠিক তথ্য প্রদান করুন।" />
            <Card className="max-w-2xl mx-auto">
                <form onSubmit={handleNidSubmit}>
                    <CardHeader>
                        <CardTitle>ভেরিফিকেশন তথ্য</CardTitle>
                        <CardDescription>এই তথ্যগুলো আপনার প্রোফাইলের বিশ্বাসযোগ্যতা বাড়াতে সাহায্য করবে।</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 py-4 px-4 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">পুরো নাম (এনআইডি অনুযায়ী)</Label>
                            <Input id="name" name="name" placeholder="আপনার পুরো নাম লিখুন" required />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="nid">এনআইডি নম্বর</Label>
                            <Input id="nid" name="nid" type="number" placeholder="আপনার এনআইডি নম্বর" required />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="dob">জন্ম তারিখ</Label>
                            <Input id="dob" name="dob" type="date" required />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="phone">ফোন নম্বর</Label>
                            <Input id="phone" name="phone" placeholder="আপনার ফোন নম্বর" required />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="address">ঠিকানা</Label>
                            <Input id="address" name="address" placeholder="আপনার ঠিকানা লিখুন" required />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'জমা দেওয়া হচ্ছে...' : 'জমা দিন'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
