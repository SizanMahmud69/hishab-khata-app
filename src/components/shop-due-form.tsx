
"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useBudget } from "@/context/budget-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useShops } from "@/hooks/use-shops";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type DebtNote } from "@/context/budget-context";

export default function ShopDueForm() {
    const { addDebtNote } = useBudget();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { shops, addShop: addNewShopToList, removeShop } = useShops();
    const [isAddShopDialogOpen, setIsAddShopDialogOpen] = useState(false);
    const [isDeleteShopDialogOpen, setIsDeleteShopDialogOpen] = useState(false);
    const [newShopName, setNewShopName] = useState("");
    
    // This state is to close the parent dialog after successful submission
    const [isParentDialogOpen, setIsParentDialogOpen] = useState(true);

    const handleAddNewDue = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // The parent dialog is controlled by the Page, not this component. 
        // We can't close it directly. A callback would be needed.
        // For now, we just handle the logic.

        setIsSubmitting(true);
        const formData = new FormData(event.currentTarget);
        const shopName = formData.get('shopName') as string;
        const amount = Number(formData.get('amount'));
        const date = formData.get('date') as string;
        const description = formData.get('description') as string;

        if (!shopName || !amount || !date) {
            toast({
                variant: "destructive",
                title: "ফর্ম পূরণ আবশ্যক",
                description: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।",
            });
            setIsSubmitting(false);
            return;
        }

        try {
            const newDue: Omit<DebtNote, 'id' | 'userId' | 'createdAt'> = {
                person: shopName,
                type: 'shopDue',
                amount,
                date: new Date(date).toISOString(),
                description,
                paidAmount: 0,
                status: 'unpaid'
            };
            
            await addDebtNote(newDue);

            toast({
                title: "সফল!",
                description: "নতুন দোকানের বাকি সফলভাবে যোগ করা হয়েছে।",
            });

            (event.target as HTMLFormElement).reset();
            // Here we would call a prop like `onSuccess()` to close the dialog.
        } catch (error) {
            console.error("Error adding new due:", error);
            toast({ variant: "destructive", title: "ত্রুটি", description: "একটি সমস্যা হয়েছে।" });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleAddNewShop = () => {
        if (newShopName.trim()) {
            const success = addNewShopToList(newShopName.trim());
            if (success) {
                setNewShopName("");
                toast({
                    title: "সফল!",
                    description: `"${newShopName.trim()}" দোকানে যোগ করা হয়েছে।`,
                });
                setIsAddShopDialogOpen(false);
            } else {
                 toast({
                    variant: "destructive",
                    title: "ব্যর্থ",
                    description: "এই দোকানটি ইতিমধ্যে তালিকায় রয়েছে।",
                });
            }
        }
    }


    return (
        <form onSubmit={handleAddNewDue}>
            <div className="grid gap-4 py-4 px-1 max-h-[70vh] overflow-y-auto">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="shopName">দোকানের নাম</Label>
                        <div className="flex items-center">
                            <Dialog open={isAddShopDialogOpen} onOpenChange={setIsAddShopDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>নতুন দোকান যোগ করুন</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-shop-name">দোকানের নাম</Label>
                                        <Input
                                            id="new-shop-name"
                                            value={newShopName}
                                            onChange={(e) => setNewShopName(e.target.value)}
                                            placeholder="করিম স্টোর"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleAddNewShop}>সংরক্ষণ করুন</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Dialog open={isDeleteShopDialogOpen} onOpenChange={setIsDeleteShopDialogOpen}>
                                <DialogTrigger asChild>
                                     <Button variant="ghost" size="icon" className="h-7 w-7">
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>দোকানের তালিকা পরিচালনা করুন</DialogTitle>
                                        <DialogDescription>তালিকা থেকে দোকান মুছে ফেলুন।</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {shops.map(shop => (
                                            <div key={shop} className="flex items-center justify-between p-2 border rounded-md">
                                                <span>{shop}</span>
                                                <Button variant="ghost" size="icon" onClick={() => removeShop(shop)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                     <Select name="shopName" required disabled={shops.length === 0}>
                        <SelectTrigger>
                            <SelectValue placeholder={shops.length > 0 ? "একটি দোকান নির্বাচন করুন" : "প্রথমে একটি দোকান যোগ করুন"} />
                        </SelectTrigger>
                        <SelectContent>
                            {shops.map(shop => <SelectItem key={shop} value={shop}>{shop}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="amount">পরিমাণ</Label>
                    <Input id="amount" name="amount" type="number" placeholder="500" required />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="due-date">বাকির তারিখ</Label>
                    <Input id="due-date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="description">বিবরণ</Label>
                    <Textarea id="description" name="description" placeholder="বাকি সম্পর্কিত কোনো নোট" />
                </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'প্রসেসিং...' : 'সংরক্ষণ করুন'}
              </Button>
            </DialogFooter>
        </form>
    );
}

