
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  getBusiness,
  updateBusinessStatus,
  type BusinessWithId,
  type BusinessPlan,
  type BusinessStatus,
} from "@/lib/firebase/firestore";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { format } from "date-fns";

function statusBadge(status: BusinessStatus) {
  if (status === "active") return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>;
  if (status === "pending") return <Badge variant="secondary">Pending signup</Badge>;
  return <Badge variant="outline">Inactive</Badge>;
}

export default function StaffCompanyDetailPage() {
  const params = useParams<{ businessId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [business, setBusiness] = useState<BusinessWithId | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    const data = await getBusiness(params.businessId);
    setBusiness(data);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.businessId]);

  const handlePlanChange = async (plan: BusinessPlan) => {
    if (!business) return;
    await updateDoc(doc(db, "businesses", business.id), { plan });
    toast({ title: "Plan updated", description: `${business.name} is now on the ${plan} plan.` });
    await load();
  };

  const handleStatusToggle = async () => {
    if (!business) return;
    const next: BusinessStatus = business.status === "inactive" ? "active" : "inactive";
    await updateBusinessStatus(business.id, next);
    await load();
  };

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Company not found.
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/staff/companies">
              <ArrowLeft className="mr-2 h-4 w-4" /> All companies
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:gap-6">
      <div>
        <Button asChild variant="ghost" className="mb-2 -ml-4">
          <Link href="/staff/companies">
            <ArrowLeft className="mr-2 h-4 w-4" /> All companies
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{business.name}</h1>
          {statusBadge(business.status)}
        </div>
        <p className="text-muted-foreground">Onboarded {format(business.createdAt, "dd MMM yyyy")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin access</CardTitle>
          <CardDescription>
            {business.adminUid
              ? "This business has been claimed and has an active admin account."
              : "Waiting for the assigned email to sign up and claim this business."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Assigned admin email</span>
            <span className="font-medium">{business.assignedAdminEmail}</span>
          </div>
          <div className="flex justify-between pb-2">
            <span className="text-muted-foreground">Claim status</span>
            <span className="font-medium">{business.adminUid ? "Claimed" : "Not yet claimed"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan &amp; status</CardTitle>
          <CardDescription>Change this business&apos;s plan tier or activation status.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 sm:max-w-md">
          <div className="grid gap-2">
            <span className="text-sm text-muted-foreground">Plan</span>
            <Select value={business.plan} onValueChange={(v) => handlePlanChange(v as BusinessPlan)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Launch">Launch</SelectItem>
                <SelectItem value="Growth">Growth</SelectItem>
                <SelectItem value="Complete">Complete</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <span className="text-sm text-muted-foreground">Status</span>
            <Button variant="outline" onClick={handleStatusToggle}>
              {business.status === "inactive" ? "Reactivate business" : "Mark inactive"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customers, rewards &amp; analytics</CardTitle>
          <CardDescription>Per-business activity data isn&apos;t wired up yet.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Once this business&apos;s customers, rewards, and scan activity are tracked, they&apos;ll show up here for staff to review alongside what the business&apos;s own admin dashboard shows.
        </CardContent>
      </Card>
    </div>
  );
}
