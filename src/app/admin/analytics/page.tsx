
"use client"

import { Suspense } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';

// Initial empty state for charts
const customerGrowthData = [
    { month: "Jan", new: 0, total: 0 },
    { month: "Feb", new: 0, total: 0 },
    { month: "Mar", new: 0, total: 0 },
    { month: "Apr", new: 0, total: 0 },
    { month: "May", new: 0, total: 0 },
    { month: "Jun", new: 0, total: 0 },
    { month: "Jul", new: 0, total: 0 },
];

const pointsData = [
      { name: 'Jan', issued: 0, redeemed: 0 },
      { name: 'Feb', issued: 0, redeemed: 0 },
      { name: 'Mar', issued: 0, redeemed: 0 },
      { name: 'Apr', issued: 0, redeemed: 0 },
      { name: 'May', issued: 0, redeemed: 0 },
      { name: 'Jun', issued: 0, redeemed: 0 },
      { name: 'Jul', issued: 0, redeemed: 0 },
];

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('storeId');
  const loyaltyData = getLoyaltyData();
  const currentStore = storeId ? loyaltyData.stores.find(s => s.id === storeId) : null;
  
  // In a real app, you would fetch and filter data. For now, we show an empty state.
  const displayedCustomerGrowthData = customerGrowthData;
  const displayedPointsData = pointsData;

  return (
    <div className="grid gap-4 md:gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Customer Growth {currentStore ? `at ${currentStore.name}` : ''}</CardTitle>
                <CardDescription>New vs. Total Customers</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full">
                {loyaltyData.stores.length > 0 ? (
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
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        No analytics data to display yet.
                    </div>
                )}
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle>Points Activity {currentStore ? `at ${currentStore.name}` : ''}</CardTitle>
                <CardDescription>Points Issued vs. Redeemed</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full">
                {loyaltyData.stores.length > 0 ? (
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
                ) : (
                     <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        No points data to display yet.
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}

function AnalyticsSkeleton() {
    return (
        <div className="grid gap-4 md:gap-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[350px] w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[350px] w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

export default function AnalyticsPage() {
    return (
        <Suspense fallback={<AnalyticsSkeleton />}>
            <AnalyticsContent />
        </Suspense>
    )
}
