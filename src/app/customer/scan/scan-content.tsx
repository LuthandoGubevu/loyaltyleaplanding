
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from 'next/navigation'
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getStoreById } from "@/lib/mock-data";

const qrcodeRegionId = "html5qr-code-full-region";

export function ScanContent() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  const searchParams = useSearchParams();
  const storeId = searchParams.get('storeId');
  const store = storeId ? getStoreById(storeId) : null;
  const backHref = storeId ? `/customer/store/${storeId}` : '/customer/dashboard';


  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(qrcodeRegionId, {
        verbose: false
      });
    }
    const html5Qrcode = scannerRef.current;

    const startScanner = async () => {
        setIsScanning(true);
        setScanResult(null);

        // Check for camera permissions
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
            toast({
                variant: "destructive",
                title: "Camera Access Denied",
                description: "Please enable camera permissions in your browser settings.",
            });
            return;
        }

        const qrCodeSuccessCallback = (decodedText: string) => {
            const pointsEarned = Math.floor(Math.random() * 50) + 10; // Simulate earning 10-60 points
            setScanResult(`Simulated scan for ${store?.name || 'a store'}. You earned ${pointsEarned} points!`);
            toast({
                title: "Points Earned!",
                description: `You've earned ${pointsEarned} points at ${store?.name || 'this store'}!`,
            });
            stopScanner();
        };

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        try {
             if (html5Qrcode.getState() !== Html5QrcodeScannerState.SCANNING) {
                await html5Qrcode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback, undefined);
             }
        } catch(err) {
            console.error("Error starting scanner: ", err);
             toast({
                variant: "destructive",
                title: "Scanner Error",
                description: "Could not start the QR code scanner.",
            });
            setIsScanning(false);
        }
    };
    
    const stopScanner = () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
          setIsScanning(false);
        }).catch((err) => {
          console.error("Failed to stop scanner", err);
        });
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [toast, store]);
  
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
                   Point your camera at a QR code to earn points{store ? ` at ${store.name}` : ''}.
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
                {isScanning && !scanResult &&(
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[250px] h-[250px] border-4 border-dashed border-primary rounded-lg animate-pulse"></div>
                    </div>
                )}
                {scanResult && (
                    <div className="mt-4 text-center">
                        <Alert variant="default" className="border-green-500 text-green-700">
                            <AlertTitle className="text-green-600">Scan Successful!</AlertTitle>
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
