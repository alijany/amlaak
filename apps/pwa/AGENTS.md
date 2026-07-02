# PWA — Frontend Application

Next.js 15 progressive web application with domain-driven architecture, SSR/RSC support, and built-in auth.

## Architecture Overview

- **Domain-based organization**: Each business domain is self-contained under `src/app/<domain>/`
- **Type-safe API layer**: All HTTP via `src/libs/api/api.util.fetcher.ts` + SWR helpers
- **Role-based auth**: JWT + OTP with multi-role support and route protection

## Project Structure

```
src/
  app/            Next.js App Router — domain pages and co-located domain code
  components/     Shared components used across 2+ domains
    auth/         Authentication system (global by design)
    dashboard/    Dashboard shell (navbar, sidebar, layout)
  ui/             Design system
    atoms/        Primitive components (Button, Input, Modal…)
    molecules/    Composite components (DataView, Pagination, Tabs…)
  libs/           Shared utilities
    api/          fetcher, SWR helpers, error types
    format/       Formatting utilities
    style/        Style helpers
  assets/         Static assets
```

Domain-local code stays inside `src/app/<domain>/`. Only move code to `src/libs/` or `src/components/` when it is used by two or more domains.

## File Naming Convention

Pattern: `domain.type.purpose.ext`

```
items.types.item.ts
items.api.ts                   # SWR hooks + fetcher calls for this domain
items.component.list.tsx
items.component.add-form.tsx
```

## API Integration Pattern

All domains follow this exact pattern — no exceptions.

### 1. Fetcher utilities (`src/libs/api/api.util.fetcher.ts`)

Use the pre-built fetcher helpers. They handle auth tokens, 401 refresh, and error throwing automatically.

```typescript
import {
  fetcher,         // GET
  postFetcher,     // POST  — signature: (url, { arg }) => Promise<R>
  patchFetcher,    // PATCH — signature: (url, { arg }) => Promise<R>
  putFetcher,      // PUT   — signature: (url, { arg }) => Promise<R>
  deleteFetcher,   // DELETE
  formDataFetcher, // multipart POST
} from '@/libs/api/api.util.fetcher';
```

### 2. SWR helpers (`src/libs/api/api.hook.use-swr-helper.ts`)

Always wrap `useSWR` / `useSWRMutation` with these helpers instead of destructuring raw SWR.

```typescript
import { useSwrHelper, useSwrMutationHelper } from '@/libs/api/api.hook.use-swr-helper';

// useSwrHelper returns: { data, error, isLoading, refresh, reset, mutate }
// useSwrMutationHelper returns: { data, error, isLoading, submit, reset }
```

### 3. Domain API file (`<domain>.api.ts`)

Co-locate all hooks and fetcher calls for a domain in a single `<domain>.api.ts` file.

```typescript
// src/app/items/items.api.ts
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { fetcher, postFetcher, patchFetcher, deleteFetcher } from '@/libs/api/api.util.fetcher';
import { useSwrHelper, useSwrMutationHelper } from '@/libs/api/api.hook.use-swr-helper';
import { Item, CreateItemDto, ItemsResponse } from './items.types';

// GET list
export function useItems() {
  return useSwrHelper(useSWR<ItemsResponse>('/items', fetcher));
}

// GET single
export function useItem(id: string) {
  return useSwrHelper(useSWR<Item>(`/items/${id}`, fetcher));
}

// POST
export function useCreateItem() {
  return useSwrMutationHelper(useSWRMutation('/items', postFetcher<CreateItemDto, Item>));
}

// PATCH
export function useUpdateItem(id: string) {
  return useSwrMutationHelper(useSWRMutation(`/items/${id}`, patchFetcher<Partial<CreateItemDto>, Item>));
}
```

### 4. DataView component (`src/ui/molecules/dataView/ui.data-view.tsx`)

Always use `DataView` to render async data — it handles loading, error, and empty states automatically. Import it from `@/ui/molecules`.

```typescript
import { DataView } from '@/ui/molecules';

// Props: data, error, isLoading, isEmpty?, onRetry?, errorTitle?, errorMessage?,
//        emptyMessage?, emptyIcon?, variant? ("card" | "inline"), className, ...divProps
```

```tsx
'use client';
import { DataView } from '@/ui/molecules';
import { useItems } from './items.api';

export function ItemsPage() {
  const { data, error, isLoading, refresh } = useItems();

  return (
    <DataView
      data={data}
      error={error}
      isLoading={isLoading}
      isEmpty={(d) => !d?.items.length}
      emptyMessage="No items found"
      onRetry={refresh}
    >
      {data?.items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </DataView>
  );
}
```

### 5. Mutations with refresh

