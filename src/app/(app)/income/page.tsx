"use client";

import React from "react";
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/page-header"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useBudget } from "@/context/budget-context";
import { useToast } from "@/hooks/use-toast";

export default function IncomePage() {
    const { addIncome } = useBudget();
    const { toast } = useToast();
    const formRef = React.useRef<HTMLFormElement>(null);
    
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const source = formData.get('source') as string;
        const amount = parseFloat(formData.get('amount') as string);
        const date = formData.get('date') as string;

        if (!source || !amount || !date) {
            toast({
                variant: "destructive",
                title: "ফর্ম পূরণ আবশ্যক",
                description: "অনুগ্রহ করে সকল তথ্য পূরণ করুন।",
            });
            return;
        }

        const newIncome = {
            source,
            amount,
            date,
        };

        addIncome(newIncome);

        toast({
            title: "সফল!",
            description: "আপনার নতুন আয় সফলভাবে যোগ করা হয়েছে।",
        });

        formRef.current?.reset();
    }

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="নতুন আয় যোগ করুন" description="আপনার আয়ের উৎস, পরিমাণ এবং তারিখ লিখুন।" />
      
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} ref={formRef}>
            <CardHeader>
              <CardTitle>আয়ের তথ্য</CardTitle>
              <CardDescription>
                অনুগ্রহ করে নিচের ফর্মটি পূরণ করুন।
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="source" className="text-right">
                  উৎস
                </Label>
                <Input id="source" name="source" placeholder="মাসিক বেতন" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  পরিমাণ
                </Label>
                <Input id="amount" name="amount" type="number" placeholder="50000" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  তারিখ
                </Label>
                <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="col-span-3" />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">সংরক্ষণ করুন</Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  )
}
