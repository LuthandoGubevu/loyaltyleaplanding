
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserProfile } from '@/lib/firebase/firestore';
import { isStaffEmail, type Role } from '@/lib/roles';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: Role | null;
  businessId: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  businessId: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        if (isStaffEmail(user.email)) {
          setRole('staff');
          setBusinessId(null);
        } else {
          const profile = await getUserProfile(user.uid);
          setRole(profile?.role ?? null);
          setBusinessId(profile?.businessId ?? null);
        }
      } else {
        setRole(null);
        setBusinessId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, role, businessId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const useRequireAuth = (redirectTo = '/login') => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading };
};

function roleHome(role: Role | null): string {
  if (role === 'staff') return '/staff';
  if (role === 'admin') return '/admin/dashboard';
  return '/customer/dashboard';
}

const ProtectedRoute = ({ children, allowedRoles }: { children: ReactNode, allowedRoles?: Role[] }) => {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  const isAllowed = !allowedRoles || (role !== null && allowedRoles.includes(role));

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (!isAllowed) {
      router.push(roleHome(role));
    }
  }, [user, loading, role, router, isAllowed]);

  if (loading || !user || !isAllowed) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};


export const CustomerRoute = ({ children }: { children: ReactNode }) => {
  return <ProtectedRoute>{children}</ProtectedRoute>;
};

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  return <ProtectedRoute allowedRoles={['admin', 'staff']}>{children}</ProtectedRoute>;
};

export const StaffRoute = ({ children }: { children: ReactNode }) => {
  return <ProtectedRoute allowedRoles={['staff']}>{children}</ProtectedRoute>;
};
