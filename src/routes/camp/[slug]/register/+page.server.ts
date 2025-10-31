import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
    const { slug } = params;

    try {
        // Fetch camp by slug
        const camp = await locals.pb.collection('camps').getFirstListItem(`slug="${slug}"`, {
            expand: 'faculty,organizer'
        });

        // Check if registration is open
        const now = new Date();
        const registrationStart = new Date(camp.registration_start);
        const registrationEnd = new Date(camp.registration_end);

        if (now < registrationStart) {
            throw error(400, 'การรับสมัครยังไม่เปิด');
        }

        if (now > registrationEnd) {
            throw error(400, 'การรับสมัครปิดแล้ว');
        }

        if (camp.status !== 'published') {
            throw error(400, 'ค่ายนี้ไม่เปิดรับสมัคร');
        }

        if (camp.current_participants >= camp.max_participants) {
            throw error(400, 'รับสมัครเต็มแล้ว');
        }

        // Check if user already registered
        if (locals.user) {
            try {
                const existingRegistration = await locals.pb.collection('registrations').getFirstListItem(
                    `camp="${camp.id}" && user="${locals.user.id}"`
                );
                throw redirect(303, `/camp/${slug}?already_registered=true`);
            } catch (err: any) {
                // Not registered yet, continue
                if (err.status !== 404) {
                    throw err;
                }
            }
        }

        // Fetch registration form
        let registrationForm = null;
        try {
            registrationForm = await locals.pb.collection('registration_forms').getFirstListItem(
                `camp="${camp.id}"`
            );
        } catch (err) {
            // No custom form, use default
            console.log('No registration form found, using default');
        }

        return {
            camp,
            registrationForm,
            user: locals.user
        };
    } catch (err: any) {
        console.error('Error loading registration page:', err);
        if (err.status === 404) {
            throw error(404, 'ไม่พบค่ายที่คุณกำลังมองหา');
        }
        throw err;
    }
};

export const actions = {
    register: async ({ request, params, locals }) => {
        const { slug } = params;
        const formData = await request.formData();

        try {
            // Fetch camp
            const camp = await locals.pb.collection('camps').getFirstListItem(`slug="${slug}"`);

            // Validate registration is still open
            const now = new Date();
            if (now > new Date(camp.registration_end)) {
                return fail(400, { error: 'การรับสมัครปิดแล้ว' });
            }

            if (camp.current_participants >= camp.max_participants) {
                return fail(400, { error: 'รับสมัครเต็มแล้ว' });
            }

            // Check if already registered (for logged-in users)
            if (locals.user) {
                try {
                    await locals.pb.collection('registrations').getFirstListItem(
                        `camp="${camp.id}" && user="${locals.user.id}"`
                    );
                    return fail(400, { error: 'คุณได้ลงทะเบียนค่ายนี้แล้ว' });
                } catch (err: any) {
                    if (err.status !== 404) throw err;
                }
            }

            // Build form data JSON
            const formDataJson: Record<string, any> = {};
            for (const [key, value] of formData.entries()) {
                if (key !== 'files' && !key.startsWith('file_')) {
                    // Handle multiple values (checkboxes)
                    if (formDataJson[key]) {
                        if (Array.isArray(formDataJson[key])) {
                            formDataJson[key].push(value);
                        } else {
                            formDataJson[key] = [formDataJson[key], value];
                        }
                    } else {
                        formDataJson[key] = value;
                    }
                }
            }

            // Create registration
            const registrationData = {
                camp: camp.id,
                user: locals.user?.id || null,
                form_data: formDataJson,
                status: 'pending',
                payment_status: camp.registration_fee > 0 ? 'unpaid' : 'paid',
                submitted_at: new Date().toISOString()
            };

            const registration = await locals.pb.collection('registrations').create(registrationData);

            // Handle file uploads
            const fileFields = Array.from(formData.keys()).filter((key: string) => key.startsWith('file_'));
            if (fileFields.length > 0) {
                const updateData = new FormData();
                fileFields.forEach((key: string) => {
                    const file = formData.get(key) as File;
                    if (file && file.size > 0) {
                        updateData.append('files', file);
                    }
                });
                if (Array.from(updateData.entries()).length > 0) {
                    await locals.pb.collection('registrations').update(registration.id, updateData);
                }
            }

            // Update camp participant count
            await locals.pb.collection('camps').update(camp.id, {
                current_participants: camp.current_participants + 1
            });

            throw redirect(303, `/camp/${slug}?registered=true`);
        } catch (err: any) {
            console.error('Error registering:', err);
            if (err.status === 303) throw err;
            return fail(400, { 
                error: err.message || 'ไม่สามารถลงทะเบียนได้',
                data: Object.fromEntries(formData)
            });
        }
    }
};

