
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScanContent } from './scan-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function ScanSkeleton() {
    return (
        <div className="w-full max-w-md">
             <Card>
                <CardHeader>
                    <CardTitle>Scan QR Code</CardTitle>
                    <CardDescription>
                       Loading scanner...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full aspect-square rounded-md" />
                </CardContent>
            </Card>
        </div>
    )
}


export default function ScanPage() {
  return (
    <div className="flex-1 p-4 md:p-6 flex flex-col items-center">
        <Suspense fallback={<ScanSkeleton />}>
            <ScanContent />
        </Suspense>
    </div>
  );
}
