
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from "lucide-react";

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase/config';
import { createUserProfile, findPendingBusinessByEmail, claimBusiness } from '@/lib/firebase/firestore';
import { isStaffEmail } from '@/lib/roles';

const formSchema = z.object({
    firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
    lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string(),
    dob: z.date().optional(),
    marketingOptIn: z.boolean().default(false).optional(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type DobState = {
  day: string;
  month: string;
  year: string;
}

const years = Array.from({ length: new Date().getFullYear() - 1939 }, (_, i) => String(new Date().getFullYear() - i));
const months = Array.from({ length: 12 }, (_, i) => ({ value: String(i), label: new Date(2000, i).toLocaleString('default', { month: 'long' }) }));

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dob, setDob] = useState<DobState>({ day: '', month: '', year: '' });
  const [days, setDays] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      marketingOptIn: false,
    },
  });

  useEffect(() => {
    const { year, month } = dob;
    if (year && month) {
      const daysInMonth = new Date(Number(year), Number(month) + 1, 0).getDate();
      setDays(Array.from({ length: daysInMonth }, (_, i) => String(i + 1)));
    } else {
      setDays(Array.from({ length: 31 }, (_, i) => String(i + 1)));
    }
  }, [dob.year, dob.month]);
  
  useEffect(() => {
      if (dob.year && dob.month && dob.day) {
          const newDate = new Date(Number(dob.year), Number(dob.month), Number(dob.day));
          form.setValue('dob', newDate, { shouldValidate: true });
      }
  }, [dob, form]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const baseProfile = {
        email: user.email!,
        firstName: values.firstName,
        lastName: values.lastName,
        dob: values.dob,
        marketingOptIn: values.marketingOptIn,
      };

      let redirectTo = '/customer/dashboard';

      if (isStaffEmail(user.email)) {
        await createUserProfile(user.uid, { ...baseProfile, role: 'staff' });
        redirectTo = '/staff';
      } else {
        const pendingBusiness = await findPendingBusinessByEmail(user.email!);
        if (pendingBusiness) {
          await createUserProfile(user.uid, { ...baseProfile, role: 'admin', businessId: pendingBusiness.id });
          await claimBusiness(pendingBusiness.id, user.uid);
          redirectTo = '/admin/dashboard';
        } else {
          await createUserProfile(user.uid, { ...baseProfile, role: 'customer' });
          redirectTo = '/customer/dashboard';
        }
      }

      toast({
        title: 'Account Created',
        description: "You've been successfully signed up!",
      });
      router.push(redirectTo);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create your Loyalty Leap account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Jane" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of birth (Optional)</FormLabel>
                    <div className="grid grid-cols-3 gap-2">
                       <Select onValueChange={(value) => setDob(prev => ({...prev, month: value}))} value={dob.month}>
                         <SelectTrigger>
                           <SelectValue placeholder="Month" />
                         </SelectTrigger>
                         <SelectContent>
                           {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                         </SelectContent>
                       </Select>
                       <Select onValueChange={(value) => setDob(prev => ({...prev, day: value}))} value={dob.day}>
                         <SelectTrigger>
                           <SelectValue placeholder="Day" />
                         </SelectTrigger>
                         <SelectContent>
                           {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                         </SelectContent>
                       </Select>
                       <Select onValueChange={(value) => setDob(prev => ({...prev, year: value}))} value={dob.year}>
                         <SelectTrigger>
                           <SelectValue placeholder="Year" />
                         </SelectTrigger>
                         <SelectContent>
                           {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                         </SelectContent>
                       </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                       <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                       <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="marketingOptIn"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Receive marketing emails
                      </FormLabel>
                      <FormDescription>
                        Receive special offers, updates, and more from Loyalty Leap partners.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" passHref>
            <span className="underline cursor-pointer">Log in</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
