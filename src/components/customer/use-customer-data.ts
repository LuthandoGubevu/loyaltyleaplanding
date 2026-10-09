"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { ActivityEntry, CustomerStore } from "@/lib/loyalty/customer";

export type { ActivityEntry, CustomerStore };

export type Shop = {
  businessId: string;
  name: string;
  earnRule: string;
  topReward: { name: string; stampsRequired: number } | null;
  joined: boolean;
};

// Small fetch hook for the customer pages' API data.
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!path) return;
    let alive = true;
    apiFetch<T>(path)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [path]);
  return { data, error, loading: !data && !error };
}

export const visitDate = (t: number | null) =>
  t === null ? "No visits yet" : new Date(t).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });

export const activityLabel = (e: ActivityEntry) =>
  e.type === "stamp" ? "Stamp collected" : `Redeemed ${e.rewardName ?? "a reward"}${e.birthday ? " (birthday)" : ""}`;
