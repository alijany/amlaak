# PWA - Frontend Application

A modern, modular Next.js 14+ progressive web application built with TypeScript, featuring a domain-driven architecture and comprehensive SSR/RSC support.

## 🏗️ Architecture Overview

This project follows a **domain-driven, modular architecture** with clear separation of concerns:

- **Domain-based organization**: Each business domain (auth, dashboard, payments) is self-contained
- **Server/Client component separation**: Optimized for Next.js 13+ App Router
- **Type-safe API layer**: Comprehensive TypeScript coverage
- **SSR-first approach**: Server-side rendering with SWR for client-side hydration
- **Role-based authentication**: JWT-based auth with multi-role support and route protection

## Project structure (high level)

```
src/
├─ app/             # Next.js App Router (domain containers & pages)
├─ components/      # Reusable UI components shared between domains
│  ├─ auth/         # Authentication system (global by design)
│  └─ ...           # Other shared components
├─ ui/              # Design system (atoms, molecules, organisms)
├─ libs/            # Shared utilities (fetcher, helpers)
├─ styles/          # Global & theme styles
└─ assets/          # Static assets
```

Keep domain-local code self-contained. Example: `src/app/reports/*` contains types, services, hooks, and components for the reports domain.

## 🎯 File Naming Conventions

We use a **domain.type.purpose** naming pattern for better organization:

```typescript
// Components
auth.component.login-form.tsx
auth.component.signup-modal.tsx
dashboard.component.stats-card.tsx
payment.component.checkout-form.tsx
ui.component.data-table.tsx
ui.component.loading-spinner.tsx

// Services & APIs
payment.api.process.ts
dashboard.api.analytics.ts
auth.service.login.ts
auth.service.profile.ts

// Hooks
auth.hook.use-login.ts
auth.hook.use-profile.ts
dashboard.hook.use-stats.ts
payment.hook.use-checkout.ts
ui.hook.use-modal.ts

// Types
auth.types.user.ts
auth.types.login-request.ts
payment.types.transaction.ts
dashboard.types.analytics.ts
api.types.response.ts

// Utilities
currency.util.format.ts
date.util.persian.ts
validation.util.form.ts
storage.util.local.ts

// Constants
auth.constants.roles.ts
api.constants.endpoints.ts
ui.constants.colors.ts
validation.constants.rules.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ 
- npm/yarn/pnpm
- Git

### Development Setup

1. **Set up environment variables**:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration if needed
```
**Optional (Mock Payments)**
If you want to enable the mock payment gateway button in the frontend for testing:
```bash
# In `.env.local` set:
NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS=true
```

2. **Run development server**:
```bash
pnpm run dev
```

3. **Open application**:
Visit [http://localhost:8000](http://localhost:8000)

## 🛠️ Development Workflow

### Creating New Features

1. **Create domain structure (self‑contained)**:
```bash
# For a new 'reports' domain (all local to app/reports)
mkdir -p src/app/reports
touch src/app/reports/page.tsx                       # Route entry (Server Component)
touch src/app/reports/reports.types.analytics.ts     # Domain types
touch src/app/reports/reports.service.data.ts        # Domain service
touch src/app/reports/reports.hook.use-data.ts       # Domain hook
touch src/app/reports/reports.component.dashboard.tsx # Domain component
```

Use top-level `libs/` or `components/` ONLY if the artifact is reused across multiple domains (do not move domain code out prematurely). Auth remains global by design.

2. **Follow the architecture patterns**:
- **Server Components**: For SSR data fetching
- **Client Components**: For interactivity  
- **Hooks**: For data management with SWR
- **Services**: For API communication

### API Integration Pattern

1) Define domain types in `src/app/<domain>/<domain>.types.*`

2) Create a domain-local service that uses the shared `fetcher` in `src/libs/`

3) Create a hook that wraps SWR for client-side behavior

4) Use a Server Component to fetch initial data and render a Client Component for interactivity

example: 

```typescript
// 1. Define types (domain-local)
// app/reports/reports.types.analytics.ts
export interface Report {
  id: string;
  title: string;
  data: ReportData[];
}

// 2. Create service (domain-local)
// app/reports/reports.service.data.ts
export const reportsService = {
  getAll: () => fetcher<Report[]>('/reports'),
  getById: (id: string) => fetcher<Report>(`/reports/${id}`)
};

// 3. Create hook (domain-local)
// app/reports/reports.hook.use-data.ts
export function useReports(initialData?: Report[]) {
  const swr = useSWR('/reports', reportsService.getAll, {
    fallbackData: initialData,
    revalidateOnMount: !initialData // if no initial data, fetch on mount
  });
  return useSWRHelper(swr, initialData);
}

// 4. Server component for SSR (still domain-local)
// app/reports/reports.component.list-server.tsx
export async function ReportsListServer() {
  const reports = await reportsService.getAll();
  return <ReportsListClient initialData={reports} />;
}

// 5. Client component for interactivity (domain-local)
// app/reports/reports.component.list-client.tsx
'use client';
export function ReportsListClient({ initialData }: Props) {
  const { data, refresh, isLoading } = useReports(initialData);
  // Render with client-side features
}
```

