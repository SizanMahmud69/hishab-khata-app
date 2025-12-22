import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Link href="/">
          <Button variant="ghost">
             <ArrowRight className="mr-2 h-4 w-4" />
            হোমপেজে ফিরে যান
          </Button>
        </Link>
      </header>
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl py-12 px-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">গোপনীয়তা নীতি</h1>
          <p className="mt-4 text-muted-foreground">সর্বশেষ আপডেট: {new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose prose-lg mt-8 max-w-none dark:prose-invert">
            <p>আমাদের "হিসাব খাতা" অ্যাপটি ব্যবহার করার জন্য আপনাকে ধন্যবাদ। আমরা আপনার গোপনীয়তাকে সম্মান করি এবং আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখতে প্রতিশ্রুতিবদ্ধ। এই নীতিটি ব্যাখ্যা করে যে আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত করি।</p>

            <h2 className="mt-8 text-2xl font-semibold">তথ্য সংগ্রহ</h2>
            <p>আমরা নিম্নলিখিত ধরনের তথ্য সংগ্রহ করি:</p>
            <ul>
              <li><strong>ব্যক্তিগত তথ্য:</strong> নিবন্ধনের সময় আপনার নাম, ইমেল ঠিকানা এবং পাসওয়ার্ড।</li>
              <li><strong>আর্থিক তথ্য:</strong> আপনার দ্বারা введен আয়, ব্যয়, ধার, বাকি এবং সঞ্চয়ের তথ্য। এই তথ্যগুলো আপনার ডিভাইসে এবং আমাদের সুরক্ষিত সার্ভারে সংরক্ষিত থাকে।</li>
              <li><strong>ব্যবহারের ডেটা:</strong> আপনি কীভাবে আমাদের অ্যাপ ব্যবহার করছেন, কোন ফিচারগুলো বেশি ব্যবহার করছেন, সে সম্পর্কিত বেনামী ডেটা।</li>
            </ul>

            <h2 className="mt-8 text-2xl font-semibold">তথ্যের ব্যবহার</h2>
            <p>আপনার তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহার করা হয়:</p>
            <ul>
              <li>আপনাকে আমাদের পরিষেবা সরবরাহ করতে এবং আপনার অ্যাকাউন্ট পরিচালনা করতে।</li>
              <li>আপনার আর্থিক লেনদেন প্রক্রিয়া করতে এবং রেকর্ড সংরক্ষণ করতে।</li>
              <li>আমাদের অ্যাপের পরিষেবা উন্নত করতে এবং নতুন ফিচার যুক্ত করতে।</li>
              <li>প্রয়োজনে আপনাকে গুরুত্বপূর্ণ নোটিফিকেশন বা আপডেট পাঠাতে।</li>
            </ul>

            <h2 className="mt-8 text-2xl font-semibold">তথ্য শেয়ারিং</h2>
            <p>আমরা আপনার অনুমতি ছাড়া কোনো তৃতীয় পক্ষের কাছে আপনার ব্যক্তিগত বা আর্থিক তথ্য বিক্রি বা ভাড়া দিই না। তবে, নিম্নলিখিত ক্ষেত্রে তথ্য শেয়ার করা হতে পারে:</p>
            <ul>
              <li>আইনি প্রয়োজনে বা আদালতের আদেশ অনুযায়ী।</li>
              <li>আমাদের পরিষেবা প্রদানকারী, যারা আমাদের অ্যাপ পরিচালনা করতে সহায়তা করে (যেমন, সার্ভার হোস্টিং), কিন্তু তারা কঠোর গোপনীয়তা চুক্তির অধীনে থাকে।</li>
            </ul>

            <h2 className="mt-8 text-2xl font-semibold">তথ্যের সুরক্ষা</h2>
            <p>আপনার তথ্যের সুরক্ষা আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ। আমরা আপনার ডেটা সুরক্ষিত রাখতে ইন্ডাস্ট্রি-স্ট্যান্ডার্ড এনক্রিপশন এবং সুরক্ষা ব্যবস্থা ব্যবহার করি।</p>

            <h2 className="mt-8 text-2xl font-semibold">আপনার অধিকার</h2>
            <p>আপনার নিজের তথ্য দেখার, সম্পাদনা করার বা মুছে ফেলার অধিকার রয়েছে। আপনি অ্যাপের প্রোফাইল সেকশন থেকে এটি করতে পারেন।</p>

            <h2 className="mt-8 text-2xl font-semibold">নীতিমালার পরিবর্তন</h2>
            <p>আমরা সময়ে সময়ে এই গোপনীয়তা নীতি আপডেট করতে পারি। যেকোনো পরিবর্তনের বিষয়ে আপনাকে অ্যাপের মাধ্যমে বা ইমেলের মাধ্যমে জানানো হবে।</p>

            <h2 className="mt-8 text-2xl font-semibold">যোগাযোগ</h2>
            <p>এই গোপনীয়তা নীতি সম্পর্কে আপনার কোনো প্রশ্ন থাকলে, অনুগ্রহ করে আমাদের সাথে [যোগাযোগের ইমেল] এ যোগাযোগ করুন।</p>
          </div>
        </div>
      </main>
    </div>
  )
}
