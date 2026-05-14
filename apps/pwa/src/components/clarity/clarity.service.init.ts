
import clarity from '@microsoft/clarity';

export interface UserIdentification {
  userId?: string;
  phoneNumber?: string;
  roles?: string[];
  selectedRole?: string;
  invitationStatus?: string;
}

export interface CustomTags {
  userRole?: string;
  roleStatus?: string;
  userType?: string;
  isAuthenticated?: boolean;
  profileComplete?: boolean;
  [key: string]: string | boolean | number | undefined;
}

export function initClarity(clarityProjectId: string) {
  clarity.init(clarityProjectId);
}

export function identifyUser(userInfo: UserIdentification) {
  if (typeof window === 'undefined') return;
  
  try {
    // Set user ID for session tracking
    if (userInfo.userId) {
      clarity.identify(userInfo.userId, undefined, undefined, userInfo.phoneNumber);
      
      // Set additional user properties using setTag
      if (userInfo.roles?.length) {
        clarity.setTag('roles', userInfo.roles.join(','));
      }
      if (userInfo.selectedRole) {
        clarity.setTag('selectedRole', userInfo.selectedRole);
      }
      if (userInfo.invitationStatus) {
        clarity.setTag('invitationStatus', userInfo.invitationStatus);
      }
    }
  } catch (error) {
    console.warn('Clarity user identification failed:', error);
  }
}

export function setCustomTags(tags: CustomTags) {
  if (typeof window === 'undefined') return;
  
  try {
    // Use setTag method for each tag
    Object.entries(tags).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        clarity.setTag(key, String(value));
      }
    });
  } catch (error) {
    console.warn('Clarity custom tags failed:', error);
  }
}

export function trackEvent(eventName: string, customProperties?: Record<string, string | number | boolean | undefined>) {
  if (typeof window === 'undefined') return;
  
  try {
    clarity.event(eventName);
    
    // Set additional properties as custom tags if provided
    if (customProperties) {
      setCustomTags(customProperties);
    }
  } catch (error) {
    console.warn('Clarity event tracking failed:', error);
  }
}