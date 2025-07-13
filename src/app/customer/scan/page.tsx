
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  
  export default function ScanPage() {
    return (
      <div className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Scan QR Code</CardTitle>
            <CardDescription>
              This is where the QR code scanning interface will be.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>QR code scanner component will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  