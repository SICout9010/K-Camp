import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
    // Check if user is authenticated
    if (!locals.user) {
        throw redirect(303, '/auth');
    }

    // Check if user is not a student (organizers only)
    if (locals.user.role === 'student') {
        throw error(403, 'เฉพาะผู้จัดงานเท่านั้นที่สามารถสร้างค่ายได้');
    }

    try {
        // Fetch faculties for the dropdown
        const faculties = await locals.pb.collection('faculties').getFullList({
            sort: 'name_th'
        });

        return {
            user: locals.user,
            faculties
        };
    } catch (err) {
        console.error('Error loading create camp page:', err);
        throw error(500, 'ไม่สามารถโหลดข้อมูลได้');
    }
};

// Helper function to generate slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\u0E00-\u0E7Fa-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export const actions = {
    createDraft: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { error: 'กรุณาเข้าสู่ระบบ' });
        }

        const formData = await request.formData();
        
        try {
            // Generate slug if not provided
            let slug = formData.get('slug') as string;
            if (!slug) {
                const title = formData.get('title') as string;
                slug = generateSlug(title);
            }

            // Create camp record
            const campData = {
                title: formData.get('title'),
                slug: slug,
                short_description: formData.get('short_description'),
                description: formData.get('description'),
                category: formData.get('category'),
                target_audience: formData.getAll('target_audience'),
                location: formData.get('location'),
                location_detail: formData.get('location_detail') || '',
                start_date: formData.get('start_date'),
                end_date: formData.get('end_date'),
                registration_start: formData.get('registration_start'),
                registration_end: formData.get('registration_end'),
                min_participants: parseInt(formData.get('min_participants') as string) || 0,
                max_participants: parseInt(formData.get('max_participants') as string),
                registration_fee: parseInt(formData.get('registration_fee') as string) || 0,
                contact_email: formData.get('contact_email'),
                contact_phone: formData.get('contact_phone') || '',
                contact_line: formData.get('contact_line') || '',
                website: formData.get('website') || '',
                facebook: formData.get('facebook') || '',
                instagram: formData.get('instagram') || '',
                department: formData.get('department') || '',
                requirements: formData.get('requirements') || '',
                benefits: formData.get('benefits') || '',
                tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map(t => t.trim()).filter(t => t) : [],
                organizer: locals.user.id,
                faculty: formData.get('faculty'),
                status: 'draft',
                visibility: formData.get('visibility') || 'public',
                current_participants: 0,
                views: 0,
                featured: false
            };

            const camp = await locals.pb.collection('camps').create(campData);

            // Handle banner upload if provided
            const banner = formData.get('banner') as File;
            if (banner && banner.size > 0) {
                const updateData = new FormData();
                updateData.append('banner', banner);
                await locals.pb.collection('camps').update(camp.id, updateData);
            }

            // Handle gallery upload if provided
            const gallery = formData.getAll('gallery') as File[];
            if (gallery && gallery.length > 0 && gallery[0].size > 0) {
                const updateData = new FormData();
                gallery.forEach(file => {
                    if (file.size > 0) {
                        updateData.append('gallery', file);
                    }
                });
                await locals.pb.collection('camps').update(camp.id, updateData);
            }

            throw redirect(303, `/camp/${camp.slug}?draft=true`);
        } catch (err: any) {
            console.error('Error creating draft:', err);
            return fail(400, { 
                error: err.message || 'ไม่สามารถสร้างค่ายได้',
                data: Object.fromEntries(formData)
            });
        }
    },

    publish: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { error: 'กรุณาเข้าสู่ระบบ' });
        }

        const formData = await request.formData();
        
        try {
            // Generate slug if not provided
            let slug = formData.get('slug') as string;
            if (!slug) {
                const title = formData.get('title') as string;
                slug = generateSlug(title);
            }

            // Create camp record with published status
            const campData = {
                title: formData.get('title'),
                slug: slug,
                short_description: formData.get('short_description'),
                description: formData.get('description'),
                category: formData.get('category'),
                target_audience: formData.getAll('target_audience'),
                location: formData.get('location'),
                location_detail: formData.get('location_detail') || '',
                start_date: formData.get('start_date'),
                end_date: formData.get('end_date'),
                registration_start: formData.get('registration_start'),
                registration_end: formData.get('registration_end'),
                min_participants: parseInt(formData.get('min_participants') as string) || 0,
                max_participants: parseInt(formData.get('max_participants') as string),
                registration_fee: parseInt(formData.get('registration_fee') as string) || 0,
                contact_email: formData.get('contact_email'),
                contact_phone: formData.get('contact_phone') || '',
                contact_line: formData.get('contact_line') || '',
                website: formData.get('website') || '',
                facebook: formData.get('facebook') || '',
                instagram: formData.get('instagram') || '',
                department: formData.get('department') || '',
                requirements: formData.get('requirements') || '',
                benefits: formData.get('benefits') || '',
                tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map(t => t.trim()).filter(t => t) : [],
                organizer: locals.user.id,
                faculty: formData.get('faculty'),
                status: 'published',
                visibility: formData.get('visibility') || 'public',
                current_participants: 0,
                views: 0,
                featured: false
            };

            const camp = await locals.pb.collection('camps').create(campData);

            // Handle banner upload if provided
            const banner = formData.get('banner') as File;
            if (banner && banner.size > 0) {
                const updateData = new FormData();
                updateData.append('banner', banner);
                await locals.pb.collection('camps').update(camp.id, updateData);
            }

            // Handle gallery upload if provided
            const gallery = formData.getAll('gallery') as File[];
            if (gallery && gallery.length > 0 && gallery[0].size > 0) {
                const updateData = new FormData();
                gallery.forEach(file => {
                    if (file.size > 0) {
                        updateData.append('gallery', file);
                    }
                });
                await locals.pb.collection('camps').update(camp.id, updateData);
            }

            throw redirect(303, `/camp/${camp.slug}?published=true`);
        } catch (err: any) {
            console.error('Error publishing camp:', err);
            return fail(400, { 
                error: err.message || 'ไม่สามารถเผยแพร่ค่ายได้',
                data: Object.fromEntries(formData)
            });
        }
    }
};

