'use client';

import { useCallback } from 'react';
import { trackEvent, setCustomTags, type CustomTags } from '@/components/clarity/clarity.service.init';
import { useAuth } from '@/components/auth/auth.context.provider';

export function useClarityTracking() {
  const { user, selectedRole, isAuthenticated } = useAuth();

  const trackCustomEvent = useCallback((eventName: string, customProperties?: Record<string, unknown>) => {
    const contextualProperties = {
      userRole: selectedRole?.role || 'guest',
      roleStatus: selectedRole?.invitationStatus || 'none',
      isAuthenticated,
      ...customProperties
    };

    trackEvent(eventName, contextualProperties);
  }, [selectedRole, isAuthenticated]);

  const updateUserTags = useCallback((additionalTags: CustomTags) => {
    const contextualTags: CustomTags = {
      userRole: selectedRole?.role || 'guest',
      roleStatus: selectedRole?.invitationStatus || 'none',
      isAuthenticated,
      profileComplete: user?.firstName && user?.lastName ? true : false,
      ...additionalTags
    };

    setCustomTags(contextualTags);
  }, [user, selectedRole, isAuthenticated]);

  return {
    trackCustomEvent,
    updateUserTags
  };
}
