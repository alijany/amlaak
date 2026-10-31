import { locales, ROOT_CLIENT_NAMESPACES } from '@/i18n/i18n.config';
import { routing } from '@/i18n/i18n.routing';
import pick from 'lodash/pick';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

/**
 * Extends the client-side message set with the `dashboard` and `errors`
 * namespaces for this subtree only. The root layout deliberately ships just the
 * shared chrome strings; anything area-specific is added here so it never
 * reaches visitors who only ever see the public pages.
 *
 * The root namespaces have to be re-sent alongside it: a nested provider's
 * `messages` prop replaces the inherited catalog instead of merging with it, so
 * picking only `dashboard` would strip `common`/`calendar`/`format` from every
 * client component under `/dashboard`.
 *
 * Add domain namespaces the same way — either here, or in a layout further
 * down if the strings belong to a single domain.
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function DashboardSegmentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider
      messages={pick(messages, [...ROOT_CLIENT_NAMESPACES, 'dashboard', 'errors'])}
    >
      {children}
    </NextIntlClientProvider>
  );
}
