# Localization

**Status:** landed for every existing surface (landing page, login, dashboard shell and
pages, shared `ui/` primitives) and for the API's error and SMS paths. This document owns
the localization contract; `apps/pwa/AGENTS.md` carries the day-to-day rules.

## The constraint that shaped everything

Three requirements pull against each other:

1. the language is detected automatically, from the visitor's locale or timezone;
2. visitors cannot choose a language themselves — no switcher, anywhere;
3. SSR performance stays a priority.

(1) and (3) conflict. Detecting the language from a request header *inside a page* makes
that page dynamic: Next.js's full-route cache does not vary on `Accept-Language`, so every
page would drop from cached static HTML to a server render per visit.

The resolution: **decide once at the edge, express the decision as a URL.** `proxy.ts` (the
file Next.js 16 renamed `middleware` to) negotiates before the cache is consulted and routes
to a per-locale path. Every page below is an ordinary static render, one per language, and
nothing downstream reads a header.

The `/en` prefix is therefore a **cache key, not a user-facing choice** — requirement (2) is
about the interface, not the address bar. The default locale (`fa`) keeps its unprefixed
URLs (`/`, `/login`, `/dashboard`), so existing links keep working.

## Why the timezone is a correction, not an input

No HTTP header carries the timezone; only `Intl.DateTimeFormat().resolvedOptions()` knows
it. Making it a primary input would force a client round trip before first paint. So
`Accept-Language` is primary and the timezone only *corrects* a weak result:

- the proxy records its confidence in a `locale_src` cookie — `strong` when the browser
  named a language we ship, `weak` when we fell back;
- `LocaleProbe` (a client component) acts only on `weak`, reads the timezone, and pins the
  corrected locale in a cookie — **at most once per visitor**, since the next request is then
  `strong`;
- crawlers do not run JS, so they always get the deterministic header-derived render.

The case this exists for: a visitor in Iran whose device locale is left at `en-US`. The
header implies English, `Asia/Tehran` implies Persian, and Persian is the better answer.

## Precedence

```
1. LOCALE_OVERRIDE         deploy-time env var
2. /en/... URL prefix      explicit link, crawler, hreflang alternate
3. NEXT_LOCALE cookie      an earlier negotiation, or the timezone probe
4. accept-language         the common first-visit path
5. default locale (fa)
```

Steps 2–5 are next-intl's own order. `src/proxy.ts` layers 1 on top and records how
confident 4 was.

## The global override

`LOCALE_OVERRIDE=fa|en` pins every visitor to one language. It is read from the environment
at request time — no rebuild, no network, and it still works when the API is down. It is
absolute: it beats the header, beats an explicit `NEXT_LOCALE` cookie, and redirects
bookmarked URLs in the other language onto its path. Empty or unrecognised means negotiate
normally. The PWA container reads it from the root `.env`.

There is deliberately no runtime (admin-console) toggle; add one only when a project needs
to flip the language without a redeploy.

## Calendars

`Intl` and date-fns split the work, and the split is the whole design:

| Job | Handled by | Why |
|---|---|---|
| **Display** — `۱۹ مرداد ۱۴۰۵` vs `10 August 2026` | `Intl` / `useFormatter()` | `Intl` resolves `fa` to the Persian calendar and `en` to the Gregorian one by itself. No branching. |
| **Arithmetic** — month grids, "start of month", "add a month" | `calendarFns(locale)` in `i18n.util.calendar.ts` | Genuinely differs: Mordad 1st is not August 1st and the grids do not line up. `Intl` cannot do this. |

So the shared `Calendar` molecule draws a **Jalali** month under `fa` and a **Gregorian** one
otherwise — including week start (Saturday for Persian, Sunday otherwise) and weekday
initials, derived from `Intl` rather than hardcoded. For `fa` that reproduces the previous
hand-written `['ش','ی','د','س','چ','پ','ج']` exactly.

One deliberate exception: the calendar's internal day key is **always Gregorian**. It is
never displayed, and both calendars agree on which day an instant falls in, so pinning it
removes any chance of two keys for one day.

`date-fns-jalali` is therefore still a dependency, but only for arithmetic.

## Layout

