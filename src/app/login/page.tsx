
"use client";

import Link from "next/link"
import Image from "next/image";
import { BookMarked, ArrowRight } from "lucide-react"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";

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
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "@/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        toast({
          title: "লগইন সফল হয়েছে!",
          description: "আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে।",
        });
        router.push('/dashboard');
      })
      .catch((error: any) => {
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
      })
      .finally(() => {
        setIsLoading(false);
      });
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "লোড হচ্ছে..." : "লগইন"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            এখনো কোনো অ্যাকাউন্ট নেই?{" "}
            <Link href="/register" className="underline">
              নিবন্ধন করুন
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
