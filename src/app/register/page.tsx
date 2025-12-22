"use client";

import Link from "next/link"
import { BookMarked, ArrowRight } from "lucide-react"
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
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { app } from "@/firebase/config";

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth(app);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
      
      if(userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: fullName
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
        errorMessage = "এই ইমেইল ঠিকানাটি ইতিমধ্যে ব্যবহৃত হয়েছে।";
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
              <Button type="submit" className="w-full" disabled={isLoading}>
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
        </CardContent>
      </Card>
    </div>
  )
}
