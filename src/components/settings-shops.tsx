"use client";

import { useState } from "react";
import { useShops } from "@/hooks/use-shops";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "./ui/label";

export function SettingsShops() {
    const { shops, addShop, removeShop, isLoading } = useShops();
    const [newShop, setNewShop] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const handleAddShop = () => {
        if (newShop.trim()) {
            const success = addShop(newShop.trim());
            if (success) {
                setNewShop("");
                toast({
                    title: "সফল!",
                    description: `"${newShop.trim()}" দোকানে যোগ করা হয়েছে।`,
                });
                setIsDialogOpen(false); // Close dialog on success
            } else {
                 toast({
                    variant: "destructive",
                    title: "ব্যর্থ",
                    description: "এই দোকানটি ইতিমধ্যে তালিকায় রয়েছে।",
                });
            }
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>নতুন দোকান যোগ করুন</CardTitle>
                    <CardDescription>আপনার নিয়মিত বাকি করা দোকানগুলোর নাম এখানে যোগ করুন।</CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                         <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            নতুন যোগ করুন
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>নতুন দোকান</DialogTitle>
                          <DialogDescription>
                            আপনার নতুন দোকানের নাম লিখুন।
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                              নাম
                            </Label>
                            <Input
                              id="name"
                              value={newShop}
                              onChange={(e) => setNewShop(e.target.value)}
                              className="col-span-3"
                              placeholder="করিম স্টোর"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" onClick={handleAddShop}>সংরক্ষণ করুন</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>আপনার দোকানের তালিকা</CardTitle>
                    <CardDescription>এখানে আপনার যোগ করা সকল দোকান দেখা যাচ্ছে।</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : shops.length > 0 ? (
                        <ul className="space-y-2">
                            {shops.map((shop, index) => (
                                <li key={index} className="flex items-center justify-between rounded-md border p-3">
                                    <span className="font-medium">{shop}</span>
                                    <Button variant="ghost" size="icon" onClick={() => removeShop(shop)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-muted-foreground p-8">এখনও কোনো দোকান যোগ করা হয়নি।</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
