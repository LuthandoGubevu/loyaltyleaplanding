

"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { useSearchParams } from "next/navigation";
import { getStoreById } from "@/lib/mock-data";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data removed
const pointHistory: any[] = [];
  
function ActivityContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('storeId');
  const store = storeId ? getStoreById(storeId) : null;
  const history = store ? store.activity : pointHistory;

  return (
    <div className="flex-1 p-4 md:p-6">
      <Card>
          <CardHeader className="px-7">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              A log of your recent points activity{store ? ` at ${store.name}`: ''}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium text-muted-foreground">{item.date}</div>
                      </TableCell>
                      <TableCell>{item.action}</TableCell>
                      <TableCell className={`text-right ${item.points.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{item.points}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                      <TableCell colSpan={3} className="text-center h-24">
                          No activity to show yet.
                      </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex-1 p-4 md:p-6">
      <Card>
        <CardHeader className="px-7">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 px-4">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20 ml-auto" />
              </div>
              {[...Array(5)].map((_, i) => (
                  <div key={i} className="grid grid-cols-3 gap-4 p-4 border-t">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-6 w-1/3 ml-auto" />
                  </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ActivityPage() {
  return (
    <Suspense fallback={<ActivitySkeleton />}>
      <ActivityContent />
    </Suspense>
  )
}
