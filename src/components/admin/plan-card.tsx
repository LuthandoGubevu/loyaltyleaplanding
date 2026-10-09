"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatLimit, PLAN_IDS, PLANS, UPGRADE_CONTACT, type Plan } from "@/lib/plans";

type Usage = { members: number; maxMembers: number | null; activeRewards: number; maxActiveRewards: number | null };

const NEXT_PLAN_ADDS: Record<string, string[]> = {
  Starter: ["Up to 1,000 members", "Unlimited rewards", "Birthday rewards", "Analytics: busiest times, top customers, programme cost"],
  Growth: ["Unlimited members", "Full analytics: return rate, lapsed customers, cost per visit", "CSV export", "Dedicated onboarding"],
};

function UsageRow({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground">{used.toLocaleString("en-ZA")} / {formatLimit(limit)}</span>
      </div>
      {limit !== null && <Progress value={Math.min(100, (used / limit) * 100)} aria-label={`${label}: ${used} of ${limit}`} />}
    </div>
  );
}

// The business's plan, what it has used, and what upgrading adds.
export function PlanCard() {
  const [data, setData] = useState<{ plan: Plan; usage: Usage } | null>(null);

  useEffect(() => {
    apiFetch<{ plan: Plan; usage: Usage }>("/api/customers").then(setData).catch(() => setData(null));
  }, []);

  if (!data) return <Skeleton className="h-56 w-full" />;
  const { plan, usage } = data;
  const next = PLAN_IDS[PLAN_IDS.indexOf(plan.id) + 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your plan: {plan.id}</CardTitle>
        <CardDescription>
          R{plan.priceMonthly.toLocaleString("en-ZA")}/month excl. VAT · {plan.support}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <UsageRow label="Members" used={usage.members} limit={usage.maxMembers} />
        <UsageRow label="Active rewards" used={usage.activeRewards} limit={usage.maxActiveRewards} />
        {next && (
          <div className="rounded-lg border p-4">
            <p className="font-medium">
              Upgrade to {next} (R{PLANS[next].priceMonthly.toLocaleString("en-ZA")}/month) for:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {NEXT_PLAN_ADDS[plan.id].map((item) => (
                <li key={item} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{item}</li>
              ))}
            </ul>
            <a
              className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
              href={`mailto:${UPGRADE_CONTACT}?subject=Upgrade%20to%20Loyalty%20Leap%20${next}`}
            >
              Ask about upgrading
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
