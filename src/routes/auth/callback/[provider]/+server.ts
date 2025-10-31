import { redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, url, cookies }) => {
    const provider = JSON.parse(cookies.get('provider') ?? '{}');
    const redirectUrl = cookies.get('redirectUrl') || `${url.origin}/auth/callback/${provider.name}`;
    
    console.log('[OAuth Callback] Provider:', provider.name);

    if (provider.state !== url.searchParams.get('state')) {
        console.error('[OAuth Callback] State mismatch');
        throw new Error('Invalid state');
    }

    try {
        // Authenticate with OAuth2 code - this creates/logs in the user
        const authData = await locals.pb.collection('users').authWithOAuth2Code(
            provider.name,
            url.searchParams.get('code') || '',
            provider.codeVerifier,
            redirectUrl
        );

        console.log('[OAuth Callback] User authenticated:', authData.record.id);

        // Get the authenticated user ID from authData
        const userId = authData.record.id;

        // Create FormData to upload avatar
        const formData = new FormData();
        formData.append('username', authData.meta?.name);
        
        // Download and upload avatar if available
        if (authData.meta?.avatarUrl) {
            try {
                const avatarBlob = await fetch(authData.meta.avatarUrl).then(res => res.blob());
                formData.append('avatar', avatarBlob, `${userId}-avatar.jpg`);
            } catch (err) {
                console.error('[OAuth Callback] Failed to fetch avatar:', err);
            }
        }

        // Update user with username and avatar
        await locals.pb.collection('users').update(userId, formData).catch((err) => {
            console.error('[OAuth Callback] Failed to update user:', err);
        });

        // Check if user's email is from @kmitl.ac.th
        if (!authData.record.email.endsWith('@kmitl.ac.th')) {
            await locals.pb.collection('users').update(userId, {
                role: 'student'
            }).catch((err) => {
                console.error('[OAuth Callback] Failed to update user role:', err);
            });
        } else {
            await locals.pb.collection('users').update(userId, {
                role: 'organizer'
            }).catch((err) => {
                console.error('[OAuth Callback] Failed to update user role:', err);
            });
        }

        console.log('[OAuth Callback] Login successful, redirecting to /kawaii');
    } catch (e: any) {
        console.error('[OAuth Callback] Error:', {
            message: e?.message,
            status: e?.status,
            data: e?.data
        });
        return redirect(303, '/auth?fail=true');
    }

    return redirect(303, '/');
}