import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

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
