# PWA — Frontend Application

Next.js 16 progressive web application with domain-driven architecture, SSR/RSC support, built-in auth, and automatic fa/en localization.

## Architecture Overview

- **Domain-based organization**: Each business domain is self-contained under `src/app/[locale]/<domain>/`
- **Localized**: language is auto-negotiated at the edge; every route is statically rendered per locale
- **Type-safe API layer**: All HTTP via `src/libs/api/api.util.fetcher.ts` + SWR helpers
- **Role-based auth**: JWT + OTP with multi-role support and route protection

## Project Structure

```
src/
  app/[locale]/   Next.js App Router — every route lives under the locale segment
  i18n/           Localization config, routing, navigation, formatters, calendar utils
  messages/       Message catalogs (fa.json is the type source, then en.json)
  proxy.ts        Locale negotiation at the edge (Next.js 16's `middleware`)
  components/     Shared components used across 2+ domains
    auth/         Authentication system (global by design)
    dashboard/    Dashboard shell (navbar, sidebar, layout)
    layout/       Public-page shell (navbar, footer)
  ui/             Design system
    atoms/        Primitive components (Button, Input, Modal…)
    molecules/    Composite components (DataView, Pagination, Tabs…)
  libs/           Shared utilities
    api/          fetcher, SWR helpers, error types
    format/       Formatting utilities
    style/        Style helpers
  assets/         Static assets
```

Domain-local code stays inside `src/app/[locale]/<domain>/`. Only move code to `src/libs/` or `src/components/` when it is used by two or more domains.

### Shared layouts

