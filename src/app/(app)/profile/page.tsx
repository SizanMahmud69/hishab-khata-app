"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/firebase/provider";
import { Mail, Phone, UserCheck, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ProfilePage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isNidVerified, setIsNidVerified] = useState(false);

  const handleNidVerification = () => {
    // This is a placeholder function.
    // In a real app, this would trigger a flow to a third-party service
    // or a backend that handles NID verification.
    toast({
      title: "এনআইডি ভেরিফিকেশন",
      description: "এনআইডি ভেরিফিকেশন প্রক্রিয়া শীঘ্রই শুরু হবে।",
    });
    // For demonstration, we can toggle the state after a delay.
    setTimeout(() => setIsNidVerified(true), 3000);
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
            <CardTitle>এনআইডি ভেরিফিকেশন</CardTitle>
            <CardDescription>আপনার অ্যাকাউন্টের নিরাপত্তা এবং বিশ্বাসযোগ্যতা বাড়ান।</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {isNidVerified ? (
                    <>
                        <UserCheck className="w-8 h-8 text-green-500" />
                        <div>
                            <p className="font-semibold text-green-500">এনআইডি ভেরিফাইড</p>
                            <p className="text-sm text-muted-foreground">আপনার অ্যাকাউন্টটি এখন সম্পূর্ণ ভেরিফাইড।</p>
                        </div>
                    </>
                ) : (
                    <>
                        <XCircle className="w-8 h-8 text-red-500" />
                        <div>
                            <p className="font-semibold text-red-500">এনআইডি ভেরিফাইড নয়</p>
                            <p className="text-sm text-muted-foreground">অতিরিক্ত সুবিধা পেতে আপনার এনআইডি ভেরিফাই করুন।</p>
                        </div>
                    </>
                )}
            </div>
             {!isNidVerified && (
                <Button onClick={handleNidVerification}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    এনআইডি ভেরিফাই করুন
                </Button>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
