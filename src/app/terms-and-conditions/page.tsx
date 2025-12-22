import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function TermsAndConditionsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">ব্যবহারের শর্তাবলী</h1>
          <p className="mt-4 text-muted-foreground">সর্বশেষ আপডেট: {new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose prose-lg mt-8 max-w-none dark:prose-invert">
            <p>"হিসাব খাতা" অ্যাপে আপনাকে স্বাগতম। আমাদের অ্যাপ ব্যবহার করার আগে, অনুগ্রহ করে এই শর্তাবলী মনোযোগ সহকারে পড়ুন।</p>

            <h2 className="mt-8 text-2xl font-semibold">১. পরিষেবার স্বীকৃতি</h2>
            <p>এই অ্যাপটি ব্যবহার করার মাধ্যমে, আপনি এই ব্যবহারের শর্তাবলী এবং আমাদের গোপনীয়তা নীতি মেনে চলতে সম্মত হচ্ছেন। আপনি যদি এই শর্তাবলীর কোনো অংশের সাথে একমত না হন, তাহলে অনুগ্রহ করে অ্যাপটি ব্যবহার করবেন না।</p>

            <h2 className="mt-8 text-2xl font-semibold">২. ব্যবহারকারীর অ্যাকাউন্ট</h2>
            <p>অ্যাপের সম্পূর্ণ সুবিধা পেতে আপনাকে একটি অ্যাকাউন্ট তৈরি করতে হবে। আপনার অ্যাকাউন্টের তথ্যের গোপনীয়তা রক্ষা করার দায়িত্ব আপনার। আপনার অ্যাকাউন্ট থেকে সংঘটিত যেকোনো কার্যকলাপের জন্য আপনি দায়ী থাকবেন।</p>

            <h2 className="mt-8 text-2xl font-semibold">৩. অ্যাপের ব্যবহার</h2>
            <p>আপনি согласен যে আপনি অ্যাপটি শুধুমাত্র বৈধ উদ্দেশ্যে ব্যবহার করবেন। কোনো ধরনের অবৈধ, প্রতারণামূলক, বা ক্ষতিকারক কার্যকলাপের জন্য অ্যাপটি ব্যবহার করা কঠোরভাবে নিষিদ্ধ।</p>
            <p>আপনি আপনার নিজের আর্থিক তথ্যের নির্ভুলতার জন্য দায়ী। অ্যাপটি শুধুমাত্র একটি হিসাব রাখার টুল এবং কোনো আর্থিক পরামর্শ প্রদান করে না।</p>

            <h2 className="mt-8 text-2xl font-semibold">৪. মেধা স্বত্ব</h2>
            <p>অ্যাপটির ডিজাইন, লোগো, কোড এবং বিষয়বস্তু সহ 모든 মেধা স্বত্ব "হিসাব খাতা"-এর মালিকানাধীন। আমাদের লিখিত অনুমতি ছাড়া এর কোনো অংশ复制, বিতরণ, বা পরিবর্তন করা যাবে না।</p>

            <h2 className="mt-8 text-2xl font-semibold">৫. পরিষেবার সীমাবদ্ধতা</h2>
            <p>আমরা কোনো গ্যারান্টি দিচ্ছি না যে অ্যাপটি সর্বদা নিরবচ্ছিন্ন বা ত্রুটিমুক্ত থাকবে। আমরা পূর্ব اطلاع ছাড়াই যেকোনো সময় অ্যাপের পরিষেবা পরিবর্তন, স্থগিত বা বন্ধ করার অধিকার রাখি।</p>

            <h2 className="mt-8 text-2xl font-semibold">৬. দায়মুক্তি</h2>
            <p>অ্যাপটি ব্যবহার করার ফলে আপনার কোনো প্রত্যক্ষ বা পরোক্ষ ক্ষতির জন্য "হিসাব খাতা" দায়ী থাকবে না। তথ্যের हानि বা व्यावसायिक ক্ষতির ক্ষেত্রেও এটি প্রযোজ্য।</p>
            
            <h2 className="mt-8 text-2xl font-semibold">৭. শর্তাবলীর পরিবর্তন</h2>
            <p>আমরা সময়ে সময়ে এই শর্তাবলী পরিবর্তন করার অধিকার রাখি। যেকোনো পরিবর্তনের পর অ্যাপটি ব্যবহার চালিয়ে গেলে, আপনি নতুন শর্তাবলী মেনে নিয়েছেন বলে গণ্য হবে।</p>

            <h2 className="mt-8 text-2xl font-semibold">৮. যোগাযোগ</h2>
            <p>এই শর্তাবলী সম্পর্কে আপনার কোনো প্রশ্ন থাকলে, অনুগ্রহ করে আমাদের সাথে [যোগাযোগের ইমেল] এ যোগাযোগ করুন।</p>
          </div>
        </div>
      </main>
    </div>
  )
}
