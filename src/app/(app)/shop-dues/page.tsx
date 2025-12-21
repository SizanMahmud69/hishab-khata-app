import PageHeader from "@/components/page-header"

export default function ShopDuesPage() {
  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="দোকান বাকি" description="আপনার দোকানের বাকির হিসাব রাখুন।" />
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">এখানে আপনার দোকানের বাকির হিসাব দেখানো হবে।</p>
      </div>
    </div>
  )
}
