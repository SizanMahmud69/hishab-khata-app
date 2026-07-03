
"use client";

import Link from "next/link"
import { BookMarked, ArrowRight, Loader2 } from "lucide-react"
import { useState, useEffect } from "react";
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
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { useAuth, useUser } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isLoading: isAuthLoading } = useUser();

  // If user is already logged in, send them to dashboard immediately
  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isAuthLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoggingIn(true);

    try {
        // Explicitly set persistence to local (keeps user logged in even after browser close)
        await setPersistence(auth, browserLocalPersistence);
        await signInWithEmailAndPassword(auth, email, password);
        
        toast({
          title: "লগইন সফল হয়েছে!",
          description: "আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে।",
        });
        router.push('/dashboard');
    } catch (error: any) {
        let errorMessage = "লগইন করার সময় একটি সমস্যা হয়েছে।";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          errorMessage = "আপনার দেওয়া ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।";
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = "অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।";
        }
        
        toast({
          variant: "destructive",
          title: "লগইন ব্যর্থ হয়েছে",
          description: errorMessage,
        });
    } finally {
        setIsLoggingIn(false);
    }
  };

  if (isAuthLoading) {
      return (
          <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-green-500 p-4">
              <Card className="w-full max-w-sm">
                <CardHeader className="space-y-4">
                    <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-full mx-auto" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
          </div>
      )
  }

  return (
     <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-green-500 p-4">
       <Link
          href="/"
          className="absolute left-4 top-4 md:left-8 md:top-8"
        >
          <Button variant="ghost" className="text-white hover:bg-white/20">
             <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
            হোমপেজে ফিরে যান
          </Button>
        </Link>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
                <BookMarked className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">লগইন করুন</CardTitle>
            <CardDescription className="text-muted-foreground">
                আপনার অ্যাকাউন্টে প্রবেশ করতে ইমেইল ও পাসওয়ার্ড দিন।
            </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">ইমেইল</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoggingIn}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center">
                  <Label htmlFor="password">পাসওয়ার্ড</Label>
                   <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoggingIn}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> লোড হচ্ছে...</>
                ) : (
                    <>লগইন <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            এখনো কোনো অ্যাকাউন্ট নেই?{" "}
            <Link href="/register" className="underline text-foreground font-semibold">
              নিবন্ধন করুন
            </Link>
          </div>
           <div className="mt-4 px-8 text-center text-xs text-muted-foreground">
            চালিয়ে যাওয়ার মাধ্যমে, আপনি আমাদের{" "}
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
