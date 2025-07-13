
"use client";

import { Suspense } from 'react';
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { getLoyaltyData } from "@/lib/mock-data";
import { Skeleton } from '@/components/ui/skeleton';

const allRewards = [
    { name: "Free Coffee", cost: 100, status: "Active", store: "The Cozy Cafe", storeId: "cozy-cafe" },
    { name: "R50 Off Purchase", cost: 500, status: "Active", store: "The Cozy Cafe", storeId: "cozy-cafe" },
    { name: "25% Off Haircut", cost: 1000, status: "Active", store: "Modern Cuts Salon", storeId: "modern-cuts" },
    { name: "Exclusive Tote Bag", cost: 2000, status: "Disabled", store: "Urban Threads Boutique", storeId: "urban-threads" },
    { name: "Free Bouquet", cost: 150, status: 'Active', store: 'Bloom & Grow Florist', storeId: "bloom-and-grow" }
]

function RewardsContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('storeId');

  const rewards = storeId && storeId !== 'all' 
    ? allRewards.filter(r => r.storeId === storeId)
    : allRewards;
  
  const currentStore = storeId ? getLoyaltyData().stores.find(s => s.id === storeId) : null;

  return (
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Reward Manager</CardTitle>
                    <CardDescription>
                        Add, edit, or disable available rewards {currentStore ? `for ${currentStore.name}` : ''}.
                    </CardDescription>
                </div>
                <Button size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                    Add Reward
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Reward</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Points Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rewards.map(reward => (
                    <TableRow key={reward.name}>
                        <TableCell className="font-medium">{reward.name}</TableCell>
                        <TableCell>{reward.store}</TableCell>
                        <TableCell>{reward.cost}</TableCell>
                        <TableCell>
                            <Badge variant={reward.status === 'Active' ? 'outline' : 'secondary'}>{reward.status}</Badge>
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                                >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>{reward.status === 'Active' ? 'Disable' : 'Enable'}</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}

function RewardsSkeleton() {
    return (
        <Card>
            <CardHeader>
                 <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-9 w-32 rounded-md" />
                </div>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-4 px-4">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-10" />
                    </div>
                     {[...Array(5)].map((_, i) => (
                        <div key={i} className="grid grid-cols-5 gap-4 p-4 border-t">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                     ))}
                 </div>
            </CardContent>
        </Card>
    );
}

export default function RewardsPage() {
    return (
        <Suspense fallback={<RewardsSkeleton />}>
            <RewardsContent />
        </Suspense>
    )
}
