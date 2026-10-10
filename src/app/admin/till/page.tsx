"use client";

import { useCallback, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import { Cake, CheckCircle2, Gift, Loader2, Phone, QrCode, RefreshCw, Stamp, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase/config";
import { fetchProgram } from "@/lib/loyalty/client";
import { apiFetch } from "@/lib/api-client";
import { formatZaPhone } from "@/lib/phone";
import { buildTillPayload, type LoyaltyProgram, type MemberSummary, type RewardProgress } from "@/lib/loyalty/types";

type TillCodeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "showing"; code: string; payload: string; expiresAt: number }
  | { status: "used"; name: string; stamps: number }
  | { status: "expired" };

function QrTill({ businessId }: { businessId: string }) {
  const { toast } = useToast();
  const [state, setState] = useState<TillCodeState>({ status: "idle" });
  const [secondsLeft, setSecondsLeft] = useState(0);

  const showCode = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const { code, expiresAt } = await apiFetch<{ code: string; expiresAt: number }>("/api/till/code", { method: "POST" });
      setState({ status: "showing", code, payload: buildTillPayload(businessId, code), expiresAt });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Could not create a code", description: error.message });
      setState({ status: "idle" });
    }
  }, [businessId, toast]);

  // Watch the code until the customer claims it.
  useEffect(() => {
    if (state.status !== "showing") return;
    const unsubscribe = onSnapshot(doc(db, "businesses", businessId, "tillCodes", state.code), (snap) => {
      const data = snap.data();
      if (data?.usedByMemberId) {
        setState({ status: "used", name: data.usedByName, stamps: data.usedStamps });
      }
    });
    return unsubscribe;
  }, [state, businessId]);

  // Countdown until the code expires.
  useEffect(() => {
    if (state.status !== "showing") return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((state.expiresAt - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) setState({ status: "expired" });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [state]);

  if (state.status === "showing") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <QRCodeSVG value={state.payload} size={260} />
        </div>
        <p className="text-lg font-semibold">Ask the customer to scan with the Loyalty Leap app</p>
        <p className="text-muted-foreground">Code expires in {secondsLeft}s and works once.</p>
        <Button variant="ghost" onClick={() => setState({ status: "idle" })}>Cancel</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      {state.status === "used" && (
        <Alert className="border-green-500">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-700">Stamp added for {state.name}</AlertTitle>
          <AlertDescription>They now have {state.stamps} stamp(s).</AlertDescription>
        </Alert>
      )}
      {state.status === "expired" && (
        <p className="text-muted-foreground">That code expired before it was scanned.</p>
      )}
      <Button size="lg" className="h-16 w-full max-w-sm text-lg" onClick={showCode} disabled={state.status === "loading"}>
        {state.status === "loading" ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : state.status === "idle" ? <QrCode className="mr-2 h-5 w-5" /> : <RefreshCw className="mr-2 h-5 w-5" />}
        {state.status === "idle" || state.status === "loading" ? "Show QR for this sale" : "Show new QR"}
      </Button>
    </div>
  );
}

