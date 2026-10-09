"use client";

import Link from "next/link";
import { Check, Store } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi, type Shop } from "@/components/customer/use-customer-data";

export default function ShopsPage() {
  const { data, error, loading } = useApi<{ shops: Shop[] }>("/api/shops");

  return (
    <div className="flex-1">
      <Card>
        <CardHeader>
          <CardTitle>Explore shops</CardTitle>
          <CardDescription>Loyalty Leap shops where you can collect stamps. Scan the QR code at their till, or give them your cellphone number.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive"><AlertTitle>Could not load shops</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
          ) : loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
          ) : data!.shops.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
              <Store className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-xl font-semibold">No shops yet</h3>
              <p className="text-muted-foreground">Shops will appear here once they join Loyalty Leap.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data!.shops.map((shop) => {
                const body = (
                  <Card className={shop.joined ? "h-full transition-colors hover:border-primary" : "h-full"}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="flex items-center gap-2 text-lg"><Store className="h-5 w-5 shrink-0 text-primary" />{shop.name}</CardTitle>
                        {shop.joined && <Badge variant="secondary" className="shrink-0 gap-1"><Check className="h-3 w-3" />Joined</Badge>}
                      </div>
                      <CardDescription>{shop.earnRule}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {shop.topReward ? `${shop.topReward.name} after ${shop.topReward.stampsRequired} stamps` : "Rewards coming soon"}
                    </CardContent>
                  </Card>
                );
                return shop.joined
                  ? <Link key={shop.businessId} href={`/customer/store/${shop.businessId}`}>{body}</Link>
                  : <div key={shop.businessId}>{body}</div>;
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
