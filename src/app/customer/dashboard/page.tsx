
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLoyaltyData } from "@/lib/mock-data";
import { ArrowRight, QrCode, Store as StoreIcon } from "lucide-react";
import Link from "next/link";

export default function CustomerDashboardPage() {
  const loyaltyData = getLoyaltyData();

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Stores</CardTitle>
          <CardDescription>
            Here's a summary of your loyalty points across different stores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loyaltyData.stores.length > 0 ? (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loyaltyData.stores.map((store) => (
                <Card key={store.id} className="flex flex-col">
                  <CardHeader className="flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-lg border bg-muted-foreground/10 flex items-center justify-center">
                      <StoreIcon className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle>{store.name}</CardTitle>
                      <CardDescription>{store.points} Points</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="mb-2 text-xs text-muted-foreground">
                      Next Reward: {store.nextReward.title}
                    </div>
                    <Progress value={(store.points / store.nextReward.requiredPoints) * 100} />
                    <div className="mt-2 text-xs text-muted-foreground">
                      {store.nextReward.requiredPoints - store.points > 0
                        ? `${store.nextReward.requiredPoints - store.points} points to go`
                        : "Reward available!"}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                      <Button asChild variant="outline">
                          <Link href={`/customer/store/${store.id}`}>
                              View Store
                              <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                      </Button>
                      <Button asChild size="icon">
                          <Link href={`/customer/scan?storeId=${store.id}`}>
                            <QrCode className="h-5 w-5" />
                            <span className="sr-only">Scan for {store.name}</span>
                          </Link>
                      </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                <StoreIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No Stores Found</h3>
                <p className="text-muted-foreground mb-4">
                    You haven't joined any loyalty programs yet.
                </p>
                <Button asChild>
                    <Link href="/customer/shops">Explore Shops</Link>
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
