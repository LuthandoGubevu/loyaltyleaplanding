
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  createBusiness,
  getBusinesses,
  updateBusinessStatus,
  type BusinessWithId,
  type BusinessStatus,
} from "@/lib/firebase/firestore";
import { format } from "date-fns";

const addCompanySchema = z.object({
  name: z.string().min(2, { message: "Business name must be at least 2 characters." }),
  assignedAdminEmail: z.string().email({ message: "Invalid email address." }),
  plan: z.enum(["Launch", "Growth", "Complete"]),
});

function statusBadge(status: BusinessStatus) {
  if (status === "active") return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>;
  if (status === "pending") return <Badge variant="secondary">Pending signup</Badge>;
  return <Badge variant="outline">Inactive</Badge>;
}

export default function StaffCompaniesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState<BusinessWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BusinessStatus>("all");

  const form = useForm<z.infer<typeof addCompanySchema>>({
    resolver: zodResolver(addCompanySchema),
    defaultValues: { name: "", assignedAdminEmail: "", plan: "Launch" },
  });

  const loadBusinesses = async () => {
    setIsLoading(true);
    const list = await getBusinesses();
    setBusinesses(list);
    setIsLoading(false);
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch = !q || b.name.toLowerCase().includes(q) || b.assignedAdminEmail.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [businesses, search, statusFilter]);

  const onSubmit = async (values: z.infer<typeof addCompanySchema>) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await createBusiness({
        name: values.name,
        assignedAdminEmail: values.assignedAdminEmail,
        plan: values.plan,
        createdByUid: user.uid,
      });
      toast({ title: "Company added", description: `${values.name} can now be claimed by ${values.assignedAdminEmail}.` });
      form.reset();
      setDialogOpen(false);
      await loadBusinesses();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Could not add company", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkInactive = async (business: BusinessWithId) => {
    const nextStatus: BusinessStatus = business.status === "inactive" ? "active" : "inactive";
    await updateBusinessStatus(business.id, nextStatus);
    await loadBusinesses();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Companies</CardTitle>
          <CardDescription>Every business onboarded onto Loyalty Leap.</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add a company</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Onboard a new business</DialogTitle>
              <DialogDescription>
                Assign an admin email now — when that person signs up, they&apos;ll automatically get access to this business&apos;s admin dashboard.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business name</FormLabel>
                      <FormControl>
                        <Input placeholder="The Cozy Cafe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignedAdminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin email</FormLabel>
                      <FormControl>
                        <Input placeholder="owner@business.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Launch">Launch</SelectItem>
                          <SelectItem value="Growth">Growth</SelectItem>
                          <SelectItem value="Complete">Complete</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add company
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input
            placeholder="Search company or contact"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | BusinessStatus)}>
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending signup</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filtered.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Assigned admin</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((business) => (
                <TableRow key={business.id}>
                  <TableCell>
                    <Link href={`/staff/companies/${business.id}`} className="font-medium text-primary hover:underline">
                      {business.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{business.assignedAdminEmail}</TableCell>
                  <TableCell>{business.plan}</TableCell>
                  <TableCell>{statusBadge(business.status)}</TableCell>
                  <TableCell className="text-muted-foreground">{format(business.createdAt, "dd MMM yyyy")}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/staff/companies/${business.id}`}>Manage</Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleMarkInactive(business)}>
                      {business.status === "inactive" ? "Mark active" : "Mark inactive"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-muted-foreground py-12">No companies yet.</div>
        )}
      </CardContent>
    </Card>
  );
}
