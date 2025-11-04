import PocketBase from 'pocketbase';
import { serializeNonPOJOs } from '$lib/utils';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    // 'Content-Security-Policy': "default-src 'self' https://*.sentry.io https://*.googleapis.com https://*.google.com data:; img-src 'self' https://* blob: data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com",
}

// Add security headers to all responses
const securityHeadersMiddleware: Handle = async ({ event, resolve }) => {
    const response = await resolve(event);

    Object.entries(securityHeaders).forEach(([header, value]) => {
        response.headers.set(header, value);
    });

    return response;
}

const initPocketbase: Handle = async ({ event, resolve }) => {
    event.locals.pb = new PocketBase(PUBLIC_POCKETBASE_URL);
    event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

    try {
        if (event.locals.pb.authStore.isValid) {
            await event.locals.pb.collection('users').authRefresh();
            event.locals.user = serializeNonPOJOs(event.locals.pb.authStore.record);
        }
    } catch (_) {
        event.locals.pb.authStore.clear();       
        event.locals.user = null;     
    }

    const response = await resolve(event);
    response.headers.append('set-cookie', event.locals.pb.authStore.exportToCookie({secure: true, sameSite: 'lax'}));

    return response;
}

export const handle = sequence(securityHeadersMiddleware, initPocketbase);