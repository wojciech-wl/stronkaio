import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { GoogleAnalytics } from '@next/third-parties/google';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteDetails } from '@/data/siteDetails';
import { routing } from '@/i18n/routing';

type Props = {
    children: React.ReactNode;
    params: { locale: string } | Promise<{ locale: string }>;
};

export default async function LocaleLayout({
    children,
    params
}: Props) {
    const { locale } = await Promise.resolve(params);

    // Ensure that the incoming `locale` is valid
    if (!routing.locales.includes(locale as 'pl' | 'en')) {
        notFound();
    }

    setRequestLocale(locale);

    // Providing all messages to the client
    const messages = await getMessages({ locale });

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {siteDetails.googleAnalyticsId && <GoogleAnalytics gaId={siteDetails.googleAnalyticsId} />}
            <Header />
            <main>
                {children}
            </main>
            <Footer />
        </NextIntlClientProvider>
    );
}
