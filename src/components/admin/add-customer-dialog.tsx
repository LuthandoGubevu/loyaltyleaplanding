"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-client";
import { formatZaPhone, normalizeZaPhone } from "@/lib/phone";

const today = () => new Date().toISOString().slice(0, 10);

const schema = z.object({
  firstName: z.string().trim().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().trim().min(2, { message: "Last name must be at least 2 characters." }),
  phone: z.string().refine((v) => normalizeZaPhone(v) !== null, { message: "Enter a valid South African cellphone number." }),
  email: z.string().trim().email({ message: "Invalid email address." }).or(z.literal("")),
  dob: z.string().refine((v) => v === "" || v <= today(), { message: "Date of birth can't be in the future." }),
  marketingOptIn: z.boolean(),
  consent: z.boolean().refine((v) => v, { message: "The customer must agree before you add them." }),
  stampNow: z.boolean(),
});

type Values = z.infer<typeof schema>;

const empty: Values = { firstName: "", lastName: "", phone: "", email: "", dob: "", marketingOptIn: false, consent: false, stampNow: true };

// Managers register a customer and their details, e.g. at the counter before
// the customer has the app. When the customer later signs up in the app with
// the same cellphone number, their account is connected to this record.
export function AddCustomerDialog({ onAdded, disabled }: { onAdded: () => void; disabled?: boolean }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: empty });

  useEffect(() => { if (open) form.reset(empty); }, [open, form]);

  const onSubmit = async (values: Values) => {
    try {
      const result = await apiFetch<{ phone: string; stamps: number }>("/api/customers", { method: "POST", body: values });
      toast({
        title: `${values.firstName} ${values.lastName} added`,
        description: values.stampNow
          ? `First stamp added. When they sign up in the app with ${formatZaPhone(result.phone)}, their stamps will be waiting.`
          : `When they sign up in the app with ${formatZaPhone(result.phone)}, their account will be connected.`,
      });
      setOpen(false);
      onAdded();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Customer not added", description: error.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1" disabled={disabled}><UserPlus className="h-4 w-4" />Add customer</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a customer</DialogTitle>
          <DialogDescription>
            Register a customer and their details. If they later download the app and sign up with the same cellphone number, their account is connected automatically.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem><FormLabel>First name</FormLabel><FormControl><Input placeholder="Thandi" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem><FormLabel>Last name</FormLabel><FormControl><Input placeholder="Mokoena" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Cellphone number</FormLabel>
                <FormControl><Input type="tel" inputMode="tel" placeholder="082 123 4567" {...field} /></FormControl>
                <FormDescription>This is their loyalty number. They give it at the till and sign up with it in the app.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>Email <span className="font-normal text-muted-foreground">(optional)</span></FormLabel><FormControl><Input type="email" placeholder="name@example.com" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="dob" render={({ field }) => (
              <FormItem>
                <FormLabel>Date of birth <span className="font-normal text-muted-foreground">(optional)</span></FormLabel>
                <FormControl><Input type="date" max={today()} {...field} /></FormControl>
                <FormDescription>Used for birthday rewards.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="marketingOptIn" render={({ field }) => (
              <FormItem className="flex items-start gap-3 space-y-0">
                <FormControl><Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} /></FormControl>
                <FormLabel className="font-normal leading-snug">The customer is happy to receive news and offers from us.</FormLabel>
              </FormItem>
            )} />
            <FormField control={form.control} name="consent" render={({ field }) => (
              <FormItem className="space-y-1">
                <div className="flex items-start gap-3">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} /></FormControl>
                  <FormLabel className="font-normal leading-snug">The customer agreed to join our loyalty programme and for us to store their details.</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="stampNow" render={({ field }) => (
              <FormItem className="flex items-start gap-3 space-y-0 rounded-md border p-3">
                <FormControl><Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} /></FormControl>
                <div className="space-y-1">
                  <FormLabel className="font-normal leading-snug">Add a stamp for today&apos;s purchase</FormLabel>
                  <FormDescription>Untick if they haven&apos;t bought anything yet.</FormDescription>
                </div>
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add customer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
