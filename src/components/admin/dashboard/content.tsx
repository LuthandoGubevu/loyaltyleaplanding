"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Cake, Gift, ScanLine, Stamp, UserPlus, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiFetch } from "@/lib/api-client";
import { formatZaPhone } from "@/lib/phone";
import type { Plan } from "@/lib/plans";
import { DashboardSkeleton } from "./skeleton";

type Summary = {
    plan: Plan;
    totals: { members: number; newMembersThisWeek: number; stampsThisWeek: number; rewardsThisWeek: number };
    recent: { name: string; phone: string; type: "stamp" | "redeem"; rewardName: string | null; birthday: boolean; at: number }[];
};

const when = (t: number) => new Date(t).toLocaleString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function DashboardContent() {
    const [data, setData] = useState<Summary | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        apiFetch<Summary>("/api/summary").then(setData).catch((e) => setError(e.message));
    }, []);

    if (error) return <Alert variant="destructive"><AlertTitle>Could not load your dashboard</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
    if (!data) return <DashboardSkeleton />;

    const tiles = [
        { icon: Users, title: "Members", value: data.totals.members, note: `${data.plan.id} plan` },
        { icon: UserPlus, title: "New members this week", value: data.totals.newMembersThisWeek },
        { icon: Stamp, title: "Stamps this week", value: data.totals.stampsThisWeek },
        { icon: Gift, title: "Rewards redeemed this week", value: data.totals.rewardsThisWeek },
    ];

    return (
        <div className="grid auto-rows-max items-start gap-4 md:gap-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {tiles.map(item => (
                    <Card key={item.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tabular-nums">{item.value.toLocaleString("en-ZA")}</div>
                            {item.note && <p className="text-xs text-muted-foreground">{item.note}</p>}
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                        <CardTitle>Recent activity</CardTitle>
                        <CardDescription>The latest stamps and rewards at your till.</CardDescription>
                    </div>
                    <Button asChild size="sm" className="gap-1">
                        <Link href="/admin/till"><ScanLine className="h-4 w-4" />Open Till</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Activity</TableHead>
                                <TableHead className="text-right">When</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.recent.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No activity yet. Add your first stamp from the Till.</TableCell>
                                </TableRow>
                            ) : data.recent.map((r, i) => (
                                <TableRow key={`${r.at}-${i}`}>
                                    <TableCell>
                                        <div className="font-medium">{r.name}</div>
                                        <div className="text-xs text-muted-foreground">{formatZaPhone(r.phone)}</div>
                                    </TableCell>
                                    <TableCell>
                                        {r.type === "stamp" ? "Stamp added" : (
                                            <span className="flex items-center gap-1.5">
                                                {r.birthday ? <Cake className="h-4 w-4 text-primary" /> : <Gift className="h-4 w-4 text-primary" />}
                                                Redeemed {r.rewardName ?? "a reward"}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">{when(r.at)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="gap-2">
                    <Button asChild size="sm" variant="outline" className="ml-auto gap-1">
                        <Link href="/admin/customers">All customers <ArrowUpRight className="h-4 w-4" /></Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="gap-1">
                        <Link href="/admin/analytics">Analytics <ArrowUpRight className="h-4 w-4" /></Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
