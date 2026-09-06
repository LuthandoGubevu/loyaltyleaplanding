
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from 'next/navigation'
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, PartyPopper, Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getBusiness, recordScan, type BusinessWithId } from "@/lib/firebase/firestore";
import { formatDistanceToNow } from "date-fns";

const qrcodeRegionId = "html5qr-code-full-region";

type ScanState =
  | { phase: 'scanning' }
  | { phase: 'awarding' }
  | { phase: 'awarded'; pointsAwarded: number; newTotal: number; businessName: string }
  | { phase: 'cooldown'; retryAfter: Date; businessName: string }
  | { phase: 'error'; message: string };

function extractBusinessId(decodedText: string): string | null {
  try {
    const url = new URL(decodedText);
    return url.searchParams.get('businessId');
  } catch {
    return null;
  }
}

export function ScanContent() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(true);
  const [state, setState] = useState<ScanState>({ phase: 'scanning' });
  const [business, setBusiness] = useState<BusinessWithId | null>(null);

  const searchParams = useSearchParams();
  const businessIdFromUrl = searchParams.get('businessId');
  const backHref = business ? `/customer/store/${business.id}` : '/customer/dashboard';

  const awardPoints = async (businessId: string) => {
    if (!user) return;
    setState({ phase: 'awarding' });

    const targetBusiness = await getBusiness(businessId);
    if (!targetBusiness) {
      setState({ phase: 'error', message: "This code doesn't match a business on Loyalty Leap." });
      return;
    }
    setBusiness(targetBusiness);

    const result = await recordScan(businessId, user.uid);
    if (result.status === 'awarded') {
      setState({
        phase: 'awarded',
        pointsAwarded: result.pointsAwarded,
        newTotal: result.newTotal,
        businessName: targetBusiness.name,
      });
      toast({ title: "Points Earned!", description: `+${result.pointsAwarded} points at ${targetBusiness.name}.` });
    } else if (result.status === 'cooldown') {
      setState({ phase: 'cooldown', retryAfter: result.retryAfter, businessName: targetBusiness.name });
    } else {
      setState({ phase: 'error', message: result.message });
    }
  };

  // Deep-link path: the QR's URL already carries businessId, so a customer
  // opening it with their phone's native camera lands here with nothing left
  // to scan in-app — award immediately.
  useEffect(() => {
    if (businessIdFromUrl && user) {
      awardPoints(businessIdFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessIdFromUrl, user]);

  // In-app camera path: only runs when there's no businessId in the URL yet,
  // i.e. the customer opened the app and tapped "Scan" themselves.
  useEffect(() => {
    if (businessIdFromUrl) return;

    scannerRef.current = new Html5Qrcode(qrcodeRegionId, { verbose: false });
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

      const qrCodeSuccessCallback = (decodedText: string) => {
        if (html5Qrcode.isScanning) {
          html5Qrcode.stop().catch(err => console.error("Error stopping scanner post-success", err));
        }
        const businessId = extractBusinessId(decodedText);
        if (!businessId) {
          setState({ phase: 'error', message: "That doesn't look like a Loyalty Leap code." });
          return;
        }
        awardPoints(businessId);
      };

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      if (html5Qrcode.getState() === Html5QrcodeScannerState.NOT_STARTED) {
        try {
          await html5Qrcode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback, undefined);
        } catch (err) {
          console.error("Error starting scanner: ", err);
          toast({
            variant: "destructive",
            title: "Scanner Error",
            description: "Could not start the QR code scanner.",
          });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessIdFromUrl]);

  const handleRescan = () => {
    window.location.href = '/customer/scan';
  };

  return (
    <div className="w-full max-w-md">
      <Button asChild variant="ghost" className="mb-4">
        <Link href={backHref}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {business ? business.name : 'Dashboard'}
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Scan QR Code</CardTitle>
          <CardDescription>
            Point your camera at a business's QR code to earn points.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative flex flex-col items-center justify-center">
          {state.phase === 'scanning' && (
            <>
              {!hasPermission && (
                <Alert variant="destructive">
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                    Please allow camera access to use this feature. You may need to refresh the page after granting permissions.
                  </AlertDescription>
                </Alert>
              )}
              <div id={qrcodeRegionId} className="w-full aspect-square rounded-md overflow-hidden bg-muted relative"></div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[250px] h-[250px] border-4 border-dashed border-primary rounded-lg animate-pulse"></div>
              </div>
            </>
          )}

          {state.phase === 'awarding' && (
            <div className="py-12 text-center text-muted-foreground">Recording your scan…</div>
          )}

          {state.phase === 'awarded' && (
            <div className="mt-4 text-center">
              <Alert variant="default" className="border-green-500 text-green-700">
                <PartyPopper className="h-4 w-4" />
                <AlertTitle className="text-green-600">+{state.pointsAwarded} points!</AlertTitle>
                <AlertDescription className="break-words">
                  You now have {state.newTotal} points at {state.businessName}.
                </AlertDescription>
              </Alert>
              <Button onClick={handleRescan} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Scan Another
              </Button>
            </div>
          )}

          {state.phase === 'cooldown' && (
            <div className="mt-4 text-center">
              <Alert variant="default">
                <Clock className="h-4 w-4" />
                <AlertTitle>Already earned points here recently</AlertTitle>
                <AlertDescription className="break-words">
                  You can scan again at {state.businessName} {formatDistanceToNow(state.retryAfter, { addSuffix: true })}.
                </AlertDescription>
              </Alert>
              <Button onClick={handleRescan} variant="outline" className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Scan Another
              </Button>
            </div>
          )}

          {state.phase === 'error' && (
            <div className="mt-4 text-center">
              <Alert variant="destructive">
                <AlertTitle>Couldn&apos;t record that scan</AlertTitle>
                <AlertDescription className="break-words">{state.message}</AlertDescription>
              </Alert>
              <Button onClick={handleRescan} variant="outline" className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
