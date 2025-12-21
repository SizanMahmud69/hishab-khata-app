import { OverviewCards } from "@/components/overview-cards"
import { OverviewChart } from "@/components/overview-chart"
import { RecentTransactions } from "@/components/recent-transactions"
import { Card } from "@/components/ui/card"
import { OverviewPieChart } from "@/components/overview-pie-chart"

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCards />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
            <OverviewChart />
        </div>
        <div>
            <OverviewPieChart />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <RecentTransactions />
      </div>
    </div>
  )
}
