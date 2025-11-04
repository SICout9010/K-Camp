import type { PageServerLoad, Actions } from './$types';
import { error, redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
    const { slug } = params;

    // Check if user is authenticated
    if (!locals.user) {
        throw redirect(302, `/auth?redirect=/camp/${slug}/dashboard`);
    }

    try {
        // Fetch camp data by slug
        const camp = await locals.pb.collection('camps').getFirstListItem(`slug="${slug}"`);
        
        // Check if user is the organizer or admin
        const isOrganizer = locals.user.id === camp.organizer;
        const isAdmin = locals.user.role === 'admin';

        if (!isOrganizer && !isAdmin) {
            throw error(403, 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        }

        // Fetch related data
        const [organizer, faculty, registrationForm] = await Promise.all([
            locals.pb.collection('users').getOne(camp.organizer),
            locals.pb.collection('faculties').getOne(camp.faculty),
            locals.pb.collection('registration_forms').getFirstListItem(`camp="${camp.id}"`).catch(() => null)
        ]);

        // Get all registrations for this camp with user data
        const registrations = await locals.pb.collection('registrations').getFullList({
            filter: `camp="${camp.id}"`,
            expand: 'user',
            sort: '-created'
        });

        // Calculate statistics
        const stats = {
            total: registrations.length,
            pending: registrations.filter(r => r.status === 'pending').length,
            reviewing: registrations.filter(r => r.status === 'reviewing').length,
            accepted: registrations.filter(r => r.status === 'accepted').length,
            waitlist: registrations.filter(r => r.status === 'waitlist').length,
            rejected: registrations.filter(r => r.status === 'rejected').length,
            cancelled: registrations.filter(r => r.status === 'cancelled').length,
        };

        // Payment stats (if applicable)
        const paymentStats = {
            unpaid: registrations.filter(r => r.payment_status === 'unpaid').length,
            pending: registrations.filter(r => r.payment_status === 'pending').length,
            paid: registrations.filter(r => r.payment_status === 'paid').length,
            refunded: registrations.filter(r => r.payment_status === 'refunded').length,
        };

        const campBanner = camp.banner ? await locals.pb.files.getURL(camp, camp.banner) : null;

        // Get all faculties for editing
        const faculties = await locals.pb.collection('faculties').getFullList({
            sort: 'name_th'
        });

        return {
            camp,
            campBanner,
            organizer,
            faculty,
            faculties,
            registrationForm,
            registrations,
            stats,
            paymentStats,
            isOrganizer,
            isAdmin,
            user: locals.user
        };
    } catch (err: any) {
        console.error('Error loading camp dashboard:', err);
        if (err.status === 404) {
            throw error(404, 'ไม่พบค่ายที่คุณกำลังมองหา');
        }
        throw error(500, 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
};

export const actions: Actions = {
    // Update registration status
    updateRegistrationStatus: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { message: 'กรุณาเข้าสู่ระบบ' });
        }

        const formData = await request.formData();
        const registrationId = formData.get('registrationId') as string;
        const status = formData.get('status') as string;
        const notes = formData.get('notes') as string;

        try {
            const registration = await locals.pb.collection('registrations').getOne(registrationId, {
                expand: 'camp'
            });

            // Check permissions
            const camp = registration.expand?.camp;
            if (!camp || (camp.organizer !== locals.user.id && locals.user.role !== 'admin')) {
                return fail(403, { message: 'คุณไม่มีสิทธิ์ดำเนินการนี้' });
            }

            // Update registration
            await locals.pb.collection('registrations').update(registrationId, {
                status,
                notes,
                reviewed_at: new Date().toISOString(),
                reviewed_by: locals.user.id
            });

            // Update camp participant count
            if (status === 'accepted') {
                await locals.pb.collection('camps').update(camp.id, {
                    current_participants: (camp.current_participants || 0) + 1
                });
            } else if (registration.status === 'accepted' && status !== 'accepted') {
                // Decrement if changing from accepted to another status
                await locals.pb.collection('camps').update(camp.id, {
                    current_participants: Math.max(0, (camp.current_participants || 0) - 1)
                });
            }

            return { success: true, message: 'อัพเดตสถานะสำเร็จ' };
        } catch (err) {
            console.error('Error updating registration status:', err);
            return fail(500, { message: 'เกิดข้อผิดพลาดในการอัพเดตสถานะ' });
        }
    },

    // Update payment status
    updatePaymentStatus: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { message: 'กรุณาเข้าสู่ระบบ' });
        }

        const formData = await request.formData();
        const registrationId = formData.get('registrationId') as string;
        const paymentStatus = formData.get('paymentStatus') as string;

        try {
            const registration = await locals.pb.collection('registrations').getOne(registrationId, {
                expand: 'camp'
            });

            // Check permissions
            const camp = registration.expand?.camp;
            if (!camp || (camp.organizer !== locals.user.id && locals.user.role !== 'admin')) {
                return fail(403, { message: 'คุณไม่มีสิทธิ์ดำเนินการนี้' });
            }

            // Update payment status
            const updateData: any = {
                payment_status: paymentStatus
            };

            if (paymentStatus === 'paid') {
                updateData.payment_verified_at = new Date().toISOString();
            }

            await locals.pb.collection('registrations').update(registrationId, updateData);

            return { success: true, message: 'อัพเดตสถานะการชำระเงินสำเร็จ' };
        } catch (err) {
            console.error('Error updating payment status:', err);
            return fail(500, { message: 'เกิดข้อผิดพลาดในการอัพเดตสถานะการชำระเงิน' });
        }
    },

    // Update camp info
    updateCamp: async ({ request, locals, params }) => {
        if (!locals.user) {
            return fail(401, { message: 'กรุณาเข้าสู่ระบบ' });
        }

        const { slug } = params;
        const formData = await request.formData();

        try {
            const camp = await locals.pb.collection('camps').getFirstListItem(`slug="${slug}"`);

            // Check permissions
            if (camp.organizer !== locals.user.id && locals.user.role !== 'admin') {
                return fail(403, { message: 'คุณไม่มีสิทธิ์แก้ไขค่ายนี้' });
            }

            // Extract form data
            const updateData: any = {
                title: formData.get('title'),
                short_description: formData.get('short_description'),
                description: formData.get('description'),
                location: formData.get('location'),
                max_participants: parseInt(formData.get('max_participants') as string),
                registration_fee: parseFloat(formData.get('registration_fee') as string) || 0,
                contact_email: formData.get('contact_email'),
                contact_phone: formData.get('contact_phone'),
                contact_line: formData.get('contact_line'),
                website: formData.get('website'),
                facebook: formData.get('facebook'),
                instagram: formData.get('instagram'),
                status: formData.get('status'),
            };

            // Handle banner upload
            const banner = formData.get('banner') as File;
            if (banner && banner.size > 0) {
                updateData.banner = banner;
            }

            await locals.pb.collection('camps').update(camp.id, updateData);

            return { success: true, message: 'อัพเดตข้อมูลค่ายสำเร็จ' };
        } catch (err) {
            console.error('Error updating camp:', err);
            return fail(500, { message: 'เกิดข้อผิดพลาดในการอัพเดตข้อมูลค่าย' });
        }
    },

    // Delete camp
    deleteCamp: async ({ locals, params }) => {
        if (!locals.user) {
            return fail(401, { message: 'กรุณาเข้าสู่ระบบ' });
        }

        const { slug } = params;

        try {
            const camp = await locals.pb.collection('camps').getFirstListItem(`slug="${slug}"`);

            // Check permissions
            if (camp.organizer !== locals.user.id && locals.user.role !== 'admin') {
                return fail(403, { message: 'คุณไม่มีสิทธิ์ลบค่ายนี้' });
            }

            // Check if there are any accepted registrations
            const acceptedRegistrations = await locals.pb.collection('registrations').getList(1, 1, {
                filter: `camp="${camp.id}" && status="accepted"`
            });

            if (acceptedRegistrations.totalItems > 0) {
                return fail(400, { 
                    message: 'ไม่สามารถลบค่ายได้ เนื่องจากมีผู้สมัครที่ผ่านการคัดเลือกแล้ว กรุณายกเลิกค่ายแทน' 
                });
            }

            // Delete related data
            const registrations = await locals.pb.collection('registrations').getFullList({
                filter: `camp="${camp.id}"`
            });

            for (const registration of registrations) {
                await locals.pb.collection('registrations').delete(registration.id);
            }

            // Delete registration form
            try {
                const form = await locals.pb.collection('registration_forms').getFirstListItem(`camp="${camp.id}"`);
                await locals.pb.collection('registration_forms').delete(form.id);
            } catch {
                // Form might not exist
            }

            // Finally delete the camp
            await locals.pb.collection('camps').delete(camp.id);

            throw redirect(302, '/');
        } catch (err: any) {
            if (err.status === 302) {
                throw err;
            }
            console.error('Error deleting camp:', err);
            return fail(500, { message: 'เกิดข้อผิดพลาดในการลบค่าย' });
        }
    },

    // Export registrations to CSV
    exportRegistrations: async ({ locals, params }) => {
        if (!locals.user) {
            return fail(401, { message: 'กรุณาเข้าสู่ระบบ' });
        }

        const { slug } = params;

        try {
            const camp = await locals.pb.collection('camps').getFirstListItem(`slug="${slug}"`);

            // Check permissions
            if (camp.organizer !== locals.user.id && locals.user.role !== 'admin') {
                return fail(403, { message: 'คุณไม่มีสิทธิ์ดำเนินการนี้' });
            }

            const registrations = await locals.pb.collection('registrations').getFullList({
                filter: `camp="${camp.id}"`,
                expand: 'user',
                sort: '-created'
            });

            // Generate CSV data
            const csvRows = [];
            const headers = ['ID', 'ชื่อ-นามสกุล', 'อีเมล', 'สถานะ', 'วันที่สมัคร', 'หมายเหตุ'];
            csvRows.push(headers.join(','));

            for (const reg of registrations) {
                const formData = reg.form_data || {};
                const name = formData.field_1 || (reg.expand?.user?.name || 'N/A');
                const email = formData.field_2 || (reg.expand?.user?.email || 'N/A');
                const row = [
                    reg.id,
                    name,
                    email,
                    reg.status,
                    new Date(reg.created).toLocaleDateString('th-TH'),
                    reg.notes || ''
                ];
                csvRows.push(row.join(','));
            }

            return { 
                success: true, 
                csv: csvRows.join('\n'),
                filename: `registrations-${camp.slug}-${new Date().toISOString().split('T')[0]}.csv`
            };
        } catch (err) {
            console.error('Error exporting registrations:', err);
            return fail(500, { message: 'เกิดข้อผิดพลาดในการ export ข้อมูล' });
        }
    }
};

