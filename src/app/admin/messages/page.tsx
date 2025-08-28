
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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
import { getDemoRequests, DemoRequest } from "@/lib/mock-data";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";


export default function MessagesPage() {
    const messages = getDemoRequests();

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
                        {messages.map((message, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
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

