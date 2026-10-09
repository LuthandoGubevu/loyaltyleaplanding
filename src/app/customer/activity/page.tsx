"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { activityLabel, useApi, type ActivityEntry } from "@/components/customer/use-customer-data";

function ActivityContent() {
  const storeId = useSearchParams().get("storeId");
  const path = storeId ? `/api/me/activity?businessId=${encodeURIComponent(storeId)}` : "/api/me/activity";
  const { data, error, loading } = useApi<{ activity: ActivityEntry[] }>(path);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Your stamps and rewards across your shops.</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive"><AlertTitle>Could not load activity</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Shop</TableHead><TableHead>Activity</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={3}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ) : data!.activity.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No activity yet.</TableCell></TableRow>
              ) : data!.activity.map((e, i) => (
                <TableRow key={`${e.at}-${i}`}>
                  <TableCell>{new Date(e.at).toLocaleString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell>{e.shop}</TableCell>
                  <TableCell>{activityLabel(e)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default function ActivityPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <ActivityContent />
    </Suspense>
  );
}
