"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Cake, Lock } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { formatZaPhone } from "@/lib/phone";
import { UPGRADE_CONTACT } from "@/lib/plans";
import type { AnalyticsResult } from "@/lib/loyalty/analytics";

// Chart colours: brand coral for single-series charts, plus a blue for the
// one two-series comparison. The pair passes the colour-blind separation
// checks in light and dark mode (coral with the brand teal does not).
const CORAL = "#E26C5E";
const BLUE = "#3B6FD4";
const GRID = "hsl(var(--border))";
const AXIS_TEXT = "hsl(var(--muted-foreground))";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Full = Extract<AnalyticsResult, { level: "full" }>;

const rand = (n: number) => `R${n.toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const shortDate = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTH_NAMES[Number(iso.slice(5, 7)) - 1]}`;
const monthLabel = (key: string) => `${MONTH_NAMES[Number(key.slice(5, 7)) - 1]} ${key.slice(2, 4)}`;
const hourLabel = (h: number) => `${String(h).padStart(2, "0")}:00`;
const visitDate = (t: number | null) => (t === null ? "—" : new Date(t).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }));

function StatTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      {note && <CardContent className="pt-0 text-xs text-muted-foreground">{note}</CardContent>}
    </Card>
  );
}

function ChartTooltip({ active, payload, label, format }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{format ? format(label) : label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-medium text-foreground tabular-nums">{p.value.toLocaleString("en-ZA")}</span>
        </p>
      ))}
    </div>
  );
}

