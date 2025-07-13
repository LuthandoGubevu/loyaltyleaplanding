
"use client"

import { useSearchParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    LineChart,
    Line,
  } from "recharts"
import { getLoyaltyData } from "@/lib/mock-data";

const customerGrowthData = [
    { month: "Jan", new: 40, total: 240 },
    { month: "Feb", new: 30, total: 270 },
    { month: "Mar", new: 20, total: 290 },
    { month: "Apr", new: 27, total: 317 },
    { month: "May", new: 18, total: 335 },
    { month: "Jun", new: 23, total: 358 },
    { month: "Jul", new: 34, total: 392 },
];

const pointsData = [
      { name: 'Jan', issued: 4000, redeemed: 2400 },
      { name: 'Feb', issued: 3000, redeemed: 1398 },
      { name: 'Mar', issued: 5000, redeemed: 6800 },
      { name: 'Apr', issued: 2780, redeemed: 3908 },
      { name: 'May', issued: 1890, redeemed: 4800 },
      { name: 'Jun', issued: 2390, redeemed: 3800 },
      { name: 'Jul', issued: 3490, redeemed: 4300 },
];

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('storeId');
  const currentStore = storeId ? getLoyaltyData().stores.find(s => s.id === storeId) : null;
  
  // This is where you would fetch/filter data based on storeId
  // For now, we'll just display the same data but modify titles
  const displayedCustomerGrowthData = customerGrowthData; // Replace with filtered data
  const displayedPointsData = pointsData; // Replace with filtered data

  return (
    <div className="grid gap-4 md:gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Customer Growth {currentStore ? `at ${currentStore.name}` : ''}</CardTitle>
                <CardDescription>New vs. Total Customers</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displayedCustomerGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="new" name="New Customers" stroke="hsl(var(--primary))" activeDot={{ r: 8 }}/>
                    <Line yAxisId="right" type="monotone" dataKey="total" name="Total Customers" stroke="hsl(var(--accent))" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle>Points Activity {currentStore ? `at ${currentStore.name}` : ''}</CardTitle>
                <CardDescription>Points Issued vs. Redeemed</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayedPointsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="issued" name="Points Issued" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="redeemed" name="Points Redeemed" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    </div>
  );
}
