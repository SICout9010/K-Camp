import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
    try {
        // Fetch featured/recent camps from PocketBase
        const camps = await locals.pb.collection('camps').getList(1, 6, {
            filter: 'status = "published"',
            sort: '-featured,-created',
            expand: 'faculty,organizer'
        });

        return {
            camps: camps.items,
            user: locals.user
        };
    } catch (error) {
        console.error('Error loading camps:', error);
        return {
            camps: [],
            user: locals.user
        };
    }
};

