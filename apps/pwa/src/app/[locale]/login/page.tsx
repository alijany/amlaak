import LoginModal from "@/components/auth/auth.component.modal";
import { ROOT_CLIENT_NAMESPACES, type LocalePageProps } from "@/i18n/i18n.config";
import type { Metadata } from "next";
import pick from "lodash/pick";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

// The door to the dashboard, not a page anyone should arrive on from search: it
// has no content of its own. `noindex` rather than a robots.txt disallow, which
// only stops crawling and would hide this very directive from the crawler.
export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default async function LoginPage({ params }: LocalePageProps) {
    const { locale } = await params;
    const messages = await getMessages({ locale });

    return (
        // `login` for the modal itself, `errors` so an API refusal renders in
        // the reader's language rather than as the API's English fallback.
        <NextIntlClientProvider
            messages={pick(messages, [...ROOT_CLIENT_NAMESPACES, 'login', 'errors'])}
        >
            <img alt='grid' src="/images/Grid.svg" className='absolute end-0 top-0 h-full object-cover' />
            <LoginModal />
        </NextIntlClientProvider>
    );
}
