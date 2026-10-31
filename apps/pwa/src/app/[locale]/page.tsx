import {
  defaultLocale,
  locales,
  ROOT_CLIENT_NAMESPACES,
  type LocalePageProps,
} from '@/i18n/i18n.config';
import type { Metadata } from 'next';
import pick from 'lodash/pick';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { LandingPage } from './landing.component.page';

/**
 * Canonical and language alternates live on the page, not the root layout:
 * layout metadata merges into every child, so a layout-level canonical would
 * make `/login` and every dashboard route claim to be a copy of `/`.
 */
export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    alternates: {
      canonical: locale === defaultLocale ? '/' : `/${locale}`,
      languages: Object.fromEntries(
        locales.map((current) => [
          current,
          current === defaultLocale ? '/' : `/${current}`,
        ]),
      ),
    },
  };
}

/**
 * The landing page is a Client Component (the FAQ accordion holds state), so
 * its namespace is shipped here, beside the shared chrome strings it also
 * needs — not from the root layout, which every dashboard route shares.
 */
export default async function HomePage({ params }: LocalePageProps) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider
      messages={pick(messages, [...ROOT_CLIENT_NAMESPACES, 'landing'])}
    >
      <LandingPage />
    </NextIntlClientProvider>
  );
}
