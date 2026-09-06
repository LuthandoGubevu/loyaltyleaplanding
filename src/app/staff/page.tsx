
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { getBusinesses, getDemoRequests, type BusinessWithId, type DemoRequestWithId } from "@/lib/firebase/firestore";
import { startOfWeek, subWeeks, isWithinInterval, addWeeks, format } from "date-fns";

function buildWeeklyBuckets(dates: Date[]) {
  const now = new Date();
  const weeks = Array.from({ length: 8 }, (_, i) => startOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 }));
  return weeks.map((weekStart) => {
    const weekEnd = addWeeks(weekStart, 1);
    const count = dates.filter((d) => isWithinInterval(d, { start: weekStart, end: weekEnd })).length;
    return { label: format(weekStart, "dd MMM"), count };
  });
}

export default function StaffOverviewPage() {
  const [businesses, setBusinesses] = useState<BusinessWithId[]>([]);
  const [demoRequests, setDemoRequests] = useState<DemoRequestWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [businessList, demoList] = await Promise.all([getBusinesses(), getDemoRequests()]);
      setBusinesses(businessList);
      setDemoRequests(demoList);
      setIsLoading(false);
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:gap-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-[350px] w-full" />
      </div>
    );
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = businesses.filter((b) => b.createdAt >= startOfMonth).length;
  const pendingBusinesses = businesses.filter((b) => b.status === 'pending');
  const chartData = buildWeeklyBuckets(businesses.map((b) => b.createdAt));

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">Loyalty Leap, at a glance</p>
        </div>
        <Button asChild>
          <Link href="/staff/companies">Add a company</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Demo requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoRequests.length} <span className="text-sm font-normal text-muted-foreground">total submitted</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Companies on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businesses.length} <span className="text-sm font-normal text-muted-foreground">companies</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>New companies this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newThisMonth} <span className="text-sm font-normal text-muted-foreground">signed up</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Awaiting admin signup</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBusinesses.length} <span className="text-sm font-normal text-muted-foreground">pending</span></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Companies onboarded, last 8 weeks</CardTitle>
            <CardDescription>{businesses.length} total</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" name="New companies" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingBusinesses.length > 0 ? (
              <ul className="space-y-3">
                {pendingBusinesses.map((b) => (
                  <li key={b.id} className="text-sm">
                    <Link href={`/staff/companies/${b.id}`} className="font-medium hover:underline">{b.name}</Link>
                    <p className="text-muted-foreground">Waiting for {b.assignedAdminEmail} to sign up</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nothing needs attention right now.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
