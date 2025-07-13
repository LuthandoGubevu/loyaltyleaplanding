
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
import { Gift, Star, DollarSign, Edit, QrCode } from "lucide-react";
import Link from "next/link";

// Mock Data
const customer = {
  name: "Sarah",
  totalPoints: 1250,
  tier: "Gold",
};

const pointHistory = [
  { date: "2024-05-20", action: "Purchase at The Cozy Cafe", points: "+50" },
  { date: "2024-05-18", action: "Redeemed: Free Coffee", points: "-100" },
  { date: "2024-05-15", action: "Birthday Bonus", points: "+200" },
  { date: "2024-05-10", action: "Purchase at Modern Cuts", points: "+150" },
];

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8 xl:col-span-3">
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
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8 xl:col-span-2">
           <Card>
            <CardHeader className="px-7">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                A log of your recent points activity.
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
                  {pointHistory.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium text-muted-foreground">{item.date}</div>
                      </TableCell>
                       <TableCell>{item.action}</TableCell>
                      <TableCell className={`text-right ${item.points.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{item.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>
                    Manage your personal information.
                </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="#">
                    Edit Profile
                    <Edit className="h-4 w-4" />
                </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid gap-1 text-sm">
                    <div className="font-semibold">Name: {customer.name}</div>
                    <div>Email: sarah@example.com</div>
                    <div>Tier: {customer.tier}</div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
