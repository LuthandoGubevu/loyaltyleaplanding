
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/use-auth';
import type { UserProfile } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Edit } from "lucide-react";
import Link from "next/link";
  
type DisplayProfile = Omit<UserProfile, 'createdAt' | 'dob'> & {
    createdAt: string;
    dob?: string;
}

function ProfileSkeleton() {
    return (
      <div className="flex-1 p-4 md:p-6 max-w-lg mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-start sm:items-center">
              <div className="grid gap-2 flex-1">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-9 w-28" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
          </CardContent>
        </Card>
      </div>
    )
}


export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<DisplayProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setLoading(false);
                return;
            };

            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as UserProfile;
                setProfile({
                    ...data,
                    createdAt: data.createdAt ? format(data.createdAt, 'PPP') : 'N/A',
                    dob: data.dob ? format(data.dob, 'PPP') : 'Not provided',
                });
            } else {
                console.log("No such document!");
            }
            setLoading(false);
        };

        fetchProfile();
    }, [user]);

    if (loading) {
        return <ProfileSkeleton />;
    }

    if (!profile) {
        return <p>No profile found.</p>
    }

  return (
    <div className="flex-1 p-4 md:p-6 max-w-lg mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-start sm:items-center">
            <div className="grid gap-2 flex-1">
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
                Manage your personal information.
            </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1 shrink-0">
            <Link href="#">
                Edit Profile
                <Edit className="h-4 w-4" />
            </Link>
            </Button>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4 text-sm sm:text-base">
                <div className="grid grid-cols-3 items-center">
                    <span className="font-semibold text-muted-foreground">Name:</span>
                    <span className="col-span-2">{profile.firstName} {profile.lastName}</span>
                </div>
                 <div className="grid grid-cols-3 items-center">
                    <span className="font-semibold text-muted-foreground">Email:</span>
                    <span className="col-span-2">{profile.email}</span>
                </div>
                <div className="grid grid-cols-3 items-center">
                    <span className="font-semibold text-muted-foreground">Date of Birth:</span>
                    <span className="col-span-2">{profile.dob}</span>
                </div>
                 <div className="grid grid-cols-3 items-center">
                    <span className="font-semibold text-muted-foreground">Marketing:</span>
                    <span className="col-span-2">{profile.marketingOptIn ? 'Subscribed' : 'Not Subscribed'}</span>
                </div>
                <div className="grid grid-cols-3 items-center">
                    <span className="font-semibold text-muted-foreground">Member Since:</span>
                    <span className="col-span-2">{profile.createdAt}</span>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
