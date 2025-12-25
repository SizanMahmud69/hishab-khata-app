
"use client";

import Link from "next/link"
import { BookMarked, ArrowRight, Loader2, CheckCircle } from "lucide-react"
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useAuth, useFirestore } from "@/firebase";
import { doc, setDoc, serverTimestamp, getDoc, query, collection, where, getDocs, writeBatch, increment, limit, addDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetClientProvider, useBudget } from "@/context/budget-context-provider";
import { useDebounce } from "react-use";
import { createNotification } from "@/components/app-header";


function RegisterPageContent() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [referrer, setReferrer] = useState<{ id: string, name: string } | null>(null);
  const [isCheckingReferral, setIsCheckingReferral] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { referrerBonusPoints, referredUserBonusPoints, bdtPer100Points } = useBudget();

  const checkReferralCode = useCallback(async (code: string) => {
    if (!code.trim() || !firestore) {
        setReferrer(null);
        return;
    }
    setIsCheckingReferral(true);
    try {
        const usersRef = collection(firestore, "users");
        const q = query(usersRef, where("referralCode", "==", code.trim()), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const referrerDoc = querySnapshot.docs[0];
            setReferrer({ id: referrerDoc.id, name: referrerDoc.data().name });
        } else {
            setReferrer(null);
        }
    } catch (error) {
        console.error("Error checking referral code:", error);
        setReferrer(null);
    } finally {
        setIsCheckingReferral(false);
    }
  }, [firestore]);

  useDebounce(() => {
    checkReferralCode(referralCode)
  }, 500, [referralCode]);


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
      if (referralCode.trim() && !referrer) {
        toast({
            variant: "destructive",
            title: "অবৈধ রেফার কোড",
            description: "প্রদত্ত রেফার কোডটি সঠিক নয়। অনুগ্রহ করে আবার চেষ্টা করুন।",
        });
        setIsLoading(false);
        return;
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if(user) {
        await updateProfile(user, {
          displayName: fullName
        });

        // Ensure app config exists
        const configDocRef = doc(firestore, "app_config", "settings");
        const configDocSnap = await getDoc(configDocRef);
        if (!configDocSnap.exists()) {
          await setDoc(configDocRef, { 
            minWithdrawalPoints: 1000,
            referrerBonusPoints: 100,
            referredUserBonusPoints: 50,
            bdtPer100Points: 5,
           });
        }
        
        const userDocRef = doc(firestore, "users", user.uid);
        const ownReferralCode = `#${fullName.split(' ')[0].toLowerCase()}-${Math.random().toString(36).substr(2, 4)}`;

        const batch = writeBatch(firestore);

        // 1. Set new user's document
        batch.set(userDocRef, {
            id: user.uid,
            userId: `#hishab-${Math.random().toString(36).substr(2, 4)}`,
            name: fullName,
            email: user.email,
            avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.email}`,
            phone: user.phoneNumber || '',
            address: '',
            points: referrer ? referredUserBonusPoints : 0, // Bonus for referred user
            joinDate: serverTimestamp(),
            lastCheckIn: null,
            checkInStreak: 0,
            verificationRequestId: null,
            referralCode: ownReferralCode,
            referredBy: referrer ? referrer.id : null,
        });

        // 2. If referred, update referrer
        if (referrer) {
            const referrerDocRef = doc(firestore, "users", referrer.id);
            batch.update(referrerDocRef, { points: increment(referrerBonusPoints) });

            const referralRecordRef = doc(collection(firestore, `users/${referrer.id}/referrals`));
            batch.set(referralRecordRef, {
                userId: referrer.id,
                referredUserId: user.uid,
                referredUserName: fullName,
                bonusPoints: referrerBonusPoints,
                createdAt: serverTimestamp(),
            });
            
             // Create notification for the referrer
            const referrerNotifRef = doc(collection(firestore, `users/${referrer.id}/notifications`));
            batch.set(referrerNotifRef, {
                userId: referrer.id,
                title: "রেফারেল বোনাস!",
                description: `${fullName} আপনার কোড ব্যবহার করে যোগ দিয়েছেন। আপনি ${referrerBonusPoints} পয়েন্ট পেয়েছেন।`,
                link: `/congratulations?title=রেফারেল বোনাস&description=আপনি সফলভাবে একজনকে রেফার করেছেন!&points=${referrerBonusPoints}`,
                read: false,
                createdAt: serverTimestamp(),
            });
        }

        // Add welcome bonus to the new user's referrals sub-collection for history tracking
        if (referrer) {
             const newUserReferralRecordRef = doc(collection(firestore, `users/${user.uid}/referrals`));
             batch.set(newUserReferralRecordRef, {
                userId: user.uid,
                referredUserId: user.uid, // Self-reference for their own bonus
                referredUserName: "স্বাগতম বোনাস",
                bonusPoints: referredUserBonusPoints,
                createdAt: serverTimestamp(),
            });
        }
        
        await batch.commit();

        if (referrer) {
            await createNotification({
                id: `welcome-bonus-${user.uid}`,
                title: 'স্বাগতম বোনাস!',
                description: `রেফার কোড ব্যবহার করার জন্য আপনি ${referredUserBonusPoints} পয়েন্ট পেয়েছেন।`,
                link: `/congratulations?title=স্বাগতম বোনাস&description=আমাদের অ্যাপে আপনাকে স্বাগতম!&points=${referredUserBonusPoints}`,
            }, user.uid, firestore);
        }
      }

      toast({
        title: "নিবন্ধন সফল হয়েছে!",
        description: "আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে।",
      });
      router.push('/dashboard');

    } catch (error: any) {
      console.error(error);
      let errorMessage = "নিবন্ধন করার সময় একটি সমস্যা হচ্ছে।";
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-green-500 p-4">
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
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <BookMarked className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">নতুন অ্যাকাউন্ট তৈরি করুন</CardTitle>
          <CardDescription className="text-muted-foreground">
            আপনার তথ্য দিয়ে নিবন্ধন সম্পন্ন করুন।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="overflow-y-auto max-h-[calc(100vh-350px)] px-2">
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
                <Label htmlFor="referral-code">রেফার কোড (ঐচ্ছিক)</Label>
                <Input 
                  id="referral-code" 
                  placeholder="রেফারেল কোড"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  disabled={isLoading}
                />
                <div className="h-4 px-1 text-xs">
                    {isCheckingReferral ? (
                        <div className="flex items-center text-muted-foreground">
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            যাচাই করা হচ্ছে...
                        </div>
                    ) : referrer ? (
                        <div className="flex items-center text-green-600 font-medium">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            রেফার করেছেন: {referrer.name}
                        </div>
                    ) : referralCode && !isCheckingReferral ? (
                       <div className="text-destructive">অবৈধ রেফার কোড</div>
                    ) : null}
                </div>
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


export default function RegisterPage() {
    return (
        <BudgetClientProvider>
            <RegisterPageContent />
        </BudgetClientProvider>
    )
}