type Lookup = { phone: string; member: MemberSummary | null; rewards: RewardProgress[] };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function PhoneTill() {
  const { toast } = useToast();
  const [phoneInput, setPhoneInput] = useState("");
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const reset = () => {
    setPhoneInput("");
    setLookup(null);
    setName("");
    setConsent(false);
    setBirthDay("");
    setBirthMonth("");
  };

  const birthday = birthDay && birthMonth ? `${birthMonth}-${birthDay.padStart(2, "0")}` : undefined;

  const find = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("find");
    try {
      setLookup(await apiFetch<Lookup>(`/api/till/member?phone=${encodeURIComponent(phoneInput)}`));
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lookup failed", description: error.message });
    } finally {
      setBusy(null);
    }
  };

  const stamp = async () => {
    if (!lookup) return;
    setBusy("stamp");
    try {
      const isNew = !lookup.member;
      const result = await apiFetch<{ member: MemberSummary; rewards: RewardProgress[] }>("/api/till/stamp", {
        method: "POST",
        body: isNew ? { phone: lookup.phone, name, consent, birthday } : { phone: lookup.phone },
      });
      setLookup({ phone: lookup.phone, member: result.member, rewards: result.rewards });
      toast({ title: `Stamp added for ${result.member.name}`, description: `They now have ${result.member.stamps} stamp(s).` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Stamp not added", description: error.message });
    } finally {
      setBusy(null);
    }
  };

  const redeem = async (reward: RewardProgress | "birthday") => {
    if (!lookup) return;
    const isBirthday = reward === "birthday";
    setBusy(isBirthday ? "birthday" : reward.id);
    try {
      const result = await apiFetch<{ member: MemberSummary; rewards: RewardProgress[]; rewardName: string }>("/api/till/redeem", {
        method: "POST",
        body: isBirthday ? { phone: lookup.phone, birthday: true } : { phone: lookup.phone, rewardId: reward.id },
      });
      setLookup({ phone: lookup.phone, member: result.member, rewards: result.rewards });
      toast({
        title: `${result.rewardName} redeemed`,
        description: isBirthday ? `Happy birthday, ${result.member.name}!` : `${result.member.name} has ${result.member.stamps} stamp(s) left.`,
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Could not redeem", description: error.message });
    } finally {
      setBusy(null);
    }
  };

  if (!lookup) {
    return (
      <form onSubmit={find} className="mx-auto flex max-w-sm flex-col gap-4 py-6">
        <Label htmlFor="till-phone" className="text-base">Customer cellphone number</Label>
        <Input
          id="till-phone"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          placeholder="082 123 4567"
          className="h-14 text-xl"
          value={phoneInput}
          onChange={(e) => setPhoneInput(e.target.value)}
        />
        <Button type="submit" size="lg" className="h-14 text-lg" disabled={!phoneInput || busy === "find"}>
          {busy === "find" && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Find customer
        </Button>
      </form>
    );
  }

  const { member, rewards } = lookup;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{formatZaPhone(lookup.phone)}</p>
          <p className="text-2xl font-bold">{member ? member.name : "New customer"}</p>
        </div>
        {member && (
          <div className="text-right">
            <p className="text-4xl font-extrabold">{member.stamps}</p>
            <p className="text-sm text-muted-foreground">stamps</p>
          </div>
        )}
      </div>

      {!member && (
        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <Label htmlFor="till-name">Customer name</Label>
          <Input id="till-name" className="h-12 text-lg" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Thandi Mokoena" />
          <div className="flex flex-col gap-2">
            <Label>Birthday <span className="font-normal text-muted-foreground">(optional)</span></Label>
            <div className="flex gap-2">
              <Input
                aria-label="Birthday day"
                type="number"
                inputMode="numeric"
                min={1}
                max={31}
                placeholder="Day"
                className="h-12 w-24 text-lg"
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value.slice(0, 2))}
              />
              <select
                aria-label="Birthday month"
                className="h-12 flex-1 rounded-md border border-input bg-background px-3 text-lg"
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value)}
              >
                <option value="">Month</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox id="till-consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-1" />
            <Label htmlFor="till-consent" className="font-normal leading-snug">
              The customer agreed to join this store&apos;s loyalty programme and for us to store their name and number.
            </Label>
          </div>
        </div>
      )}

      <Button
        size="lg"
        className="h-16 text-lg"
        onClick={stamp}
        disabled={busy !== null || (!member && (name.trim().length < 2 || !consent))}
      >
        {busy === "stamp" ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : member ? <Stamp className="mr-2 h-5 w-5" /> : <UserPlus className="mr-2 h-5 w-5" />}
        {member ? "Add stamp" : "Add customer & stamp"}
      </Button>

      {member?.birthdayRewardAvailable && (
        <div className="rounded-lg border-2 border-primary bg-primary/10 p-3">
          <p className="flex items-center gap-2 font-semibold"><Cake className="h-5 w-5 text-primary" />It&apos;s {member.name}&apos;s birthday week!</p>
          <Button className="mt-3 w-full" onClick={() => redeem("birthday")} disabled={busy !== null}>
            {busy === "birthday" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gift className="mr-2 h-4 w-4" />}
            Redeem {member.birthdayRewardAvailable.name}
          </Button>
        </div>
      )}

      {member && rewards.length > 0 && (
        <div className="flex flex-col gap-3">
          {rewards.map((reward) => (
            <div key={reward.id} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-medium">{reward.name}</span>
                <span className="text-sm text-muted-foreground">{Math.min(member.stamps, reward.stampsRequired)}/{reward.stampsRequired}</span>
              </div>
              <Progress value={Math.min(100, (member.stamps / reward.stampsRequired) * 100)} />
              {reward.eligible && (
                <Button variant="secondary" className="mt-3 w-full" onClick={() => redeem(reward)} disabled={busy !== null}>
                  {busy === reward.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gift className="mr-2 h-4 w-4" />}
                  Redeem {reward.name}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      {member && rewards.length === 0 && (
        <p className="text-sm text-muted-foreground">No rewards set up yet. Add them on the Rewards page.</p>
      )}

      <Button variant="outline" onClick={reset}>Next customer</Button>
    </div>
  );
}

export default function TillPage() {
  const { businessId } = useAuth();
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);

  useEffect(() => {
    if (businessId) fetchProgram().then((r) => setProgram(r.program)).catch(() => setProgram(null));
  }, [businessId]);

  if (!businessId) {
    return (
      <Alert>
        <AlertTitle>No business linked</AlertTitle>
        <AlertDescription>Your account is not linked to a business yet. Contact Loyalty Leap support.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-2xl">Till</CardTitle>
            <CardDescription>
              {program ? program.earnRule : "Add a stamp after each qualifying sale."}
              {program?.minSpend ? ` · Minimum spend R${program.minSpend}` : ""}
            </CardDescription>
          </div>
          <a
            href="/admin/help?section=till"
            className="shrink-0 text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline mt-1"
            title="Till guide"
          >
            ? Help
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="qr">
          <TabsList className="grid h-12 w-full grid-cols-2">
            <TabsTrigger value="qr" className="h-10 text-base"><QrCode className="mr-2 h-4 w-4" />Show QR</TabsTrigger>
            <TabsTrigger value="phone" className="h-10 text-base"><Phone className="mr-2 h-4 w-4" />Enter number</TabsTrigger>
          </TabsList>
          <TabsContent value="qr"><QrTill businessId={businessId} /></TabsContent>
          <TabsContent value="phone"><PhoneTill /></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
