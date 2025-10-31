<script lang="ts">
    import type { PageData, ActionData } from './$types';
    import { enhance } from '$app/forms';
    import Header from '$lib/components/Header.svelte';
    import GridPattern from '$lib/components/GridPattern.svelte';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Textarea } from '$lib/components/ui/textarea';
    import * as Card from '$lib/components/ui/card';
    import * as Tabs from '$lib/components/ui/tabs';
    import { Badge } from '$lib/components/ui/badge';
    import { Separator } from '$lib/components/ui/separator';
    import { Checkbox } from '$lib/components/ui/checkbox';
    import {
        Sparkles,
        Info,
        Calendar,
        MapPin,
        Image as ImageIcon,
        Mail,
        Save,
        Send,
        AlertCircle,
        Check,
        Users,
        Clock,
        DollarSign
    } from '@lucide/svelte';

    type Props = {
        data: PageData;
        form?: ActionData;
    };

    let { data, form }: Props = $props();

    // Form state
    let title = $state('');
    let slug = $state('');
    let shortDescription = $state('');
    let description = $state('');
    let category = $state('');
    let targetAudience = $state<string[]>([]);
    let location = $state('');
    let locationDetail = $state('');
    let startDate = $state('');
    let endDate = $state('');
    let registrationStart = $state('');
    let registrationEnd = $state('');
    let minParticipants = $state(0);
    let maxParticipants = $state(50);
    let registrationFee = $state(0);
    let contactEmail = $state(data.user?.email || '');
    let contactPhone = $state('');
    let contactLine = $state('');
    let website = $state('');
    let facebook = $state('');
    let instagram = $state('');
    let department = $state('');
    let requirements = $state('');
    let benefits = $state('');
    let tags = $state('');
    let selectedFaculty = $state('');
    let visibility = $state('public');
    let isSubmitting = $state(false);
    let bannerPreview = $state<string | null>(null);
    let galleryPreviews = $state<string[]>([]);

    // Categories
    const categories = [
        { value: 'academic', label: 'ค่ายวิชาการ' },
        { value: 'skills', label: 'ค่ายพัฒนาทักษะ' },
        { value: 'competition', label: 'ค่ายแข่งขัน' },
        { value: 'volunteer', label: 'ค่ายจิตอาสา' },
        { value: 'cultural', label: 'ค่ายวัฒนธรรม' },
        { value: 'sports', label: 'ค่ายกีฬา' },
        { value: 'technology', label: 'ค่ายเทคโนโลยี' },
        { value: 'leadership', label: 'ค่ายผู้นำ' },
        { value: 'other', label: 'อื่นๆ' }
    ];

    const audiences = [
        { value: 'high_school', label: 'นักเรียนมัธยมปลาย' },
        { value: 'undergraduate', label: 'นิสิตปริญญาตรี' },
        { value: 'all_students', label: 'นักเรียน/นิสิตทั่วไป' }
    ];

    // Auto-generate slug from title
    const generateSlug = () => {
        slug = title
            .toLowerCase()
            .replace(/[^\u0E00-\u0E7Fa-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    // Handle banner preview
    const handleBannerChange = (event: Event) => {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                bannerPreview = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle gallery preview
    const handleGalleryChange = (event: Event) => {
        const input = event.target as HTMLInputElement;
        const files = input.files;
        if (files) {
            galleryPreviews = [];
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    galleryPreviews = [...galleryPreviews, e.target?.result as string];
                };
                reader.readAsDataURL(file);
            });
        }
    };

    // Toggle audience selection
    const toggleAudience = (value: string) => {
        if (targetAudience.includes(value)) {
            targetAudience = targetAudience.filter(a => a !== value);
        } else {
            targetAudience = [...targetAudience, value];
        }
    };

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
</script>

<svelte:head>
    <title>สร้างค่าย | K-CAMP</title>
</svelte:head>

<Header />

<div class="min-h-screen bg-gradient-to-b from-background via-accent/5 to-background">
    <!-- Hero Section -->
    <section class="relative pt-32 pb-16">
        <GridPattern
            width={60}
            height={60}
            class="absolute inset-0 opacity-30"
            fillColor="rgb(255 147 51 / 0.1)"
        />
        
        <div class="container mx-auto px-4 relative z-10">
            <div class="max-w-4xl mx-auto text-center space-y-4">
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                    <Sparkles class="size-4 text-primary" />
                    <span class="text-sm font-medium text-primary">สร้างค่ายใหม่</span>
                </div>
                <h1 class="text-4xl md:text-5xl font-bold">
                    <span class="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        สร้างค่ายของคุณ
                    </span>
                </h1>
                <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
                    กรอกข้อมูลค่ายของคุณให้ครบถ้วน เพื่อให้ผู้สมัครเข้าใจและสนใจเข้าร่วมค่ายของคุณ
                </p>
            </div>
        </div>
    </section>

    <!-- Form Section -->
    <section class="pb-16">
        <div class="container mx-auto px-4">
            <div class="max-w-5xl mx-auto">
                {#if form?.error}
                    <Card.Root class="mb-6 border-destructive">
                        <Card.Content class="pt-6">
                            <div class="flex items-center gap-3 text-destructive">
                                <AlertCircle class="size-5" />
                                <p class="font-semibold">{form.error}</p>
                            </div>
                        </Card.Content>
                    </Card.Root>
                {/if}

                <form method="POST" enctype="multipart/form-data" class="space-y-6" use:enhance={() => {
                    isSubmitting = true;
                    return async ({ update }) => {
                        await update();
                        isSubmitting = false;
                    };
                }}>
                    <Tabs.Root value="basic" class="w-full">
                        <Tabs.List class="grid w-full grid-cols-4 lg:grid-cols-6">
                            <Tabs.Trigger value="basic" class="text-xs sm:text-sm">ข้อมูลพื้นฐาน</Tabs.Trigger>
                            <Tabs.Trigger value="dates" class="text-xs sm:text-sm">วันที่</Tabs.Trigger>
                            <Tabs.Trigger value="location" class="text-xs sm:text-sm">สถานที่</Tabs.Trigger>
                            <Tabs.Trigger value="images" class="text-xs sm:text-sm">รูปภาพ</Tabs.Trigger>
                            <Tabs.Trigger value="details" class="text-xs sm:text-sm">รายละเอียด</Tabs.Trigger>
                            <Tabs.Trigger value="contact" class="text-xs sm:text-sm">ติดต่อ</Tabs.Trigger>
                        </Tabs.List>

                        <!-- Basic Information Tab -->
                        <Tabs.Content value="basic" class="mt-6 space-y-6">
                            <Card.Root>
                                <Card.Header>
                                    <Card.Title class="flex items-center gap-2">
                                        <Info class="size-5" />
                                        ข้อมูลพื้นฐาน
                                    </Card.Title>
                                    <Card.Description>
                                        ข้อมูลสำคัญเกี่ยวกับค่ายของคุณ
                                    </Card.Description>
                                </Card.Header>
                                <Card.Content class="space-y-6">
                                    <!-- Title -->
                                    <div class="space-y-2">
                                        <Label for="title">ชื่อค่าย <span class="text-destructive">*</span></Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            type="text"
                                            required
                                            placeholder="เช่น ค่ายเขียนโปรแกรมสำหรับมัธยมปลาย"
                                            bind:value={title}
                                            oninput={generateSlug}
                                        />
                                    </div>

                                    <!-- Slug -->
                                    <div class="space-y-2">
                                        <Label for="slug">URL Slug <span class="text-muted-foreground text-xs">(สร้างอัตโนมัติ)</span></Label>
                                        <div class="flex gap-2 items-center">
                                            <Badge variant="outline" class="shrink-0">k-camp.com/camp/</Badge>
                                            <Input
                                                id="slug"
                                                name="slug"
                                                type="text"
                                                bind:value={slug}
                                                placeholder="camp-slug"
                                            />
                                        </div>
                                    </div>

                                    <!-- Short Description -->
                                    <div class="space-y-2">
                                        <Label for="short_description">คำอธิบายสั้น <span class="text-destructive">*</span></Label>
                                        <Textarea
                                            id="short_description"
                                            name="short_description"
                                            required
                                            rows={3}
                                            maxlength={300}
                                            placeholder="อธิบายค่ายของคุณในไม่เกิน 300 ตัวอักษร"
                                            bind:value={shortDescription}
                                        />
                                        <p class="text-xs text-muted-foreground text-right">
                                            {shortDescription.length}/300 ตัวอักษร
                                        </p>
                                    </div>

                                    <!-- Description -->
                                    <div class="space-y-2">
                                        <Label for="description">คำอธิบายเต็ม <span class="text-destructive">*</span></Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            required
                                            rows={8}
                                            placeholder="บอกรายละเอียดเกี่ยวกับค่าย วัตถุประสงค์ กิจกรรม และสิ่งที่น่าสนใจ..."
                                            bind:value={description}
                                        />
                                    </div>

                                    <Separator />

                                    <!-- Category & Faculty -->
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div class="space-y-2">
                                            <Label for="category">ประเภทค่าย <span class="text-destructive">*</span></Label>
                                            <select
                                                id="category"
                                                name="category"
                                                required
                                                bind:value={category}
                                                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                            >
                                                <option value="" disabled selected>เลือกประเภทค่าย</option>
                                                {#each categories as cat}
                                                    <option value={cat.value}>{cat.label}</option>
                                                {/each}
                                            </select>
                                        </div>

                                        <div class="space-y-2">
                                            <Label for="faculty">คณะ <span class="text-destructive">*</span></Label>
                                            <select
                                                id="faculty"
                                                name="faculty"
                                                required
                                                bind:value={selectedFaculty}
                                                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                            >
                                                <option value="" disabled selected>เลือกคณะ</option>
                                                {#each data.faculties as faculty}
                                                    <option value={faculty.id}>{faculty.name_th}</option>
                                                {/each}
                                            </select>
                                        </div>
                                    </div>

                                    <!-- Department -->
                                    <div class="space-y-2">
                                        <Label for="department">ภาควิชา/หน่วยงาน</Label>
                                        <Input
                                            id="department"
                                            name="department"
                                            type="text"
                                            placeholder="เช่น ภาควิชาวิศวกรรมคอมพิวเตอร์"
                                            bind:value={department}
                                        />
                                    </div>

                                    <!-- Target Audience -->
                                    <div class="space-y-3">
                                        <Label>กลุ่มเป้าหมาย <span class="text-destructive">*</span></Label>
                                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {#each audiences as audience}
                                                <label class="flex items-center space-x-2 cursor-pointer">
                                                    <Checkbox
                                                        name="target_audience"
                                                        value={audience.value}
                                                        checked={targetAudience.includes(audience.value)}
                                                        onCheckedChange={() => toggleAudience(audience.value)}
                                                    />
                                                    <span class="text-sm">{audience.label}</span>
                                                </label>
                                            {/each}
                                        </div>
                                    </div>
                                </Card.Content>
                            </Card.Root>
                        </Tabs.Content>

                        <!-- Dates Tab -->
                        <Tabs.Content value="dates" class="mt-6 space-y-6">
                            <Card.Root>
                                <Card.Header>
                                    <Card.Title class="flex items-center gap-2">
                                        <Calendar class="size-5" />
                                        วันที่และเวลา
                                    </Card.Title>
                                    <Card.Description>
                                        กำหนดวันที่จัดค่ายและช่วงเวลารับสมัคร
                                    </Card.Description>
                                </Card.Header>
                                <Card.Content class="space-y-6">
                                    <!-- Camp Dates -->
                                    <div class="space-y-4">
                                        <h4 class="font-semibold flex items-center gap-2">
                                            <Calendar class="size-4" />
                                            วันที่จัดค่าย
                                        </h4>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div class="space-y-2">
                                                <Label for="start_date">วันเริ่มต้น <span class="text-destructive">*</span></Label>
                                                <Input
                                                    id="start_date"
                                                    name="start_date"
                                                    type="date"
                                                    required
                                                    min={today}
                                                    bind:value={startDate}
                                                />
                                            </div>
                                            <div class="space-y-2">
                                                <Label for="end_date">วันสิ้นสุด <span class="text-destructive">*</span></Label>
                                                <Input
                                                    id="end_date"
                                                    name="end_date"
                                                    type="date"
                                                    required
                                                    min={startDate || today}
                                                    bind:value={endDate}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <!-- Registration Dates -->
                                    <div class="space-y-4">
                                        <h4 class="font-semibold flex items-center gap-2">
                                            <Clock class="size-4" />
                                            ช่วงเวลารับสมัคร
                                        </h4>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div class="space-y-2">
                                                <Label for="registration_start">เปิดรับสมัคร <span class="text-destructive">*</span></Label>
                                                <Input
                                                    id="registration_start"
                                                    name="registration_start"
                                                    type="date"
                                                    required
                                                    min={today}
                                                    bind:value={registrationStart}
                                                />
                                            </div>
                                            <div class="space-y-2">
                                                <Label for="registration_end">ปิดรับสมัคร <span class="text-destructive">*</span></Label>
                                                <Input
                                                    id="registration_end"
                                                    name="registration_end"
                                                    type="date"
                                                    required
                                                    min={registrationStart || today}
                                                    max={startDate}
                                                    bind:value={registrationEnd}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <!-- Participants -->
                                    <div class="space-y-4">
                                        <h4 class="font-semibold flex items-center gap-2">
                                            <Users class="size-4" />
                                            จำนวนผู้เข้าร่วม
                                        </h4>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div class="space-y-2">
                                                <Label for="min_participants">จำนวนขั้นต่ำ</Label>
                                                <Input
                                                    id="min_participants"
                                                    name="min_participants"
                                                    type="number"
                                                    min="0"
                                                    placeholder="0"
                                                    bind:value={minParticipants}
                                                />
                                            </div>
                                            <div class="space-y-2">
                                                <Label for="max_participants">จำนวนสูงสุด <span class="text-destructive">*</span></Label>
                                                <Input
                                                    id="max_participants"
                                                    name="max_participants"
                                                    type="number"
                                                    required
                                                    min="1"
                                                    placeholder="50"
                                                    bind:value={maxParticipants}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <!-- Registration Fee -->
                                    <div class="space-y-2">
                                        <Label for="registration_fee" class="flex items-center gap-2">
                                            <DollarSign class="size-4" />
                                            ค่าสมัคร (บาท)
                                        </Label>
                                        <Input
                                            id="registration_fee"
                                            name="registration_fee"
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            bind:value={registrationFee}
                                        />
                                        <p class="text-xs text-muted-foreground">
                                            ใส่ 0 หากไม่มีค่าใช้จ่าย
                                        </p>
                                    </div>
                                </Card.Content>
                            </Card.Root>
                        </Tabs.Content>

                        <!-- Location Tab -->
                        <Tabs.Content value="location" class="mt-6 space-y-6">
                            <Card.Root>
                                <Card.Header>
                                    <Card.Title class="flex items-center gap-2">
                                        <MapPin class="size-5" />
                                        สถานที่จัดงาน
                                    </Card.Title>
                                    <Card.Description>
                                        ระบุสถานที่จัดค่ายให้ชัดเจน
                                    </Card.Description>
                                </Card.Header>
                                <Card.Content class="space-y-6">
                                    <div class="space-y-2">
                                        <Label for="location">สถานที่ <span class="text-destructive">*</span></Label>
                                        <Input
                                            id="location"
                                            name="location"
                                            type="text"
                                            required
                                            placeholder="เช่น คณะเทคโนโลยีสารสนเทศ สจล."
                                            bind:value={location}
                                        />
                                    </div>

                                    <div class="space-y-2">
                                        <Label for="location_detail">รายละเอียดสถานที่</Label>
                                        <Textarea
                                            id="location_detail"
                                            name="location_detail"
                                            rows={4}
                                            placeholder="ข้อมูลเพิ่มเติมเกี่ยวกับสถานที่ เช่น วิธีการเดินทาง ที่จอดรถ ..."
                                            bind:value={locationDetail}
                                        />
                                    </div>
                                </Card.Content>
                            </Card.Root>
                        </Tabs.Content>

                        <!-- Images Tab -->
                        <Tabs.Content value="images" class="mt-6 space-y-6">
                            <Card.Root>
                                <Card.Header>
                                    <Card.Title class="flex items-center gap-2">
                                        <ImageIcon class="size-5" />
                                        รูปภาพ
                                    </Card.Title>
                                    <Card.Description>
                                        อัปโหลดรูปภาพที่น่าสนใจเพื่อดึงดูดผู้สมัคร
                                    </Card.Description>
                                </Card.Header>
                                <Card.Content class="space-y-6">
                                    <!-- Banner -->
                                    <div class="space-y-2">
                                        <Label for="banner">รูปหน้าปก (Banner)</Label>
                                        <Input
                                            id="banner"
                                            name="banner"
                                            type="file"
                                            accept="image/*"
                                            onchange={handleBannerChange}
                                        />
                                        <p class="text-xs text-muted-foreground">
                                            แนะนำขนาด 1200x630 px, ไฟล์ไม่เกิน 5MB
                                        </p>
                                        {#if bannerPreview}
                                            <div class="mt-4 aspect-video rounded-lg overflow-hidden border">
                                                <img src={bannerPreview} alt="Preview" class="w-full h-full object-cover" />
                                            </div>
                                        {/if}
                                    </div>

                                    <Separator />

                                    <!-- Gallery -->
                                    <div class="space-y-2">
                                        <Label for="gallery">แกลเลอรี่ (ได้สูงสุด 10 รูป)</Label>
                                        <Input
                                            id="gallery"
                                            name="gallery"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onchange={handleGalleryChange}
                                        />
                                        <p class="text-xs text-muted-foreground">
                                            รูปเพิ่มเติมสำหรับแสดงในหน้าค่าย
                                        </p>
                                        {#if galleryPreviews.length > 0}
                                            <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {#each galleryPreviews as preview}
                                                    <div class="aspect-square rounded-lg overflow-hidden border">
                                                        <img src={preview} alt="Gallery preview" class="w-full h-full object-cover" />
                                                    </div>
                                                {/each}
                                            </div>
                                        {/if}
                                    </div>
                                </Card.Content>
                            </Card.Root>
                        </Tabs.Content>

                        <!-- Details Tab -->
                        <Tabs.Content value="details" class="mt-6 space-y-6">
                            <Card.Root>
                                <Card.Header>
                                    <Card.Title>รายละเอียดเพิ่มเติม</Card.Title>
                                    <Card.Description>
                                        ข้อมูลที่จะช่วยให้ผู้สมัครตัดสินใจได้ดีขึ้น
                                    </Card.Description>
                                </Card.Header>
                                <Card.Content class="space-y-6">
                                    <!-- Requirements -->
                                    <div class="space-y-2">
                                        <Label for="requirements">คุณสมบัติผู้สมัคร</Label>
                                        <Textarea
                                            id="requirements"
                                            name="requirements"
                                            rows={6}
                                            placeholder="ระบุคุณสมบัติที่ต้องการ เช่น อายุ ระดับการศึกษา ทักษะพื้นฐาน ..."
                                            bind:value={requirements}
                                        />
                                    </div>

                                    <!-- Benefits -->
                                    <div class="space-y-2">
                                        <Label for="benefits">สิ่งที่ผู้เข้าร่วมจะได้รับ</Label>
                                        <Textarea
                                            id="benefits"
                                            name="benefits"
                                            rows={6}
                                            placeholder="ระบุสิ่งที่ผู้เข้าร่วมจะได้รับ เช่น ความรู้ ใบประกาศนียบัตร ของที่ระลึก ..."
                                            bind:value={benefits}
                                        />
                                    </div>

                                    <!-- Tags -->
                                    <div class="space-y-2">
                                        <Label for="tags">Tags (คำค้นหา)</Label>
                                        <Input
                                            id="tags"
                                            name="tags"
                                            type="text"
                                            placeholder="คั่นด้วยเครื่องหมายจุลภาค เช่น programming, python, coding"
                                            bind:value={tags}
                                        />
                                        <p class="text-xs text-muted-foreground">
                                            ช่วยให้ผู้ใช้ค้นหาค่ายของคุณได้ง่ายขึ้น
                                        </p>
                                    </div>

                                    <!-- Visibility -->
                                    <div class="space-y-2">
                                        <Label for="visibility">การมองเห็น</Label>
                                        <select
                                            id="visibility"
                                            name="visibility"
                                            bind:value={visibility}
                                            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                        >
                                            <option value="public">สาธารณะ - ทุกคนเห็น</option>
                                            <option value="unlisted">Unlisted - เฉพาะลิงก์</option>
                                            <option value="private">ส่วนตัว - เชิญเท่านั้น</option>
                                        </select>
                                    </div>
                                </Card.Content>
                            </Card.Root>
                        </Tabs.Content>

                        <!-- Contact Tab -->
                        <Tabs.Content value="contact" class="mt-6 space-y-6">
                            <Card.Root>
                                <Card.Header>
                                    <Card.Title class="flex items-center gap-2">
                                        <Mail class="size-5" />
                                        ข้อมูลการติดต่อ
                                    </Card.Title>
                                    <Card.Description>
                                        ช่องทางสำหรับผู้สมัครติดต่อสอบถาม
                                    </Card.Description>
                                </Card.Header>
                                <Card.Content class="space-y-6">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div class="space-y-2">
                                            <Label for="contact_email">อีเมล <span class="text-destructive">*</span></Label>
                                            <Input
                                                id="contact_email"
                                                name="contact_email"
                                                type="email"
                                                required
                                                placeholder="camp@example.com"
                                                bind:value={contactEmail}
                                            />
                                        </div>

                                        <div class="space-y-2">
                                            <Label for="contact_phone">เบอร์โทรศัพท์</Label>
                                            <Input
                                                id="contact_phone"
                                                name="contact_phone"
                                                type="tel"
                                                placeholder="0812345678"
                                                bind:value={contactPhone}
                                            />
                                        </div>
                                    </div>

                                    <div class="space-y-2">
                                        <Label for="contact_line">LINE ID</Label>
                                        <Input
                                            id="contact_line"
                                            name="contact_line"
                                            type="text"
                                            placeholder="@campline"
                                            bind:value={contactLine}
                                        />
                                    </div>

                                    <Separator />

                                    <div class="space-y-2">
                                        <Label for="website">เว็บไซต์</Label>
                                        <Input
                                            id="website"
                                            name="website"
                                            type="url"
                                            placeholder="https://example.com"
                                            bind:value={website}
                                        />
                                    </div>

                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div class="space-y-2">
                                            <Label for="facebook">Facebook</Label>
                                            <Input
                                                id="facebook"
                                                name="facebook"
                                                type="url"
                                                placeholder="https://facebook.com/..."
                                                bind:value={facebook}
                                            />
                                        </div>

                                        <div class="space-y-2">
                                            <Label for="instagram">Instagram</Label>
                                            <Input
                                                id="instagram"
                                                name="instagram"
                                                type="text"
                                                placeholder="username"
                                                bind:value={instagram}
                                            />
                                        </div>
                                    </div>
                                </Card.Content>
                            </Card.Root>
                        </Tabs.Content>
                    </Tabs.Root>

                    <!-- Action Buttons -->
                    <Card.Root>
                        <Card.Content class="pt-6">
                            <div class="flex flex-col sm:flex-row gap-4 justify-end">
                                <Button
                                    type="submit"
                                    formaction="?/createDraft"
                                    variant="outline"
                                    size="lg"
                                    disabled={isSubmitting}
                                    class="sm:order-1"
                                >
                                    <Save class="size-5 mr-2" />
                                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกแบบร่าง'}
                                </Button>
                                <Button
                                    type="submit"
                                    formaction="?/publish"
                                    size="lg"
                                    disabled={isSubmitting}
                                    class="sm:order-2"
                                >
                                    <Send class="size-5 mr-2" />
                                    {isSubmitting ? 'กำลังเผยแพร่...' : 'เผยแพร่ค่าย'}
                                </Button>
                            </div>
                            <p class="text-sm text-muted-foreground text-center mt-4">
                                บันทึกแบบร่างเพื่อแก้ไขภายหลัง หรือเผยแพร่เพื่อให้ผู้ใช้งานเห็นได้ทันที
                            </p>
                        </Card.Content>
                    </Card.Root>
                </form>
            </div>
        </div>
    </section>
</div>

