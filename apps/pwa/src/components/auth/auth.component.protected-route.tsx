'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/auth.context.provider';
import { Spinner } from '@/ui/atoms/ui.atoms.spinner';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated && pathname !== '/login') {
            // Redirect to login with current URL as redirect param
            const currentUrl = `${pathname}${window.location.search}`;
            const redirectUrl = `/login?redirect=${encodeURIComponent(currentUrl)}`;
            router.push(redirectUrl);
        }
    }, [isLoading, isAuthenticated, router, pathname]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Don't render anything while redirecting
    }

    return <>{children}</>;
}