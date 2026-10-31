'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/auth.context.provider';
import { usePathname, useRouter } from '@/i18n/i18n.navigation';
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
            // Redirect to login with current URL as redirect param. `pathname`
            // has no locale prefix, so the login page's locale-aware router
            // can send the user back without doubling it.
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