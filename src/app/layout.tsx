import type { Metadata } from "next";
import { Source_Sans_3, Manrope } from "next/font/google";

import "./globals.css";

const manrope = Manrope({ subsets: ['latin'] });
const sourceSans = Source_Sans_3({ subsets: ['latin'] });

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
            <body className={`${manrope.className} ${sourceSans.className} antialiased`}>
                {children}
            </body>
        </html>
    );
}
