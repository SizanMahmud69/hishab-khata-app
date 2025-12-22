
"use client";

import PageHeader from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";
import { useUser } from "@/firebase/auth/use-user";

export default function ProfilePage() {
  const { user } = useUser();
  
  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="প্রোফাইল" description="আপনার ব্যক্তিগত তথ্য দেখুন এবং সম্পাদনা করুন।" />
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={user?.photoURL ?? "https://picsum.photos/seed/1/200/200"} alt="User avatar" data-ai-hint="profile avatar" />
                            <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                        </Avatar>
                        <Button variant="ghost" size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background/80 hover:bg-background">
                            <Camera className="h-4 w-4" />
                            <span className="sr-only">Change photo</span>
                        </Button>
                    </div>
                    <div>
                        <CardTitle className="text-3xl">{user?.displayName ?? 'ব্যবহারকারী'}</CardTitle>
                        <CardDescription>{user?.email ?? 'user@example.com'}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="name">পুরো নাম</Label>
                    <Input type="text" id="name" defaultValue={user?.displayName ?? 'ব্যবহারকারী'} />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="email">ইমেইল</Label>
                    <Input type="email" id="email" defaultValue={user?.email ?? ''} disabled />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="phone">মোবাইল নম্বর</Label>
                    <Input type="tel" id="phone" placeholder="আপনার মোবাইল নম্বর দিন" />
                </div>
            </CardContent>
            <CardFooter>
                <Button className="ml-auto">সংরক্ষণ করুন</Button>
            </CardFooter>
        </Card>
    </div>
  )
}
