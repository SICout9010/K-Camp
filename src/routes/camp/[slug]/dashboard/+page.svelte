<script lang="ts">
    import type { PageData, ActionData } from './$types';
    import { enhance } from '$app/forms';
    import { Button } from '$lib/components/ui/button';
    import * as Card from '$lib/components/ui/card';
    import * as Tabs from '$lib/components/ui/tabs';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Badge } from '$lib/components/ui/badge';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Textarea } from '$lib/components/ui/textarea';
    import { Separator } from '$lib/components/ui/separator';
    import { Checkbox } from '$lib/components/ui/checkbox';
    import { 
        LayoutDashboard,
        Users,
        Clock,
        CheckCircle,
        XCircle,
        AlertCircle,
        Download,
        Edit,
        Trash2,
        Eye,
        Calendar,
        MapPin,
        Mail,
        Phone,
        DollarSign,
        UserCheck,
        UserX,
        ListX,
        Filter,
        Search,
        ArrowLeft,
        Settings,
        BarChart3,
        FileText,
        TrendingUp,
        UserPlus,
        Loader2
    } from '@lucide/svelte';

    type Props = {
        data: PageData;
        form?: ActionData;
    };

    let { data, form }: Props = $props();

    // State
    let activeTab = $state('overview');
    let searchQuery = $state('');
    let statusFilter = $state('all');
    let paymentFilter = $state('all');
    let deleteConfirmOpen = $state(false);
    let editCampOpen = $state(false);
    let selectedRegistration = $state<any>(null);
    let statusDialogOpen = $state(false);
    let isSubmitting = $state(false);

    // Format date
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
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    // Status labels
    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'รอการตรวจสอบ',
            reviewing: 'กำลังตรวจสอบ',
            accepted: 'ผ่านการคัดเลือก',
            waitlist: 'รายชื่อสำรอง',
            rejected: 'ไม่ผ่านการคัดเลือก',
            cancelled: 'ยกเลิกการสมัคร'
        };
        return labels[status] || status;
    };

    const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'secondary',
            reviewing: 'default',
            accepted: 'default',
            waitlist: 'outline',
            rejected: 'destructive',
            cancelled: 'outline'
        };
        return variants[status] || 'secondary';
    };

    const getPaymentStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            unpaid: 'ยังไม่ชำระ',
            pending: 'รอตรวจสอบ',
            paid: 'ชำระแล้ว',
            refunded: 'คืนเงินแล้ว'
        };
        return labels[status] || status;
    };

    // Filter registrations
    const filteredRegistrations = $derived.by(() => {
        let filtered = data.registrations;

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(r => r.status === statusFilter);
        }

        // Filter by payment
        if (paymentFilter !== 'all') {
            filtered = filtered.filter(r => r.payment_status === paymentFilter);
        }

        // Search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(r => {
                const formData = r.form_data || {};
                const name = formData.field_1 || r.expand?.user?.name || '';
                const email = formData.field_2 || r.expand?.user?.email || '';
                return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
            });
        }

        return filtered;
    });

    // Open status update dialog
    const openStatusDialog = (registration: any) => {
        selectedRegistration = registration;
        statusDialogOpen = true;
    };

    // Export CSV
    const exportCSV = async () => {
        const formData = new FormData();
        const response = await fetch(`?/exportRegistrations`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.csv) {
                const blob = new Blob([result.data.csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = result.data.filename || 'registrations.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        }
    };

    // Calculate days until event
    const getDaysUntil = (dateString: string) => {
        const targetDate = new Date(dateString);
        const now = new Date();
        const diffTime = targetDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };
</script>

<svelte:head>
    <title>Dashboard - {data.camp.title} | K-CAMP</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-background via-accent/5 to-background">
    <!-- Header -->
    <header class="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <Button href="/camp/{data.camp.slug}" variant="ghost" size="icon">
                        <ArrowLeft class="size-5" />
                    </Button>
                    <div>
                        <h1 class="text-2xl font-bold flex items-center gap-2">
                            <LayoutDashboard class="size-6 text-primary" />
                            Dashboard
                        </h1>
                        <p class="text-sm text-muted-foreground">{data.camp.title}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <Button href="/camp/{data.camp.slug}" variant="outline" size="sm">
                        <Eye class="size-4 mr-2" />
                        ดูหน้าค่าย
                    </Button>
                    <Button href="/camp/{data.camp.slug}/register" variant="outline" size="sm">
                        <FileText class="size-4 mr-2" />
                        ฟอร์มสมัคร
                    </Button>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
        <Tabs.Root value={activeTab} onValueChange={(v) => activeTab = v || 'overview'}>
            <Tabs.List class="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
                <Tabs.Trigger value="overview" class="gap-2">
                    <BarChart3 class="size-4" />
                    <span class="hidden sm:inline">ภาพรวม</span>
                </Tabs.Trigger>
                <Tabs.Trigger value="registrations" class="gap-2">
                    <Users class="size-4" />
                    <span class="hidden sm:inline">รายชื่อผู้สมัคร</span>
                </Tabs.Trigger>
                <Tabs.Trigger value="settings" class="gap-2">
                    <Settings class="size-4" />
                    <span class="hidden sm:inline">ตั้งค่าค่าย</span>
                </Tabs.Trigger>
                <Tabs.Trigger value="analytics" class="gap-2">
                    <TrendingUp class="size-4" />
                    <span class="hidden sm:inline">Analytics</span>
                </Tabs.Trigger>
            </Tabs.List>

            <!-- Overview Tab -->
            <Tabs.Content value="overview" class="space-y-6">
                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card.Root>
                        <Card.Content class="pt-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-muted-foreground">ผู้สมัครทั้งหมด</p>
                                    <p class="text-3xl font-bold text-primary">{data.stats.total}</p>
                                </div>
                            </div>
                        </Card.Content>
                    </Card.Root>

                    <Card.Root>
                        <Card.Content class="pt-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-muted-foreground">รอการตรวจสอบ</p>
                                    <p class="text-3xl font-bold text-orange-500">{data.stats.pending}</p>
                                </div>
                            </div>
                        </Card.Content>
                    </Card.Root>

                    <Card.Root>
                        <Card.Content class="pt-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-muted-foreground">ผ่านการคัดเลือก</p>
                                    <p class="text-3xl font-bold text-green-500">{data.stats.accepted}</p>
                                </div>
                            </div>
                        </Card.Content>
                    </Card.Root>

                    <Card.Root>
                        <Card.Content class="pt-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-muted-foreground">ที่นั่งเหลือ</p>
                                    <p class="text-3xl font-bold text-blue-500">
                                        {data.camp.max_participants - data.camp.current_participants}
                                    </p>
                                </div>
                            </div>
                        </Card.Content>
                    </Card.Root>
                </div>

                <!-- Camp Info & Quick Stats -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Camp Information -->
                    <Card.Root>
                        <Card.Header>
                            <Card.Title class="flex items-center gap-2">
                                <Calendar class="size-5" />
                                ข้อมูลค่าย
                            </Card.Title>
                        </Card.Header>
                        <Card.Content class="space-y-4">
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p class="text-muted-foreground mb-1">วันที่จัดงาน</p>
                                    <p class="font-semibold">{formatDate(data.camp.start_date)}</p>
                                    {#if data.camp.start_date !== data.camp.end_date}
                                        <p class="text-xs text-muted-foreground">ถึง {formatDate(data.camp.end_date)}</p>
                                    {/if}
                                    {#if getDaysUntil(data.camp.start_date) > 0}
                                        <Badge variant="outline" class="mt-1 text-xs">
                                            อีก {getDaysUntil(data.camp.start_date)} วัน
                                        </Badge>
                                    {/if}
                                </div>
                                <div>
                                    <p class="text-muted-foreground mb-1">ปิดรับสมัคร</p>
                                    <p class="font-semibold">{formatDate(data.camp.registration_end)}</p>
                                    {#if getDaysUntil(data.camp.registration_end) > 0}
                                        <Badge variant="outline" class="mt-1 text-xs">
                                            อีก {getDaysUntil(data.camp.registration_end)} วัน
                                        </Badge>
                                    {:else}
                                        <Badge variant="destructive" class="mt-1 text-xs">
                                            ปิดแล้ว
                                        </Badge>
                                    {/if}
                                </div>
                            </div>

                            <Separator />

                            <div class="space-y-2 text-sm">
                                <div class="flex items-start gap-2">
                                    <MapPin class="size-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <p class="font-medium">{data.camp.location}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <Users class="size-4 text-muted-foreground" />
                                    <span>{data.camp.current_participants} / {data.camp.max_participants} คน</span>
                                </div>
                                {#if data.camp.registration_fee > 0}
                                    <div class="flex items-center gap-2">
                                        <DollarSign class="size-4 text-muted-foreground" />
                                        <span>ค่าสมัคร {data.camp.registration_fee.toLocaleString()} บาท</span>
                                    </div>
                                {/if}
                            </div>

                            <Separator />

                            <div class="flex items-center justify-between">
                                <span class="text-sm text-muted-foreground">สถานะค่าย</span>
                                <Badge 
                                    variant={data.camp.status === 'published' ? 'default' : 'secondary'}
                                >
                                    {data.camp.status}
                                </Badge>
                            </div>
                        </Card.Content>
                    </Card.Root>

                    <!-- Registration Stats -->
                    <Card.Root>
                        <Card.Header>
                            <Card.Title class="flex items-center gap-2">
                                <Users class="size-5" />
                                สถิติการสมัคร
                            </Card.Title>
                        </Card.Header>
                        <Card.Content class="space-y-4">
                            <div class="space-y-3">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <Clock class="size-4 text-orange-500" />
                                        <span class="text-sm">รอการตรวจสอบ</span>
                                    </div>
                                    <span class="font-bold text-orange-500">{data.stats.pending}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <Eye class="size-4 text-blue-500" />
                                        <span class="text-sm">กำลังตรวจสอบ</span>
                                    </div>
                                    <span class="font-bold text-blue-500">{data.stats.reviewing}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <UserCheck class="size-4 text-green-500" />
                                        <span class="text-sm">ผ่านการคัดเลือก</span>
                                    </div>
                                    <span class="font-bold text-green-500">{data.stats.accepted}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <ListX class="size-4 text-purple-500" />
                                        <span class="text-sm">รายชื่อสำรอง</span>
                                    </div>
                                    <span class="font-bold text-purple-500">{data.stats.waitlist}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <UserX class="size-4 text-red-500" />
                                        <span class="text-sm">ไม่ผ่านการคัดเลือก</span>
                                    </div>
                                    <span class="font-bold text-red-500">{data.stats.rejected}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <XCircle class="size-4 text-gray-500" />
                                        <span class="text-sm">ยกเลิกการสมัคร</span>
                                    </div>
                                    <span class="font-bold text-gray-500">{data.stats.cancelled}</span>
                                </div>
                            </div>

                            {#if data.camp.registration_fee > 0}
                                <Separator />
                                <div>
                                    <p class="text-sm font-semibold mb-3">สถิติการชำระเงิน</p>
                                    <div class="space-y-2 text-sm">
                                        <div class="flex justify-between">
                                            <span class="text-muted-foreground">ยังไม่ชำระ</span>
                                            <span class="font-semibold">{data.paymentStats.unpaid}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-muted-foreground">รอตรวจสอบ</span>
                                            <span class="font-semibold text-orange-500">{data.paymentStats.pending}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-muted-foreground">ชำระแล้ว</span>
                                            <span class="font-semibold text-green-500">{data.paymentStats.paid}</span>
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        </Card.Content>
                    </Card.Root>
                </div>

                <!-- Recent Registrations -->
                <Card.Root>
                    <Card.Header>
                        <div class="flex items-center justify-between">
                            <Card.Title>การสมัครล่าสุด</Card.Title>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onclick={() => activeTab = 'registrations'}
                            >
                                ดูทั้งหมด
                            </Button>
                        </div>
                    </Card.Header>
                    <Card.Content>
                        <div class="space-y-3">
                            {#each data.registrations.slice(0, 5) as registration}
                                {@const formData = registration.form_data || {}}
                                {@const name = formData.field_1 || registration.expand?.user?.name || 'ไม่ระบุชื่อ'}
                                {@const email = formData.field_2 || registration.expand?.user?.email || ''}
                                
                                <div class="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                                    <div class="flex-1">
                                        <p class="font-semibold">{name}</p>
                                        <p class="text-sm text-muted-foreground">{email}</p>
                                        <p class="text-xs text-muted-foreground mt-1">
                                            {formatDateTime(registration.created)}
                                        </p>
                                    </div>
                                    <Badge variant={getStatusVariant(registration.status)}>
                                        {getStatusLabel(registration.status)}
                                    </Badge>
                                </div>
                            {:else}
                                <div class="text-center py-8 text-muted-foreground">
                                    <Users class="size-12 mx-auto mb-2 opacity-20" />
                                    <p>ยังไม่มีผู้สมัคร</p>
                                </div>
                            {/each}
                        </div>
                    </Card.Content>
                </Card.Root>
            </Tabs.Content>

            <!-- Registrations Tab -->
            <Tabs.Content value="registrations" class="space-y-6">
                <Card.Root>
                    <Card.Header>
                        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <Card.Title class="flex items-center gap-2">
                                <Users class="size-5" />
                                รายชื่อผู้สมัคร ({filteredRegistrations.length})
                            </Card.Title>
                            <Button size="sm" onclick={exportCSV}>
                                <Download class="size-4 mr-2" />
                                Export CSV
                            </Button>
                        </div>
                    </Card.Header>
                    <Card.Content class="space-y-4">
                        <!-- Filters -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="relative">
                                <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="ค้นหาชื่อหรืออีเมล..."
                                    class="pl-10"
                                    bind:value={searchQuery}
                                />
                            </div>
                            
                            <select 
                                bind:value={statusFilter}
                                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="all">สถานะทั้งหมด</option>
                                <option value="pending">รอการตรวจสอบ</option>
                                <option value="reviewing">กำลังตรวจสอบ</option>
                                <option value="accepted">ผ่านการคัดเลือก</option>
                                <option value="waitlist">รายชื่อสำรอง</option>
                                <option value="rejected">ไม่ผ่านการคัดเลือก</option>
                                <option value="cancelled">ยกเลิกการสมัคร</option>
                            </select>

                            {#if data.camp.registration_fee > 0}
                                <select 
                                    bind:value={paymentFilter}
                                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="all">การชำระเงินทั้งหมด</option>
                                    <option value="unpaid">ยังไม่ชำระ</option>
                                    <option value="pending">รอตรวจสอบ</option>
                                    <option value="paid">ชำระแล้ว</option>
                                    <option value="refunded">คืนเงินแล้ว</option>
                                </select>
                            {/if}
                        </div>

                        <!-- Registrations Table -->
                        <div class="border rounded-lg overflow-hidden">
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead class="bg-muted/50">
                                        <tr class="border-b">
                                            <th class="text-left p-3 text-sm font-semibold">ชื่อ-นามสกุล</th>
                                            <th class="text-left p-3 text-sm font-semibold hidden md:table-cell">อีเมล</th>
                                            <th class="text-left p-3 text-sm font-semibold">สถานะ</th>
                                            {#if data.camp.registration_fee > 0}
                                                <th class="text-left p-3 text-sm font-semibold hidden lg:table-cell">ชำระเงิน</th>
                                            {/if}
                                            <th class="text-left p-3 text-sm font-semibold hidden sm:table-cell">วันที่สมัคร</th>
                                            <th class="text-right p-3 text-sm font-semibold">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {#each filteredRegistrations as registration}
                                            {@const formData = registration.form_data || {}}
                                            {@const name = formData.field_1 || registration.expand?.user?.name || 'ไม่ระบุชื่อ'}
                                            {@const email = formData.field_2 || registration.expand?.user?.email || ''}
                                            
                                            <tr class="border-b hover:bg-accent/20 transition-colors">
                                                <td class="p-3">
                                                    <div>
                                                        <p class="font-medium">{name}</p>
                                                        <p class="text-xs text-muted-foreground md:hidden">{email}</p>
                                                    </div>
                                                </td>
                                                <td class="p-3 hidden md:table-cell">
                                                    <p class="text-sm text-muted-foreground">{email}</p>
                                                </td>
                                                <td class="p-3">
                                                    <Badge variant={getStatusVariant(registration.status)} class="text-xs">
                                                        {getStatusLabel(registration.status)}
                                                    </Badge>
                                                </td>
                                                {#if data.camp.registration_fee > 0}
                                                    <td class="p-3 hidden lg:table-cell">
                                                        <Badge 
                                                            variant={registration.payment_status === 'paid' ? 'default' : 'outline'}
                                                            class="text-xs"
                                                        >
                                                            {getPaymentStatusLabel(registration.payment_status)}
                                                        </Badge>
                                                    </td>
                                                {/if}
                                                <td class="p-3 text-sm text-muted-foreground hidden sm:table-cell">
                                                    {formatDateTime(registration.created)}
                                                </td>
                                                <td class="p-3 text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onclick={() => openStatusDialog(registration)}
                                                    >
                                                        <Edit class="size-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        {:else}
                                            <tr>
                                                <td colspan="6" class="p-8 text-center text-muted-foreground">
                                                    <Users class="size-12 mx-auto mb-2 opacity-20" />
                                                    <p>ไม่พบข้อมูลที่ค้นหา</p>
                                                </td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Card.Content>
                </Card.Root>
            </Tabs.Content>

            <!-- Settings Tab -->
            <Tabs.Content value="settings" class="space-y-6">
                <Card.Root>
                    <Card.Header>
                        <Card.Title class="flex items-center gap-2">
                            <Settings class="size-5" />
                            ตั้งค่าค่าย
                        </Card.Title>
                        <Card.Description>แก้ไขข้อมูลและตั้งค่าค่ายของคุณ</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <form method="POST" action="?/updateCamp" use:enhance={() => {
                            isSubmitting = true;
                            return async ({ update }) => {
                                await update();
                                isSubmitting = false;
                            };
                        }} class="space-y-6">
                            <!-- Basic Info -->
                            <div class="space-y-4">
                                <h3 class="text-lg font-semibold">ข้อมูลพื้นฐาน</h3>
                                
                                <div class="space-y-2">
                                    <Label for="title">ชื่อค่าย</Label>
                                    <Input 
                                        id="title" 
                                        name="title" 
                                        value={data.camp.title} 
                                        required 
                                    />
                                </div>

                                <div class="space-y-2">
                                    <Label for="short_description">คำอธิบายสั้น</Label>
                                    <Textarea 
                                        id="short_description" 
                                        name="short_description" 
                                        value={data.camp.short_description} 
                                        rows={3}
                                        required 
                                    />
                                </div>

                                <div class="space-y-2">
                                    <Label for="location">สถานที่</Label>
                                    <Input 
                                        id="location" 
                                        name="location" 
                                        value={data.camp.location} 
                                        required 
                                    />
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div class="space-y-2">
                                        <Label for="max_participants">จำนวนผู้เข้าร่วมสูงสุด</Label>
                                        <Input 
                                            id="max_participants" 
                                            name="max_participants" 
                                            type="number" 
                                            value={data.camp.max_participants} 
                                            required 
                                        />
                                    </div>

                                    <div class="space-y-2">
                                        <Label for="registration_fee">ค่าสมัคร (บาท)</Label>
                                        <Input 
                                            id="registration_fee" 
                                            name="registration_fee" 
                                            type="number" 
                                            value={data.camp.registration_fee} 
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <div class="space-y-2">
                                    <Label for="status">สถานะค่าย</Label>
                                    <select 
                                        id="status" 
                                        name="status" 
                                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="draft" selected={data.camp.status === 'draft'}>Draft</option>
                                        <option value="published" selected={data.camp.status === 'published'}>Published</option>
                                        <option value="closed" selected={data.camp.status === 'closed'}>Closed</option>
                                        <option value="cancelled" selected={data.camp.status === 'cancelled'}>Cancelled</option>
                                        <option value="completed" selected={data.camp.status === 'completed'}>Completed</option>
                                    </select>
                                </div>
                            </div>

                            <Separator />

                            <!-- Contact Info -->
                            <div class="space-y-4">
                                <h3 class="text-lg font-semibold">ข้อมูลติดต่อ</h3>
                                
                                <div class="space-y-2">
                                    <Label for="contact_email">อีเมล</Label>
                                    <Input 
                                        id="contact_email" 
                                        name="contact_email" 
                                        type="email" 
                                        value={data.camp.contact_email} 
                                        required 
                                    />
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div class="space-y-2">
                                        <Label for="contact_phone">เบอร์โทรศัพท์</Label>
                                        <Input 
                                            id="contact_phone" 
                                            name="contact_phone" 
                                            type="tel" 
                                            value={data.camp.contact_phone || ''} 
                                        />
                                    </div>

                                    <div class="space-y-2">
                                        <Label for="contact_line">LINE ID</Label>
                                        <Input 
                                            id="contact_line" 
                                            name="contact_line" 
                                            value={data.camp.contact_line || ''} 
                                        />
                                    </div>
                                </div>

                                <div class="space-y-2">
                                    <Label for="website">เว็บไซต์</Label>
                                    <Input 
                                        id="website" 
                                        name="website" 
                                        type="url" 
                                        value={data.camp.website || ''} 
                                    />
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div class="space-y-2">
                                        <Label for="facebook">Facebook</Label>
                                        <Input 
                                            id="facebook" 
                                            name="facebook" 
                                            type="url" 
                                            value={data.camp.facebook || ''} 
                                        />
                                    </div>

                                    <div class="space-y-2">
                                        <Label for="instagram">Instagram</Label>
                                        <Input 
                                            id="instagram" 
                                            name="instagram" 
                                            value={data.camp.instagram || ''} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {#if form?.message}
                                <div class="p-3 rounded-lg {form.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}">
                                    {form.message}
                                </div>
                            {/if}

                            <div class="flex gap-3">
                                <Button type="submit" disabled={isSubmitting}>
                                    {#if isSubmitting}
                                        <Loader2 class="size-4 mr-2 animate-spin" />
                                    {/if}
                                    บันทึกการเปลี่ยนแปลง
                                </Button>
                                <Button type="button" variant="outline" href="/camp/{data.camp.slug}">
                                    ยกเลิก
                                </Button>
                            </div>
                        </form>
                    </Card.Content>
                </Card.Root>

                <!-- Danger Zone -->
                <Card.Root class="border-destructive">
                    <Card.Header>
                        <Card.Title class="text-destructive flex items-center gap-2">
                            <AlertCircle class="size-5" />
                            Danger Zone
                        </Card.Title>
                        <Card.Description>การดำเนินการเหล่านี้ไม่สามารถย้อนกลับได้</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <div class="flex items-center justify-between p-4 border border-destructive/50 rounded-lg">
                            <div>
                                <p class="font-semibold text-destructive">ลบค่ายนี้</p>
                                <p class="text-sm text-muted-foreground">
                                    การลบค่ายจะไม่สามารถกู้คืนได้ และจะลบข้อมูลทั้งหมดที่เกี่ยวข้อง
                                </p>
                            </div>
                            <Button 
                                variant="destructive" 
                                onclick={() => deleteConfirmOpen = true}
                            >
                                <Trash2 class="size-4 mr-2" />
                                ลบค่าย
                            </Button>
                        </div>
                    </Card.Content>
                </Card.Root>
            </Tabs.Content>

            <!-- Analytics Tab -->
            <Tabs.Content value="analytics" class="space-y-6">
                <Card.Root>
                    <Card.Header>
                        <Card.Title class="flex items-center gap-2">
                            <TrendingUp class="size-5" />
                            Analytics
                        </Card.Title>
                        <Card.Description>สถิติและข้อมูลการวิเคราะห์ค่าย</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div class="p-4 border rounded-lg">
                                <p class="text-sm text-muted-foreground mb-1">จำนวนผู้เข้าชม</p>
                                <p class="text-2xl font-bold">{data.camp.views.toLocaleString()}</p>
                            </div>

                            <div class="p-4 border rounded-lg">
                                <p class="text-sm text-muted-foreground mb-1">Conversion Rate</p>
                                <p class="text-2xl font-bold">
                                    {data.camp.views > 0 ? ((data.stats.total / data.camp.views) * 100).toFixed(2) : 0}%
                                </p>
                            </div>

                            <div class="p-4 border rounded-lg">
                                <p class="text-sm text-muted-foreground mb-1">Acceptance Rate</p>
                                <p class="text-2xl font-bold">
                                    {data.stats.total > 0 ? ((data.stats.accepted / data.stats.total) * 100).toFixed(2) : 0}%
                                </p>
                            </div>
                        </div>

                        <div class="mt-8 text-center text-muted-foreground">
                            <BarChart3 class="size-16 mx-auto mb-4 opacity-20" />
                            <p>Analytics จะพร้อมใช้งานในเร็วๆ นี้</p>
                        </div>
                    </Card.Content>
                </Card.Root>
            </Tabs.Content>
        </Tabs.Root>
    </div>
</div>

<!-- Update Status Dialog -->
<Dialog.Root bind:open={statusDialogOpen}>
    <Dialog.Content class="sm:max-w-lg">
        <Dialog.Header>
            <Dialog.Title>อัพเดตสถานะผู้สมัคร</Dialog.Title>
            <Dialog.Description>
                {selectedRegistration?.form_data?.field_1 || selectedRegistration?.expand?.user?.name || 'ผู้สมัคร'}
            </Dialog.Description>
        </Dialog.Header>
        
        {#if selectedRegistration}
            <form method="POST" action="?/updateRegistrationStatus" use:enhance={() => {
                return async ({ update }) => {
                    await update();
                    statusDialogOpen = false;
                };
            }} class="space-y-4">
                <input type="hidden" name="registrationId" value={selectedRegistration.id} />
                
                <div class="space-y-2">
                    <Label for="status-select">สถานะการสมัคร</Label>
                    <select 
                        id="status-select"
                        name="status" 
                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="pending" selected={selectedRegistration.status === 'pending'}>รอการตรวจสอบ</option>
                        <option value="reviewing" selected={selectedRegistration.status === 'reviewing'}>กำลังตรวจสอบ</option>
                        <option value="accepted" selected={selectedRegistration.status === 'accepted'}>ผ่านการคัดเลือก</option>
                        <option value="waitlist" selected={selectedRegistration.status === 'waitlist'}>รายชื่อสำรอง</option>
                        <option value="rejected" selected={selectedRegistration.status === 'rejected'}>ไม่ผ่านการคัดเลือก</option>
                        <option value="cancelled" selected={selectedRegistration.status === 'cancelled'}>ยกเลิกการสมัคร</option>
                    </select>
                </div>

                {#if data.camp.registration_fee > 0}
                    <div class="space-y-2">
                        <Label for="payment-select">สถานะการชำระเงิน</Label>
                        <select 
                            id="payment-select"
                            name="paymentStatus" 
                            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            form="payment-form"
                        >
                            <option value="unpaid" selected={selectedRegistration.payment_status === 'unpaid'}>ยังไม่ชำระ</option>
                            <option value="pending" selected={selectedRegistration.payment_status === 'pending'}>รอตรวจสอบ</option>
                            <option value="paid" selected={selectedRegistration.payment_status === 'paid'}>ชำระแล้ว</option>
                            <option value="refunded" selected={selectedRegistration.payment_status === 'refunded'}>คืนเงินแล้ว</option>
                        </select>
                    </div>
                {/if}

                <div class="space-y-2">
                    <Label for="notes">หมายเหตุ</Label>
                    <Textarea 
                        id="notes"
                        name="notes" 
                        value={selectedRegistration.notes || ''} 
                        rows={3}
                        placeholder="เพิ่มหมายเหตุ..."
                    />
                </div>

                <!-- Show form data -->
                <div class="space-y-2 p-4 bg-muted/30 rounded-lg max-h-60 overflow-y-auto">
                    <p class="text-sm font-semibold">ข้อมูลที่กรอก:</p>
                    {#each Object.entries(selectedRegistration.form_data || {}) as [key, value]}
                        <div class="text-sm">
                            <span class="text-muted-foreground">{key}:</span>
                            <span class="ml-2">{JSON.stringify(value)}</span>
                        </div>
                    {/each}
                </div>

                <Dialog.Footer>
                    <Button type="button" variant="outline" onclick={() => statusDialogOpen = false}>
                        ยกเลิก
                    </Button>
                    <Button type="submit">
                        บันทึก
                    </Button>
                </Dialog.Footer>
            </form>

            <!-- Separate form for payment status -->
            <form id="payment-form" method="POST" action="?/updatePaymentStatus" use:enhance={() => {
                return async ({ update }) => {
                    await update();
                };
            }}>
                <input type="hidden" name="registrationId" value={selectedRegistration.id} />
            </form>
        {/if}
    </Dialog.Content>
</Dialog.Root>

<!-- Delete Confirmation Dialog -->
<Dialog.Root bind:open={deleteConfirmOpen}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title class="text-destructive">ยืนยันการลบค่าย</Dialog.Title>
            <Dialog.Description>
                คุณแน่ใจหรือไม่ว่าต้องการลบค่าย "{data.camp.title}"? 
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </Dialog.Description>
        </Dialog.Header>
        
        <div class="bg-destructive/10 border border-destructive/50 rounded-lg p-4 space-y-2">
            <p class="text-sm font-semibold text-destructive">คำเตือน:</p>
            <ul class="text-sm text-destructive/80 space-y-1 ml-4">
                <li>• ข้อมูลค่ายจะถูกลบถาวร</li>
                <li>• ข้อมูลผู้สมัครทั้งหมดจะถูกลบ</li>
                <li>• ฟอร์มสมัครจะถูกลบ</li>
                <li>• ไม่สามารถกู้คืนข้อมูลได้</li>
            </ul>
        </div>

        <Dialog.Footer>
            <Button variant="outline" onclick={() => deleteConfirmOpen = false}>
                ยกเลิก
            </Button>
            <form method="POST" action="?/deleteCamp" use:enhance>
                <Button type="submit" variant="destructive">
                    <Trash2 class="size-4 mr-2" />
                    ยืนยันการลบ
                </Button>
            </form>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