- `components/layout/` — public-facing pages: `RootLayout` wraps content with a sticky glassmorphism `Navbar` (transparent variant available) and a `Footer`. The navbar shows a "start free" CTA for guests and a "dashboard" link for authenticated users.
- `components/dashboard/` — authenticated area: `DashbaordLayout` (the export's spelling) provides a top `Navbar`, a collapsible `Sidebar` (desktop only), and a `BottomNavBar` (mobile only). Navigation items in `dashboard.constants.route-groups.tsx` are filtered at render time by the user's selected role. Add new dashboard routes there.

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
// src/app/[locale]/items/items.api.ts
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
//        retryText?, emptyMessage?, emptyIcon?, variant? ("card" | "inline"), className, ...divProps
// Omitted copy falls back to `common.dataView.*` in the reader's language.
```

```tsx
'use client';
import { useTranslations } from 'next-intl';
import { DataView } from '@/ui/molecules';
import { useItems } from './items.api';

export function ItemsPage() {
  const t = useTranslations('items');
  const { data, error, isLoading, refresh } = useItems();

  return (
    <DataView
      data={data}
      error={error}
      isLoading={isLoading}
      isEmpty={(d) => !d?.items.length}
      emptyMessage={t('empty')} // omit to use the shared catalog default
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
mkdir -p 'src/app/[locale]/items'
touch 'src/app/[locale]/items/page.tsx'
touch 'src/app/[locale]/items/items.types.ts'
touch 'src/app/[locale]/items/items.api.ts'
touch 'src/app/[locale]/items/items.component.list.tsx'
```

Checklist:
1. Define types in `items.types.ts`
2. Write SWR hooks in `items.api.ts` using fetcher + SWR helpers
3. Use `DataView` in components — never write manual loading/error/empty branches
4. Protect routes with `ProtectedRoute` or `RoleProtectedRoute` (see Auth below)
5. Add the domain's strings to `fa.json` then `en.json`, and ship its namespace to the
   client from the nearest layout (see Localization below)

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

Roles live in `src/components/auth/auth.constants.roles.ts` and follow a strict hierarchy (higher = more access):

| Role | Level | Notes |
|---|---|---|
| `admin` | 5 | Full access; sees the Users management route |
| `owner` | 4 | Organization owner |
| `manager` | 3 | |
| `member` | 2 | |
| `user` | 1 | |
| `guest` | 0 | Lowest privilege |

A user may hold multiple roles (one per organization). The active role is chosen in the sidebar dropdown, and route visibility and guards are evaluated against `selectedRole` from `useAuth()`. Use `hasPermission(userRole, requiredRole)` for hierarchy checks, and pass a `roles` array to a `RouteItem` in `dashboard.constants.route-groups.tsx` to restrict a sidebar link. Role names render from `dashboard.roles.<role>`; a `RouteItem` carries a `labelKey` under `dashboard.routes`, typed from `fa.json`.

## Localization

The language is detected automatically and **users cannot choose it** — there is
no switcher and none should be added. `fa` is the default with unprefixed URLs; `en`
lives under `/en`. See `docs/engine/localization.md` for the design, the
negotiation precedence and the `LOCALE_OVERRIDE` kill switch.

Five rules matter when writing components:

```tsx
// 1. Strings come from the catalog — works in both server and client components
import { useTranslations } from 'next-intl';
const t = useTranslations('nav');
<span>{t('home')}</span>

// 2. Navigation comes from the i18n helpers, never next/link or next/navigation.
//    `usePathname` here returns the path WITHOUT the /en prefix, which is what
//    active-route checks and `?redirect=` round trips need.
import { Link, useRouter, usePathname } from '@/i18n/i18n.navigation';

// 3. Numbers and dates go through the formatter — never toLocaleString('fa-IR').
//    `fa` resolves to Persian digits AND the Jalali calendar automatically.
import { useFormatter } from 'next-intl';
const format = useFormatter();
format.number(total, 'integer');            // ۱۲٬۵۰۰
format.dateTime(createdAt, 'numeric');      // ۱۴۰۵/۸/۸ — presets in i18n.formats.ts

// 4. Calendars: display via the formatter, arithmetic via calendarFns.
import { calendarFns, weekdayLabels } from '@/i18n/i18n.util.calendar';
const { startOfMonth, addMonths } = calendarFns(locale);

// 5. API errors render through the catalog, never from `error.message`.
import { useApiErrorMessage } from '@/libs/api/api.hook.use-error-message';
const errorMessage = useApiErrorMessage();
setError(errorMessage(err, t('saveFailed')));
```

Server pages need no `setRequestLocale` — the locale comes from
`next/root-params` in `i18n.request.ts`. Keep `generateStaticParams` in the root
layout and never read `headers()`/`cookies()` in a page or layout.

Adding a string: put it in `src/messages/fa.json` (its shape is the type source
of truth), then `en.json`. A missing key fails `pnpm lint`. API error codes go
under `errors.*`; a new validator needs its constraint key under
`errors.validation.rules`.

Client bundle: the root layout ships only `common`, `nav`, `footer`, `format`,
`calendar`. An area adds its own namespaces in a nested `NextIntlClientProvider`
that re-sends the root ones — `/` adds `landing`, `/login` adds `login` and
`errors`, `app/[locale]/dashboard/layout.tsx` adds `dashboard` and `errors`.
Widen there, not at the root.

Metadata: the root layout sets the localized title and description. Put a
canonical or `hreflang` alternates on the page itself, never in a layout, or
every child inherits them.

Bidi: `<html dir>` is per-locale, which turns on Tailwind's `rtl:`/`ltr:`
variants. Use logical utilities (`ms/me`, `ps/pe`, `start/end`, `text-start`,
`border-s/border-e`) and `gap-*` rather than `space-x-* space-x-reverse`.
Transforms (drawer slides, directional icons) and JS-laid-out widgets
(`react-range`, Embla) need the direction passed explicitly.

Fonts: Yekan Bakh for `fa`, Inter for everything else — chosen in
`app/[locale]/layout.tsx` via one `font-yekan`/`font-inter` class, never both.
Both loaders use `preload: false`; verify any change with a production-build
network trace, not by reading CSS or the dev server.

Brand: `src/config/brand.config.ts` keeps language-independent contact values;
the brand name (`common.brand`), metadata (`meta`) and landing copy (`landing`)
are catalog keys.

## Commands

```bash
pnpm --filter pwa dev          # dev server on :8000
pnpm --filter pwa build        # production build
pnpm --filter pwa lint         # type-check + ESLint (flat config; `next lint` was removed in Next 16)
pnpm --filter pwa type-check   # TypeScript check
```

## Runtime and browser validation

Follow the repository-root `.devcontainer/README.md`; it owns the runtime,
Playwright, login, and container-network procedures. For UI or journey changes,
linting and HTTP status checks are necessary but not sufficient:

1. Start `pnpm dev:back` when the page reads API data, then `pnpm dev:front`.
2. Load the changed route through nginx on `http://127.0.0.1/` and verify its
   relevant `/api/v1/` request independently.
3. Open the route with the Playwright MCP server (`browser_navigate` to
   `http://127.0.0.1/…` or `http://127.0.0.1/en/…`), inspect the accessibility
   snapshot (`browser_snapshot`), and capture a screenshot
   (`browser_take_screenshot`) for visual review.
4. Exercise the changed interaction and important loading, empty, error, and
   success states when they are part of the change (`browser_click`,
   `browser_type`, then re-snapshot).
5. Check mobile and desktop widths when layout can differ (the dashboard swaps
   the sidebar for a bottom bar on mobile), and both `fa` (RTL) and `en` (LTR)
   when layout or localized copy can differ, then close the tab
   (`browser_close`). A `NEXT_LOCALE` cookie outranks the browser language, so
   visiting `/en/…` keeps later unprefixed URLs in English until it is reset.

For dashboard or admin-only routes, sign in with the OTP flow in
`.devcontainer/README.md`; never add an auth bypass for validation. Playwright
is the default browser path for frontend QA here.

## Troubleshooting

- **Hydration errors**: ensure data passed from Server → Client Components is serializable
- **Route stopped prerendering**: do not trust the build summary — it still prints `●` while emitting no HTML. Check `find .next/server/app -name '*.html' | wc -l` (expect 16: 7 routes × 2 locales + `_not-found` + `_global-error`; add two per new route). Cause is almost always something reading the locale from a request API instead of `next/root-params`
- **`MISSING_MESSAGE` in a client component** (or `⟪namespace.key⟫` rendered in dev): its namespace is not in any `NextIntlClientProvider` above it — add it to the nearest area layout or page
- **Active nav link stops highlighting under `/en`**, or login redirects to `/en/en/...`: `usePathname`/`useRouter` was imported from `next/navigation` instead of `@/i18n/i18n.navigation`
- **API error shows in English on a Persian page**: the throw site has no code (use a `Coded*Exception`), the code is missing from `errors.*`, or the component renders `error.message` instead of `useApiErrorMessage()`
- **SWR cache stale**: call `refresh()` from `useSwrHelper` after mutations; pass `onSuccess={refresh}` to forms
- **Type errors**: import types only from the owning domain — avoid cross-domain type imports
- **Auth token issues**: clear localStorage and re-login; check JWT expiration settings

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
