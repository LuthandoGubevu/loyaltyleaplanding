
"use client";

import { Suspense } from 'react';
import { useSearchParams } from "next/navigation"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getLoyaltyData } from "@/lib/mock-data";
import { Skeleton } from '@/components/ui/skeleton';

const allCustomers = [
    { name: "Olivia Martin", email: "olivia.martin@email.com", totalPoints: 1250, tier: "Gold", stores: ["cozy-cafe", "urban-threads"]},
    { name: "Jackson Lee", email: "jackson.lee@email.com", totalPoints: 830, tier: "Silver", stores: ["modern-cuts"]},
    { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", totalPoints: 450, tier: "Bronze", stores: ["bloom-and-grow"]},
    { name: "William Kim", email: "will@email.com", totalPoints: 210, tier: "Bronze", stores: ["urban-threads"]},
    { name: "Sofia Davis", email: "sofia.davis@email.com", totalPoints: 1570, tier: "Gold", stores: ["cozy-cafe", "bloom-and-grow"]},
]

function CustomersContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('storeId');

  const customers = storeId && storeId !== 'all' 
    ? allCustomers.filter(c => c.stores.includes(storeId))
    : allCustomers;
  
  const currentStore = storeId ? getLoyaltyData().stores.find(s => s.id === storeId) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>
          A list of all customers in your loyalty program {currentStore ? `at ${currentStore.name}` : ''}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="text-right">Total Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map(customer => (
                <TableRow key={customer.email}>
                    <TableCell>
                        <div className="flex items-center gap-4">
                            <Avatar className="hidden h-9 w-9 sm:flex">
                                <AvatarImage src={`https://placehold.co/40x40.png`} alt="Avatar" data-ai-hint="user avatar"/>
                                <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium leading-none">{customer.name}</p>
                                <p className="text-sm text-muted-foreground">{customer.email}</p>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={customer.tier === 'Gold' ? 'default' : customer.tier === 'Silver' ? 'secondary' : 'outline'}>{customer.tier}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{customer.totalPoints}</TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CustomersSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-12" />
                        </div>
                    ))}
                 </div>
            </CardContent>
        </Card>
    )
}

export default function CustomersPage() {
    return (
        <Suspense fallback={<CustomersSkeleton />}>
            <CustomersContent />
        </Suspense>
    )
}
