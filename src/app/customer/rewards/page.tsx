'use client';

import Link from "next/link";
import { Cake, Gift } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi, type CustomerStore } from "@/components/customer/use-customer-data";

export default function RewardsPage() {
  const { data, error, loading } = useApi<{ stores: CustomerStore[] }>("/api/me/stores");

  const rows = (data?.stores ?? []).flatMap((s) => s.rewards.map((r) => ({ shop: s.name, businessId: s.businessId, stamps: s.stamps, ...r })))
    .sort((a, b) => Number(b.eligible) - Number(a.eligible) || (a.stampsRequired - a.stamps) - (b.stampsRequired - b.stamps));
  const birthdays = (data?.stores ?? []).filter((s) => s.birthdayReward);

  return (
    <div className="flex-1">
      <Card>
        <CardHeader>
          <CardTitle>Your rewards</CardTitle>
          <CardDescription>Rewards at the shops you visit. When one is ready, show staff at the till to redeem it.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {error ? (
            <Alert variant="destructive" className="sm:col-span-2 lg:col-span-3"><AlertTitle>Could not load rewards</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
          ) : loading ? (
            <><Skeleton className="h-36" /><Skeleton className="h-36" /></>
          ) : rows.length === 0 && birthdays.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center sm:col-span-2 lg:col-span-3">
              <Gift className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-xl font-semibold">No rewards yet</h3>
              <p className="mb-4 text-muted-foreground">Collect stamps at a Loyalty Leap shop to start earning rewards.</p>
              <Button asChild variant="outline"><Link href="/customer/shops">Explore shops</Link></Button>
            </div>
          ) : (
            <>
              {birthdays.map((s) => (
                <Card key={`bday-${s.businessId}`} className="border-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg"><Cake className="h-5 w-5 text-primary" />{s.birthdayReward}</CardTitle>
                    <CardDescription>{s.name} · your birthday week</CardDescription>
                  </CardHeader>
                  <CardContent><Badge>Ready: show staff at the till</Badge></CardContent>
                </Card>
              ))}
              {rows.map((r) => (
                <Card key={`${r.businessId}-${r.id}`} className={r.eligible ? "border-primary" : undefined}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg"><Gift className="h-5 w-5 text-primary" />{r.name}</CardTitle>
                    <CardDescription>{r.shop}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {r.eligible ? (
                      <Badge>Ready: show staff at the till</Badge>
                    ) : (
                      <>
                        <Progress value={(r.stamps / r.stampsRequired) * 100} aria-label={`${r.name} progress`} />
                        <p className="text-xs text-muted-foreground">{r.stamps}/{r.stampsRequired} stamps · {r.stampsRequired - r.stamps} more to go</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
