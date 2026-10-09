"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Cake, Gift, QrCode } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { activityLabel, useApi, visitDate, type ActivityEntry, type CustomerStore } from "@/components/customer/use-customer-data";

export default function StoreDetailPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const stores = useApi<{ stores: CustomerStore[] }>("/api/me/stores");
  const activity = useApi<{ activity: ActivityEntry[] }>(`/api/me/activity?businessId=${encodeURIComponent(storeId)}`);
  const store = stores.data?.stores.find((s) => s.businessId === storeId);

  if (stores.error) return <Alert variant="destructive"><AlertTitle>Could not load this shop</AlertTitle><AlertDescription>{stores.error}</AlertDescription></Alert>;
  if (stores.loading) return <Skeleton className="h-72 w-full" />;
  if (!store) {
    return (
      <Card>
        <CardHeader><CardTitle>Shop not found</CardTitle><CardDescription>You haven&apos;t collected stamps at this shop yet.</CardDescription></CardHeader>
        <CardContent><Button asChild variant="outline"><Link href="/customer/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to your shops</Link></Button></CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:gap-6">
      <Button asChild variant="ghost" className="w-fit"><Link href="/customer/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Your shops</Link></Button>
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-2xl">{store.name}</CardTitle>
            <CardDescription>{store.earnRule} · last visit {visitDate(store.lastVisit)}</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-4xl font-extrabold tabular-nums">{store.stamps}</p>
            <p className="text-sm text-muted-foreground">stamps</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {store.birthdayReward && (
            <Badge className="gap-1"><Cake className="h-3.5 w-3.5" />Happy birthday week! Ask for your {store.birthdayReward} at the till.</Badge>
          )}
          {store.rewards.length === 0 ? (
            <p className="text-sm text-muted-foreground">This shop hasn&apos;t set up rewards yet.</p>
          ) : store.rewards.map((r) => (
            <div key={r.id} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-medium"><Gift className="h-4 w-4 text-primary" />{r.name}</span>
                <span className="text-sm tabular-nums text-muted-foreground">{Math.min(store.stamps, r.stampsRequired)}/{r.stampsRequired}</span>
              </div>
              <Progress value={Math.min(100, (store.stamps / r.stampsRequired) * 100)} aria-label={`${r.name} progress`} />
              {r.eligible && <p className="mt-2 text-sm font-medium text-primary">Ready! Show staff at the till to redeem.</p>}
            </div>
          ))}
          <Button asChild><Link href="/customer/scan"><QrCode className="mr-2 h-4 w-4" />Scan for a stamp</Link></Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Your activity</CardTitle><CardDescription>Stamps and rewards at {store.name}.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Activity</TableHead></TableRow></TableHeader>
            <TableBody>
              {activity.loading ? (
                <TableRow><TableCell colSpan={2}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ) : (activity.data?.activity ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={2} className="text-muted-foreground">No activity yet.</TableCell></TableRow>
              ) : activity.data!.activity.map((e, i) => (
                <TableRow key={`${e.at}-${i}`}>
                  <TableCell>{new Date(e.at).toLocaleString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell>{activityLabel(e)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
