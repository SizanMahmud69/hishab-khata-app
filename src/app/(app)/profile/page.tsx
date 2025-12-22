"use client";

import PageHeader from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/firebase/provider";
import { Mail, Phone, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
            <CardContent className="text-center pt-20 px-4 sm:px-6">
                <h2 className="text-2xl font-bold">{user?.displayName ?? 'ব্যবহারকারী'}</h2>
                
                <div className="mt-6 text-left space-y-4">
                    <div className="flex items-center gap-4">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                             <p className="text-sm font-medium">ইমেইল</p>
                             <div className="flex items-center gap-2">
                                <p className="text-muted-foreground">{user?.email ?? 'ইমেইল পাওয়া যায়নি'}</p>
                                {user?.emailVerified ? (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        ভেরিফাইড
                                    </Badge>
                                ) : (
                                     <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                                        <XCircle className="w-3 h-3 mr-1" />
                                        ভেরিফাইড নয়
                                    </Badge>
                                )}
                             </div>
                        </div>
                    </div>

                    {user?.phoneNumber && (
                         <div className="flex items-center gap-4">
                            <Phone className="w-5 h-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">ফোন নম্বর</p>
                                <p className="text-muted-foreground">{user.phoneNumber}</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
