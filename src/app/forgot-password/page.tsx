
"use client";

import Link from "next/link"
import { BookMarked, ArrowRight, Loader2 } from "lucide-react"
import { useState } from "react";
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
import { useAuth } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);

    sendPasswordResetEmail(auth, email)
      .then(() => {
        toast({
          title: "ইমেইল পাঠানো হয়েছে",
          description: "আপনার পাসওয়ার্ড রিসেট করার জন্য একটি লিঙ্ক ইমেইলে পাঠানো হয়েছে।",
        });
        setIsSubmitted(true);
      })
      .catch((error) => {
        let errorMessage = "একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
        if (error.code === 'auth/user-not-found') {
          errorMessage = "এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।";
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = "অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।";
        }
        toast({
          variant: "destructive",
          title: "ব্যর্থ হয়েছে",
          description: errorMessage,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
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
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <BookMarked className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">পাসওয়ার্ড রিসেট</CardTitle>
          <CardDescription className="text-center">
            {isSubmitted 
              ? "আপনার ইমেইল চেক করুন এবং লিঙ্কে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন।"
              : "আপনার অ্যাকাউন্টের ইমেইল ঠিকানা দিন। আমরা আপনাকে পাসওয়ার্ড রিসেট করার জন্য একটি লিঙ্ক পাঠাবো।"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleResetPassword}>
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "প্রসেসিং..." : "রিসেট লিঙ্ক পাঠান"}
                </Button>
              </div>
            </form>
          ) : (
             <Button asChild className="w-full">
                <Link href="/login">
                    লগইন পেজে ফিরে যান
                </Link>
            </Button>
          )}
          <div className="mt-4 text-center text-sm">
            পাসওয়ার্ড মনে পড়েছে?{" "}
            <Link href="/login" className="underline">
              লগইন করুন
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
