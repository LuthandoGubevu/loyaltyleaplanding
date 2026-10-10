"use client";

import Link from "next/link";
import { BookOpen, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpAccordion } from "@/components/help/help-accordion";
import { adminSections } from "@/content/help/admin";

function AdminHelpContent() {
  const params = useSearchParams();
  const anchor = params.get("section") ?? undefined;

  return (
    <div className="grid gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Management guide</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Everything you need to know about setting up and running your Loyalty Leap programme.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Admin guide</CardTitle>
          </div>
          <CardDescription>
            From first sign-in to daily operations — use the search to jump to any topic.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HelpAccordion sections={adminSections} anchor={anchor} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Customer guide</CardTitle>
          </div>
          <CardDescription>
            Share this with your customers so they understand how to earn stamps, redeem rewards and use the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/customer/help"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View customer guide →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminHelpPage() {
  return (
    <Suspense fallback={<div />}>
      <AdminHelpContent />
    </Suspense>
  );
}
