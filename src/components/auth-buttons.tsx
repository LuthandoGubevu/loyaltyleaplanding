
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from './ui/skeleton';

export function AuthButtons({ className }: { className?: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return (
        <div className='flex items-center gap-2'>
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
        </div>
    )
  }

  if (user) {
    return (
      <div className={`flex flex-col sm:flex-row items-center gap-2 ${className}`}>
        <Button asChild className='w-full sm:w-auto'>
          <Link href={user.email === 'lgubevu@gmail.com' ? '/admin/dashboard' : '/customer/dashboard'}>
            Dashboard
          </Link>
        </Button>
        <Button variant="secondary" onClick={handleLogout} className='w-full sm:w-auto'>
          Log Out
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-2 ${className}`}>
      <Button asChild className='w-full sm:w-auto'>
        <Link href="/signup">Sign Up</Link>
      </Button>
      <Button variant="secondary" asChild className='w-full sm:w-auto'>
        <Link href="/login">Log In</Link>
      </Button>
    </div>
  );
}
