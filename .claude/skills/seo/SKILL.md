---
name: seo
description: Create, modify, or review search-facing pages in this Next.js application using project-specific technical SEO, on-page content, structured data, internal-linking, localization, and programmatic-page checks. Use for SEO audits and for implementation where organic discoverability is an explicit goal; do not invoke for ordinary dashboard UI work with no search surface.
---

# SEO for this application

Improve discoverability without separating SEO from the page's real user job. Base findings
on repository evidence, rendered output, and current primary guidance; never promise rankings
or invent keywords, demand, prices, reviews, freshness, or brand authority.

## Ground the task

Read the root and PWA `AGENTS.md` files first. Then inspect only the relevant page, layouts,
navigation, data source, and product contract. For public surfaces, follow `docs/README.md`
to the engine or product document that owns the page's intent, when one exists.

Check the installed Next.js version in `apps/pwa/node_modules/next/package.json` and use the
documentation for that version before changing a framework API; versions that ship their
guides keep them under `apps/pwa/node_modules/next/dist/docs/`. When an SEO rule may have
changed, verify it against the primary sources at the end of this file. Treat third-party
SEO heuristics as ideas to investigate, not evidence.

Before reviewing or editing, identify:

- the page's audience and useful outcome;
- whether the URL should be public and indexable, public but `noindex`, or authenticated;
- its URL equivalents in other locales, when the project serves more than one;
- whether important content exists in the initial HTML or only after client-side data loads;
- the exact evidence for every factual claim and structured-data property.

Do not turn a review into implementation unless the user asked for changes. When implementing,
make the smallest coherent change and preserve the PWA's fetcher, `DataView`, and public-DTO
boundaries.

## Understand this application

- Routes use the Next.js App Router under `apps/pwa/src/app/[locale]/`.
- `fa` is the default locale and has unprefixed URLs (`/`, `/login`); `en` uses `/en`
  (`/en`, `/en/login`). The language is negotiated in `src/proxy.ts` before rendering so both
  versions stay statically rendered; do not add a language switcher or read request headers
  inside a page. See `docs/engine/localization.md`.
- `app/[locale]/layout.tsx` renders `<html lang dir>` per locale and owns the default,
  localized title and description (catalog namespace `meta`). It sets no canonical: layout
  metadata merges into every child, so canonical and `alternates.languages` belong on the page
  that owns them — `/` declares its own canonical plus `fa`/`en` alternates. next-intl also
  sends `Link: rel="alternate"; hreflang` (including `x-default`) on every route.
- The boilerplate's search-facing surface is `/`, the public landing page inside
  `RootLayout`; its copy comes from the `meta` and `landing` catalog namespaces in
  `src/messages/fa.json` and `en.json`. `/login` and `/dashboard/**` are application
  surfaces, not acquisition pages. Give each public page one search intent; do not blend a
  product pitch, directory, and legal content on one URL.
- Domain data is fetched client-side with SWR and rendered through `DataView`, and the
  landing content (`landing.component.page.tsx`) is a Client Component rendered, and
  prerendered per locale, from a server `page.tsx`. For a public page whose primary content comes
  from the API, treat initial-HTML discoverability as an explicit tradeoff. Do not redesign
  the data path or abandon `DataView` merely to satisfy a checklist; surface the impact and
  change it only when the approved scope includes that architecture.
- Seed and demo data are development-only and cannot support production search pages or
  claims.

Run the deterministic inventory from the repository root when the task covers more than one
route, or when metadata/indexing is in scope:

```bash
node .claude/skills/seo/scripts/inspect-seo.mjs
```

The script reports route exposure, rendering mode, local metadata coverage, metadata files,
private-route `noindex` coverage, and structured-data locations. Its warnings are source-code
leads, not proof of the final HTML. Use `--strict` only in a deliberately clean validation gate.

## Review or build in this order

### 1. Crawlability, indexability, and rendering

- Verify the real HTTP status, redirect target, robots directives, canonical, and body (in
  every locale variant, when localized). An unavailable record should produce the intended
  status, not an indexable soft-404 explanation under `200`.
- Keep authenticated and login surfaces out of search results with page-level `noindex`. A
  `robots.txt` disallow controls crawling and is not a substitute for `noindex`; do not expose
  protected content to crawlers to make the directive visible.
- A sitemap should contain only canonical, indexable, useful URLs: each locale equivalent when
  localized, and only records that pass the same visibility rules as the API. Do not list
  dashboard, login, query-string filter states, unavailable records, or speculative pages.
- Check the initial HTML with `curl` or built artifacts as well as the hydrated browser. Critical
  page meaning, crawlable links, canonical metadata, and structured data should not depend on a
  click. Flag client-only primary content with its concrete impact; do not call JavaScript content
  invisible without testing rendered output.
- Preserve static rendering of public pages. When build/runtime configuration or metadata
  routing changes, run the PWA build and inspect actual `.next/server/app/**/*.html` artifacts;
  the build summary alone is not sufficient evidence.

### 2. Metadata and URL identity

- Give each indexable page a useful title and description that match its visible H1 and page
  job. Do not use arbitrary character counts as pass/fail rules; check truncation and clarity
  in the rendered result.
