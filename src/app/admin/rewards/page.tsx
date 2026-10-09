"use client";

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Cake, Loader2, Lock, Pencil, PlusCircle } from "lucide-react";

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
import { createReward, fetchProgram, fetchRewards, saveProgram, updateReward } from '@/lib/loyalty/client';
import type { LoyaltyProgram, Reward } from '@/lib/loyalty/types';
import { formatLimit, UPGRADE_CONTACT, type Plan } from '@/lib/plans';

// Kept as text in the form ('' = not set) and converted on save.
const optionalRand = z.string().refine(
    v => v.trim() === '' || (Number.isFinite(Number(v)) && Number(v) >= 0),
    { message: 'Enter an amount in rand.' },
);
const toRand = (v: string) => (v.trim() === '' ? null : Number(v));

const programSchema = z.object({
    earnRule: z.string().trim().min(3, { message: 'Describe how customers earn a stamp.' }).max(120),
    minSpend: z.coerce.number().min(0).optional(),
    cooldownHours: z.coerce.number().min(0).max(168),
});

const birthdaySchema = z.object({
    enabled: z.boolean(),
    name: z.string().trim().min(2, { message: 'Name the birthday reward.' }).max(80),
    costRand: optionalRand,
});

const rewardSchema = z.object({
    name: z.string().trim().min(2, { message: 'Give the reward a name.' }).max(80),
    stampsRequired: z.coerce.number().int().min(1, { message: 'At least 1 stamp.' }).max(100),
    costRand: optionalRand,
});

const rand = (n: number | null) => (n === null ? '—' : `R${n.toLocaleString('en-ZA', { maximumFractionDigits: 2 })}`);

function ProgramCard({ program, onSaved }: { program: LoyaltyProgram; onSaved: () => void }) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof programSchema>>({
        resolver: zodResolver(programSchema),
        defaultValues: { earnRule: program.earnRule, minSpend: program.minSpend ?? 0, cooldownHours: program.cooldownHours },
    });

    const onSubmit = async (values: z.infer<typeof programSchema>) => {
        try {
            await saveProgram({
                ...program,
                earnRule: values.earnRule,
                minSpend: values.minSpend ? values.minSpend : null,
                cooldownHours: values.cooldownHours,
            });
            toast({ title: 'Programme rules saved' });
            onSaved();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Could not save', description: error.message });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Programme rules</CardTitle>
                <CardDescription>How customers qualify for a stamp. Staff see this on the Till screen.</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
        </Card>
    );
}