```
apps/pwa/src/
  i18n/
    i18n.config.ts        locales, direction, timezone map, cookie names  ← the knob file
    i18n.routing.ts       next-intl routing (localePrefix: 'as-needed')
    i18n.navigation.ts    locale-aware Link / useRouter / usePathname
    i18n.request.ts       per-request config; loads the catalog
    i18n.formats.ts       shared date/number presets
    i18n.util.negotiate.ts   confidence scoring of accept-language
    i18n.util.override.ts    LOCALE_OVERRIDE
    i18n.util.calendar.ts    Jalali vs Gregorian arithmetic, weekday labels
    i18n.component.locale-probe.tsx   one-shot timezone correction
    i18n.types.d.ts       makes message keys type-safe
  messages/
    fa.json               default locale — the source of truth for key shape
    en.json
  proxy.ts                negotiation, at the edge
  app/[locale]/...        every route
apps/core-api/src/libs/
  i18n/                   backend locale constants and the SMS catalog
  error/                  coded exceptions, the exception filter, validation pipes
```

## Rules

**Keeping pages static.** `i18n.request.ts` resolves the locale from `next/root-params` and
deliberately never touches the `requestLocale` param. That is the whole mechanism: next-intl
passes `requestLocale` as a lazy getter falling back to the `x-next-intl-locale` **header**,
and touching it opts every route out of prerendering. Pages therefore need no
`setRequestLocale`; `generateStaticParams` returning the locale list (in the root layout) is
enough.

⚠️ **Do not verify this from the build summary.** If the locale starts coming from the header
again the failure is silent — the summary still prints `● (SSG)` while emitting no HTML.
Check the artefacts after `pnpm --filter pwa build`:

```bash
find apps/pwa/.next/server/app -name '*.html' | wc -l   # 16: 7 routes × 2 locales + _not-found + _global-error
ls apps/pwa/.next/server/app/{fa,en}/login.html
```

Add two to the expected count for every new route.

**Navigation.** Import `Link`, `useRouter` and `usePathname` from `@/i18n/i18n.navigation`,
never from `next/link` or `next/navigation`. Beyond keeping the prefix on the URL, next-intl's
`usePathname` returns the path *without* the locale prefix — which is what active-route
comparisons and the login `?redirect=` round trip need, since the plain one returns
`/en/dashboard` and breaks both. (`notFound` from `next/navigation` is fine.)

**Client payload.** The root layout ships only `ROOT_CLIENT_NAMESPACES` (`common`, `nav`,
`footer`, `format`, `calendar`). An area adds its own namespaces with a nested
`NextIntlClientProvider`, re-sending the root ones because a nested `messages` prop replaces
rather than merges: `/` adds `landing`, `/login` adds `login` and `errors`, and
`app/[locale]/dashboard/layout.tsx` adds `dashboard` and `errors`. A landing-page visitor
never downloads dashboard strings. Widen the area, not the root.

**Metadata.** The root layout sets the localized title and description only. Canonical and
`hreflang` alternates live on the page that owns them (`app/[locale]/page.tsx`), because
layout metadata merges into every child — a layout-level canonical would make `/login` and
every dashboard route claim to be a copy of `/`. next-intl also emits the alternates as a
`Link` response header on every route (`alternateLinks: true`).

**Numbers and dates.** Use `useFormatter()`; never `toLocaleString('fa-IR')`. `Intl` resolves
bare `fa` to the Persian numbering system *and* the Jalali calendar, so `format.dateTime(d)`
gives `۱۶ مرداد ۱۴۰۵` under `fa` and a Gregorian date under `en` with no branching. Use the
named presets in `i18n.formats.ts` so the same value cannot drift between screens. The render
timezone is fixed to `BUSINESS_TIME_ZONE` (`Asia/Tehran`) — without it the server formats in
the container's zone and the browser in the visitor's, which is both a hydration mismatch and
request-dependent output. Counts that change wording use ICU (`{count, plural, …}`).

**Amounts.** Toman amounts are not converted; only their presentation is localized.
`useCostFormatter()` in `src/libs/format/format.util.ts` keeps the unit inside the message
(`"{amount} ت"` / `"{amount} T"`) because unit placement is a translator decision.

**Bidi.** `<html dir>` is set per locale, activating Tailwind's `rtl:`/`ltr:` variants. Use
logical utilities — `ms/me`, `ps/pe`, `start/end`, `text-start/text-end`, `border-s/border-e`
— not `ml/mr` or `left/right`, and `gap-*` rather than `space-x-* space-x-reverse`, which does
not flip. The existing UI was drawn right-to-left, so a physical `right`/`mr`/`text-right`
becomes `start`/`ms`/`text-start` and `left` becomes `end`; that keeps `fa` pixel-identical
and mirrors `en`. Two things do not follow `dir` on their own:

