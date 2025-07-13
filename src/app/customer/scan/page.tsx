
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const qrcodeRegionId = "html5qr-code-full-region";

export default function ScanPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(qrcodeRegionId);
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
            setScanResult(decodedText);
            toast({
                title: "QR Code Scanned!",
                description: `Result: ${decodedText}`,
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
      if (html5Qrcode && html5Qrcode.getState() === Html5QrcodeScannerState.SCANNING) {
        html5Qrcode.stop().then(() => {
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
  }, [toast]);
  
  const handleRescan = () => {
      window.location.reload();
  }

  return (
    <div className="flex-1 p-4 md:p-6 flex flex-col items-center">
        <div className="w-full max-w-md">
            <Button asChild variant="ghost" className="mb-4">
                <Link href="/customer/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Scan QR Code</CardTitle>
                    <CardDescription>
                        Point your camera at a QR code to earn points.
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
                    <div id={qrcodeRegionId} className="w-full aspect-square rounded-md overflow-hidden relative"></div>
                    {isScanning && (
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[250px] h-[250px] border-4 border-dashed border-red-500 rounded-lg"></div>
                        </div>
                    )}
                    {scanResult && (
                        <div className="mt-4 text-center">
                            <Alert>
                                <AlertTitle>Scan Successful!</AlertTitle>
                                <AlertDescription className="break-all">
                                    Scanned data: {scanResult}
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
    </div>
  );
}
