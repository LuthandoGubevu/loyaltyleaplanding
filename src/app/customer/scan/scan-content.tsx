
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from 'next/navigation'
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStoreById } from "@/lib/mock-data";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import type { RewardProgress } from "@/lib/loyalty/types";

const qrcodeRegionId = "html5qr-code-full-region";

export function ScanContent() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [needsPhoneFor, setNeedsPhoneFor] = useState<string | null>(null);
  const [phone, setPhone] = useState("");

  const searchParams = useSearchParams();
  const storeId = searchParams.get('storeId');
  const store = storeId ? getStoreById(storeId) : null;
  const backHref = storeId ? `/customer/store/${storeId}` : '/customer/dashboard';


  useEffect(() => {
    scannerRef.current = new Html5Qrcode(qrcodeRegionId, {
      verbose: false
    });
    const html5Qrcode = scannerRef.current;

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) {
          setHasPermission(false);
          toast({
            variant: "destructive",
            title: "No cameras found.",
            description: "Could not find any cameras on this device.",
          });
          return;
        }
        setHasPermission(true);
      } catch (err) {
        setHasPermission(false);
        console.error("Camera permission error:", err);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description: "Please enable camera permissions in your browser settings.",
        });
        return;
      }
      
      setIsScanning(true);
      setScanResult(null);

      const qrCodeSuccessCallback = (decodedText: string) => {
        setIsScanning(false);
        if (html5Qrcode.isScanning) {
            html5Qrcode.stop().catch(err => console.error("Error stopping scanner post-success", err));
        }
        claim(decodedText);
      };

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      // Ensure we only start if not already scanning or in an intermediate state
      if (html5Qrcode.getState() === Html5QrcodeScannerState.NOT_STARTED) {
          try {
            await html5Qrcode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback, undefined);
          } catch(err) {
              console.error("Error starting scanner: ", err);
              toast({
                  variant: "destructive",
                  title: "Scanner Error",
                  description: "Could not start the QR code scanner.",
              });
              setIsScanning(false);
          }
      }
    };
    
    startScanner();

    return () => {
        if (scannerRef.current?.isScanning) {
            scannerRef.current.stop().catch((err) => {
                console.error("Failed to stop scanner on cleanup", err);
            });
        }
    };
  // The dependencies array is empty to run only on mount and cleanup on unmount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const claim = async (payload: string, phone?: string) => {
    setClaiming(true);
    setScanError(null);
    try {
      const result = await apiFetch<{ businessName: string; member: { stamps: number }; rewards: RewardProgress[] }>(
        "/api/stamps/claim",
        { method: "POST", body: { payload, phone } }
      );
      setNeedsPhoneFor(null);
      const next = result.rewards.find(r => !r.eligible);
      const ready = result.rewards.filter(r => r.eligible).map(r => r.name);
      setScanResult(
        `Stamp added at ${result.businessName}. You have ${result.member.stamps} stamp(s).` +
        (ready.length ? ` Ready to redeem: ${ready.join(", ")}.` : next ? ` ${next.stampsRequired - result.member.stamps} more for ${next.name}.` : "")
      );
      toast({ title: "Stamp added!", description: result.businessName });
    } catch (error: any) {
      if (error instanceof ApiClientError && error.data?.needsPhone) {
        setNeedsPhoneFor(payload);
      } else {
        setScanError(error.message);
      }
    } finally {
      setClaiming(false);
    }
  };

  const handleRescan = () => {
      window.location.reload();
  }

  return (
    <div className="w-full max-w-md">
        <Button asChild variant="ghost" className="mb-4">
            <Link href={backHref}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {store ? store.name : 'Dashboard'}
            </Link>
        </Button>
        <Card>
            <CardHeader>
                <CardTitle>Scan QR Code</CardTitle>
                <CardDescription>
                   Scan the QR code shown at the till to collect a stamp{store ? ` at ${store.name}` : ''}.
                </CardDescription>
            </CardHeader>
            <CardContent className="relative flex flex-col items-center justify-center">
                {!hasPermission && (
                    <Alert variant="destructive">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please allow camera access to use this feature. You may need to refresh the page after granting permissions.
                        </AlertDescription>
                    </Alert>
                )}
                <div id={qrcodeRegionId} className="w-full aspect-square rounded-md overflow-hidden bg-muted relative"></div>
                {claiming && (
                    <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Adding your stamp...
                    </div>
                )}
                {needsPhoneFor && !claiming && (
                    <form
                        className="mt-4 w-full space-y-3"
                        onSubmit={(e) => { e.preventDefault(); claim(needsPhoneFor, phone); }}
                    >
                        <Label htmlFor="claim-phone">Add your cellphone number to collect stamps</Label>
                        <Input id="claim-phone" type="tel" inputMode="tel" placeholder="082 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        <Button type="submit" className="w-full" disabled={!phone}>Save and collect stamp</Button>
                    </form>
                )}
                {scanError && !claiming && (
                    <div className="mt-4 w-full text-center">
                        <Alert variant="destructive">
                            <AlertTitle>Stamp not added</AlertTitle>
                            <AlertDescription className="break-words">{scanError}</AlertDescription>
                        </Alert>
                        <Button onClick={handleRescan} className="mt-4">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Scan Again
                        </Button>
                    </div>
                )}
                {isScanning && !scanResult &&(
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[250px] h-[250px] border-4 border-dashed border-primary rounded-lg animate-pulse"></div>
                    </div>
                )}
                {scanResult && (
                    <div className="mt-4 text-center">
                        <Alert variant="default" className="border-green-500 text-green-700">
                            <AlertTitle className="text-green-600">Scan Complete</AlertTitle>
                            <AlertDescription className="break-words">
                                {scanResult}
                            </AlertDescription>
                        </Alert>
                         <Button onClick={handleRescan} className="mt-4">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Scan Another
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
