"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Cake, Gift, PartyPopper, QrCode, Store as StoreIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi, visitDate, type CustomerStore } from "@/components/customer/use-customer-data";
import { formatZaPhone } from "@/lib/phone";
import { apiFetch } from "@/lib/api-client";

function StoreCard({ store }: { store: CustomerStore }) {
  const target = store.nextReward ? store.stamps + store.nextReward.stampsToGo : store.rewards.at(-1)?.stampsRequired ?? 0;
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center gap-4 space-y-0">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <StoreIcon className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0">
          <CardTitle className="truncate text-lg">{store.name}</CardTitle>
          <CardDescription>{store.stamps} stamp{store.stamps === 1 ? "" : "s"} · last visit {visitDate(store.lastVisit)}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        {store.birthdayReward && (
          <Badge className="gap-1"><Cake className="h-3.5 w-3.5" />Birthday treat waiting: {store.birthdayReward}</Badge>
        )}
        {store.readyRewards.length > 0 && (
          <div className="flex items-start gap-2 rounded-md bg-primary/10 p-2 text-sm">
            <Gift className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span><span className="font-semibold">Ready to redeem:</span> {store.readyRewards.join(", ")}. Show staff at the till.</span>
          </div>
        )}
        {store.nextReward ? (
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>Next: {store.nextReward.name}</span>
              <span>{store.nextReward.stampsToGo} more</span>
            </div>
            <Progress value={target ? (store.stamps / target) * 100 : 0} aria-label={`${store.stamps} of ${target} stamps`} />
          </div>
        ) : store.rewards.length === 0 ? (
          <p className="text-xs text-muted-foreground">This shop hasn&apos;t set up rewards yet.</p>
        ) : null}
      </CardContent>
      <CardFooter className="justify-between">
        <Button asChild variant="outline" size="sm">
          <Link href={`/customer/store/${store.businessId}`}>View<ArrowRight className="ml-1.5 h-4 w-4" /></Link>
        </Button>
        <Button asChild size="icon">
          <Link href="/customer/scan" aria-label={`Scan at ${store.name}`}><QrCode className="h-5 w-5" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CustomerDashboardPage() {
  // Link first (shops that registered this number before sign-up), then load.
  const [linkedNow, setLinkedNow] = useState<string[] | null>(null);
  useEffect(() => {
    // Shops linked during sign-up are handed over by the signup page.
    let fromSignup: string[] = [];
    try {
      fromSignup = JSON.parse(sessionStorage.getItem("ll-linked-shops") ?? "[]");
      sessionStorage.removeItem("ll-linked-shops");
    } catch {}
    apiFetch<{ newlyLinked: string[] }>("/api/me/link", { method: "POST" })
      .then((r) => setLinkedNow([...new Set([...fromSignup, ...r.newlyLinked])]))
      .catch(() => setLinkedNow(fromSignup));
  }, []);
  const { data, error, loading } = useApi<{ phone: string | null; stores: CustomerStore[] }>(linkedNow ? "/api/me/stores" : null);

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
      {linkedNow && linkedNow.length > 0 && (
        <Alert className="border-primary">
          <PartyPopper className="h-4 w-4 text-primary" />
          <AlertTitle>Your account is connected</AlertTitle>
          <AlertDescription>
            We found your stamps at {linkedNow.join(", ")}. From now on, scan the QR code at the till to collect stamps with the app.
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Your shops</CardTitle>
          <CardDescription>
            Your stamps at every Loyalty Leap shop.
            {data?.phone && <> Your loyalty number is <span className="font-semibold text-foreground">{formatZaPhone(data.phone)}</span>. Give it at the till if you can&apos;t scan.</>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive"><AlertTitle>Could not load your shops</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
          ) : loading || !data ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>
          ) : data!.stores.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data!.stores.map((store) => <StoreCard key={store.businessId} store={store} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
              <StoreIcon className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-xl font-semibold">No shops yet</h3>
              <p className="mb-4 max-w-sm text-muted-foreground">
                Scan the QR code at the till of a Loyalty Leap shop to collect your first stamp.
              </p>
              <div className="flex gap-2">
                <Button asChild><Link href="/customer/scan"><QrCode className="mr-2 h-4 w-4" />Scan</Link></Button>
                <Button asChild variant="outline"><Link href="/customer/shops">Explore shops</Link></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
