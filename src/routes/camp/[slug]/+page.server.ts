import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
    const { slug } = params;

    try {
        // Fetch camp data by slug
        const camp = await locals.pb.collection('camps').getFirstListItem(`slug="${slug}"`);
        
        // Fetch related data
        const [organizer, faculty, registrationForm] = await Promise.all([
            locals.pb.collection('users').getOne(camp.organizer),
            locals.pb.collection('faculties').getOne(camp.faculty),
            locals.pb.collection('registration_forms').getFirstListItem(`camp="${camp.id}"`).catch(() => null)
        ]);

        // Get registration count
        const registrationCount = await locals.pb.collection('registrations').getList(1, 1, {
            filter: `camp="${camp.id}" && status!="cancelled"`
        });

        // Check if user has already registered (if authenticated)
        let hasRegistered = false;
        let userRegistration = null;
        if (locals.user) {
            try {
                userRegistration = await locals.pb.collection('registrations').getFirstListItem(
                    `camp="${camp.id}" && user="${locals.user.id}"`
                );
                hasRegistered = true;
            } catch {
                hasRegistered = false;
            }
        }

        // Check if user is the organizer
        const isOrganizer = locals.user?.id === camp.organizer;

        // Increment view count
        await locals.pb.collection('camps').update(camp.id, {
            views: camp.views + 1
        });

        // Calculate registration status
        const now = new Date();
        const registrationStart = new Date(camp.registration_start);
        const registrationEnd = new Date(camp.registration_end);
        const startDate = new Date(camp.start_date);
        
        let registrationStatus: 'upcoming' | 'open' | 'closed' | 'full' | 'ended' = 'closed';
        
        if (now < registrationStart) {
            registrationStatus = 'upcoming';
        } else if (now >= registrationStart && now <= registrationEnd && camp.status === 'published') {
            if (camp.current_participants >= camp.max_participants) {
                registrationStatus = 'full';
            } else {
                registrationStatus = 'open';
            }
        } else if (now > startDate) {
            registrationStatus = 'ended';
        } else {
            registrationStatus = 'closed';
        }

        const campBanner = await locals.pb.files.getURL(camp, camp.banner);

        return {
            campBanner,
            camp,
            organizer,
            faculty,
            registrationForm,
            registrationCount: registrationCount.totalItems,
            hasRegistered,
            userRegistration,
            isOrganizer,
            registrationStatus,
            user: locals.user
        };
    } catch (err) {
        console.error('Error loading camp:', err);
        throw error(404, 'ไม่พบค่ายที่คุณกำลังมองหา');
    }
};

