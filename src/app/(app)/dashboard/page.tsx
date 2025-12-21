import { OverviewCards } from "@/components/overview-cards"
import { OverviewChart } from "@/components/overview-chart"
import { RecentTransactions } from "@/components/recent-transactions"
import PageHeader from "@/components/page-header"

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="ড্যাশবোর্ড" description="আপনার আর্থিক কার্যকলাপের সারসংক্ষেপ।" />
      <div className="space-y-4">
        <OverviewCards />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <OverviewChart />
          </div>
          <div className="lg:col-span-3">
            <RecentTransactions />
          </div>
        </div>
      </div>
    </div>
  )
}
