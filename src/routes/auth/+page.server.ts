import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
    const authMethods = await locals.pb.collection('users').listAuthMethods();
    const fail = url.searchParams.get('fail') === 'true';

    return {
        providers: authMethods.oauth2.providers,
        user: locals.user,
        fail
    }
}

export const actions = {
    google: async ({ locals, request, cookies, url }) => {
        console.log("[Auth] Logging in with Google...");
        const provider = (await locals.pb.collection('users').listAuthMethods()).oauth2.providers.find((p: any) => p.name === 'google');
        
        // Dynamically construct redirect URL based on current origin
        const redirectUrl = `${url.origin}/auth/callback/${provider?.name}`;
        
        cookies.set('provider', JSON.stringify(provider), { 
            path: '/auth/callback/google', 
            httpOnly: false, 
            secure: true, 
            sameSite: 'lax'
        });
        cookies.set('redirectUrl', redirectUrl, { 
            path: '/auth/callback/google', 
            httpOnly: false, 
            secure: true, 
            sameSite: 'lax' 
        });

        console.log("[Auth] Redirecting to:", provider?.authURL + redirectUrl);
        throw redirect(303, provider?.authURL + redirectUrl);
    },
    facebook: async ({ locals, request, cookies, url }) => {
        console.log("logging with Facebook...");
        const provider = (await locals.pb.collection('users').listAuthMethods()).oauth2.providers.find((p: any) => p.name === 'facebook');
        
        // Dynamically construct redirect URL based on current origin
        const redirectUrl = `${url.origin}/auth/callback/${provider?.name}`;
        
        cookies.set('provider', JSON.stringify(provider), { path: '/auth/callback/facebook', httpOnly: false, secure: false, sameSite: 'lax' });
        cookies.set('redirectUrl', redirectUrl, { path: '/auth/callback/facebook', httpOnly: false, secure: false, sameSite: 'lax' });

        throw redirect(303, provider?.authURL + redirectUrl);
    },
    logout: async ({ locals }) => {
        await locals.pb.authStore.clear();
        throw redirect(303, '/auth');
    }
}