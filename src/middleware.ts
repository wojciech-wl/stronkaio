import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

const LOCALE_PREFIX_RE = /^\/(pl|en)(\/|$)/;

/**
 * Normalize host header value:
 * - Take first value if CSV (proxy chains)
 * - Lowercase
 * - Strip port number
 */
function normalizeHost(raw: string | null): string {
    return (raw ?? '')
        .split(',')[0]
        .trim()
        .toLowerCase()
        .replace(/:\d+$/, '');
}

export function resolveDefaultLocaleFromHost(host: string | null): 'pl' | 'en' {
    const normalizedHost = normalizeHost(host);

    if (normalizedHost.includes('irassistant.app')) {
        return 'en';
    }

    if (normalizedHost.includes('asystentio.app')) {
        return 'pl';
    }

    return 'pl';
}

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const hostHeader = request.headers.get('x-forwarded-host') ?? request.headers.get('host');

    // Respect explicit locale URLs (/pl, /en, /pl/..., /en/...).
    if (!LOCALE_PREFIX_RE.test(pathname)) {
        const defaultLocale = resolveDefaultLocaleFromHost(hostHeader);
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = `/${defaultLocale}`;
        return NextResponse.redirect(redirectUrl);
    }

    return handleI18nRouting(request);
}

export const config = {
    matcher: [
        // Match all pathnames except for
        // - /api routes
        // - /_next (Next.js internals)
        // - /_vercel (Vercel internals)
        // - /images, /favicon.ico, etc (static files)
        '/((?!api|_next|_vercel|.*\\..*).*)'
    ]
};
