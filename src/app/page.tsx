import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookMarked } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-6 flex items-center justify-center">
          <BookMarked className="h-16 w-16 text-primary" />
        </div>
        <h1 className="font-headline text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          হিসাব খাতা
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
          আপনার ব্যক্তিগত আয়-ব্যয়ের হিসাব রাখার সহজ এবং আধুনিক সমাধান। আপনার আর্থিক জীবনের উপর সম্পূর্ণ নিয়ন্ত্রণ নিন।
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg">
            <Link href="/login">লগইন করুন</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">নিবন্ধন করুন</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