- **Transforms.** A drawer's slide needs both variants
  (`ltr:-translate-x-full rtl:translate-x-full`), and a directional icon either swaps with
  `ltr:hidden`/`rtl:hidden` or flips with `ltr:rotate-180`.
- **Libraries that lay out in JavaScript.** `react-range` and Embla take a direction option;
  `RangeInput` and `Carousel` pass `localeDirection[useLocale()]`.

Content that is always left-to-right (a phone or code input, a JSON sample) gets
`dir="ltr"` on its element rather than a page-level exception.

## Adding a language

1. add it to `locales` in `i18n.config.ts`
2. add its direction to `localeDirection`
3. add `src/messages/<locale>.json` — TypeScript lists every missing key
4. add it to `SUPPORTED_LOCALES` in `apps/core-api/src/libs/i18n/i18n.constants.ts` and to
   every SMS template

## Adding a string

1. add the key to `src/messages/fa.json` (the shape is type-checked from here)
2. add it to `en.json`
3. `const t = useTranslations('namespace')`, then `t('key')` — same in server and client
   components; make sure the namespace reaches that component's provider

Keep catalogs to keys a rendered surface uses. Structure stays in code and wording moves to
the catalog: the dashboard route table keeps a `labelKey` typed from `fa.json`, and lists such
as the landing FAQ keep an id array whose ids key the messages.

## Brand and marketing copy

`src/config/brand.config.ts` holds only language-independent values (contact phones). The
brand name (`common.brand`), page metadata (`meta`), landing copy (`landing`) and the footer
text and address (`footer`) are localized and live in the catalogs. Rebranding means editing
both.

## API errors

`core-api` returns an error **code**, not a translated sentence:

```jsonc
{ "statusCode": 400,
  "code": "user.avatar.too_large",
  "params": { "megabytes": 5 },
  "message": "File size exceeds 5 MB" }
```

- `code` is dot-delimited `domain.subject.reason` and matches a key under `errors.*` in
  `fa.json`/`en.json`. Throw with the per-status subclasses in
  `apps/core-api/src/libs/error/error.exception.coded.ts`.
- `params` carries interpolation values only — `{ megabytes: 5 }` travels, "under 5 MB"
  does not, because only the client knows which language to render it in.
- `message` is **required and English** — the fallback for a consumer that is not the PWA,
  and what an operator reads in logs. Translated copy lives only in the catalog.
- `CodedExceptionFilter` (registered in `main.ts`) normalises every `HttpException` body. It
  is scoped to `HttpException` so an unexpected throw stays with Nest's default handler, which
  already logs it and answers a bare 500.

### Validation

`createValidationPipe()` gives every `class-validator` refusal `code: "validation.failed"`
plus `issues: [{ field, rules }]` — a dotted DTO path and the constraint keys, never rendered
copy. Apply it through the two exported pipe lists, never as a class-level `@UsePipes`:

- **`formPipes`** — `@Body(...formPipes)` for anything a person typed. Normalises Persian and
  Arabic numerals *before* validating, the only order that works: Nest runs controller and
  method pipes ahead of parameter pipes, so a method-level validation pipe refuses `۱۲۳۴` for
  a format `NormalizeNumbersPipe` was about to fix.
- **`validationPipes`** — `@Query(...validationPipes)`, and `@Body(...validationPipes)` for a
  body carrying a document whose own literals must arrive byte-for-byte.
  `error.pipe.validation.ordering.spec.ts` pins both, plus the inverted arrangement as the
  counter-example.

Both lists use `whitelist: true`, so a DTO property without a decorator is stripped.

**Never put `message:` on a validator.** Only `Object.keys(constraints)` is transmitted, so
the text is discarded. Adding a validator means adding its **constraint key** under
`errors.validation.rules` in both catalogs, and the key is the library's rather than the
decorator's: `@Length` emits `isLength`, `@IsISO8601` emits `isIso8601`. A field a person can
see gets a name under `errors.validation.fields`. An unmapped key falls back to
`validation.rules.invalid` and an unmapped field to `validation.fields.generic`, so a gap
degrades quietly — which is why it needs checking rather than waiting to be reported.

