#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const appRoot = resolve(projectRoot, 'apps/pwa/src/app');
// Localized apps nest every route under [locale]; otherwise routes start at app/.
const localeSegment = resolve(appRoot, '[locale]');
const routeRoot = existsSync(localeSegment) ? localeSegment : appRoot;
const strict = process.argv.includes('--strict');
const warnings = [];
const privateRoutesWithoutNoindex = [];

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function source(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

function routeFor(pagePath) {
  const segments = relative(routeRoot, dirname(pagePath))
    .split(sep)
    .filter((segment) => segment && !/^\(.*\)$/.test(segment) && !segment.startsWith('@'));
  return segments.length ? `/${segments.join('/')}` : '/';
}

function ancestors(pagePath) {
  const results = [];
  let current = dirname(pagePath);
  while (current.startsWith(routeRoot)) {
    results.push(resolve(current, 'layout.tsx'));
    if (current === routeRoot) break;
    current = dirname(current);
  }
  return results.filter(existsSync);
}

function hasMetadata(text) {
  return /export\s+(?:async\s+)?function\s+generateMetadata|export\s+const\s+metadata\b/.test(text);
}

function metadataOwner(pagePath) {
  if (hasMetadata(source(pagePath))) return pagePath;
  return ancestors(pagePath).find((path) => hasMetadata(source(path)));
}

function isPrivateRoute(route) {
  return route === '/login' || route.startsWith('/dashboard');
}

function hasNoindex(pagePath) {
  return [pagePath, ...ancestors(pagePath)].some((path) => {
    const text = source(path);
    return /robots\s*:/.test(text) && /index\s*:\s*false/.test(text);
  });
}

function displayPath(path) {
  return relative(projectRoot, path).split(sep).join('/');
}

if (!existsSync(appRoot)) {
  console.error(`SEO inventory: missing ${displayPath(appRoot)}`);
  process.exit(2);
}

const pages = walk(routeRoot)
  .filter((path) => path.endsWith(`${sep}page.tsx`))
  .sort((a, b) => routeFor(a).localeCompare(routeFor(b)));

console.log('SEO source inventory (verify warnings against rendered HTML)');
console.log('');
console.log('ROUTE\tEXPOSURE\tRENDER\tMETADATA OWNER');

for (const page of pages) {
  const route = routeFor(page);
  const pageSource = source(page);
  const privateRoute = isPrivateRoute(route);
  const owner = metadataOwner(page);
  const render = /^\s*['"]use client['"];?/m.test(pageSource) ? 'client' : 'server';
  const ownerLabel = owner ? displayPath(owner) : 'none';
  console.log(`${route}\t${privateRoute ? 'private' : 'public'}\t${render}\t${ownerLabel}`);

  if (privateRoute && !hasNoindex(page)) {
    privateRoutesWithoutNoindex.push(route);
  }

  if (!privateRoute) {
    if (!owner) {
      warnings.push(`${route}: public route has no metadata export in its page/layout ancestry`);
      continue;
    }

    const ownerText = source(owner);
    if (owner === resolve(routeRoot, 'layout.tsx') && route !== '/') {
      warnings.push(`${route}: inherits root metadata; review title, description, and homepage canonical`);
    } else if (!/alternates\s*:/.test(ownerText)) {
      warnings.push(`${route}: nearest metadata owner has no source-level alternates/canonical`);
    }
  }
}

const dashboardWithoutNoindex = privateRoutesWithoutNoindex.filter(
  (route) => route === '/dashboard' || route.startsWith('/dashboard/'),
);
if (dashboardWithoutNoindex.length) {
  warnings.push(
    `/dashboard/**: ${dashboardWithoutNoindex.length} application routes have no ` +
      'source-level robots index:false in their ancestry',
  );
}
if (privateRoutesWithoutNoindex.includes('/login')) {
  warnings.push('/login: private application route has no source-level robots index:false');
}

const metadataFiles = {
  robots: ['robots.ts', 'robots.js', 'robots.txt'],
  sitemap: ['sitemap.ts', 'sitemap.js', 'sitemap.xml'],
  'open graph image': [
    'opengraph-image.tsx',
    'opengraph-image.ts',
    'opengraph-image.png',
    'opengraph-image.jpg',
  ],
  favicon: ['favicon.ico', 'icon.png', 'icon.svg', 'icon.tsx'],
};

console.log('');
console.log('APP METADATA FILES');
for (const [label, candidates] of Object.entries(metadataFiles)) {
  const found = candidates.map((name) => resolve(appRoot, name)).filter(existsSync);
  console.log(`${label}: ${found.length ? found.map(displayPath).join(', ') : 'not found'}`);
  if ((label === 'robots' || label === 'sitemap') && !found.length) {
    warnings.push(`app metadata: ${label} file not found`);
  }
}

const sourceFiles = walk(resolve(projectRoot, 'apps/pwa/src')).filter((path) =>
  /\.(?:ts|tsx|js|jsx)$/.test(path),
);
const jsonLdFiles = sourceFiles.filter((path) => /application\/ld\+json/.test(source(path)));
console.log(`JSON-LD: ${jsonLdFiles.length ? jsonLdFiles.map(displayPath).join(', ') : 'not found'}`);

const buildRoot = resolve(projectRoot, 'apps/pwa/.next/server/app');
if (existsSync(buildRoot)) {
  const htmlCount = walk(buildRoot).filter((path) => path.endsWith('.html')).length;
  console.log(`Built HTML artifacts: ${htmlCount} (count only; compare with the current route contract)`);
} else {
  console.log('Built HTML artifacts: .next/server/app not found (build not run)');
}

console.log('');
if (warnings.length) {
  console.log(`REVIEW LEADS (${warnings.length})`);
  for (const warning of warnings) console.log(`- ${warning}`);
} else {
  console.log('REVIEW LEADS (0)');
}

if (strict && warnings.length) process.exitCode = 1;
