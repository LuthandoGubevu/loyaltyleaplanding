
"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getBusiness, updateBusinessPointsConfig, type BusinessWithId } from "@/lib/firebase/firestore";

function QrCodeCard({ business }: { business: BusinessWithId }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanUrl, setScanUrl] = useState("");

  useEffect(() => {
    setScanUrl(`${window.location.origin}/customer/scan?businessId=${business.id}`);
  }, [business.id]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${business.name.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your QR Code</CardTitle>
        <CardDescription>
          Print this and put it where customers pay. Scanning it awards {business.pointsPerScan} points per visit.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {scanUrl ? (
          <div className="rounded-lg border bg-white p-4">
            <QRCodeCanvas ref={canvasRef} value={scanUrl} size={200} />
          </div>
        ) : (
          <Skeleton className="h-[232px] w-[232px] rounded-lg" />
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleDownload} variant="outline" disabled={!scanUrl}>
          <Download className="mr-2 h-4 w-4" />
          Download PNG
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function SettingsPage() {
  const { businessId } = useAuth();
  const { toast } = useToast();
  const [business, setBusiness] = useState<BusinessWithId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pointsPerScan, setPointsPerScan] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!businessId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const data = await getBusiness(businessId);
      setBusiness(data);
      if (data) setPointsPerScan(String(data.pointsPerScan));
      setIsLoading(false);
    };
    load();
  }, [businessId]);

  const handleSavePoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    const value = Number(pointsPerScan);
    if (!Number.isFinite(value) || value <= 0) {
      toast({ variant: "destructive", title: "Invalid amount", description: "Points per scan must be a positive number." });
      return;
    }
    setIsSaving(true);
    try {
      await updateBusinessPointsConfig(businessId, value);
      setBusiness((prev) => (prev ? { ...prev, pointsPerScan: value } : prev));
      toast({ title: "Saved", description: `Customers now earn ${value} points per scan.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Couldn't save", description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

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
        <Card>
            <CardHeader>
                <CardTitle>Loyalty Program</CardTitle>
                <CardDescription>
                    Configure how many points a customer earns per scan.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 {isLoading ? (
                    <Skeleton className="h-10 w-full max-w-xs" />
                 ) : !businessId ? (
                    <p className="text-sm text-muted-foreground">No business is linked to your account yet — contact staff.</p>
                 ) : (
                    <form className="grid gap-4" onSubmit={handleSavePoints}>
                        <div className="grid gap-2 max-w-xs">
                            <Label htmlFor="points-per-scan">Points per scan</Label>
                            <Input
                                id="points-per-scan"
                                type="number"
                                min="1"
                                value={pointsPerScan}
                                onChange={(e) => setPointsPerScan(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-fit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Configuration
                        </Button>
                    </form>
                 )}
            </CardContent>
        </Card>
        {business && <QrCodeCard business={business} />}
    </div>
  );
}