## 📦 Key Technologies

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR + Custom fetcher
- **State Management**: React Context + SWR
- **Authentication**: Custom JWT implementation with OTP verification
- **Authorization**: Role-based access control (RBAC)
- **UI Components**: Custom component library
- **Development**: ESLint, Prettier, Husky

## 🌐 SSR/RSC Strategy

- **Server Components**: Initial data fetching, SEO optimization
- **Client Components**: User interactions, real-time updates
- **SWR Integration**: Client-side caching with server-side fallbacks
- **Progressive Enhancement**: Works without JavaScript

## 🔐 Authentication & Authorization

The application features a comprehensive authentication system with role-based access control:

### Authentication Flow
- **OTP-based authentication**: Phone number + OTP verification
- **JWT tokens**: Secure token-based session management
- **Automatic token refresh**: Seamless session persistence
- **Multi-role support**: Users can have multiple roles with different permissions

### Using Authentication

#### 1. **Auth Context Provider**
Wrap your app with the AuthProvider to enable authentication:

```tsx
import { AuthProvider } from '@/components/auth/auth.context.provider';

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

#### 2. **Using Auth Hook**
Access authentication state and methods:

```tsx
'use client';
import { useAuth } from '@/components/auth/auth.context.provider';

export function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    isLoading,
    sendOtp,
    verifyOtpAndLogin,
    logout,
    hasRole,
    selectedRole 
  } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;

  return <div>Welcome, {user?.firstName}!</div>;
}
```

#### 3. **Route Protection**
Protect routes that require authentication:

```tsx
import ProtectedRoute from '@/components/auth/auth.component.protected-route';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

#### 4. **Role-Based Protection**
Protect routes based on user roles:

```tsx
import RoleProtectedRoute from '@/components/auth/auth.component.role-protected-route';
import { Role } from '@/components/auth/auth.constants.roles';

export default function AdminPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.ADMIN, Role.MODERATOR]}>
      <AdminContent />
    </RoleProtectedRoute>
  );
}
```

### Role System

The application supports a flexible role-based access control system:

```typescript
// Available roles
export enum Role {
  ADMIN = 'admin',
  USER = 'user', 
  MODERATOR = 'moderator',
  GUEST = 'guest'
}

// Role invitation statuses
export enum InvitationStatus {
  PENDING = 'pending',
  AWAITING_PROFILE_COMPLETION = 'awaiting_profile_completion',
  ACCEPTED = 'accepted'
}
```

#### Role Checking
```tsx
const { hasRole, hasAnyRole, selectedRole } = useAuth();

// Check single role
if (hasRole(Role.ADMIN)) {
  // Show admin features
}

// Check multiple roles
if (hasAnyRole([Role.ADMIN, Role.MODERATOR])) {
  // Show moderator+ features
}

// Current selected role
console.log(`Current role: ${selectedRole?.role}`);
```

### Authentication API

The auth system provides these core API methods:

```typescript
// Send OTP to phone number
await sendOtp('09123456789');

// Verify OTP and login
await verifyOtpAndLogin('09123456789', '123456');

// Logout user
logout();

// Refresh user profile
refreshProfile();
```

### Token Management

Tokens are automatically managed by the auth system:
- **Storage**: Secure token storage in localStorage/cookies
- **Refresh**: Automatic token refresh on expiration
- **Cleanup**: Tokens are cleared on logout

### Persian Language Support

The auth system includes Persian language support:
- Persian role names and labels
- RTL-compatible UI components
- Persian number formatting

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run test         # Run tests
```

## 🏃‍♂️ Performance Optimizations

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Optimized Persian font loading
- **Bundle Analysis**: Regular bundle size monitoring
- **SSR Caching**: Strategic server-side caching

## 🤝 Contributing

1. Follow the established file naming conventions
2. Maintain domain separation (except auth, which is global by design)
3. Write TypeScript-first code
4. Include proper error handling
5. Add appropriate loading states
6. Test both server and client components
7. Consider authentication/authorization requirements for new features
8. Test role-based access controls when adding protected routes

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [SWR Documentation](https://swr.vercel.app/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🐛 Troubleshooting

**Common Issues:**
- **Hydration errors**: Check server/client component boundaries
- **SWR caching issues**: Verify key consistency  
- **Type errors**: Ensure proper domain type imports
- **Build errors**: Check for circular dependencies
- **Auth token issues**: Check localStorage for corrupted tokens, try logging out and back in
- **Role permission errors**: Verify user has required roles and invitation status is 'accepted'
- **OTP not received**: Check phone number format and network connectivity

For more help, check the project documentation or create an issue.