function BirthdayCard({ program, plan, onSaved }: { program: LoyaltyProgram; plan: Plan; onSaved: () => void }) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof birthdaySchema>>({
        resolver: zodResolver(birthdaySchema),
        defaultValues: {
            enabled: program.birthdayReward.enabled,
            name: program.birthdayReward.name,
            costRand: program.birthdayReward.costRand === null ? '' : String(program.birthdayReward.costRand),
        },
    });

    const onSubmit = async (values: z.infer<typeof birthdaySchema>) => {
        try {
            await saveProgram({ ...program, birthdayReward: { ...values, costRand: toRand(values.costRand) } });
            toast({ title: 'Birthday reward saved' });
            onSaved();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Could not save', description: error.message });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Cake className="h-5 w-5 text-primary" />Birthday reward</CardTitle>
                <CardDescription>
                    A free treat in the customer&apos;s birthday week, once a year. It doesn&apos;t use their stamps. Only customers who shared their birthday qualify.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!plan.birthdayRewards ? (
                    <div className="flex items-start gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>
                            Birthday rewards are included in the Growth and Pro plans.{' '}
                            <a className="font-medium text-primary underline-offset-4 hover:underline" href={`mailto:${UPGRADE_CONTACT}?subject=Upgrade%20my%20Loyalty%20Leap%20plan`}>Ask about upgrading</a>.
                        </p>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-3">
                            <FormField control={form.control} name="enabled" render={({ field }) => (
                                <FormItem className="flex items-center gap-3 md:col-span-3">
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <FormLabel className="!mt-0">Offer a birthday reward</FormLabel>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Reward</FormLabel>
                                    <FormControl><Input placeholder="e.g. Free slice of cake" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="costRand" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cost to you (R)</FormLabel>
                                    <FormControl><Input type="number" min={0} step="0.01" placeholder="Optional" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="md:col-span-3">
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save birthday reward
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
        defaultValues: { name: '', stampsRequired: 10, costRand: '' },
    });

    useEffect(() => {
        if (open) {
            form.reset(reward
                ? { name: reward.name, stampsRequired: reward.stampsRequired, costRand: reward.costRand === null ? '' : String(reward.costRand) }
                : { name: '', stampsRequired: 10, costRand: '' });
        }
    }, [open, reward, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{reward ? 'Edit reward' : 'Add reward'}</DialogTitle>
                    <DialogDescription>What customers get, how many stamps it takes, and what it costs you.</DialogDescription>
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
                        <FormField control={form.control} name="costRand" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cost to you (R)</FormLabel>
                                <FormControl><Input type="number" min={0} step="0.01" placeholder="e.g. 12" {...field} /></FormControl>
                                <FormDescription>What it costs you to give this reward away. Used to work out what the programme costs.</FormDescription>
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

function RewardsCard({ plan }: { plan: Plan }) {
    const { toast } = useToast();
    const [rewards, setRewards] = useState<Reward[] | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Reward | null>(null);

    const load = useCallback(() => {
        fetchRewards().then(setRewards).catch(() => setRewards([]));
    }, []);

    useEffect(load, [load]);

    const activeCount = rewards?.filter(r => r.active).length ?? 0;
    const atLimit = plan.maxActiveRewards !== null && activeCount >= plan.maxActiveRewards;

    const save = async (values: z.infer<typeof rewardSchema>) => {
        const reward = { ...values, costRand: toRand(values.costRand) };
        try {
            if (editing) {
                await updateReward(editing.id, reward);
            } else {
                await createReward({ ...reward, active: true });
            }
            setDialogOpen(false);
            load();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Could not save reward', description: error.message });
        }
    };

    const toggle = async (reward: Reward, active: boolean) => {
        try {
            await updateReward(reward.id, { active });
            load();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Could not update reward', description: error.message });
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardTitle>Rewards</CardTitle>
                        <CardDescription>
                            What customers can redeem their stamps for. {formatLimit(plan.maxActiveRewards)} active on the {plan.id} plan
                            {plan.maxActiveRewards !== null && rewards ? ` (${activeCount} in use)` : ''}.
                        </CardDescription>
                    </div>
                    <Button size="sm" className="gap-1" disabled={atLimit} onClick={() => { setEditing(null); setDialogOpen(true); }}>
                        <PlusCircle className="h-4 w-4" />
                        Add Reward
                    </Button>
                </div>
                {atLimit && (
                    <p className="text-sm text-muted-foreground">
                        You&apos;re using all {plan.maxActiveRewards} rewards on your plan. Switch one off to add another, or{' '}
                        <a className="font-medium text-primary underline-offset-4 hover:underline" href={`mailto:${UPGRADE_CONTACT}?subject=Upgrade%20my%20Loyalty%20Leap%20plan`}>upgrade for unlimited rewards</a>.
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Reward</TableHead>
                            <TableHead>Stamps required</TableHead>
                            <TableHead>Cost to you</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead><span className="sr-only">Edit</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rewards === null ? (
                            <TableRow><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                        ) : rewards.length > 0 ? (
                            rewards.map(reward => (
                                <TableRow key={reward.id}>
                                    <TableCell className="font-medium">{reward.name}</TableCell>
                                    <TableCell>{reward.stampsRequired}</TableCell>
                                    <TableCell>{rand(reward.costRand)}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={reward.active}
                                            disabled={!reward.active && atLimit}
                                            onCheckedChange={(v) => toggle(reward, v)}
                                            aria-label={`${reward.name} active`}
                                        />
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
                                <TableCell colSpan={5} className="text-center h-24">
                                    No rewards created yet. Click &quot;Add Reward&quot; to start, e.g. 10 stamps for a free coffee.
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
    const [state, setState] = useState<{ program: LoyaltyProgram; plan: Plan } | null>(null);
    const [version, setVersion] = useState(0);

    const load = useCallback(() => {
        fetchProgram().then(setState).catch(() => setState(null));
    }, []);

    useEffect(() => {
        if (businessId) load();
    }, [businessId, load]);

    if (!businessId) {
        return <p className="text-muted-foreground">Your account is not linked to a business yet.</p>;
    }
    if (!state) {
        return <Skeleton className="h-64 w-full" />;
    }

    const reload = () => { load(); setVersion(v => v + 1); };

    return (
        <div className="grid gap-4 md:gap-8">
            <ProgramCard key={`p${version}`} program={state.program} onSaved={reload} />
            <RewardsCard plan={state.plan} />
            <BirthdayCard key={`b${version}`} program={state.program} plan={state.plan} onSaved={reload} />
        </div>
    );
}
