
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import PageHeader from '@/components/page-header';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AdBanner } from '@/components/ad-banner';

function MilestoneContent() {
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount');
  const { width, height } = useWindowSize();

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const milestoneAmount = amount ? parseInt(amount, 10) : 0;

  return (
    <>
      {width && height && <Confetti width={width} height={height} recycle={false} />}
      <div className="flex-1 space-y-4">
        <PageHeader
          title="মাইলফলক অর্জন"
          description="আপনার সঞ্চয়ের যাত্রায় একটি নতুন সাফল্য!"
        />
        <Card className="max-w-2xl mx-auto text-center overflow-hidden border-yellow-400 shadow-lg shadow-yellow-400/20">
          <CardHeader className="bg-gradient-to-b from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-900/10 p-10">
             <Trophy className="w-24 h-24 text-yellow-500 mx-auto drop-shadow-lg" />
          </CardHeader>
          <CardContent className="p-8">
            <CardTitle className="text-3xl font-bold text-primary">অভিনন্দন!</CardTitle>
            <CardDescription className="text-lg mt-2">
              আপনি সফলভাবে <span className="font-bold text-primary">{formatCurrency(milestoneAmount)}</span> সঞ্চয়ের মাইলফলক অর্জন করেছেন!
            </CardDescription>
            <p className="text-muted-foreground mt-4">
              আপনার এই অসাধারণ সাফল্যকে আমরা সাধুবাদ জানাই। আপনার সঞ্চয়ের এই ধারাবাহিকতা আপনাকে আর্থিক স্বাধীনতার পথে আরও এক ধাপ এগিয়ে নিয়ে গেল।
            </p>
            <Button asChild className="mt-8">
                <Link href="/dashboard">ড্যাশবোর্ডে ফিরে যান</Link>
            </Button>
          </CardContent>
        </Card>
        <div className="max-w-2xl mx-auto pt-4">
            <AdBanner page="milestone" />
        </div>
      </div>
    </>
  );
}


export default function MilestonePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MilestoneContent />
        </Suspense>
    )
}
