
"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { PlanCard } from "@/components/admin/plan-card";

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>
                    Update your business name, logo, and contact info.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="business-name">Business Name</Label>
                        <Input id="business-name" placeholder="Your business name" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="logo">Logo</Label>
                        <div className="flex items-center gap-4">
                            <Image
                                src="/logos/logo.png"
                                alt="Current Logo"
                                width={40}
                                height={40}
                                className="rounded-lg border p-1"
                                data-ai-hint="company logo"
                            />
                            <Input id="logo" type="file" className="max-w-xs"/>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="contact-email">Contact Email</Label>
                        <Input id="contact-email" type="email" placeholder="contact@yourbusiness.com" />
                    </div>
                    <Button type="submit" className="w-fit">Save Changes</Button>
                </form>
            </CardContent>
        </Card>
        <PlanCard />
    </div>
  );
}
