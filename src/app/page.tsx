import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookMarked, ShieldCheck, FileText, TrendingUp, TrendingDown, HandCoins, Store, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: "আয়ের হিসাব",
    description: "আপনার সকল আয়ের উৎস এবং পরিমাণ নির্ভুলভাবে রেকর্ড করুন।",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: <TrendingDown className="h-8 w-8 text-red-500" />,
    title: "ব্যয়ের হিসাব",
    description: "প্রতিদিনের ছোট-বড় সকল ব্যয়ের হিসাব রাখুন ক্যাটাগরি অনুযায়ী।",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  {
    icon: <HandCoins className="h-8 w-8 text-yellow-500" />,
    title: "ধারের হিসাব",
    description: "কারও থেকে টাকা ধার নিলে বা কাউকে দিলে, তার হিসাব সহজেই রাখুন।",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  {
    icon: <Store className="h-8 w-8 text-purple-500" />,
    title: "দোকান বাকি",
    description: "বিভিন্ন দোকানে আপনার বাকির হিসাব এক জায়গায় গুছিয়ে রাখুন।",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    icon: <Award className="h-8 w-8 text-green-500" />,
    title: "রিওয়ার্ড সিস্টেম",
    description: "প্রতিদিন অ্যাপ ব্যবহার করে এবং মাইলফলক অর্জন করে পয়েন্ট জমান।",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  {
    icon: <BookMarked className="h-8 w-8 text-indigo-500" />,
    title: "মাসিক রিপোর্ট",
    description: "মাস শেষে আপনার আয়-ব্যয়ের 상세 রিপোর্ট দেখুন এবং বিশ্লেষণ করুন।",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
  },
];


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BookMarked className="h-8 w-8 text-primary" />
            <span className="font-bold text-lg">হিসাব খাতা</span>
          </div>
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
          <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"><div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)]"></div></div>
          <div className="container grid place-items-center gap-6 py-20 text-center sm:py-32">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-br from-primary to-slate-600 dark:to-slate-300 bg-clip-text text-transparent">
              আপনার আর্থিক ব্যবস্থাপনার সহজ সমাধান
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              "হিসাব খাতা" দিয়ে আপনার ব্যক্তিগত আয়-ব্যয়ের হিসাব রাখুন স্মার্ট এবং আধুনিক উপায়ে। আপনার আর্থিক জীবনের উপর সম্পূর্ণ নিয়ন্ত্রণ নিন।
            </p>
            <div className="mt-6 flex gap-4">
              <Button asChild size="lg">
                <Link href="/register">আজই শুরু করুন</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#features">ফিচারগুলো দেখুন</Link>
              </Button>
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
              <Card key={feature.title} className="text-center transition-transform hover:scale-105 hover:shadow-lg relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent group-hover:from-primary/10 transition-all duration-300"></div>
                 <div className="absolute top-0 right-0 h-16 w-16 bg-primary/10 rounded-bl-full"></div>
                <CardHeader>
                  <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${feature.bgColor} z-10`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="mt-4 z-10">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="z-10">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-secondary/50">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <BookMarked className="h-8 w-8 text-primary" />
                <span className="font-bold text-lg">হিসাব খাতা</span>
              </div>
              <p className="mt-4 text-muted-foreground">
                আপনার আর্থিক ব্যবস্থাপনার বিশ্বস্ত সঙ্গী।
              </p>
            </div>
            <div>
              <h4 className="font-semibold">গুরুত্বপূর্ণ লিঙ্ক</h4>
              <ul className="mt-4 flex space-x-4">
                <li><Link href="/#features" className="text-muted-foreground hover:text-primary">ফিচার</Link></li>
                <li><Link href="/login" className="text-muted-foreground hover:text-primary">লগইন</Link></li>
                <li><Link href="/register" className="text-muted-foreground hover:text-primary">রেজিস্ট্রেশন</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">আইনি</h4>
              <ul className="mt-4 flex space-x-4">
                <li><Link href="/terms-and-conditions" className="text-muted-foreground hover:text-primary">শর্তাবলী</Link></li>
                <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">গোপনীয়তা নীতি</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} হিসাব খাতা। সর্বসত্ত্ব সংরক্ষিত।</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
