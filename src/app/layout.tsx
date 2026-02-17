import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
    subsets: ['latin', 'latin-ext'],
    variable: '--font-ui',
    display: 'swap'
});

export const metadata: Metadata = {
    title: 'IR Assistant - Asystent IO',
    description: 'Darmowa aplikacja pomagajaca osobom z insulinoopornoscia w codziennych wyborach zywieniowych.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pl" suppressHydrationWarning>
            <body className={`${inter.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
