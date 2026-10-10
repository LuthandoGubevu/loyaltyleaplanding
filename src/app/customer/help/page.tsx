"use client";

import { BookOpen } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpAccordion } from "@/components/help/help-accordion";
import { customerSections } from "@/content/help/customer";

function CustomerHelpContent() {
  const params = useSearchParams();
  const anchor = params.get("section") ?? undefined;

  return (
    <div className="grid gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Help</h1>
        <p className="text-sm text-muted-foreground mt-1">
          How Loyalty Leap works — stamps, rewards, and your account.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Customer guide</CardTitle>
          </div>
          <CardDescription>
            Everything from joining a programme to redeeming your first reward.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HelpAccordion sections={customerSections} anchor={anchor} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function CustomerHelpPage() {
  return (
    <Suspense fallback={<div />}>
      <CustomerHelpContent />
    </Suspense>
  );
}
