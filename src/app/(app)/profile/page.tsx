"use client";

import PageHeader from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/firebase/provider";
import { Star } from "lucide-react";

export default function ProfilePage() {
  const { user } = useUser();
  
  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="প্রোফাইল" description="আপনার ব্যক্তিগত তথ্য এবং স্ট্যাটাস দেখুন।" />
        <Card className="max-w-md mx-auto overflow-visible">
            <div className="relative h-24 bg-primary rounded-t-lg">
                <Avatar className="h-28 w-28 absolute top-1/2 left-1/2 -translate-x-1/2 border-4 border-background">
                    <AvatarImage src={user?.photoURL ?? "https://picsum.photos/seed/1/200/200"} alt="User avatar" data-ai-hint="profile avatar" />
                    <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                </Avatar>
            </div>
            <CardContent className="text-center pt-20">
                <h2 className="text-2xl font-bold">{user?.displayName ?? 'ব্যবহারকারী'}</h2>
                <p className="text-muted-foreground">{user?.email ?? 'user@example.com'}</p>
                
                <div className="mt-4 flex flex-col items-center gap-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border border-green-200">Online</Badge>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">20 Reviews (4.65)</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
