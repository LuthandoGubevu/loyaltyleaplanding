
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
import { getDemoRequests } from "@/lib/firebase/firestore";
import type { DemoRequestWithId } from "@/lib/firebase/firestore";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";


function DemoRequestsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
            </CardContent>
        </Card>
    )
}

export default function StaffDemoRequestsPage() {
    const [requests, setRequests] = useState<DemoRequestWithId[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            setIsLoading(true);
            const fetched = await getDemoRequests();
            setRequests(fetched);
            setIsLoading(false);
        };
        fetchRequests();
    }, []);

    if (isLoading) {
        return <DemoRequestsSkeleton />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Demo Requests</CardTitle>
                <CardDescription>
                    Every demo request submitted by a prospective business through the public site.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {requests.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {requests.map((request) => (
                            <AccordionItem value={request.id} key={request.id}>
                                <AccordionTrigger>
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-4">
                                            <div className="grid gap-1 text-left">
                                                <p className="text-sm font-medium leading-none">{request.businessName}</p>
                                                <p className="text-sm text-muted-foreground">{request.ownerName} - {request.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground text-right">
                                            {format(new Date(request.submittedAt), "PPP p")}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="p-4 bg-muted/50 rounded-md">
                                        {request.phone && (
                                            <p className="text-sm mb-2">
                                                <strong className="font-semibold">Phone:</strong> {request.phone}
                                            </p>
                                        )}
                                        <p className="text-sm whitespace-pre-wrap">
                                            <strong className="font-semibold">Message:</strong>
                                            <br />
                                            {request.message}
                                        </p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center text-muted-foreground py-12">
                        No demo requests yet.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