```tsx
export function AddItemForm({ onSuccess }: { onSuccess: () => void }) {
  const { submit, isLoading, error } = useCreateItem();

  const handleSubmit = async (dto: CreateItemDto) => {
    await submit(dto);
    onSuccess(); // call refresh() from the parent's useSwrHelper
  };
  // ...
}

// In the parent page:
const { data, error, isLoading, refresh } = useItems();
<AddItemForm onSuccess={refresh} />
```

## Adding a New Domain

```bash
mkdir -p src/app/items
touch src/app/items/page.tsx
touch src/app/items/items.types.ts
touch src/app/items/items.api.ts
touch src/app/items/items.component.list.tsx
```

Checklist:
1. Define types in `items.types.ts`
2. Write SWR hooks in `items.api.ts` using fetcher + SWR helpers
3. Use `DataView` in components — never write manual loading/error/empty branches
4. Protect routes with `ProtectedRoute` or `RoleProtectedRoute` (see Auth below)

## Authentication

The auth system (`src/components/auth/`) is global and already wired into the root layout.

### Route Protection

```tsx
import ProtectedRoute from '@/components/auth/auth.component.protected-route';
import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { Role } from '@/components/auth/auth.constants.roles';

// Any authenticated user
export default function Page() {
  return <ProtectedRoute><Content /></ProtectedRoute>;
}

// Specific roles only
export default function AdminPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
      <AdminContent />
    </RoleProtectedRoute>
  );
}
```

### Using Auth in Client Components

```tsx
'use client';
import { useAuth } from '@/components/auth/auth.context.provider';

export function MyComponent() {
  const { user, isAuthenticated, isLoading, logout, hasRole } = useAuth();
}
```

### Role System

```typescript
export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
  GUEST = 'guest',
}
```

## Commands

```bash
pnpm --filter pwa dev          # dev server on :8000
pnpm --filter pwa build        # production build
pnpm --filter pwa lint         # ESLint check
pnpm --filter pwa type-check   # TypeScript check
```

## Server-side Data Fetching (RSC / SSR pages)

Public pages that must be crawlable by search engines use React Server Components, not SWR. Use the server-only fetcher:

```typescript
import { serverFetcher } from '@/libs/api/api.util.server-fetcher';

// In an async Server Component or generateMetadata:
const data = await serverFetcher<MyType>('/endpoint');
```

- No auth token is sent — use only for public endpoints.
- Wraps Next.js `fetch` with `next: { revalidate }` for ISR (default 1 hour).
- Throws on non-2xx — wrap in `try/catch` and call `notFound()` or return a fallback.
- For `generateStaticParams`, return `[]` on error so the build doesn't fail if the API is down.

## Rich Text — Slate Editor Molecule (`src/ui/molecules/slate-editor/`)

| Export | Where to use |
|---|---|
| `SlateEditor` | Dashboard forms only — import via `dynamic` with `ssr: false` |
| `SlateRenderer` | Public pages (SSR-safe read-only HTML render) |
| `slateToHtml(nodes)` | Serialize Slate value to HTML string |
| `parseSlateValue(raw)` | Deserialize stored JSON string back to `Descendant[]` |
| `EMPTY_SLATE_VALUE` | Default initial value for a new editor |

The body field is stored as a **JSON string** (`JSON.stringify(Descendant[])`) in the DB and rendered back via `parseSlateValue` + `SlateRenderer` on public pages.

```typescript
// Dashboard form — dynamic import prevents SSR hydration errors
const SlateEditor = dynamic(
  () => import('@/ui/molecules/slate-editor/ui.slate-editor').then((m) => m.SlateEditor),
  { ssr: false },
);

// Public page — SSR-safe, no dynamic import needed
import { SlateRenderer } from '@/ui/molecules/slate-editor/ui.slate-renderer';
<SlateRenderer content={post.body} />
```

## SEO on Public Pages

Next.js 15 App Router handles SEO via `metadata` exports and `generateMetadata`.

```typescript
// Static metadata (listing pages)
export const metadata: Metadata = {
  title: 'Blog',
  alternates: { canonical: '/blog' },
  openGraph: { type: 'website', ... },
};

// Dynamic metadata (detail pages)
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await serverFetcher<Post>(`/blog/${params.slug}`);
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: { type: 'article', publishedTime: post.publishedAt, ... },
  };
}
```

Inject **JSON-LD structured data** directly in the page JSX:
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', ... }) }}
/>
```

The dynamic sitemap lives at `src/app/sitemap.ts` and exports a default async function returning `MetadataRoute.Sitemap`.

## Troubleshooting

- **Hydration errors**: ensure data passed from Server → Client Components is serializable
- **SWR cache stale**: call `refresh()` from `useSwrHelper` after mutations; pass `onSuccess={refresh}` to forms
- **Type errors**: import types only from the owning domain — avoid cross-domain type imports
- **Auth token issues**: clear localStorage and re-login; check JWT expiration settings
- **Slate SSR errors**: always use `dynamic(..., { ssr: false })` for `SlateEditor`; `SlateRenderer` is SSR-safe
