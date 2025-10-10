'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/providers/Providers';
import LoadingSpinner from '../ui/LoadingSpinner';

type Props = {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
};

export default function AuthGuard({ 
  children, 
  redirectTo = "/login", 
  fallback 
}: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />
  }

  if (!user) {
    return fallback || <div className="p-8 text-center">Redirecting...</div>
  }

  return (
    <>
      {children}
    </>
  );
};