### The framework's own refusals

A body with no `code` makes the client render the English `message`, so the refusals Nest
and Passport produce themselves are coded too. `JwtStrategy.validate()` only runs for a token
that verified, so an expired, malformed or absent one got Passport's bare `Unauthorized`;
`JwtAuthGuard.handleRequest` codes it as `auth.session.expired` or `auth.session.invalid`.
The same applies to anything added later that refuses inside the framework — a throttler
guard or a `FileInterceptor` size limit throws before your code runs and needs a coded
wrapper.

### On the client

Translation happens at the **display** layer, never in `fetcher` — a plain function with no
`useTranslations`, so it copies `code`/`params`/`issues` onto `ApiError` and
`useApiErrorMessage()` (in `src/libs/api/`) resolves the wording: validation issues through
`errors.validation.*`, other errors through the catalog entry for `code`, then the API's
`message`, then the caller's fallback, then `common.unknownError`. An unknown code can never
render as a bare `auth.otp.invalid`. The hook needs the `errors` namespace in the nearest
provider.

**Backend `Accept-Language` negotiation was rejected.** It would create a second catalog
beside `src/messages/fa.json` — the type source for the PWA's key shape — require plumbing
the edge-negotiated locale into every request, and make every response vary by language.

## Out-of-band messages

**SMS is the one place the backend renders a sentence itself**, and therefore the only
backend copy catalog: `apps/core-api/src/libs/i18n/i18n.templates.sms.ts`. It has no request
behind it — no URL prefix, no browser — only a phone number, so its language has to be
reported by a client that knew it.

- The OTP is the only template. `SendOtpDto` carries an optional `locale` that
  `useRequestOtpMutation` attaches on every call, and `AuthService.sendOtp` renders the SMS in
  it. It is used for that one message and not stored.
- Call sites name a template and its values, never a language: `renderSms(SmsTemplate.OTP,
  locale, { otp })`.
- Persian is the fallback at every step. `resolveLocale()` renders `fa` for anything absent
  or unrecognised rather than throwing: a message in the wrong language still arrives, an
  exception loses a login.
- A message sent later, with no request at all (a notification SMS days after the last
  visit), would need the reader's locale **recorded** — a nullable `UserEntity.locale`
  written at OTP verification. Nothing in the boilerplate renders such a message yet:
  notification bodies are caller-supplied text stored as given. Add the column with the first
  backend-rendered template that needs it.
- The locale rides on the OTP request only, never as a global header, for the reason backend
  negotiation was rejected above.

## Fonts

Two typefaces, chosen per locale in `app/[locale]/layout.tsx`: Yekan Bakh for `fa`, Inter
otherwise. The bundled Yekan build is the FaNum variant, which draws Latin digits as Persian
ones — right for `fa`, wrong for every number on an English page.

Both `next/font` loaders are called unconditionally at module scope — required, since font
loaders cannot be called conditionally — but only one is ever *active*: the body applies a
single `font-yekan` or `font-inter` class. `preload: false` is set on both deliberately;
without it Next.js emits an eager `<link rel=preload>` for both fonts on every page regardless
of locale. A declared-but-unused `@font-face` is not fetched on its own, so `preload: false`
plus "exactly one font class per render" is what keeps each locale from downloading the
other's font.

Checked with a real browser trace against the production build, each locale in a fresh
browser context:

```
fa (/):   5 Yekan Bakh files fetched, 0 Inter files
en (/en): 1 Inter file fetched (Latin subset), 0 Yekan files
```

If you touch the font setup, re-run that check against `next build` output. The dev server
and a browser profile that already visited the other locale both fetch fonts the production
page does not, and `next/font`'s CSS necessarily contains both `@font-face` blocks, so neither
eyeballing the CSS nor a dev-server trace tells you whether a leak exists.

Inter comes from `next/font/google`, which downloads it **at build time**; a build host that
cannot reach Google Fonts fails the build. Self-host it with `next/font/local` if that is a
constraint.

## Known gaps

- Notification `message` bodies are free text written by the caller and render as stored.
  Rendering them per reader means storing an `event` plus `metadata` and translating
  client-side.
- `RoleLabels` in `apps/core-api/src/roles/roles.constants.ts` is an unused Persian map; the
  PWA's role names come from `dashboard.roles`.
- The terms modal body is still an empty placeholder in both languages.
