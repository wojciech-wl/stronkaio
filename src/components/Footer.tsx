'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { footerDetails } from '@/data/footer';

const Footer: React.FC = () => {
    const locale = useLocale();
    const tBrand = useTranslations('brand');
    const isEn = locale === 'en';

    return (
        <footer className="bg-hero-background text-foreground py-10">
            <div className="mt-8 md:text-center text-foreground-accent px-6">
                <p>
                    Copyright &copy; {new Date().getFullYear()} {tBrand('name')}.
                    {isEn ? ' All rights reserved.' : ' Wszelkie prawa zastrzezone.'}
                </p>
                {footerDetails.email && (
                    <a href={`mailto:${footerDetails.email}`} className="block mt-2 hover:text-foreground">
                        {footerDetails.email}
                    </a>
                )}
            </div>
        </footer>
    );
};

export default Footer;
