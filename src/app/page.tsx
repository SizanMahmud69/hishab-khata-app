import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookMarked, ShieldCheck, FileText, TrendingUp, TrendingDown, HandCoins, Store, Award, MoveRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: "আয়ের হিসাব",
    description: "আপনার সকল আয়ের উৎস এবং পরিমাণ নির্ভুলভাবে রেকর্ড করুন।",
  },
  {
    icon: <TrendingDown className="h-8 w-8 text-red-500" />,
    title: "ব্যয়ের হিসাব",
    description: "প্রতিদিনের ছোট-বড় সকল ব্যয়ের হিসাব রাখুন ক্যাটাগরি অনুযায়ী।",
  },
  {
    icon: <HandCoins className="h-8 w-8 text-yellow-500" />,
    title: "ধারের হিসাব",
    description: "কারও থেকে টাকা ধার নিলে বা কাউকে দিলে, তার হিসাব সহজেই রাখুন।",
  },
  {
    icon: <Store className="h-8 w-8 text-purple-500" />,
    title: "দোকান বাকি",
    description: "বিভিন্ন দোকানে আপনার বাকির হিসাব এক জায়গায় গুছিয়ে রাখুন।",
  },
  {
    icon: <Award className="h-8 w-8 text-green-500" />,
    title: "রিওয়ার্ড সিস্টেম",
    description: "প্রতিদিন অ্যাপ ব্যবহার করে এবং মাইলফলক অর্জন করে পয়েন্ট জমান।",
  },
  {
    icon: <BookMarked className="h-8 w-8 text-indigo-500" />,
    title: "মাসিক রিপোর্ট",
    description: "মাস শেষে আপনার আয়-ব্যয়ের 상세 রিপোর্ট দেখুন এবং বিশ্লেষণ করুন।",
  },
];

const landingPageImage = PlaceHolderImages.find(p => p.id === 'finance-app-dashboard');


export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BookMarked className="h-8 w-8 text-primary" />
            <span className="font-bold text-lg">হিসাব খাতা</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">লগইন</Link>
            </Button>
            <Button asChild>
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
          <div className="container grid lg:grid-cols-2 items-center gap-12 py-20 lg:py-32">
            <div className='text-center lg:text-left'>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  আপনার আর্থিক ব্যবস্থাপনার সহজ সমাধান
                </h1>
                <p className="mt-6 max-w-2xl text-lg text-muted-foreground mx-auto lg:mx-0">
                  "হিসাব খাতা" দিয়ে আপনার ব্যক্তিগত আয়-ব্যয়ের হিসাব রাখুন স্মার্ট এবং আধুনিক উপায়ে। আপনার আর্থিক জীবনের উপর সম্পূর্ণ নিয়ন্ত্রণ নিন।
                </p>
                <div className="mt-8 flex justify-center lg:justify-start gap-4">
                  <Button asChild size="lg">
                    <Link href="/register">আজই শুরু করুন <MoveRight className='ml-2 h-5 w-5'/></Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="#features">ফিচারগুলো দেখুন</Link>
                  </Button>
                </div>
            </div>
             <div className="hidden lg:block">
             {landingPageImage && (
              <Image 
                src={landingPageImage.imageUrl}
                alt="হিসাব খাতা অ্যাপ ড্যাশবোর্ড"
                width={600}
                height={500}
                className="rounded-lg shadow-2xl"
                data-ai-hint={landingPageImage.imageHint}
              />
            )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-20">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">কেন হিসাব খাতা সেরা?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
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

    </div>
  );
}
