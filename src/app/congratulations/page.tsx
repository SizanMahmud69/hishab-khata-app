
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gift, Trophy } from 'lucide-react';
import PageHeader from '@/components/page-header';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { InterstitialAd } from '@/components/ad-banner';

function CongratulationsContent() {
  const searchParams = useSearchParams();
  const title = searchParams.get('title') || 'অভিনন্দন!';
  const description = searchParams.get('description') || 'আপনি একটি পুরস্কার জিতেছেন!';
  const points = searchParams.get('points');
  const { width, height } = useWindowSize();

  return (
    <>
      {width && height && <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />}
      <div className="flex-1 space-y-4">
        <PageHeader
          title={title}
          description="আপনার অর্জনের জন্য আমরা আনন্দিত!"
        />
        <Card className="max-w-2xl mx-auto text-center overflow-hidden border-yellow-400 shadow-lg shadow-yellow-400/20">
          <CardHeader className="bg-gradient-to-b from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-900/10 p-10">
             <Gift className="w-24 h-24 text-yellow-500 mx-auto drop-shadow-lg" />
          </CardHeader>
          <CardContent className="p-8">
            <CardTitle className="text-3xl font-bold text-primary">{title}</CardTitle>
            <CardDescription className="text-lg mt-2">
              {description}
            </CardDescription>
            {points && (
                 <p className="text-4xl font-bold text-primary mt-4">+{points} পয়েন্ট</p>
            )}
            <p className="text-muted-foreground mt-4">
              আপনার এই অসাধারণ সাফল্যকে আমরা সাধুবাদ জানাই। আপনার এই ধারাবাহিকতা আপনাকে আর্থিক স্বাধীনতার পথে আরও এক ধাপ এগিয়ে নিয়ে গেল।
            </p>
            <Button asChild className="mt-8">
                <Link href="/rewards">রিওয়ার্ড পেজে যান</Link>
            </Button>
          </CardContent>
        </Card>
        <div className="max-w-2xl mx-auto pt-4">
            <InterstitialAd />
        </div>
      </div>
    </>
  );
}


export default function CongratulationsPage() {
    return (
        <Suspense fallback={<div>লোড হচ্ছে...</div>}>
            <CongratulationsContent />
        </Suspense>
    )
}
