'use client';

import { useAuth } from '@/components/auth/auth.context.provider';
import { identifyUser, initClarity, setCustomTags } from '@/components/clarity/clarity.service.init';
import { useEffect } from 'react';

export function ClarityAnalytics() {
  const { user, selectedRole, isAuthenticated } = useAuth();

  // Determine whether we are running in a dev/local environment
  const isDev = process.env.NODE_ENV === 'development';

  // Determine whether its SSR or CSR
  const isSSR = typeof window === 'undefined';

  // Read Clarity project id from public environment variable (recommended)
  const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  // Initialize Clarity (only in non-dev envs and when we have a project id)
  useEffect(() => {
    if (!isDev && !isSSR && CLARITY_PROJECT_ID) {
      initClarity(CLARITY_PROJECT_ID);
    }
  }, [isDev, isSSR, CLARITY_PROJECT_ID]);

  // Update user identification and custom tags when auth state changes
  useEffect(() => {
    // Only call identify/setCustomTags in non-dev environments when Clarity is initialized
    if (!isDev && !isSSR && CLARITY_PROJECT_ID && user && isAuthenticated && selectedRole) {
      // Identify user for session tracking
      identifyUser({
        userId: user.id?.toString(),
        phoneNumber: user.phone,
        roles: user.roles?.map(role => role.role) || [],
        selectedRole: selectedRole.role,
        invitationStatus: selectedRole.invitationStatus
      });

      // Set custom tags for user segmentation
      setCustomTags({
        userRole: selectedRole.role,
        roleStatus: selectedRole.invitationStatus,
        isAuthenticated: true,
        profileComplete: user.firstName && user.lastName ? true : false,
        userType: user.roles && user.roles.length > 1 ? 'multi_role' : 'single_role',
        totalRoles: user.roles?.length || 0,
        hasProfile: user.firstName && user.lastName ? 'yes' : 'no'
      });
    } else if (!isDev && CLARITY_PROJECT_ID && !isAuthenticated) {
      // Set guest user tags
      setCustomTags({
        userRole: 'guest',
        roleStatus: 'none',
        isAuthenticated: false,
        profileComplete: false,
        userType: 'guest',
        totalRoles: 0,
        hasProfile: 'no'
      });
    }
  }, [user, selectedRole, isAuthenticated, isDev, isSSR, CLARITY_PROJECT_ID]);

  return <div className='hidden'>Clarity Analytics Initialized</div>;
}
