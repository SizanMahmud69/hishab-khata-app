import { OverviewCards } from "@/components/overview-cards"
import { OverviewPieChart } from "@/components/overview-pie-chart"
import { RecentTransactions } from "@/components/recent-transactions"

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <OverviewCards />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <OverviewPieChart />
        <RecentTransactions />
      </div>
    </div>
  )
}
