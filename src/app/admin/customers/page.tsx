"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, Lock, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase/config";
import { apiFetch } from "@/lib/api-client";
import { formatZaPhone } from "@/lib/phone";
import { formatLimit, UPGRADE_CONTACT, type Plan } from "@/lib/plans";
import { AddCustomerDialog } from "@/components/admin/add-customer-dialog";
import { Badge } from "@/components/ui/badge";

type Customer = {
  name: string;
  phone: string;
  stamps: number;
  lifetimeStamps: number;
  joined: number | null;
  lastVisit: number | null;
  birthday: string | null;
  email: string | null;
  hasApp: boolean;
};

type CustomersResponse = {
  plan: Plan;
  usage: { members: number; maxMembers: number | null; activeRewards: number; maxActiveRewards: number | null };
  members: Customer[];
};

const PAGE_SIZE = 50;

const day = (t: number | null) => (t === null ? "—" : new Date(t).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }));

function UsageCard({ data }: { data: CustomersResponse }) {
  const { members, maxMembers } = data.usage;
  const pct = maxMembers ? Math.min(100, (members / maxMembers) * 100) : null;
  const full = maxMembers !== null && members >= maxMembers;
  const near = pct !== null && pct >= 90;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardDescription>{data.plan.id} plan</CardDescription>
        <CardTitle className="text-2xl tabular-nums">
          {members.toLocaleString("en-ZA")} <span className="text-base font-normal text-muted-foreground">/ {formatLimit(maxMembers)} members</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pct !== null && <Progress value={pct} aria-label={`${Math.round(pct)}% of member limit used`} />}
        {near && (
          <p className="text-sm">
            {full
              ? "You've reached your member limit. Existing members can still earn stamps, but new customers can't join until you upgrade."
              : "You're close to your member limit."}{" "}
            <a className="font-medium text-primary underline-offset-4 hover:underline" href={`mailto:${UPGRADE_CONTACT}?subject=Upgrade%20my%20Loyalty%20Leap%20plan`}>Ask about upgrading</a>.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ExportButtons({ plan }: { plan: Plan }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  if (!plan.export) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />CSV export is included in Pro.
      </p>
    );
  }

  const download = async (type: "members" | "stamps") => {
    setBusy(type);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/export?type=${type}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Export failed.");
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `loyalty-leap-${type}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Export failed", description: error.message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => download("members")} disabled={busy !== null}>
        {busy === "members" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}Export customers
      </Button>
      <Button variant="outline" size="sm" onClick={() => download("stamps")} disabled={busy !== null}>
        {busy === "stamps" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}Export stamp history
      </Button>
    </div>
  );
}

export default function CustomersPage() {
  const [data, setData] = useState<CustomersResponse | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE_SIZE);

  const load = () => apiFetch<CustomersResponse>("/api/customers").then(setData).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, "").replace(/^0/, "");
    if (!q) return data.members;
    return data.members.filter((m) => m.name.toLowerCase().includes(q) || (digits.length > 0 && m.phone.includes(digits)));
  }, [data, query]);

  if (error) return <Alert variant="destructive"><AlertTitle>Could not load customers</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
  if (!data) return <div className="grid gap-4"><Skeleton className="h-28 w-full" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="grid gap-4 md:gap-6">
      <UsageCard data={data} />
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Customers</CardTitle>
              <CardDescription>Everyone in your loyalty programme, most recent visit first.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AddCustomerDialog
                onAdded={load}
                disabled={data.usage.maxMembers !== null && data.usage.members >= data.usage.maxMembers}
              />
              <ExportButtons plan={data.plan} />
            </div>
          </div>
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by name or cellphone" value={query} onChange={(e) => { setQuery(e.target.value); setShown(PAGE_SIZE); }} aria-label="Search customers" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Stamps</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Lifetime</TableHead>
                <TableHead className="hidden md:table-cell">Last visit</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead className="hidden sm:table-cell">App</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {data.members.length === 0 ? "No customers yet. Add your first one with \"Add customer\" or from the Till." : "No customers match your search."}
                  </TableCell>
                </TableRow>
              ) : filtered.slice(0, shown).map((m) => (
                <TableRow key={m.phone}>
                  <TableCell>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{formatZaPhone(m.phone)}</p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{m.stamps}</TableCell>
                  <TableCell className="hidden text-right tabular-nums sm:table-cell">{m.lifetimeStamps}</TableCell>
                  <TableCell className="hidden md:table-cell">{day(m.lastVisit)}</TableCell>
                  <TableCell className="hidden md:table-cell">{day(m.joined)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {m.hasApp ? <Badge variant="secondary">Using app</Badge> : <span className="text-xs text-muted-foreground">Not yet</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length > shown && (
            <div className="mt-4 flex flex-col items-center gap-2 text-sm text-muted-foreground">
              Showing {shown.toLocaleString("en-ZA")} of {filtered.length.toLocaleString("en-ZA")}
              <Button variant="outline" size="sm" onClick={() => setShown((n) => n + PAGE_SIZE)}>Show more</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
