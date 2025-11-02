<script lang="ts">
    import type { PageData } from './$types';
    import { Button } from '$lib/components/ui/button';
    import * as Card from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';
    import { Separator } from '$lib/components/ui/separator';
    import GridPattern from '$lib/components/GridPattern.svelte';
    import Header from '$lib/components/Header.svelte';
    import { 
        Calendar,
        MapPin,
        Users,
        Clock,
        Mail,
        Phone,
        Globe,
        Facebook,
        Instagram,
        School,
        CheckCircle,
        XCircle,
        AlertCircle,
        Eye,
        User,
        DollarSign,
        FileText,
        Sparkles,
        MessageCircle,
        Settings
    } from '@lucide/svelte';

    type Props = {
        data: PageData;
    };

    let { data }: Props = $props();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getDaysUntil = (dateString: string) => {
        const targetDate = new Date(dateString);
        const now = new Date();
        const diffTime = targetDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            academic: 'ค่ายวิชาการ',
            skills: 'ค่ายพัฒนาทักษะ',
            competition: 'ค่ายแข่งขัน',
            volunteer: 'ค่ายจิตอาสา',
            cultural: 'ค่ายวัฒนธรรม',
            sports: 'ค่ายกีฬา',
            technology: 'ค่ายเทคโนโลยี',
            leadership: 'ค่ายผู้นำ',
            other: 'อื่นๆ'
        };
        return labels[category] || category;
    };

    const getTargetAudienceLabel = (audience: string) => {
        const labels: Record<string, string> = {
            high_school: 'นักเรียนมัธยมปลาย',
            undergraduate: 'นิสิตปริญญาตรี',
            all_students: 'นักเรียน/นิสิตทั่วไป'
        };
        return labels[audience] || audience;
    };

    type StatusConfig = {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        iconComponent: typeof Clock | typeof CheckCircle | typeof XCircle | typeof Users;
    };

    const getRegistrationStatusConfig = (status: string): StatusConfig => {
        const configs: Record<string, StatusConfig> = {
            upcoming: { 
                label: 'เปิดรับสมัครเร็วๆ นี้', 
                variant: 'secondary', 
                iconComponent: Clock 
            },
            open: { 
                label: 'เปิดรับสมัครแล้ว', 
                variant: 'default', 
                iconComponent: CheckCircle 
            },
            closed: { 
                label: 'ปิดรับสมัครแล้ว', 
                variant: 'destructive', 
                iconComponent: XCircle 
            },
            full: { 
                label: 'รับสมัครเต็มแล้ว', 
                variant: 'destructive', 
                iconComponent: Users 
            },
            ended: { 
                label: 'จบไปแล้ว', 
                variant: 'outline', 
                iconComponent: XCircle 
            }
        };
        return configs[status] || configs.closed;
    };

    const spotsRemaining = $derived(
        data.camp.max_participants - data.camp.current_participants
    );

    const progressPercentage = $derived(
        (data.camp.current_participants / data.camp.max_participants) * 100
    );

    const statusConfig = $derived(getRegistrationStatusConfig(data.registrationStatus));

    // Gallery state
    let selectedImageIndex = $state<number | null>(null);

    const openGallery = (index: number) => {
        selectedImageIndex = index;
    };

    const closeGallery = () => {
        selectedImageIndex = null;
    };
</script>

<svelte:head>
    <title>{data.camp.title} | K-CAMP</title>
    <meta name="description" content={data.camp.short_description} />
</svelte:head>

<Header />