function SeriesChart({ data, dataKey, name, xKey, xFormat, color = CORAL, valueFormat }: {
  data: object[];
  dataKey: string;
  name: string;
  xKey: string;
  xFormat: (v: string) => string;
  color?: string;
  valueFormat?: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey={xKey} tickFormatter={xFormat} tick={{ fill: AXIS_TEXT, fontSize: 12 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} tickFormatter={valueFormat} tick={{ fill: AXIS_TEXT, fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: "hsl(var(--muted) / 0.4)" }} content={<ChartTooltip format={xFormat} />} />
        <Bar dataKey={dataKey} name={name} fill={color} radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function Heatmap({ grid }: { grid: number[][] }) {
  const max = Math.max(1, ...grid.flat());
  const hours = Array.from({ length: 24 }, (_, h) => h).filter((h) => grid.some((row) => row[h] > 0));
  if (hours.length === 0) return <p className="text-sm text-muted-foreground">No stamps yet in the last 12 weeks.</p>;
  const peak = grid.flatMap((row, d) => row.map((c, h) => ({ d, h, c }))).sort((a, b) => b.c - a.c)[0];
  return (
    <div className="space-y-3">
      <p className="text-sm text-foreground">
        Busiest: <span className="font-semibold">{DAYS[peak.d]} {hourLabel(peak.h)}–{hourLabel(peak.h + 1)}</span> ({peak.c} stamps)
      </p>
      <div className="overflow-x-auto">
        <table className="border-separate" style={{ borderSpacing: 2 }}>
          <thead>
            <tr>
              <th />
              {hours.map((h) => (
                <th key={h} className="px-0.5 text-[10px] font-normal text-muted-foreground">{String(h).padStart(2, "0")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, d) => (
              <tr key={DAYS[d]}>
                <th className="pr-2 text-left text-xs font-normal text-muted-foreground">{DAYS[d]}</th>
                {hours.map((h) => (
                  <td
                    key={h}
                    title={`${DAYS[d]} ${hourLabel(h)}: ${row[h]} stamps`}
                    className="h-6 w-6 min-w-6 rounded-[3px]"
                    style={{ background: row[h] === 0 ? "hsl(var(--muted) / 0.5)" : CORAL, opacity: row[h] === 0 ? 1 : 0.2 + 0.8 * (row[h] / max) }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        Fewer
        {[0.2, 0.4, 0.6, 0.8, 1].map((o) => <span key={o} className="inline-block h-3 w-3 rounded-[3px]" style={{ background: CORAL, opacity: o }} />)}
        More stamps
      </div>
    </div>
  );
}

function Locked() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Analytics</CardTitle>
        <CardDescription>See how your loyalty programme is performing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>Analytics is included in the <span className="font-semibold">Growth</span> and <span className="font-semibold">Pro</span> plans:</p>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Stamps, new members and rewards redeemed each week</li>
          <li>Your busiest days and hours</li>
          <li>Top customers and upcoming birthdays</li>
          <li>What your rewards cost each month</li>
          <li>Pro: return rate, lapsed customers, cost per visit and more</li>
        </ul>
        <a className="inline-block font-medium text-primary underline-offset-4 hover:underline" href={`mailto:${UPGRADE_CONTACT}?subject=Upgrade%20my%20Loyalty%20Leap%20plan`}>
          Ask about upgrading
        </a>
      </CardContent>
    </Card>
  );
}

function FullSection({ data }: { data: Full }) {
  const totalMethod = data.methodSplit.qr + data.methodSplit.phone;
  const qrPct = totalMethod ? Math.round((data.methodSplit.qr / totalMethod) * 100) : 0;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Return rate" value={data.returnRate === null ? "—" : `${Math.round(data.returnRate)}%`} note="Members who came back at least twice" />
        <StatTile label="Lapsed customers" value={data.lapsed.count.toLocaleString("en-ZA")} note="No visit in the last 30 days" />
        <StatTile label="Cost per visit" value={data.costPerVisit === null ? "—" : rand(data.costPerVisit)} note="Reward cost ÷ stamps, last 12 weeks" />
        <StatTile
          label="Reward liability (estimate)"
          value={data.rewardLiability === null ? "—" : rand(data.rewardLiability)}
          note={data.rewardLiability === null ? "Add a cost to your rewards to see this" : `${data.outstandingStamps.toLocaleString("en-ZA")} unredeemed stamps`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>How customers collect stamps</CardTitle>
            <CardDescription>Last 12 weeks · {totalMethod.toLocaleString("en-ZA")} stamps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {totalMethod === 0 ? (
              <p className="text-sm text-muted-foreground">No stamps yet.</p>
            ) : (
              <>
                <div className="flex h-4 w-full overflow-hidden rounded-full" role="img" aria-label={`${qrPct}% QR code, ${100 - qrPct}% cellphone number`}>
                  <div style={{ width: `${qrPct}%`, background: CORAL }} />
                  {qrPct > 0 && qrPct < 100 && <div className="w-[2px] bg-background" />}
                  <div style={{ width: `${100 - qrPct}%`, background: BLUE }} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: CORAL }} />QR code scan <span className="font-semibold tabular-nums">{qrPct}%</span></span>
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: BLUE }} />Cellphone number <span className="font-semibold tabular-nums">{100 - qrPct}%</span></span>
                </div>
              </>
            )}
            <p className="pt-2 text-sm text-muted-foreground">
              Average time to first reward:{" "}
              <span className="font-semibold text-foreground">{data.avgDaysToReward === null ? "no rewards yet" : `${Math.round(data.avgDaysToReward)} days`}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quiet times</CardTitle>
            <CardDescription>Your slowest trading hours, good for a double-stamp promotion</CardDescription>
          </CardHeader>
          <CardContent>
            {data.quietTimes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not enough stamps yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.quietTimes.map((q) => (
                  <li key={`${q.day}-${q.hour}`} className="flex justify-between">
                    <span>{DAYS[q.day]} {hourLabel(q.hour)}–{hourLabel(q.hour + 1)}</span>
                    <span className="tabular-nums text-muted-foreground">{q.stamps} stamps</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reward performance</CardTitle>
            <CardDescription>Redemptions in the last 12 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Reward</TableHead><TableHead className="text-right">Redeemed</TableHead><TableHead className="text-right">Cost</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {data.rewardPerformance.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-muted-foreground">No rewards redeemed yet.</TableCell></TableRow>
                ) : data.rewardPerformance.map((r) => (
                  <TableRow key={r.reward}>
                    <TableCell className="font-medium">{r.reward}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.redemptions}</TableCell>
                    <TableCell className="text-right tabular-nums">{rand(r.cost)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-medium"><span className="flex items-center gap-2"><Cake className="h-4 w-4 text-primary" />Birthday rewards</span></TableCell>
                  <TableCell className="text-right tabular-nums">{data.birthdayRewards.redeemed}</TableCell>
                  <TableCell className="text-right tabular-nums">{rand(data.birthdayRewards.cost)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Age groups</CardTitle>
            <CardDescription>{data.membersWithAge.toLocaleString("en-ZA")} members shared their birth year</CardDescription>
          </CardHeader>
          <CardContent>
            {data.membersWithAge === 0 ? (
              <p className="text-sm text-muted-foreground">No birth years yet. App customers share theirs at sign-up.</p>
            ) : (
              <SeriesChart data={data.ageGroups} dataKey="members" name="Members" xKey="band" xFormat={(v) => v} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lapsed customers</CardTitle>
          <CardDescription>No visit in 30 days. A quick message or offer can win them back.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Customer</TableHead><TableHead>Cellphone</TableHead><TableHead>Last visit</TableHead><TableHead className="text-right">Lifetime stamps</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {data.lapsed.members.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-muted-foreground">No lapsed customers. Nice work.</TableCell></TableRow>
              ) : data.lapsed.members.map((m) => (
                <TableRow key={m.phone}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{formatZaPhone(m.phone)}</TableCell>
                  <TableCell>{visitDate(m.lastVisit)}</TableCell>
                  <TableCell className="text-right tabular-nums">{m.lifetimeStamps}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data.lapsed.count > data.lapsed.members.length && (
            <p className="mt-2 text-xs text-muted-foreground">Showing the {data.lapsed.members.length} most recent of {data.lapsed.count}. Export the full list from Customers.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResult | null>(null);
  const [state, setState] = useState<"loading" | "locked" | "error" | "ready">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<AnalyticsResult>("/api/analytics")
      .then((d) => { setData(d); setState("ready"); })
      .catch((e) => {
        if (e instanceof ApiClientError && e.status === 403) setState("locked");
        else { setError(e.message); setState("error"); }
      });
  }, []);

  if (state === "loading") return <div className="grid gap-4"><Skeleton className="h-28 w-full" /><Skeleton className="h-72 w-full" /></div>;
  if (state === "locked") return <Locked />;
  if (state === "error" || !data) {
    return <Alert variant="destructive"><AlertTitle>Could not load analytics</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
  }

  const thisMonth = data.monthlyCost[data.monthlyCost.length - 1];
  const uncosted = data.monthlyCost.reduce((s, m) => s + m.uncosted, 0);

  return (
    <div className="grid gap-4 md:gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Members" value={data.totals.members.toLocaleString("en-ZA")} note={`${data.totals.newMembersThisWeek} new this week`} />
        <StatTile label="Stamps this week" value={data.totals.stampsThisWeek.toLocaleString("en-ZA")} />
        <StatTile label="Rewards redeemed this week" value={data.totals.rewardsThisWeek.toLocaleString("en-ZA")} />
        <StatTile label="Programme cost this month" value={rand(thisMonth.cost)} note={`${thisMonth.redemptions} rewards given`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Stamps per week</CardTitle><CardDescription>Visits through your programme, last 12 weeks</CardDescription></CardHeader>
          <CardContent><SeriesChart data={data.weekly} dataKey="stamps" name="Stamps" xKey="week" xFormat={(v) => `w/c ${shortDate(v)}`} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>New members per week</CardTitle><CardDescription>How fast your programme is growing</CardDescription></CardHeader>
          <CardContent><SeriesChart data={data.weekly} dataKey="newMembers" name="New members" xKey="week" xFormat={(v) => `w/c ${shortDate(v)}`} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Rewards redeemed per week</CardTitle><CardDescription>Rewards customers claimed</CardDescription></CardHeader>
          <CardContent><SeriesChart data={data.weekly} dataKey="rewardsRedeemed" name="Rewards redeemed" xKey="week" xFormat={(v) => `w/c ${shortDate(v)}`} /></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>Busiest days &amp; hours</CardTitle><CardDescription>Stamps by day and hour, last 12 weeks</CardDescription></CardHeader>
          <CardContent><Heatmap grid={data.heatmap} /></CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Programme cost per month</CardTitle><CardDescription>What the rewards you gave away cost you</CardDescription></CardHeader>
          <CardContent>
            <SeriesChart data={data.monthlyCost} dataKey="cost" name="Cost (R)" xKey="month" xFormat={monthLabel} valueFormat={(v) => `R${v}`} />
            {uncosted > 0 && <p className="mt-2 text-xs text-muted-foreground">{uncosted} redemptions had no cost set. Add costs on the Rewards page.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top 10 customers</CardTitle><CardDescription>By lifetime stamps</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Last visit</TableHead><TableHead className="text-right">Stamps</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.topCustomers.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-muted-foreground">No customers yet.</TableCell></TableRow>
                ) : data.topCustomers.map((c) => (
                  <TableRow key={c.phone}>
                    <TableCell><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{formatZaPhone(c.phone)}</p></TableCell>
                    <TableCell>{visitDate(c.lastVisit)}</TableCell>
                    <TableCell className="text-right tabular-nums">{c.lifetimeStamps}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Cake className="h-5 w-5 text-primary" />Upcoming birthdays</CardTitle><CardDescription>Next 30 days</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Birthday</TableHead><TableHead className="text-right">In</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.upcomingBirthdays.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-muted-foreground">No birthdays in the next 30 days.</TableCell></TableRow>
                ) : data.upcomingBirthdays.map((b) => (
                  <TableRow key={b.phone}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{Number(b.birthday.slice(3))} {MONTH_NAMES[Number(b.birthday.slice(0, 2)) - 1]}</TableCell>
                    <TableCell className="text-right">{b.inDays === 0 ? "Today" : `${b.inDays} days`}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {data.level === "full" ? (
        <FullSection data={data} />
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col gap-2 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p><span className="font-semibold">Pro</span> adds return rate, lapsed customers, quiet times, cost per visit, reward performance, age groups and CSV export.</p>
            <a className="shrink-0 font-medium text-primary underline-offset-4 hover:underline" href={`mailto:${UPGRADE_CONTACT}?subject=Upgrade%20to%20Loyalty%20Leap%20Pro`}>Ask about Pro</a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
