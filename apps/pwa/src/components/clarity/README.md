# Enhanced Clarity Analytics Implementation

This implementation provides comprehensive user tracking and custom tagging for Microsoft Clarity.

## Features

### 1. User Identification & Session Tracking
- **Automatic user identification** when users log in
- **Phone number tracking** for better user correlation
- **Role-based identification** to understand user types
- **Session continuity** across page navigation

### 2. Custom Tags for User Segmentation
- **Role-based tags**: `userRole`, `roleStatus`
- **Authentication state**: `isAuthenticated`, `profileComplete`
- **User metadata**: `totalRoles`, `hasProfile`
- **Dynamic tagging** based on user actions

## Usage

### Basic Setup
The analytics are automatically initialized in your app layout. No additional setup required.

### Custom Event Tracking
```tsx
function MyComponent() {
  const { trackCustomEvent, updateUserTags } = useClarityTracking();

  const handleAction = () => {
    trackCustomEvent('button_click', {
      buttonName: 'cta_button',
      location: 'header'
    });
  };

  return <button onClick={handleAction}>Click Me</button>;
}
```

### Direct API Usage
```tsx

// Track events
trackEvent('custom_action', { property: 'value' });

// Set custom tags
setCustomTags({
  userSegment: 'premium',
  feature: 'enabled'
});

// Identify user (usually done automatically)
identifyUser({
  userId: 'user123',
  phoneNumber: '+1234567890',
  roles: ['manager'],
  selectedRole: 'manager'
});
```

## Tracked Data

### User Properties
- `userId`: Unique user identifier
- `phoneNumber`: User's phone number
- `roles`: All user roles (comma-separated)
- `selectedRole`: Currently active role
- `invitationStatus`: Role invitation status

### Custom Tags
- `userRole`: Current user role (guest, manager, etc.)
- `roleStatus`: Invitation status (pending, accepted, awaiting_profile_completion)
- `isAuthenticated`: Boolean authentication state
- `profileComplete`: Whether user has completed profile
- `totalRoles`: Number of roles user has
- `hasProfile`: Whether user has profile information

### Page View Data
- Manual page view tracking available via `trackEvent`
- Custom event tracking with contextual data

## Key Benefits

1. **Better User Insights**: Track user journeys across different roles and states
2. **Segmentation**: Filter sessions by role, authentication status, profile completion
3. **Manual Event Tracking**: Track specific user interactions and events
4. **Contextual Data**: Every event includes relevant user context
5. **Error Resilience**: All tracking wrapped in try-catch blocks
6. **Development Safety**: Tracking disabled in development environment

## Privacy & Performance

- Only tracks in production environment
- All tracking is anonymous until user authentication
- Minimal performance impact with lazy loading
- GDPR compliant (no personal data in tags)
- Phone numbers only used for session correlation, not storage

## Debugging

To verify tracking is working:
1. Open browser developer tools
2. Check network tab for Clarity requests
3. Look for `clarity.ms` requests
4. Events and tags should appear in Clarity dashboard within 5-10 minutes
