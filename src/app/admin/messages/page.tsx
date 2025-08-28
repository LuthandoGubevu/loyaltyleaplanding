
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


function MessagesSkeleton() {
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

export default function MessagesPage() {
    const [messages, setMessages] = useState<DemoRequestWithId[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            setIsLoading(true);
            const fetchedMessages = await getDemoRequests();
            setMessages(fetchedMessages);
            setIsLoading(false);
        };
        fetchMessages();
    }, []);

    if (isLoading) {
        return <MessagesSkeleton />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Demo Requests</CardTitle>
                <CardDescription>
                    A list of all submitted demo requests from potential clients.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {messages.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {messages.map((message) => (
                            <AccordionItem value={message.id} key={message.id}>
                                <AccordionTrigger>
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-4">
                                            <div className="grid gap-1 text-left">
                                                <p className="text-sm font-medium leading-none">{message.businessName}</p>
                                                <p className="text-sm text-muted-foreground">{message.ownerName} - {message.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground text-right">
                                            {format(new Date(message.submittedAt), "PPP p")}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="p-4 bg-muted/50 rounded-md">
                                        {message.phone && (
                                            <p className="text-sm mb-2">
                                                <strong className="font-semibold">Phone:</strong> {message.phone}
                                            </p>
                                        )}
                                        <p className="text-sm whitespace-pre-wrap">
                                            <strong className="font-semibold">Message:</strong>
                                            <br />
                                            {message.message}
                                        </p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center text-muted-foreground py-12">
                        No messages yet.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
