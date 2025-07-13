
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
import { Gift, Star, DollarSign, Edit, QrCode } from "lucide-react";
import Link from "next/link";

// Mock Data
const customer = {
  name: "Sarah",
  totalPoints: 1250,
  tier: "Gold",
};

const progress = {
  current: 250,
  goal: 1000,
  text: "You are 750 points away from Platinum Tier!",
};

export default function CustomerDashboardPage() {
  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="sm:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Hey {customer.name}!</CardTitle>
            <CardDescription className="max-w-lg text-balance leading-relaxed">
              Welcome to your Loyalty Dashboard. Here's a summary of your points
              and rewards.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Badge variant={customer.tier === 'Gold' ? "default" : "secondary"} className="text-sm">
                <Star className="mr-2 h-4 w-4" />
                {customer.tier} Tier
            </Badge>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Points</CardDescription>
            <CardTitle className="text-4xl">{customer.totalPoints}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              +10% from last month
            </div>
          </CardContent>
          <CardFooter>
            <Progress value={75} aria-label="75% increase" />
          </CardFooter>
        </Card>
        <Card className="flex flex-col items-center justify-center text-center">
            <CardHeader>
                <CardDescription>Ready to earn?</CardDescription>
                <CardTitle className="text-2xl">Scan a QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
                 <Button asChild size="lg">
                    <Link href="/customer/scan" className="flex gap-2">
                        <QrCode className="h-6 w-6" />
                        Scan Now
                    </Link>
                 </Button>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">Scan at checkout to collect points.</p>
            </CardFooter>
        </Card>
      </div>
      <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
         <Card>
          <CardHeader>
            <CardTitle>Next Reward Progress</CardTitle>
            <CardDescription>
              {progress.text}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(progress.current/progress.goal) * 100} aria-label="Next reward progress" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
