
"use client"

import { Pie, PieChart, Cell } from "recharts"
import { dailyExpenses, monthlyIncome } from "@/lib/data"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const totalIncome = monthlyIncome.reduce((sum, item) => sum + item.amount, 0)
const totalExpense = dailyExpenses.reduce((sum, item) => sum + item.amount, 0)
const balance = totalIncome - totalExpense > 0 ? totalIncome - totalExpense : 0;


const chartData = [
  { name: "আয়", value: totalIncome, fill: "hsl(var(--chart-1))" },
  { name: "ব্যয়", value: totalExpense, fill: "hsl(var(--destructive))" },
  { name: "বর্তমান ব্যালেন্স", value: balance, fill: "hsl(var(--chart-4))" },
]

const chartConfig = {
  value: {
    label: "BDT",
  },
  আয়: {
    label: "আয়",
    color: "hsl(var(--chart-1))",
  },
  ব্যয়: {
    label: "ব্যয়",
    color: "hsl(var(--destructive))",
  },
  "বর্তমান ব্যালেন্স": {
    label: "বর্তমান ব্যালেন্স",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function OverviewPieChart() {
    const total = chartData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>আয়-ব্যয়ের সারসংক্ষেপ</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[200px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={70}
              strokeWidth={2}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                  if (chartData[index].value === 0) return null
                  const RADIAN = Math.PI / 180
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                  const x = cx + radius * Math.cos(-midAngle * RADIAN)
                  const y = cy + radius * Math.sin(-midAngle * RADIAN)

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="white"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      className="text-xs font-bold"
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  )
              }}
              labelLine={false}
            >
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground mt-4">
            {chartData.map(item => (
                <div key={item.name} className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: item.fill }}></span>
                    {item.name}
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
