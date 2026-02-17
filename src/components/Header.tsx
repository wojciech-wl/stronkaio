'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
import { Transition } from '@headlessui/react';
import { HiOutlineXMark, HiBars3 } from 'react-icons/hi2';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

import Container from './Container';
import { menuItems } from '@/data/menuItems';
import { ctaDetails } from '@/data/cta';

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const locale = useLocale();
    const tBrand = useTranslations('brand');
    const router = useRouter();
    const pathname = usePathname();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const switchLanguage = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale as 'pl' | 'en' });
    };

    return (
        <header className="bg-transparent fixed top-0 left-0 right-0 md:absolute z-50 mx-auto w-full">
            <Container className="!px-0">
                <nav className="shadow-md md:shadow-none bg-white md:bg-transparent mx-auto flex justify-between items-center py-2 px-5 md:py-10">
                    {/* Logo */}
                    <Link href={`/${locale}`} className="flex items-center gap-2">
                        <Image
                            src="/images/logo.png"
                            alt={tBrand('name')}
                            width={256}
                            height={384}
                            priority
                            className="h-10 md:h-20 w-auto object-contain"
                        />
                        <span className="manrope text-lg md:text-xl font-bold text-foreground cursor-pointer">
                            {tBrand('name')}
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <ul className="hidden md:flex items-center space-x-6">
                        {menuItems.map(item => (
                            <li key={item.text}>
                                <Link href={item.url} className="text-foreground hover:text-foreground-accent transition-colors">
                                    {locale === 'pl' ? item.text : item.textEn || item.text}
                                </Link>
                            </li>
                        ))}

                        {/* Language Switcher */}
                        <li className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
                            <button
                                onClick={() => switchLanguage('pl')}
                                className={`text-sm font-medium px-2 py-1 rounded-full transition-colors ${locale === 'pl' ? 'bg-primary text-white' : 'text-foreground hover:text-primary'}`}
                            >
                                PL
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                                onClick={() => switchLanguage('en')}
                                className={`text-sm font-medium px-2 py-1 rounded-full transition-colors ${locale === 'en' ? 'bg-primary text-white' : 'text-foreground hover:text-primary'}`}
                            >
                                EN
                            </button>
                        </li>

                        <li>
                            <a
                                href={ctaDetails.googlePlayUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white bg-primary hover:bg-primary-accent px-8 py-3 rounded-full transition-colors"
                            >
                                {locale === 'pl' ? 'Pobierz' : 'Download'}
                            </a>
                        </li>
                    </ul>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        {/* Mobile Language Switcher */}
                        <div className="flex items-center gap-1 border border-gray-300 rounded-full px-2 py-1">
                            <button
                                onClick={() => switchLanguage('pl')}
                                className={`text-xs font-medium px-1.5 py-0.5 rounded-full transition-colors ${locale === 'pl' ? 'bg-primary text-white' : 'text-foreground'}`}
                            >
                                PL
                            </button>
                            <button
                                onClick={() => switchLanguage('en')}
                                className={`text-xs font-medium px-1.5 py-0.5 rounded-full transition-colors ${locale === 'en' ? 'bg-primary text-white' : 'text-foreground'}`}
                            >
                                EN
                            </button>
                        </div>

                        <button
                            onClick={toggleMenu}
                            type="button"
                            className="bg-primary text-white focus:outline-none rounded-full w-10 h-10 flex items-center justify-center"
                            aria-controls="mobile-menu"
                            aria-expanded={isOpen}
                        >
                            {isOpen ? (
                                <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <HiBars3 className="h-6 w-6" aria-hidden="true" />
                            )}
                            <span className="sr-only">Toggle navigation</span>
                        </button>
                    </div>
                </nav>
            </Container>

            {/* Mobile Menu with Transition */}
            <Transition
                show={isOpen}
                enter="transition ease-out duration-200 transform"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75 transform"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div id="mobile-menu" className="md:hidden bg-white shadow-lg">
                    <ul className="flex flex-col space-y-4 pt-1 pb-6 px-6">
                        {menuItems.map(item => (
                            <li key={item.text}>
                                <Link href={item.url} className="text-foreground hover:text-primary block" onClick={toggleMenu}>
                                    {locale === 'pl' ? item.text : item.textEn || item.text}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <a
                                href={ctaDetails.googlePlayUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white bg-primary hover:bg-primary-accent px-5 py-2 rounded-full block w-fit"
                                onClick={toggleMenu}
                            >
                                {locale === 'pl' ? 'Pobierz' : 'Download'}
                            </a>
                        </li>
                    </ul>
                </div>
            </Transition>
        </header>
    );
};

export default Header;
