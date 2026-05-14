# Frontend Auth Module - Organization Support

This module has been updated to support multi-user organizations with role-based access control.

## Changes Summary

### 1. Updated Types (`auth.constants.roles.ts`)

#### New Organization Type
```typescript
export type Organization = {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
```

#### Enhanced RoleType
```typescript
export type RoleType = {
  id: number;
  role: Role;
  invitationStatus: InvitationStatus;
  userId: number;
  organizationId?: number;  // NEW: Link to organization
  organization?: Organization;  // NEW: Populated organization
  description?: string;  // NEW: Role description
};
```

#### New Helper Functions
- `RoleHierarchy` - Maps roles to numeric hierarchy (ADMIN=4, MODERATOR=3, USER=2, GUEST=1)
- `hasPermission(userRole, requiredRole)` - Checks if user role meets requirement

### 2. New API Hooks (`auth.api.client.ts`)

#### Organization Management
```typescript
// Fetch user's organizations
const { organizations, isLoading, mutate } = useOrganizations();

// Fetch specific organization with members
const { organization, isLoading, mutate } = useOrganization(id);

// Create organization
const { createOrganization } = useCreateOrganizationMutation();
await createOrganization({ name: 'My Org', description: '...' });

// Update organization
const { updateOrganization } = useUpdateOrganizationMutation(orgId);
await updateOrganization({ name: 'Updated Name' });

// Add member to organization
const { addMember } = useAddMemberMutation(orgId);
await addMember({ userId: 123, role: Role.USER });

// Remove member from organization
const { removeMember } = useRemoveMemberMutation(orgId);
await removeMember({ userId: 123 });
```

### 3. Enhanced Auth Context (`auth.context.provider.tsx`)

#### New Context Properties
```typescript
interface AuthContextType {
  // ... existing properties ...
  
  // NEW: Organization support
  currentOrganization: Organization | null; // Auto-inferred from selectedRole
  getUserRoleInOrganization: (organizationId: number) => RoleType | null;
  refreshOrganizations: () => void;
  
  // UPDATED: Now supports organization context
  hasRole: (role: Role, organizationId?: number) => boolean;
  hasAnyRole: (roles: Role[], organizationId?: number) => boolean;
}
```

**Note:** `currentOrganization` is automatically inferred from `selectedRole.organizationId`. No need to manage organization state separately - just switch roles!

#### Usage Examples

**Check role in specific organization:**
```typescript
const { hasRole, currentOrganization } = useAuth();

// Check if user is ADMIN in current organization
if (hasRole(Role.ADMIN, currentOrganization?.id)) {
  // User is admin in this organization
}

// Check if user is ADMIN in any context
if (hasRole(Role.ADMIN)) {
  // User is admin somewhere
}
```

**Get user's role in organization:**
```typescript
const { getUserRoleInOrganization } = useAuth();

const userRole = getUserRoleInOrganization(orgId);
if (userRole) {
  console.log(`User role: ${userRole.role}`);
}
```

**Check multiple roles:**
```typescript
const { hasAnyRole } = useAuth();

// Check if user is ADMIN or MODERATOR in specific org
if (hasAnyRole([Role.ADMIN, Role.MODERATOR], orgId)) {
  // User can manage content
}
```

**Organization management:**
```typescript
const { 
  user,
  selectedRole,
  setSelectedRole,
  currentOrganization 
} = useAuth();

// Switch to a different role (organization changes automatically)
const switchToRole = (role: RoleType) => {
  setSelectedRole(role);
  // currentOrganization is now automatically updated!
};

// Get all user's roles (across all organizations)
const allRoles = user?.roles || [];

// Filter roles by organization
const orgRoles = allRoles.filter(r => r.organizationId === someOrgId);
```

## Migration Guide

### For Existing Code

**Before:**
```typescript
const { hasRole } = useAuth();

if (hasRole(Role.ADMIN)) {
  // Show admin features
}
```

**After (backward compatible):**
```typescript
const { hasRole, currentOrganization } = useAuth();

// Global check (unchanged)
if (hasRole(Role.ADMIN)) {
  // Show admin features
}

// Organization-specific check
if (hasRole(Role.ADMIN, currentOrganization?.id)) {
  // Show org-specific admin features
}
```

## Features

✅ **Backward Compatible** - Existing role checks still work  
✅ **Organization Context** - Check roles within specific organizations  
✅ **Auto Organization Selection** - Selects organization based on current role  
✅ **Multi-Organization Support** - Users can belong to multiple orgs  
✅ **Role Hierarchy** - Higher roles inherit lower role permissions  
✅ **Type Safe** - Full TypeScript support  

## API Endpoints

The module connects to these backend endpoints:

- `GET /organizations` - List user's organizations
- `GET /organizations/:id` - Get organization with members
- `POST /organizations` - Create organization
- `PATCH /organizations/:id` - Update organization
- `POST /organizations/:id/members` - Add member
- `DELETE /organizations/:id/members/:userId` - Remove member

## Example: Role Switcher Component

```typescript
'use client';

import { useAuth } from '@/components/auth/auth.context.provider';
import { getRoleName } from '@/components/auth/auth.constants.roles';

export function RoleSwitcher() {
  const { 
    user,
    selectedRole, 
    setSelectedRole,
    currentOrganization 
  } = useAuth();

  const allRoles = user?.roles || [];

  return (
    <div>
      <select
        value={selectedRole?.id || ''}
        onChange={(e) => {
          const role = allRoles.find(r => r.id === +e.target.value);
          if (role) setSelectedRole(role);
        }}
      >
        <option value="">Select Role</option>
        {allRoles.map(role => (
          <option key={role.id} value={role.id}>
            {getRoleName(role.role)}
            {role.organizationId && role.organization && ` - ${role.organization.name}`}
          </option>
        ))}
      </select>
      
      {currentOrganization && (
        <p>Current Organization: {currentOrganization.name}</p>
      )}
    </div>
  );
}
```

## Example: Organization-Specific Route Protection

```typescript
'use client';

import { useAuth } from '@/components/auth/auth.context.provider';
import { Role } from '@/components/auth/auth.constants.roles';
import { useParams, redirect } from 'next/navigation';

export function OrganizationAdminRoute({ children }: { children: React.ReactNode }) {
  const { hasRole } = useAuth();
  const params = useParams();
  const orgId = params.organizationId as string;

  if (!hasRole(Role.ADMIN, +orgId)) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
```
