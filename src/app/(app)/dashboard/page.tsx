import { OverviewCards } from "@/components/overview-cards"
import { OverviewPieChart } from "@/components/overview-pie-chart"
import { RecentTransactions } from "@/components/recent-transactions"
import { OverviewChart } from "@/components/overview-chart"
import { Card } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <OverviewCards />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
            <OverviewChart />
        </Card>
        <Card className="col-span-4 lg:col-span-3">
            <RecentTransactions />
        </Card>
      </div>
    </div>
  )
}
