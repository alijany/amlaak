'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useAuth } from './auth.context.provider';
import { Role } from './auth.constants.roles';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: Role[] | false;
  redirectPath?: string;
}

export function RoleProtectedRoute({
  children,
  allowedRoles,
  redirectPath = '/dashboard',
}: RoleProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasAnyRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to login and remember where to return.
      if (!isAuthenticated) {
        const current = window.location.pathname + window.location.search;
        router.push(`/login?redirect=${encodeURIComponent(current)}`);
        return;
      }

      // As a fallback, check if user has any allowed role
      if (allowedRoles && !hasAnyRole(allowedRoles)) {
        router.push(redirectPath);
      }
    }
  }, [isAuthenticated, isLoading, allowedRoles, redirectPath, router, hasAnyRole]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
    </div>;
  }

  // As a fallback, check if user has any allowed role
  if (allowedRoles && !hasAnyRole(allowedRoles)) {
    return null;
  }

  return children;
}