
"use client"

import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Users, CreditCard, Activity, DollarSign } from "lucide-react";
import Link from "next/link";
import { getLoyaltyData } from "@/lib/mock-data";

const summaryData = [
    { icon: DollarSign, title: "Total Revenue", value: "R45,231.89", change: "+20.1% from last month", changeType: "positive"},
    { icon: Users, title: "Active Members", value: "+2350", change: "+180.1% from last month", changeType: "positive"},
    { icon: CreditCard, title: "Rewards Redeemed", value: "1,245", change: "+19% from last month", changeType: "positive"},
    { icon: Activity, title: "New Sign-ups (Today)", value: "57", change: "+2 since yesterday", changeType: "positive"},
];

const recentTransactions = [
    { name: "Olivia Martin", email: "olivia.martin@email.com", amount: "+R1,999.00"},
    { name: "Jackson Lee", email: "jackson.lee@email.com", amount: "+R39.00"},
    { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", amount: "+R299.00"},
    { name: "William Kim", email: "will@email.com", amount: "+R99.00"},
    { name: "Sofia Davis", email: "sofia.davis@email.com", amount: "+R39.00"},
];


export function DashboardContent() {
    const searchParams = useSearchParams();
    const storeId = searchParams.get('storeId');
    const currentStore = storeId ? getLoyaltyData().stores.find(s => s.id === storeId) : null;

    // In a real app, you'd filter summaryData and recentTransactions by storeId
    
    return (
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {summaryData.map(item => (
                    <Card key={item.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {item.title}
                            </CardTitle>
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{item.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {item.change}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>
                            A list of recent points transactions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentTransactions.map(transaction => (
                                <TableRow key={transaction.email}>
                                    <TableCell>
                                        <div className="font-medium">{transaction.name}</div>
                                        <div className="hidden text-sm text-muted-foreground md:inline">
                                            {transaction.email}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">{transaction.amount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </CardContent>
                     <CardFooter>
                        <Button asChild size="sm" className="ml-auto gap-1">
                            <Link href="/admin/customers">
                                View All
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Top Rewards</CardTitle>
                        <CardDescription>
                            The most frequently redeemed rewards.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-8">
                        <div className="flex items-center gap-4">
                            <p className="text-sm font-medium text-muted-foreground">Free Coffee</p>
                            <Progress value={52} className="flex-1" />
                            <span className="text-sm font-medium">1.2k</span>
                        </div>
                         <div className="flex items-center gap-4">
                            <p className="text-sm font-medium text-muted-foreground">R50 Off</p>
                            <Progress value={37} className="flex-1" />
                             <span className="text-sm font-medium">850</span>
                        </div>
                         <div className="flex items-center gap-4">
                            <p className="text-sm font-medium text-muted-foreground">25% Haircut</p>
                            <Progress value={19} className="flex-1" />
                             <span className="text-sm font-medium">320</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild size="sm" className="ml-auto gap-1">
                            <Link href="/admin/rewards">
                                View All
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
