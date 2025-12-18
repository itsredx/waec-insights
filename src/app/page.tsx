"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

import { useEffect, useState } from "react"
import { api, DashboardData } from "@/lib/api"
import { Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

// Chart Configs (Keeping these static as they are presentational)
// Mock data removed in favor of API data types


const genderChartConfig = {
  Male: {
    label: "Male",
    color: "hsl(var(--chart-1))",
  },
  Female: {
    label: "Female",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const schoolChartConfig = {
  Public: {
    label: "Public",
    color: "hsl(var(--chart-1))",
  },
  Private: {
    label: "Private",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const subjectChartConfig = {
  English: {
    label: "English",
    color: "hsl(var(--chart-1))",
  },
  Math: {
    label: "Math",
    color: "hsl(var(--chart-2))",
  },
  Both: {
    label: "Both (Eng + Math)",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;


function KpiCard({ title, value, change }: { title: string, value: string, change: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const dashboardData = await api.getDashboardData();
        setData(dashboardData);
      } catch (err) {
        setError("Failed to load dashboard data. Please make sure the API is running.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-destructive">
        <p className="text-lg font-semibold">{error || "No data available"}</p>
        <p className="text-sm text-muted-foreground p-4">Is the backend running on port 8000?</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">WAEC Performance Overview</h1>
        <p className="text-muted-foreground">Key insights from 2016-2021</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Total Students (2021)" value="45,203" change="+12% from 2020" />
        <KpiCard title="Avg. Pass Rate" value="46.5%" change="+2.1% from 2020" />
        <KpiCard title="Top Performing" value="Private / Female" change="Consistent Leader" />
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">

        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Public vs Private School Pass Rates</CardTitle>
            <CardDescription>Pass percentage comparison (2016-2021)</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={schoolChartConfig} className="h-[300px] w-full">
              <ResponsiveContainer>
                <BarChart data={data.school_performance} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `${value}%`} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Legend />
                  <Bar dataKey="Public" fill="var(--color-Public)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Private" fill="var(--color-Private)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Gender Performance Trend</CardTitle>
            <CardDescription>Pass percentage comparison (2016-2021)</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={genderChartConfig} className="h-[300px] w-full">
              <ResponsiveContainer>
                <LineChart data={data.gender_trend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `${value}%`} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Male" stroke="var(--color-Male)" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="Female" stroke="var(--color-Female)" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Subject Breakdown: English vs Math vs Both</CardTitle>
            <CardDescription>Number of students passed (2016-2021)</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={subjectChartConfig} className="h-[300px] w-full">
              <ResponsiveContainer>
                <BarChart data={data.subject_performance} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Legend />
                  <Bar dataKey="English" fill="var(--color-English)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Math" fill="var(--color-Math)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Both" fill="var(--color-Both)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>


      </div>
    </div>
  )
}
