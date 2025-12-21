import PageHeader from "@/components/page-header"
import { Gift } from "lucide-react"

export default function RewardsPage() {
  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="রেওয়ার্ড" description="আপনার অর্জিত রেওয়ার্ড এবং পয়েন্ট দেখুন।" />
      <div className="flex flex-col items-center justify-center h-96 border rounded-lg bg-card text-card-foreground shadow-sm">
        <Gift className="w-16 h-16 text-primary mb-4" />
        <p className="text-muted-foreground">এখানে আপনার রেওয়ার্ড পয়েন্ট দেখানো হবে।</p>
        <p className="text-sm text-muted-foreground">শীঘ্রই আসছে!</p>
      </div>
    </div>
  )
}
