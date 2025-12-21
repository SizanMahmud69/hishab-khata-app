"use client";

import { useBudget } from "@/context/budget-context";
import PageHeader from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera } from "lucide-react";

export default function ProfilePage() {
  const { isLoading } = useBudget();

  if (isLoading) {
    return <ProfileSkeleton />;
  }
  
  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="প্রোফাইল" description="আপনার ব্যক্তিগত তথ্য দেখুন এবং সম্পাদনা করুন।" />
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src="https://picsum.photos/seed/1/200/200" alt="User avatar" data-ai-hint="profile avatar" />
                            <AvatarFallback>ইউ</AvatarFallback>
                        </Avatar>
                        <Button variant="ghost" size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background/80 hover:bg-background">
                            <Camera className="h-4 w-4" />
                            <span className="sr-only">Change photo</span>
                        </Button>
                    </div>
                    <div>
                        <CardTitle className="text-3xl">ব্যবহারকারী</CardTitle>
                        <CardDescription>user@example.com</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="name">পুরো নাম</Label>
                    <Input type="text" id="name" defaultValue="ব্যবহারকারী" />
                </div>
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="email">ইমেইল</Label>
                    <Input type="email" id="email" defaultValue="user@example.com" disabled />
                </div>
                <div className="grid w-full items-center gap-1.5">
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

function ProfileSkeleton() {
    return (
        <div className="flex-1 space-y-4">
            <div className="grid gap-1 mb-6">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-5 w-72" />
            </div>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <div className="flex items-center gap-6">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-9 w-40" />
                            <Skeleton className="h-5 w-48" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Skeleton className="h-10 w-32" />
                </CardFooter>
            </Card>
        </div>
    );
}
