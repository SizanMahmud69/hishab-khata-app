"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/firebase/provider";
import { Mail, Phone, CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import { sendEmailVerification } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user } = useUser();
  const { toast } = useToast();

  const handleVerification = async () => {
    if (user && !user.emailVerified) {
      try {
        await sendEmailVerification(user);
        toast({
          title: "ভেরিফিকেশন ইমেইল পাঠানো হয়েছে",
          description: "অনুগ্রহ করে আপনার ইমেইল চেক করুন এবং ভেরিফিকেশন লিঙ্কটিতে ক্লিক করুন।",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "একটি সমস্যা হয়েছে",
          description: "ইমেইল পাঠাতে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।",
        });
      }
    }
  };
  
  return (
    <div className="flex-1 space-y-6">
      <Card className="overflow-hidden">
        <div className="relative h-24 bg-primary/20">
          <Avatar className="h-32 w-32 absolute top-1/2 left-1/2 -translate-x-1/2 border-4 border-background shadow-lg">
              <AvatarImage src={user?.photoURL ?? "https://picsum.photos/seed/1/200/200"} alt="User avatar" data-ai-hint="profile avatar" />
              <AvatarFallback className="text-4xl">{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
          </Avatar>
        </div>
        <CardContent className="text-center pt-20 pb-6 px-4 sm:px-6">
            <h2 className="text-3xl font-bold">{user?.displayName ?? 'ব্যবহারকারী'}</h2>
            <p className="text-sm text-muted-foreground mt-1">@{user?.uid.substring(0, 8)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>যোগাযোগের তথ্য</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="flex items-center gap-4">
                <Mail className="w-6 h-6 text-muted-foreground" />
                <div className="flex-1">
                     <p className="text-sm font-medium">ইমেইল</p>
                     <p className="text-muted-foreground">{user?.email ?? 'ইমেইল পাওয়া যায়নি'}</p>
                </div>
            </div>

            {user?.phoneNumber && (
                 <div className="flex items-center gap-4">
                    <Phone className="w-6 h-6 text-muted-foreground" />
                    <div className="flex-1">
                        <p className="text-sm font-medium">ফোন নম্বর</p>
                        <p className="text-muted-foreground">{user.phoneNumber}</p>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
            <CardTitle>অ্যাকাউন্ট ভেরিফিকেশন</CardTitle>
            <CardDescription>আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করুন।</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                {user?.emailVerified ? (
                    <>
                        <ShieldCheck className="w-6 h-6 text-green-500" />
                        <div>
                            <p className="font-semibold">ইমেইল ভেরিফাইড</p>
                            <p className="text-sm text-muted-foreground">আপনার অ্যাকাউন্টটি সুরক্ষিত আছে।</p>
                        </div>
                    </>
                ) : (
                    <>
                        <XCircle className="w-6 h-6 text-red-500" />
                        <div>
                            <p className="font-semibold text-red-500">ইমেইল ভেরিফাইড নয়</p>
                            <p className="text-sm text-muted-foreground">আপনার অ্যাকাউন্ট সুরক্ষিত করতে ইমেইল ভেরিফাই করুন।</p>
                        </div>
                    </>
                )}
            </div>
             {!user?.emailVerified && (
                <Button onClick={handleVerification}>ভেরিফাই করুন</Button>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
