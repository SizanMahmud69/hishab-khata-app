
"use client";

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";

export default function PointIncomePage() {
    return (
        <div className="flex-1 space-y-6">
            <PageHeader title="পয়েন্ট ইনকাম" description="এই ফিচারটি এখন আর উপলব্ধ নেই।" />
            
            <Card className="border-destructive bg-destructive/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <XCircle />
                        ফিচারটি বন্ধ আছে
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        বিজ্ঞাপন দেখে পয়েন্ট অর্জনের এই সুবিধাটি সাময়িকভাবে বন্ধ রাখা হয়েছে। আমরা এই ফিচারটি উন্নত করে ভবিষ্যতে আবার চালু করার পরিকল্পনা করছি। আপনার সাময়িক অসুবিধার জন্য আমরা দুঃখিত।
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
