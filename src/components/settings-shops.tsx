
"use client";

import { useState } from "react";
import { useShops } from "@/hooks/use-shops";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SettingsShops() {
    const { shops, addShop, removeShop, isLoading } = useShops();
    const [newShop, setNewShop] = useState("");
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
                    <div className="flex w-full max-w-sm items-center space-x-2">
                        <Input 
                            type="text" 
                            placeholder="দোকানের নাম" 
                            value={newShop}
                            onChange={(e) => setNewShop(e.target.value)}
                        />
                        <Button type="button" onClick={handleAddShop}>
                            <Plus className="mr-2 h-4 w-4" /> যোগ করুন
                        </Button>
                    </div>
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
