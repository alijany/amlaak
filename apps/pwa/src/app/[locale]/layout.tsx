import { AuthProvider } from "@/components/auth/auth.context.provider";
import { ClarityAnalytics } from "@/components/clarity/clarity.component.analytics";
import { LocaleProbe } from "@/i18n/i18n.component.locale-probe";
import {
  localeDirection,
  locales,
  ROOT_CLIENT_NAMESPACES,
  type Locale,
} from "@/i18n/i18n.config";
import { routing } from "@/i18n/i18n.routing";
import type { Metadata } from "next";
import pick from "lodash/pick";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { notFound } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "../globals.css";

/**
 * One face per script: Yekan Bakh for `fa`, Inter for everything else. The
 * Yekan build here is the FaNum variant, which draws Latin digits as Persian
 * ones — right for `fa`, wrong for every number on an English page.
 *
 * Both loaders must be called unconditionally at module scope — that's a
 * `next/font` constraint — but only one is ever the *active* font per request:
 * the body below applies just one `font-*` utility class based on locale, and
 * a `@font-face` that no rendered text resolves to is never fetched by the
 * browser. `preload: false` on both is what keeps that true — see the
 * font check in docs/engine/localization.md before changing it.
 */
const yekan = localFont({
  src: [
    {
      path: '../../assets/fonts/YekanBakhFaNum-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/YekanBakhFaNum-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/YekanBakhFaNum-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/YekanBakhFaNum-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/YekanBakhFaNum-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/YekanBakhFaNum-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/YekanBakhFaNum-ExtraBlack.woff2',
      weight: '900',
      style: 'normal',
    }
  ],
  variable: '--font-yekan',
  preload: false,
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  preload: false,
});

/**
 * Prerenders every locale at build time. The locale itself is resolved from
 * `next/root-params` in `i18n.request.ts`, which is what keeps these renders
 * static without a `setRequestLocale` call in each page.
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: requested } = await params;
  // Narrowed before use: the segment doubles as a catch-all for unknown paths.
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // `[locale]` also catches unknown paths, so the segment is untrusted.
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const dir = localeDirection[locale as Locale];
  const messages = await getMessages({ locale });
  const fontClass = locale === 'fa' ? 'font-yekan' : 'font-inter';

  return (
    // `data-scroll-behavior` keeps the pre-16 behaviour: smooth scrolling for
    // in-page anchors, instant jumps on route changes.
    <html lang={locale} dir={dir} className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body
        className={`${yekan.variable} ${inter.variable} ${fontClass} text-xs lg:text-base antialiased bg-slate-50`}
      >
        {/*
          Only the namespaces the shared chrome actually needs cross to the
          client — the full catalog would otherwise be serialised into the HTML
          of every page. Area-specific namespaces are added by that area's own
          layout or page (see `dashboard/layout.tsx`), so someone reading the
          landing page never downloads dashboard strings.
        */}
        <NextIntlClientProvider
          locale={locale}
          messages={pick(messages, [...ROOT_CLIENT_NAMESPACES])}
        >
          <AuthProvider>
            {children}
            <ToastContainer position="bottom-center" rtl={dir === 'rtl'} />
            <ClarityAnalytics />
            <LocaleProbe locale={locale} />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
