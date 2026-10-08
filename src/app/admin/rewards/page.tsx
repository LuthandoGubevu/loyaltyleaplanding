"use client";

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Pencil, PlusCircle } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { addReward, getLoyaltyProgram, getRewards, updateLoyaltyProgram, updateReward } from '@/lib/firebase/firestore';
import type { Reward } from '@/lib/loyalty/types';

const programSchema = z.object({
    earnRule: z.string().trim().min(3, { message: 'Describe how customers earn a stamp.' }).max(120),
    minSpend: z.coerce.number().min(0).optional(),
    cooldownHours: z.coerce.number().min(0).max(168),
});

const rewardSchema = z.object({
    name: z.string().trim().min(2, { message: 'Give the reward a name.' }).max(80),
    stampsRequired: z.coerce.number().int().min(1, { message: 'At least 1 stamp.' }).max(100),
});

function ProgramCard({ businessId }: { businessId: string }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const form = useForm<z.infer<typeof programSchema>>({
        resolver: zodResolver(programSchema),
        defaultValues: { earnRule: '', minSpend: 0, cooldownHours: 2 },
    });

    useEffect(() => {
        getLoyaltyProgram(businessId)
            .then(p => form.reset({ earnRule: p.earnRule, minSpend: p.minSpend ?? 0, cooldownHours: p.cooldownHours }))
            .finally(() => setLoading(false));
    }, [businessId, form]);

    const onSubmit = async (values: z.infer<typeof programSchema>) => {
        try {
            await updateLoyaltyProgram(businessId, {
                earnRule: values.earnRule,
                minSpend: values.minSpend ? values.minSpend : null,
                cooldownHours: values.cooldownHours,
            });
            toast({ title: 'Programme rules saved' });
        } catch {
            toast({ variant: 'destructive', title: 'Could not save', description: 'Please try again.' });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Programme rules</CardTitle>
                <CardDescription>How customers qualify for a stamp. Staff see this on the Till screen.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? <Skeleton className="h-40 w-full" /> : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-3">
                            <FormField control={form.control} name="earnRule" render={({ field }) => (
                                <FormItem className="md:col-span-3">
                                    <FormLabel>Customers earn a stamp for</FormLabel>
                                    <FormControl><Input placeholder="e.g. 1 stamp per coffee bought" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="minSpend" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Minimum spend (R)</FormLabel>
                                    <FormControl><Input type="number" min={0} step="1" {...field} /></FormControl>
                                    <FormDescription>0 for no minimum. Shown to staff as a reminder.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="cooldownHours" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hours between stamps</FormLabel>
                                    <FormControl><Input type="number" min={0} step="1" {...field} /></FormControl>
                                    <FormDescription>Stops the same customer being stamped twice in a row.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="flex items-end md:col-span-3">
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save rules
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </CardContent>
        </Card>
    );
}

function RewardDialog({ open, onOpenChange, reward, onSave }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reward: Reward | null;
    onSave: (values: z.infer<typeof rewardSchema>) => Promise<void>;
}) {
    const form = useForm<z.infer<typeof rewardSchema>>({
        resolver: zodResolver(rewardSchema),
        defaultValues: { name: '', stampsRequired: 10 },
    });

    useEffect(() => {
        if (open) form.reset(reward ? { name: reward.name, stampsRequired: reward.stampsRequired } : { name: '', stampsRequired: 10 });
    }, [open, reward, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{reward ? 'Edit reward' : 'Add reward'}</DialogTitle>
                    <DialogDescription>What customers get, and how many stamps it takes.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reward</FormLabel>
                                <FormControl><Input placeholder="e.g. Free coffee" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="stampsRequired" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stamps required</FormLabel>
                                <FormControl><Input type="number" min={1} step="1" {...field} /></FormControl>
                                <FormDescription>These stamps are used up when the reward is redeemed.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save reward
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function RewardsCard({ businessId }: { businessId: string }) {
    const { toast } = useToast();
    const [rewards, setRewards] = useState<Reward[] | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Reward | null>(null);

    const load = useCallback(() => {
        getRewards(businessId).then(setRewards).catch(() => setRewards([]));
    }, [businessId]);

    useEffect(load, [load]);

    const save = async (values: z.infer<typeof rewardSchema>) => {
        try {
            if (editing) {
                await updateReward(businessId, editing.id, values);
            } else {
                await addReward(businessId, { ...values, active: true });
            }
            setDialogOpen(false);
            load();
        } catch {
            toast({ variant: 'destructive', title: 'Could not save reward', description: 'Please try again.' });
        }
    };

    const toggle = async (reward: Reward, active: boolean) => {
        try {
            await updateReward(businessId, reward.id, { active });
            load();
        } catch {
            toast({ variant: 'destructive', title: 'Could not update reward', description: 'Please try again.' });
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardTitle>Rewards</CardTitle>
                        <CardDescription>What customers can redeem their stamps for.</CardDescription>
                    </div>
                    <Button size="sm" className="gap-1" onClick={() => { setEditing(null); setDialogOpen(true); }}>
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
                            <TableHead>Stamps required</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead><span className="sr-only">Edit</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rewards === null ? (
                            <TableRow><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                        ) : rewards.length > 0 ? (
                            rewards.map(reward => (
                                <TableRow key={reward.id}>
                                    <TableCell className="font-medium">{reward.name}</TableCell>
                                    <TableCell>{reward.stampsRequired}</TableCell>
                                    <TableCell>
                                        <Switch checked={reward.active} onCheckedChange={(v) => toggle(reward, v)} aria-label={`${reward.name} active`} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="icon" variant="ghost" onClick={() => { setEditing(reward); setDialogOpen(true); }}>
                                            <Pencil className="h-4 w-4" />
                                            <span className="sr-only">Edit {reward.name}</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    No rewards created yet. Click "Add Reward" to start, e.g. 10 stamps for a free coffee.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            <RewardDialog open={dialogOpen} onOpenChange={setDialogOpen} reward={editing} onSave={save} />
        </Card>
    );
}

export default function RewardsPage() {
    const { businessId } = useAuth();

    if (!businessId) {
        return <p className="text-muted-foreground">Your account is not linked to a business yet.</p>;
    }

    return (
        <div className="grid gap-4 md:gap-8">
            <ProgramCard businessId={businessId} />
            <RewardsCard businessId={businessId} />
        </div>
    );
}
