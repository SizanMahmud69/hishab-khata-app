import PageHeader from "@/components/page-header"

export default function HistoryPage() {
  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="হিস্টোরি" description="আপনার সকল লেনদেনের ইতিহাস দেখুন।" />
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">এখানে আপনার সকল লেনদেনের রেকর্ড দেখানো হবে।</p>
      </div>
    </div>
  )
}