<div class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative min-h-[70vh] flex items-end">
        <!-- Background -->
        <div class="absolute inset-0 z-0">
            {#if data.campBanner}
                <img 
                    src={data.campBanner} 
                    alt={data.camp.title}
                    class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-background"></div>
            {:else}
                <div class="w-full h-full bg-gradient-to-br from-primary via-accent to-primary/80"></div>
                <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background"></div>
            {/if}
            <GridPattern 
                width={50} 
                height={50} 
                strokeDashArray="4 2" 
                class="absolute inset-0 opacity-20" 
            />
        </div>

        <!-- Hero Content -->
        <div class="relative z-10 w-full pb-16 pt-32">
            <div class="container mx-auto px-4">
                <div class="max-w-5xl mx-auto space-y-8">
                    <!-- Status Badge -->
                    <div class="flex flex-wrap gap-3">
                        <Badge 
                            variant={statusConfig.variant}
                            class="gap-2 text-base px-4 py-2 font-semibold"
                        >
                            {#if statusConfig.iconComponent === Clock}
                                <Clock class="size-5" />
                            {:else if statusConfig.iconComponent === CheckCircle}
                                <CheckCircle class="size-5" />
                            {:else if statusConfig.iconComponent === Users}
                                <Users class="size-5" />
                            {:else}
                                <XCircle class="size-5" />
                            {/if}
                            {statusConfig.label}
                        </Badge>
                        
                        {#if data.camp.featured}
                            <Badge 
                                variant="secondary"
                                class="gap-2 text-base px-4 py-2 bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                            >
                                <Sparkles class="size-5" />
                                แนะนำโดย K-CAMP
                            </Badge>
                        {/if}

                        <Badge 
                            variant="secondary"
                            class="gap-2 text-base px-4 py-2 bg-white/10 backdrop-blur-sm border-white/20 text-white"
                        >
                            {getCategoryLabel(data.camp.category)}
                        </Badge>
                    </div>

                    <!-- Title & Description -->
                    <div class="space-y-4 text-white">
                        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                            {data.camp.title}
                        </h1>
                        <p class="text-xl md:text-2xl text-white/90 max-w-3xl leading-relaxed">
                            {data.camp.short_description}
                        </p>
                    </div>

                    <!-- Key Info -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card.Root class="bg-white/10 backdrop-blur-sm border-white/20">
                            <Card.Content class="pt-6">
                                <div class="flex items-center gap-3 text-white">
                                    <Calendar class="size-6 shrink-0" />
                                    <div>
                                        <p class="text-sm text-white/70">วันที่จัดงาน</p>
                                        <p class="font-semibold text-sm">
                                            {formatDate(data.camp.start_date)}
                                        </p>
                                        {#if data.camp.start_date !== data.camp.end_date}
                                            <p class="text-xs text-white/70">
                                                ถึง {formatDate(data.camp.end_date)}
                                            </p>
                                        {/if}
                                    </div>
                                </div>
                            </Card.Content>
                        </Card.Root>

                        <Card.Root class="bg-white/10 backdrop-blur-sm border-white/20">
                            <Card.Content class="pt-6">
                                <div class="flex items-center gap-3 text-white">
                                    <MapPin class="size-6 shrink-0" />
                                    <div>
                                        <p class="text-sm text-white/70">สถานที่</p>
                                        <p class="font-semibold text-sm line-clamp-2">
                                            {data.camp.location}
                                        </p>
                                    </div>
                                </div>
                            </Card.Content>
                        </Card.Root>

                        <Card.Root class="bg-white/10 backdrop-blur-sm border-white/20">
                            <Card.Content class="pt-6">
                                <div class="flex items-center gap-3 text-white">
                                    <Users class="size-6 shrink-0" />
                                    <div>
                                        <p class="text-sm text-white/70">จำนวนที่เปิดรับ</p>
                                        <p class="font-semibold text-sm">
                                            {data.camp.current_participants}/{data.camp.max_participants} คน
                                        </p>
                                        {#if spotsRemaining > 0 && data.registrationStatus === 'open'}
                                            <p class="text-xs text-white/70">
                                                เหลืออีก {spotsRemaining} ที่
                                            </p>
                                        {/if}
                                    </div>
                                </div>
                            </Card.Content>
                        </Card.Root>

                        <Card.Root class="bg-white/10 backdrop-blur-sm border-white/20">
                            <Card.Content class="pt-6">
                                <div class="flex items-center gap-3 text-white">
                                    <Clock class="size-6 shrink-0" />
                                    <div>
                                        <p class="text-sm text-white/70">ปิดรับสมัคร</p>
                                        <p class="font-semibold text-sm">
                                            {formatDate(data.camp.registration_end)}
                                        </p>
                                        {#if getDaysUntil(data.camp.registration_end) > 0}
                                            <p class="text-xs text-white/70">
                                                อีก {getDaysUntil(data.camp.registration_end)} วัน
                                            </p>
                                        {/if}
                                    </div>
                                </div>
                            </Card.Content>
                        </Card.Root>
                    </div>

                    <!-- CTA Buttons -->
                    <div class="flex flex-wrap gap-4">
                        {#if data.isOrganizer}
                            <Button 
                                size="lg" 
                                class="text-lg px-8 py-6 shadow-xl hover:scale-105 transition-transform bg-gradient-to-r from-primary to-accent"
                                href="/camp/{data.camp.slug}/dashboard"
                            >
                                <Settings class="size-5 mr-2" />
                                เข้าสู่ Dashboard
                            </Button>
                        {/if}

                        {#if data.registrationStatus === 'open' && !data.hasRegistered}
                            <Button 
                                size="lg" 
                                class="text-lg px-8 py-6 shadow-xl hover:scale-105 transition-transform"
                                href="#register"
                            >
                                <CheckCircle class="size-5 mr-2" />
                                สมัครเข้าร่วมเลย
                            </Button>
                        {:else if data.hasRegistered}
                            <Button 
                                size="lg" 
                                variant="secondary"
                                class="text-lg px-8 py-6"
                                disabled
                            >
                                <CheckCircle class="size-5 mr-2" />
                                คุณได้สมัครแล้ว
                            </Button>
                        {:else if data.registrationStatus === 'upcoming'}
                            <Button 
                                size="lg" 
                                variant="secondary"
                                class="text-lg px-8 py-6"
                                disabled
                            >
                                <Clock class="size-5 mr-2" />
                                เปิดรับสมัคร {formatDate(data.camp.registration_start)}
                            </Button>
                        {:else}
                            <Button 
                                size="lg" 
                                variant="outline"
                                class="text-lg px-8 py-6 bg-white/10 text-white border-white/30"
                                disabled
                            >
                                <XCircle class="size-5 mr-2" />
                                {statusConfig.label}
                            </Button>
                        {/if}

                        <Button 
                            size="lg" 
                            variant="outline"
                            class="text-lg px-8 py-6 bg-white/10 text-white border-white/30 hover:bg-white/20"
                            href="#details"
                        >
                            <FileText class="size-5 mr-2" />
                            ดูรายละเอียด
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Main Content -->
    <section class="py-16">
        <div class="container mx-auto px-4">
            <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Left Column - Main Content -->
                <div class="lg:col-span-2 space-y-8" id="details">
                    <!-- About -->
                    <Card.Root>
                        <Card.Header>
                            <Card.Title class="text-2xl">เกี่ยวกับค่าย</Card.Title>
                        </Card.Header>
                        <Card.Content>
                            <div class="prose prose-lg max-w-none">
                                {@html data.camp.description}
                            </div>
                        </Card.Content>
                    </Card.Root>

                    <!-- Gallery -->
                    {#if data.camp.gallery && data.camp.gallery.length > 0}
                        <Card.Root>
                            <Card.Header>
                                <Card.Title class="text-2xl">รูปภาพค่าย</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {#each data.camp.gallery as image, index}
                                        <button
                                            type="button"
                                            class="aspect-square overflow-hidden rounded-lg group"
                                            onclick={() => openGallery(index)}
                                        >
                                            <img 
                                                src={image} 
                                                alt="รูปภาพค่าย {index + 1}"
                                                class="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                        </button>
                                    {/each}
                                </div>
                            </Card.Content>
                        </Card.Root>
                    {/if}

                    <!-- Requirements -->
                    {#if data.camp.requirements}
                        <Card.Root>
                            <Card.Header>
                                <Card.Title class="text-2xl">คุณสมบัติผู้สมัคร</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                <div class="prose max-w-none">
                                    {@html data.camp.requirements}
                                </div>
                            </Card.Content>
                        </Card.Root>
                    {/if}

                    <!-- Benefits -->
                    {#if data.camp.benefits}
                        <Card.Root>
                            <Card.Header>
                                <Card.Title class="text-2xl">สิ่งที่จะได้รับ</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                <div class="prose max-w-none">
                                    {@html data.camp.benefits}
                                </div>
                            </Card.Content>
                        </Card.Root>
                    {/if}

                    <!-- Schedule -->
                    {#if data.camp.schedule && typeof data.camp.schedule === 'object'}
                        <Card.Root>
                            <Card.Header>
                                <Card.Title class="text-2xl">กำหนดการ</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                <div class="space-y-4">
                                    {#each Object.entries(data.camp.schedule) as [day, activities]}
                                        <div>
                                            <h4 class="font-semibold text-lg mb-2">{day}</h4>
                                            <div class="space-y-2 ml-4">
                                                {#if Array.isArray(activities)}
                                                    {#each activities as activity}
                                                        {#if activity && typeof activity === 'object' && 'time' in activity && 'activity' in activity}
                                                            <div class="flex gap-3">
                                                                <Clock class="size-5 text-muted-foreground shrink-0 mt-0.5" />
                                                                <div>
                                                                    <p class="font-medium">{activity.time}</p>
                                                                    <p class="text-muted-foreground">{activity.activity}</p>
                                                                </div>
                                                            </div>
                                                        {/if}
                                                    {/each}
                                                {/if}
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </Card.Content>
                        </Card.Root>
                    {/if}
                </div>

                <!-- Right Column - Sidebar -->
                <div class="space-y-6">
                    <!-- Registration Progress -->
                    {#if data.registrationStatus === 'open' || data.registrationStatus === 'full'}
                        <Card.Root>
                            <Card.Header>
                                <Card.Title class="text-lg">สถานะการรับสมัคร</Card.Title>
                            </Card.Header>
                            <Card.Content class="space-y-4">
                                <div>
                                    <div class="flex justify-between text-sm mb-2">
                                        <span>ลงทะเบียนแล้ว</span>
                                        <span class="font-semibold">
                                            {data.camp.current_participants}/{data.camp.max_participants}
                                        </span>
                                    </div>
                                    <div class="w-full bg-muted rounded-full h-3 overflow-hidden">
                                        <div 
                                            class="h-full bg-primary transition-all rounded-full"
                                            style="width: {progressPercentage}%"
                                        ></div>
                                    </div>
                                </div>
                                
                                {#if spotsRemaining > 0 && data.registrationStatus === 'open'}
                                    <div class="flex items-center gap-2 text-sm">
                                        <AlertCircle class="size-4 text-orange-500" />
                                        <span class="text-muted-foreground">
                                            เหลืออีก <strong class="text-foreground">{spotsRemaining}</strong> ที่นั่ง
                                        </span>
                                    </div>
                                {/if}
                            </Card.Content>
                        </Card.Root>
                    {/if}

                    <!-- Organizer Info -->
                    <Card.Root>
                        <Card.Header>
                            <Card.Title class="text-lg">ผู้จัดงาน</Card.Title>
                        </Card.Header>
                        <Card.Content class="space-y-4">
                            <div class="flex items-center gap-3">
                                <div class="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    {#if data.organizer.avatar}
                                        <img 
                                            src={data.organizer.avatar} 
                                            alt={data.organizer.name}
                                            class="size-12 rounded-full object-cover"
                                        />
                                    {:else}
                                        <User class="size-6 text-primary" />
                                    {/if}
                                </div>
                                <div>
                                    <p class="font-semibold">{data.organizer.name}</p>
                                    <p class="text-sm text-muted-foreground">@{data.organizer.username}</p>
                                </div>
                            </div>

                            <Separator />

                            <div class="space-y-2">
                                <div class="flex items-center gap-2 text-sm">
                                    <School class="size-4 text-muted-foreground" />
                                    <span>{data.faculty.name_th}</span>
                                </div>
                                
                                {#if data.camp.department}
                                    <div class="flex items-center gap-2 text-sm">
                                        <School class="size-4 text-muted-foreground" />
                                        <span>{data.camp.department}</span>
                                    </div>
                                {/if}
                            </div>
                        </Card.Content>
                    </Card.Root>

                    <!-- Contact Info -->
                    <Card.Root>
                        <Card.Header>
                            <Card.Title class="text-lg">ติดต่อสอบถาม</Card.Title>
                        </Card.Header>
                        <Card.Content class="space-y-3">
                            <a 
                                href="mailto:{data.camp.contact_email}"
                                class="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                            >
                                <Mail class="size-4 shrink-0" />
                                <span class="break-all">{data.camp.contact_email}</span>
                            </a>

                            {#if data.camp.contact_phone}
                                <a 
                                    href="tel:{data.camp.contact_phone}"
                                    class="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                                >
                                    <Phone class="size-4 shrink-0" />
                                    <span>{data.camp.contact_phone}</span>
                                </a>
                            {/if}

                            {#if data.camp.contact_line}
                                <div class="flex items-center gap-3 text-sm">
                                    <MessageCircle class="size-4 shrink-0" />
                                    <span>LINE: {data.camp.contact_line}</span>
                                </div>
                            {/if}

                            <Separator />

                            <div class="flex gap-3">
                                {#if data.camp.website}
                                    <a 
                                        href={data.camp.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Globe class="size-5" />
                                    </a>
                                {/if}

                                {#if data.camp.facebook}
                                    <a 
                                        href={data.camp.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Facebook class="size-5" />
                                    </a>
                                {/if}

                                {#if data.camp.instagram}
                                    <a 
                                        href="https://instagram.com/{data.camp.instagram}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Instagram class="size-5" />
                                    </a>
                                {/if}
                            </div>
                        </Card.Content>
                    </Card.Root>

                    <!-- Additional Info -->
                    <Card.Root>
                        <Card.Header>
                            <Card.Title class="text-lg">ข้อมูลเพิ่มเติม</Card.Title>
                        </Card.Header>
                        <Card.Content class="space-y-3 text-sm">
                            {#if data.camp.registration_fee > 0}
                                <div class="flex items-center gap-2">
                                    <DollarSign class="size-4 text-muted-foreground" />
                                    <span>ค่าสมัคร: <strong>{data.camp.registration_fee.toLocaleString()} บาท</strong></span>
                                </div>
                            {:else}
                                <div class="flex items-center gap-2">
                                    <CheckCircle class="size-4 text-green-500" />
                                    <span class="text-green-600 font-semibold">ไม่มีค่าใช้จ่าย</span>
                                </div>
                            {/if}

                            <Separator />

                            <div class="space-y-2">
                                <div class="flex justify-between">
                                    <span class="text-muted-foreground">เปิดรับสมัคร</span>
                                    <span>{formatDate(data.camp.registration_start)}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-muted-foreground">ปิดรับสมัคร</span>
                                    <span>{formatDate(data.camp.registration_end)}</span>
                                </div>
                            </div>

                            <Separator />

                            {#if data.camp.target_audience}
                                <div>
                                    <p class="text-muted-foreground mb-2">กลุ่มเป้าหมาย</p>
                                    <div class="flex flex-wrap gap-2">
                                        {#each data.camp.target_audience as audience}
                                            <Badge variant="outline" class="text-xs">
                                                {getTargetAudienceLabel(audience)}
                                            </Badge>
                                        {/each}
                                    </div>
                                </div>
                            {/if}

                            {#if data.camp.tags && data.camp.tags.length > 0}
                                <div>
                                    <p class="text-muted-foreground mb-2">Tags</p>
                                    <div class="flex flex-wrap gap-2">
                                        {#each data.camp.tags as tag}
                                            <Badge variant="secondary" class="text-xs">
                                                {tag}
                                            </Badge>
                                        {/each}
                                    </div>
                                </div>
                            {/if}

                            <Separator />

                            <div class="flex items-center gap-2 text-xs text-muted-foreground">
                                <Eye class="size-3" />
                                <span>เข้าชม {data.camp.views.toLocaleString()} ครั้ง</span>
                            </div>
                        </Card.Content>
                    </Card.Root>
                </div>
            </div>
        </div>
    </section>

    <!-- Registration CTA Section -->
    {#if data.registrationStatus === 'open' && !data.hasRegistered}
        <section class="py-16 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10" id="register">
            <div class="container mx-auto px-4">
                <div class="max-w-3xl mx-auto text-center space-y-6">
                    <h2 class="text-3xl md:text-4xl font-bold">พร้อมที่จะเข้าร่วมแล้วใช่ไหม?</h2>
                    <p class="text-lg text-muted-foreground">
                        อย่าพลาดโอกาสดีๆ แบบนี้! สมัครเข้าร่วมก่อนที่ที่นั่งจะเต็ม
                    </p>
                    
                    {#if spotsRemaining > 0 && spotsRemaining <= 10}
                        <div class="flex items-center justify-center gap-2 text-orange-600">
                            <AlertCircle class="size-5" />
                            <p class="font-semibold">
                                เหลือเพียง {spotsRemaining} ที่นั่งเท่านั้น!
                            </p>
                        </div>
                    {/if}

                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button 
                            size="lg"
                            class="text-lg px-8 py-6"
                            href="/register/{data.camp.slug}"
                        >
                            <CheckCircle class="size-5 mr-2" />
                            สมัครเข้าร่วมตอนนี้
                        </Button>
                        
                        {#if data.camp.contact_line}
                            <Button 
                                size="lg"
                                variant="outline"
                                class="text-lg px-8 py-6"
                                href="https://line.me/ti/p/{data.camp.contact_line}"
                                target="_blank"
                            >
                                <MessageCircle class="size-5 mr-2" />
                                ติดต่อสอบถามทาง LINE
                            </Button>
                        {/if}
                    </div>

                    <p class="text-sm text-muted-foreground">
                        ปิดรับสมัครในอีก {getDaysUntil(data.camp.registration_end)} วัน
                    </p>
                </div>
            </div>
        </section>
    {/if}
</div>


