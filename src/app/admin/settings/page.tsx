
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
                        <Input id="business-name" defaultValue="Loyalty Leap Demo" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="logo">Logo</Label>
                        <div className="flex items-center gap-4">
                            <Image
                                src="/gift.png"
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
                        <Input id="contact-email" type="email" defaultValue="contact@loyaltyleap.com" />
                    </div>
                    <Button type="submit" className="w-fit">Save Changes</Button>
                </form>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>App Configuration</CardTitle>
                <CardDescription>
                    Mock settings for app behavior.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <form className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="points-ratio">Points Ratio (per R1)</Label>
                        <Input id="points-ratio" type="number" defaultValue="1" />
                    </div>
                    <div className="grid gap-2">
                        <Label>POS Integration</Label>
                        <p className="text-sm text-muted-foreground">Status: <span className="font-semibold text-green-600">Connected</span></p>
                    </div>
                    <Button type="submit" className="w-fit">Save Configuration</Button>
                 </form>
            </CardContent>
        </Card>
    </div>
  );
}
