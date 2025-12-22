
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/firebase/provider";
import { Mail, Phone, UserCheck, XCircle, CheckCircle, User, MapPin, Cake } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge";

interface NidData {
    name: string;
    nid: string;
    phone: string;
    dob: string;
    address: string;
}

export default function ProfilePage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isNidVerified, setIsNidVerified] = useState(false);
  const [isVerificationPending, setIsVerificationPending] = useState(false);
  const [nidData, setNidData] = useState<NidData | null>(null);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);

  const handleNidSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const nid = formData.get('nid') as string;
    const phone = formData.get('phone') as string;
    const dob = formData.get('dob') as string;
    const address = formData.get('address') as string;

    if (!name || !nid || !phone || !dob || !address) {
      toast({
        variant: "destructive",
        title: "ফর্ম পূরণ আবশ্যক",
        description: "অনুগ্রহ করে সকল তথ্য পূরণ করুন।",
      });
      return;
    }
    
    setIsVerificationPending(true);
    setIsVerificationDialogOpen(false);
    
    toast({
      title: "আবেদন জমা হয়েছে",
      description: "আপনার এনআইডি ভেরিফিকেশনের আবেদনটি প্রক্রিয়াধীন আছে।",
    });

    // Simulate manual verification process
    setTimeout(() => {
      setIsNidVerified(true);
      setIsVerificationPending(false);
      setNidData({ name, nid, phone, dob, address });
      toast({
        title: "এনআইডি ভেরিফাইড!",
        description: "আপনার অ্যাকাউন্টটি সফলভাবে ভেরিফাই করা হয়েছে।",
      });
    }, 5000);
  };
  
  return (
    <div className="flex-1 space-y-6">
      <Card className="overflow-hidden">
        <div className="h-24 bg-primary/20" />
        <div className="relative -mt-16 flex justify-center">
             <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={user?.photoURL ?? `https://i.pravatar.cc/150?u=${user?.email}`} alt="User avatar" data-ai-hint="profile avatar" />
                <AvatarFallback className="text-4xl">{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
        </div>
        <CardContent className="text-center pt-6 pb-6 px-4 sm:px-6">
            <div className="flex items-center justify-center gap-2">
                <h2 className="text-3xl font-bold">{user?.displayName ?? 'ব্যবহারকারী'}</h2>
                {isNidVerified && <CheckCircle className="w-7 h-7 text-green-500" />}
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>যোগাযোগের তথ্য</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-muted-foreground mt-1" />
                <div className="flex-1">
                     <p className="text-sm font-medium">ইমেইল</p>
                     <div className="flex items-center gap-2">
                        <p className="text-muted-foreground">{user?.email ?? 'ইমেইল পাওয়া যায়নি'}</p>
                        {user?.emailVerified ? 
                            <Badge className="bg-green-100 text-green-800 border-green-300">ভেরিফাইড</Badge> : 
                            <Badge variant="destructive">ভেরিফাইড নয়</Badge>
                        }
                     </div>
                </div>
            </div>

            <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-muted-foreground mt-1" />
                <div className="flex-1">
                    <p className="text-sm font-medium">ফোন নম্বর</p>
                    <p className="text-muted-foreground">{nidData?.phone ?? user?.phoneNumber ?? 'ফোন নম্বর সেট করা নেই'}</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-muted-foreground mt-1" />
                <div className="flex-1">
                    <p className="text-sm font-medium">ঠিকানা</p>
                    <p className="text-muted-foreground">{nidData?.address ?? 'ঠিকানা সেট করা নেই'}</p>
                </div>
            </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
            <CardTitle>এনআইডি ভেরিফিকেশন</CardTitle>
            {!isNidVerified && <CardDescription>আপনার অ্যাকাউন্টের নিরাপত্তা এবং বিশ্বাসযোগ্যতা বাড়ান।</CardDescription>}
        </CardHeader>
        <CardContent>
            {isNidVerified && nidData ? (
                 <div className="space-y-4">
                     <div className="flex items-start gap-4">
                        <User className="w-6 h-6 text-muted-foreground mt-1" />
                        <div className="flex-1">
                             <p className="text-sm font-medium">নাম (এনআইডি অনুযায়ী)</p>
                             <p className="text-muted-foreground">{nidData.name}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <UserCheck className="w-6 h-6 text-muted-foreground mt-1" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">এনআইডি নম্বর</p>
                            <p className="text-muted-foreground">{nidData.nid}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Cake className="w-6 h-6 text-muted-foreground mt-1" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">জন্ম তারিখ</p>
                            <p className="text-muted-foreground">{new Date(nidData.dob).toLocaleDateString('bn-BD')}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <MapPin className="w-6 h-6 text-muted-foreground mt-1" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">ঠিকানা (এনআইডি অনুযায়ী)</p>
                            <p className="text-muted-foreground">{nidData.address}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-8 h-8 text-red-500" />
                        <div>
                            <p className="font-semibold text-red-500">এনআইডি ভেরিফাইড নয়</p>
                            <p className="text-sm text-muted-foreground">অতিরিক্ত সুবিধা পেতে আপনার এনআইডি ভেরিফাই করুন।</p>
                        </div>
                    </div>
                     <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
                      <DialogTrigger asChild>
                        <Button disabled={isVerificationPending}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          {isVerificationPending ? 'প্রসেসিং...' : 'এনআইডি ভেরিফাই করুন'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>এনআইডি ভেরিফিকেশন</DialogTitle>
                          <DialogDescription>
                            আপনার এনআইডি কার্ড অনুযায়ী সঠিক তথ্য প্রদান করুন।
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleNidSubmit}>
                            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-2">
                              <div className="space-y-1.5">
                                <Label htmlFor="name">পুরো নাম (এনআইডি অনুযায়ী)</Label>
                                <Input id="name" name="name" placeholder="আপনার পুরো নাম লিখুন" required />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="nid">এনআইডি নম্বর</Label>
                                <Input id="nid" name="nid" type="number" placeholder="আপনার এনআইডি নম্বর" required />
                              </div>
                               <div className="space-y-1.5">
                                <Label htmlFor="dob">জন্ম তারিখ</Label>
                                <Input id="dob" name="dob" type="date" required />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="phone">ফোন নম্বর</Label>
                                <Input id="phone" name="phone" placeholder="আপনার ফোন নম্বর" required />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="address">ঠিকানা</Label>
                                <Input id="address" name="address" placeholder="আপনার ঠিকানা লিখুন" required />
                              </div>
                            </div>
                            <DialogFooter className="pt-4">
                              <Button type="submit">জমা দিন</Button>
                            </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