- Each URL should canonicalize to itself, not to `/` (or, when localized, to the other
  language). Localized pages need reciprocal language alternates generated from the same route
  mapping. Check nested routes carefully: Next.js inherits unresolved parent metadata, so a
  child can accidentally retain the homepage canonical.
- Prefer the Next.js Metadata API in Server Components. A Client Component page cannot export
  metadata; put it in a server `layout.tsx` or split the page into a server shell and client
  content. Use `metadataBase` or verified absolute production URLs where a field requires them;
  do not guess the deployment origin.
- Add Open Graph/Twitter fields or images when they improve real sharing for that page type. Keep
  their title, description, locale, image, and URL consistent with the canonical page.
- Preserve `<html lang>` and `dir` from the root (or locale) layout. When localized, metadata and
  visible copy must describe equivalent content even when phrasing is localized rather than
  literal.

### 3. On-page content and links

- Confirm one clear H1, descriptive headings, and enough visible context for a visitor arriving
  directly from search to understand the page and complete its job. Do not optimize for keyword
  density or a generic minimum word count.
- Evaluate content with the concrete `who`, `how`, and `why` questions from Google's helpful-content
  guidance where authorship or creation method matters. For data-driven pages, attribution,
  source, availability, price/date uncertainty, and freshness must reflect stored data—not
  confident copy.
- Use concise, descriptive anchors in real `<a href>` links. Every indexable detail page should be
  reachable from a useful browse or related-content path; a sitemap does not cure an orphan page.
  Use Next.js `Link`, or the project's localized navigation helper when one exists.
- Give informative images contextual alt text and decorative images empty alt text. Verify
  fallbacks for remote images that can fail. Do not repeat nearby text in alt attributes or
  treat alt text as a keyword field.
- Judge internal links by visitor usefulness and hierarchy, not a fixed links-per-page quota. Keep
  marketing, legal, and application destinations distinct while preserving the shared
  navigation in `RootLayout` and the dashboard shell.

### 4. Structured data

Add JSON-LD only when it truthfully describes visible page content and has a concrete consumer or
entity-understanding benefit.

- Render a native `<script type="application/ld+json">` from a Server Component. Escape `<` in
  serialized values as the Next.js JSON-LD guide requires; do not add a dependency merely for
  JSON-LD.
- Prefer a small, connected graph over many types: organization/site identity where supported by
  verified brand facts, `BreadcrumbList` where a visible hierarchy exists, and a page-specific
  type only when its required properties are present.
- A semantically relevant Schema.org type is not by itself a Google rich-result promise. Add
  `Offer` only for a visible, current price/currency and truthful availability. Never
  manufacture ratings, reviews, addresses, or inventory.
- Do not add FAQ or Q&A markup merely because a page has an accordion. Check the current Google
  feature documentation and eligibility before proposing search-result benefits.
- Validate generic vocabulary with Schema.org Validator and Google-supported features with Rich
  Results Test. A valid graph can still be irrelevant or misleading; compare every property with
  the rendered page and source DTO.

### 5. Programmatic SEO

Do not create per-location, per-date, per-category, or query-variant landing pages unless
product scope and useful source data already support them.

Before creating or expanding a template:

1. Prove a distinct user need and stable canonical URL pattern.
2. Inspect the data population, missingness, freshness, visibility/consent rules, and duplicate
   records. Do not infer content to fill sparse records.
3. Ensure each generated page has standalone value from real record attributes, attribution,
   useful next actions, and honest unknown states—not only swapped names.
4. Define empty, removed, expired, and unavailable behavior before indexation. Exclude
   low-value or unavailable records from sitemap and internal-link generation.
5. Sample rendered pages across locales and important data states before increasing coverage.
   Use repository data to choose the sample size; avoid invented percentage or page-count gates.

Google prohibits scaled content made primarily to manipulate rankings regardless of whether it is
generated by AI, templates, or people. Stop and ask for a product/content decision when unique
value, consent, or a reliable data source is missing.

## Verify and report

For implementation, run `pnpm --filter pwa lint`. Run `pnpm --filter pwa build` when changing
metadata routes, rendering behavior, runtime/build configuration, or static-generation contracts.
Inspect the diff after lint.

When runtime validation is relevant, follow `.devcontainer/README.md` and check every locale
variant the page serves:

- status and redirects with an HTTP client;
- initial HTML for title, description, canonical, language alternates, robots, H1, key content,
  crawlable links, and JSON-LD;
- hydrated UI and relevant API response separately with Playwright;
- `robots.txt` and `sitemap.xml` when present;
- a representative record plus missing-data and unavailable states when those paths changed.

Report evidence, not a synthetic SEO score. For each consequential finding, give the route/file or
rendered observation, why it matters for this page, the smallest recommended change, and how to
verify it. Separate indexing blockers from quality improvements and label unknowns that require
Search Console, analytics, keyword research, production access, or stakeholder evidence.

## Primary sources

- Installed framework contract: the metadata and OG images guide, the JSON-LD guide, and the
  `sitemap`, `robots`, and `generateMetadata` API references for the installed Next.js version.
- [Google's developer SEO guide](https://developers.google.com/search/docs/fundamentals/get-started-developers)
- [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Localized versions and hreflang](https://developers.google.com/search/docs/advanced/crawling/localized-versions)
- [Link best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Structured-data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Schema.org vocabulary](https://schema.org/docs/full.html)
