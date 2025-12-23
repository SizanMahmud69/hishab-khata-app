
"use client";

import Link from "next/link"
import { BookMarked, ArrowRight, Loader2 } from "lucide-react"
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useAuth, useFirestore } from "@/firebase";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralId, setReferralId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
        toast({
            variant: "destructive",
            title: "পাসওয়ার্ড মেলেনি",
            description: "আপনার দেওয়া পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড একই নয়।",
        });
        setIsLoading(false);
        return;
    }

    if (!auth || !firestore) {
        toast({
            variant: "destructive",
            title: "নিবন্ধন ব্যর্থ হয়েছে",
            description: "প্রয়োজনীয় পরিষেবা উপলব্ধ নয়।",
        });
        setIsLoading(false);
        return;
    }

    if (password.length < 6) {
        toast({
            variant: "destructive",
            title: "নিবন্ধন ব্যর্থ হয়েছে",
            description: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",
        });
        setIsLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if(user) {
        // Update Firebase Auth profile
        await updateProfile(user, {
          displayName: fullName
        });

        // Ensure app_config settings document exists
        const configDocRef = doc(firestore, "app_config", "settings");
        const configDocSnap = await getDoc(configDocRef);

        if (!configDocSnap.exists()) {
          await setDoc(configDocRef, {
            minWithdrawalPoints: 1000 // Default value
          });
        }
        
        // Create user document in Firestore
        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, {
            id: user.uid,
            userId: `#hishab-${Math.random().toString(36).substr(2, 4)}`, // Example custom ID
            name: fullName,
            email: user.email,
            avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.email}`,
            phone: user.phoneNumber || '',
            address: '',
            points: 0,
            joinDate: serverTimestamp(),
            lastCheckIn: null,
            checkInStreak: 0,
            verificationStatus: 'none',
        });
      }

      toast({
        title: "নিবন্ধন সফল হয়েছে!",
        description: "আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে।",
      });
      router.push('/dashboard');

    } catch (error: any) {
      console.error("Registration Error:", error);
      let errorMessage = "নিবন্ধন করার সময় একটি সমস্যা হয়েছে।";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে।";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "পাসওয়ার্ডটি দুর্বল। অনুগ্রহ করে আরও শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।";
      }
      toast({
        variant: "destructive",
        title: "নিবন্ধন ব্যর্থ হয়েছে",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Link
          href="/"
          className="absolute left-4 top-4 md:left-8 md:top-8"
        >
          <Button variant="ghost">
             <ArrowRight className="mr-2 h-4 w-4" />
            হোমপেজে ফিরে যান
          </Button>
        </Link>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <BookMarked className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">নতুন অ্যাকাউন্ট তৈরি করুন</CardTitle>
          <CardDescription className="text-center">
            আপনার তথ্য দিয়ে নিবন্ধন সম্পন্ন করুন।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister}>
            <div className="grid gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="full-name">পুরো নাম</Label>
                <Input 
                  id="full-name" 
                  placeholder="আপনার নাম" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">ইমেইল</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">পাসওয়ার্ড</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">কনফার্ম পাসওয়ার্ড</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
               <div className="space-y-1.5">
                <Label htmlFor="referral-id">রেফার আইডি (ঐচ্ছিক)</Label>
                <Input 
                  id="referral-id" 
                  placeholder="রেফারেল আইডি"
                  value={referralId}
                  onChange={(e) => setReferralId(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "লোড হচ্ছে..." : "নিবন্ধন করুন"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            ইতিমধ্যে একটি অ্যাকাউন্ট আছে?{" "}
            <Link href="/login" className="underline">
              লগইন করুন
            </Link>
          </div>
           <div className="mt-4 px-8 text-center text-xs text-muted-foreground">
              নিবন্ধন করার মাধ্যমে, আপনি আমাদের{" "}
              <Link
                href="/terms-and-conditions"
                className="underline underline-offset-4 hover:text-primary"
              >
                ব্যবহারের শর্তাবলী
              </Link>{" "}
              এবং{" "}
              <Link
                href="/privacy-policy"
                className="underline underline-offset-4 hover:text-primary"
              >
                গোপনীয়তা নীতিতে
              </Link>
              {" "}সম্মত হচ্ছেন।
            </div>
        </CardContent>
      </Card>
    </div>
  )
}

    