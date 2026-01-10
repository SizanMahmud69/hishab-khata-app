

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookMarked, ShieldCheck, TrendingUp, TrendingDown, HandCoins, Award, Users, Crown, MoveRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdBanner } from '@/components/ad-banner';

const features = [
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: "আয়-ব্যয়ের হিসাব",
    description: "আপনার সকল আয় এবং ব্যয়ের উৎস ও পরিমাণ নির্ভুলভাবে রেকর্ড করুন, ক্যাটাগরি অনুযায়ী বিশ্লেষণ করুন।",
  },
  {
    icon: <HandCoins className="h-8 w-8 text-yellow-500" />,
    title: "সকল ধারের হিসাব",
    description: "কাউকে টাকা ধার দিলে বা নিলে এবং দোকানের বাকি থাকলে, তার পুঙ্খানুপুঙ্খ হিসাব সহজেই রাখুন।",
  },
   {
    icon: <Users className="h-8 w-8 text-indigo-500" />,
    title: "রেফার ও আয়",
    description: "আপনার বন্ধুদের অ্যাপে আমন্ত্রণ জানিয়ে আকর্ষণীয় বোনাস পয়েন্ট অর্জন করুন এবং আয় করুন।",
  },
  {
    icon: <Award className="h-8 w-8 text-green-500" />,
    title: "রিওয়ার্ড ও চেক-ইন",
    description: "প্রতিদিন অ্যাপ ব্যবহার করে, চেক-ইন করে এবং মাইলফলক অর্জন করে মূল্যবান রিওয়ার্ড পয়েন্ট জমান।",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-blue-500" />,
    title: "NID ভেরিফিকেশন",
    description: "আপনার অ্যাকাউন্ট সুরক্ষিত রাখতে এবং বিশ্বাসযোগ্যতা বাড়াতে এনআইডি ভেরিফিকেশন সম্পন্ন করুন।",
  },
  {
    icon: <Crown className="h-8 w-8 text-purple-500" />,
    title: "প্রিমিয়াম সাবস্ক্রিপশন",
    description: "বিজ্ঞাপন-মুক্ত অভিজ্ঞতা এবং বিশেষ ফিচার পেতে প্রিমিয়াম প্ল্যানে আপগ্রেড করুন।",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-blue-500 to-green-500">
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-gradient-to-r from-blue-400 to-green-400 text-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BookMarked className="h-8 w-8" />
            <span className="font-bold text-lg">হিসাব খাতা</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hover:bg-white/20">
              <Link href="/login">লগইন</Link>
            </Button>
            <Button asChild className="bg-white text-primary hover:bg-white/90">
              <Link href="/register">নিবন্ধন করুন</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
             <div aria-hidden="true" className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20">
                <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-400 dark:from-blue-700"></div>
                <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-300 dark:to-indigo-600"></div>
            </div>
          <div className="container grid lg:grid-cols-1 items-center gap-12 py-20">
            <div className='text-center lg:text-center'>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent">
                  আপনার আর্থিক ব্যবস্থাপনার সহজ সমাধান
                </h1>
                <p className="mt-6 max-w-2xl text-lg text-blue-100 mx-auto">
                  "হিসাব খাতা" দিয়ে আপনার ব্যক্তিগত আয়-ব্যয়ের হিসাব রাখুন স্মার্ট এবং আধুনিক উপায়ে। আপনার আর্থিক জীবনের উপর সম্পূর্ণ নিয়ন্ত্রণ নিন।
                </p>
                <div className="mt-8 flex justify-center lg:justify-center gap-4">
                  <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                    <Link href="/register">আজই শুরু করুন <MoveRight className='ml-2 h-5 w-5'/></Link>
                  </Button>
                </div>
            </div>
          </div>
        </section>

        <div className="container pb-12">
            <AdBanner page="landing" />
        </div>

        {/* Features Section */}
        <section id="features" className="container py-20">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">কেন হিসাব খাতা সেরা?</h2>
            <p className="mt-4 text-lg text-blue-100">
              আমরা আপনার প্রতিদিনের আর্থিক জীবনকে সহজ করার জন্য প্রয়োজনীয় সকল ফিচার একত্রিত করেছি।
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center transition-all duration-300 hover:scale-105 hover:shadow-xl relative overflow-hidden group border-transparent hover:border-primary/50">
                 <div className="absolute inset-0 bg-gradient-to-br from-card to-muted/30 group-hover:from-primary/5 transition-all duration-300"></div>
                <CardHeader className='relative z-10'>
                   <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-white/20 bg-gradient-to-r from-blue-400 to-green-400 text-white">
        <div className="container mx-auto flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:justify-between">
            <p className='text-[10px] sm:text-xs text-blue-100'>
                &copy; {new Date().getFullYear()} <span className='font-bold'>হিসাব খাতা</span>. All rights reserved.
            </p>
            <p className='text-[10px] sm:text-xs text-blue-100 whitespace-nowrap'>
                Developer: <span className="font-semibold">Sizan Mahmud</span> & Designer: <span className="font-semibold">Black Dimond</span>
            </p>
        </div>
      </footer>
    </div>
  );
}
