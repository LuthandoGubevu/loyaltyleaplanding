
"use client";

import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStoreById } from "@/lib/mock-data";
import { ArrowLeft, QrCode, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function StoreDetailPage({
  params,
}: {
  params: { storeId: string };
}) {
  const store = getStoreById(params.storeId);

  if (!store) {
    notFound();
  }

  const pointsProgress = (store.points / store.nextReward.requiredPoints) * 100;

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
      <div className="flex justify-start">
        <Button asChild variant="ghost">
          <Link href="/customer/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Stores
          </Link>
        </Button>
      </div>

      {/* Store Header Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Image
            src={store.logo}
            alt={`${store.name} logo`}
            width={64}
            height={64}
            className="rounded-lg border p-1"
            data-ai-hint="store logo"
          />
          <div className="grid gap-1">
            <CardTitle className="text-2xl">{store.name}</CardTitle>
            <div className="flex items-center gap-2">
                <CardDescription>{store.points} Total Points</CardDescription>
                <Badge variant="secondary" className="text-sm">
                    <Star className="mr-1 h-3 w-3" />
                    {store.tier} Tier
                </Badge>
            </div>
          </div>
          <Button asChild className="ml-auto">
            <Link href={`/customer/scan?storeId=${store.id}`}>
                <QrCode className="mr-2 h-4 w-4"/>
                Scan QR
            </Link>
          </Button>
        </CardHeader>
      </Card>
      
      {/* Rewards and Activity Grid */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        {/* Next Reward Card */}
        <Card>
            <CardHeader>
                <CardTitle>Next Reward</CardTitle>
                <CardDescription>{store.nextReward.title}</CardDescription>
            </CardHeader>
            <CardContent>
                <Progress value={pointsProgress} />
                <p className="mt-2 text-sm text-muted-foreground">
                    {store.points} / {store.nextReward.requiredPoints} points
                </p>
            </CardContent>
            <CardFooter>
                 <p className="text-sm text-muted-foreground">
                    {store.nextReward.requiredPoints - store.points > 0
                      ? `${store.nextReward.requiredPoints - store.points} more points to go!`
                      : "You can redeem this reward now!"}
                  </p>
            </CardFooter>
        </Card>

        {/* Recent Activity Card */}
        <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                A log of your recent points activity at this store.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {store.activity.slice(0, 4).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium text-muted-foreground">{item.date}</div>
                      </TableCell>
                       <TableCell>{item.action}</TableCell>
                      <TableCell className={`text-right font-mono ${item.points.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{item.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
