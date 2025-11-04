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
    import { Badge } from '$lib/components/ui/badge';
    import { Separator } from '$lib/components/ui/separator';
    import { Checkbox } from '$lib/components/ui/checkbox';
    import {
        CheckCircle,
        AlertCircle,
        Calendar,
        MapPin,
        Users,
        FileText,
        Send,
        ArrowLeft,
        Info
    } from '@lucide/svelte';

    type FieldConfig = {
        id: string;
        type: string;
        label: string;
        placeholder?: string;
        required?: boolean;
        options?: Array<{ value: string; label: string }>;
        validation?: {
            minLength?: number;
            maxLength?: number;
            min?: number;
            max?: number;
            pattern?: string;
        };
        accept?: string;
        maxSize?: number;
    };

    type Props = {
        data: PageData;
        form?: ActionData;
    };

    let { data, form }: Props = $props();

    // Form state
    let formValues = $state<Record<string, any>>({});
    let isSubmitting = $state(false);
    let filePreviews = $state<Record<string, string>>({});

    // Default form fields if no custom form
    const defaultFields: FieldConfig[] = [
        { id: 'full_name', type: 'text', label: 'ชื่อ-นามสกุล', required: true, placeholder: 'กรอกชื่อ-นามสกุล' },
        { id: 'email', type: 'email', label: 'อีเมล', required: true, placeholder: 'email@example.com' },
        { id: 'phone', type: 'tel', label: 'เบอร์โทรศัพท์', required: true, placeholder: '0812345678', validation: { pattern: '^[0-9]{10}$' } },
        { id: 'school', type: 'text', label: 'โรงเรียน/มหาวิทยาลัย', required: true },
        { id: 'grade', type: 'text', label: 'ระดับชั้น/ปี', required: true },
        { id: 'motivation', type: 'textarea', label: 'เหตุผลที่สมัคร', required: true, validation: { minLength: 50 } }
    ];

    const fields = $derived(
        data.registrationForm?.fields?.fields || defaultFields
    );

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);
    };

    // Handle file preview
    const handleFileChange = (event: Event, fieldId: string) => {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
            // Check if it's an image
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    filePreviews[fieldId] = e.target?.result as string;
                };
                reader.readAsDataURL(file);
            } else {
                filePreviews[fieldId] = file.name;
            }
        }
    };

    // Handle checkbox change
    const handleCheckboxChange = (fieldId: string, value: string, checked: boolean) => {
        if (!formValues[fieldId]) {
            formValues[fieldId] = [];
        }
        if (checked) {
            formValues[fieldId] = [...formValues[fieldId], value];
        } else {
            formValues[fieldId] = formValues[fieldId].filter((v: string) => v !== value);
        }
    };

    // Get file size in MB
    const formatFileSize = (bytes: number) => {
        return (bytes / (1024 * 1024)).toFixed(2);
    };
</script>

<svelte:head>
    <title>ลงทะเบียน - {data.camp.title} | K-CAMP</title>
</svelte:head>

<Header />

<div class="min-h-screen bg-gradient-to-b from-background via-accent/5 to-background">
    <!-- Hero Section -->
    <section class="relative pt-32 pb-12">
        <GridPattern
            width={60}
            height={60}
            class="absolute inset-0 opacity-30"
            fillColor="rgb(255 147 51 / 0.1)"
        />
        
        <div class="container mx-auto px-4 relative z-10">
            <div class="max-w-4xl mx-auto space-y-6">
                <!-- Back Button -->
                <Button
                    href="/camp/{data.camp.slug}"
                    variant="ghost"
                    class="gap-2"
                >
                    <ArrowLeft class="size-4" />
                    กลับไปหน้าค่าย
                </Button>

                <!-- Camp Info Card -->
                <Card.Root class="overflow-hidden">
                    <div class="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-6 border-b">
                        <div class="space-y-4">
                            <div class="flex items-center gap-2">
                                <Badge variant="default" class="gap-1">
                                    <CheckCircle class="size-3" />
                                    เปิดรับสมัคร
                                </Badge>
                                {#if data.camp.expand?.faculty}
                                    <Badge variant="secondary">
                                        {data.camp.expand.faculty.name_th}
                                    </Badge>
                                {/if}
                            </div>
                            
                            <h1 class="text-3xl md:text-4xl font-bold">
                                {data.camp.title}
                            </h1>
                            
                            <p class="text-muted-foreground text-lg">
                                {data.camp.short_description}
                            </p>

                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                <div class="flex items-center gap-2">
                                    <Calendar class="size-4 text-muted-foreground" />
                                    <span>{formatDate(data.camp.start_date)}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <MapPin class="size-4 text-muted-foreground" />
                                    <span>{data.camp.location}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <Users class="size-4 text-muted-foreground" />
                                    <span>เหลือ {data.camp.max_participants - data.camp.current_participants} ที่นั่ง</span>
                                </div>
                            </div>

                            {#if data.camp.registration_fee > 0}
                                <div class="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                                    <Info class="size-5 text-yellow-600" />
                                    <span class="text-sm">
                                        ค่าสมัคร: <strong>{data.camp.registration_fee.toLocaleString()} บาท</strong>
                                        <span class="text-muted-foreground ml-2">(ชำระหลังจากผ่านการคัดเลือก)</span>
                                    </span>
                                </div>
                            {:else}
                                <div class="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                    <CheckCircle class="size-5 text-green-600" />
                                    <span class="text-sm font-semibold text-green-600">ไม่มีค่าใช้จ่าย</span>
                                </div>
                            {/if}
                        </div>
                    </div>
                </Card.Root>
            </div>
        </div>
    </section>

    <!-- Form Section -->
    <section class="pb-16">
        <div class="container mx-auto px-4">
            <div class="max-w-4xl mx-auto space-y-6">
                {#if form?.error}
                    <Card.Root class="border-destructive">
                        <Card.Content class="pt-6">
                            <div class="flex items-center gap-3 text-destructive">
                                <AlertCircle class="size-5" />
                                <p class="font-semibold">{form.error}</p>
                            </div>
                        </Card.Content>
                    </Card.Root>
                {/if}

                <!-- Instructions -->
                <Card.Root>
                    <Card.Header>
                        <Card.Title class="flex items-center gap-2">
                            <Info class="size-5" />
                            คำแนะนำในการกรอกแบบฟอร์ม
                        </Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <ul class="space-y-2 text-sm text-muted-foreground">
                            <li class="flex items-start gap-2">
                                <span class="text-primary mt-0.5">•</span>
                                <span>กรอกข้อมูลให้ครบถ้วนและตรงตามความเป็นจริง</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <span class="text-primary mt-0.5">•</span>
                                <span>ฟิลด์ที่มีเครื่องหมาย <span class="text-destructive">*</span> จำเป็นต้องกรอก</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <span class="text-primary mt-0.5">•</span>
                                <span>ตรวจสอบข้อมูลก่อนกดส่ง ไม่สามารถแก้ไขหลังจากส่งแล้ว</span>
                            </li>
                            {#if !data.user}
                                <li class="flex items-start gap-2">
                                    <span class="text-primary mt-0.5">•</span>
                                    <span>หากคุณมีบัญชีผู้ใช้ <a href="/auth" class="text-primary hover:underline">เข้าสู่ระบบ</a> เพื่อติดตามสถานะการสมัคร</span>
                                </li>
                            {/if}
                        </ul>
                    </Card.Content>
                </Card.Root>

                <!-- Registration Form -->
                <form method="POST" action="?/register" enctype="multipart/form-data" class="space-y-6" use:enhance={() => {
                    isSubmitting = true;
                    return async ({ update }) => {
                        await update();
                        isSubmitting = false;
                    };
                }}>
                    <Card.Root>
                        <Card.Header>
                            <Card.Title class="flex items-center gap-2">
                                <FileText class="size-5" />
                                แบบฟอร์มลงทะเบียน
                            </Card.Title>
                            <Card.Description>
                                กรุณากรอกข้อมูลให้ครบถ้วน
                            </Card.Description>
                        </Card.Header>
                        <Card.Content class="space-y-6">
                            {#each fields as field (field.id)}
                                <div class="space-y-2">
                                    <!-- Text Input -->
                                    {#if field.type === 'text' || field.type === 'email' || field.type === 'tel'}
                                        <Label for={field.id}>
                                            {field.label}
                                            {#if field.required}
                                                <span class="text-destructive">*</span>
                                            {/if}
                                        </Label>
                                        <Input
                                            id={field.id}
                                            name={field.id}
                                            type={field.type}
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            pattern={field.validation?.pattern}
                                            minlength={field.validation?.minLength}
                                            maxlength={field.validation?.maxLength}
                                            bind:value={formValues[field.id]}
                                        />
                                    {/if}

                                    <!-- Number Input -->
                                    {#if field.type === 'number'}
                                        <Label for={field.id}>
                                            {field.label}
                                            {#if field.required}
                                                <span class="text-destructive">*</span>
                                            {/if}
                                        </Label>
                                        <Input
                                            id={field.id}
                                            name={field.id}
                                            type="number"
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            min={field.validation?.min}
                                            max={field.validation?.max}
                                            bind:value={formValues[field.id]}
                                        />
                                    {/if}

                                    <!-- Date Input -->
                                    {#if field.type === 'date'}
                                        <Label for={field.id}>
                                            {field.label}
                                            {#if field.required}
                                                <span class="text-destructive">*</span>
                                            {/if}
                                        </Label>
                                        <Input
                                            id={field.id}
                                            name={field.id}
                                            type="date"
                                            required={field.required}
                                            bind:value={formValues[field.id]}
                                        />
                                    {/if}

                                    <!-- Textarea -->
                                    {#if field.type === 'textarea'}
                                        <Label for={field.id}>
                                            {field.label}
                                            {#if field.required}
                                                <span class="text-destructive">*</span>
                                            {/if}
                                        </Label>
                                        <Textarea
                                            id={field.id}
                                            name={field.id}
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            minlength={field.validation?.minLength}
                                            maxlength={field.validation?.maxLength}
                                            rows={4}
                                            bind:value={formValues[field.id]}
                                        />
                                        {#if field.validation?.minLength}
                                            <p class="text-xs text-muted-foreground">
                                                ขั้นต่ำ {field.validation.minLength} ตัวอักษร
                                                {#if formValues[field.id]}
                                                    ({formValues[field.id].length}/{field.validation.maxLength || '∞'})
                                                {/if}
                                            </p>
                                        {/if}
                                    {/if}

                                    <!-- Select Dropdown -->
                                    {#if field.type === 'select'}
                                        <Label for={field.id}>
                                            {field.label}
                                            {#if field.required}
                                                <span class="text-destructive">*</span>
                                            {/if}
                                        </Label>
                                        <select
                                            id={field.id}
                                            name={field.id}
                                            required={field.required}
                                            bind:value={formValues[field.id]}
                                            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                        >
                                            <option value="" disabled selected>เลือก {field.label}</option>
                                            {#each field.options || [] as option}
                                                <option value={option.value}>{option.label}</option>
                                            {/each}
                                        </select>
                                    {/if}

                                    <!-- Radio Buttons -->
                                    {#if field.type === 'radio'}
                                        <Label>
                                            {field.label}
                                            {#if field.required}
                                                <span class="text-destructive">*</span>
                                            {/if}
                                        </Label>
                                        <div class="space-y-2">
                                            {#each field.options || [] as option}
                                                <label class="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={field.id}
                                                        value={option.value}
                                                        required={field.required}
                                                        bind:group={formValues[field.id]}
                                                        class="size-4 border border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                    />
                                                    <span class="text-sm">{option.label}</span>
                                                </label>
                                            {/each}
                                        </div>
                                    {/if}

                                    <!-- Checkboxes -->
                                    {#if field.type === 'checkbox'}
                                        <Label>
                                            {field.label}
                                            {#if field.required}
                                                <span class="text-destructive">*</span>
                                            {/if}
                                        </Label>
                                        <div class="space-y-2">
                                            {#each field.options || [] as option}
                                                <label class="flex items-center space-x-2 cursor-pointer">
                                                    <Checkbox
                                                        name={field.id}
                                                        value={option.value}
                                                        onCheckedChange={(checked) => handleCheckboxChange(field.id, option.value, checked)}
                                                    />
                                                    <span class="text-sm">{option.label}</span>
                                                </label>
                                            {/each}
                                        </div>
                                    {/if}

                                    <!-- File Upload -->
                                    {#if field.type === 'file'}
                                        <Label for={field.id}>
                                            {field.label}
                                            {#if field.required}
                                                <span class="text-destructive">*</span>
                                            {/if}
                                        </Label>
                                        <Input
                                            id={field.id}
                                            name="file_{field.id}"
                                            type="file"
                                            required={field.required}
                                            accept={field.accept}
                                            onchange={(e) => handleFileChange(e, field.id)}
                                        />
                                        {#if field.maxSize}
                                            <p class="text-xs text-muted-foreground">
                                                ขนาดไฟล์สูงสุด {formatFileSize(field.maxSize)} MB
                                            </p>
                                        {/if}
                                        {#if filePreviews[field.id]}
                                            <div class="mt-2 p-3 bg-muted rounded-lg">
                                                {#if filePreviews[field.id].startsWith('data:image')}
                                                    <img src={filePreviews[field.id]} alt="Preview" class="max-h-40 rounded" />
                                                {:else}
                                                    <p class="text-sm text-muted-foreground flex items-center gap-2">
                                                        <FileText class="size-4" />
                                                        {filePreviews[field.id]}
                                                    </p>
                                                {/if}
                                            </div>
                                        {/if}
                                    {/if}
                                </div>

                                {#if field !== fields[fields.length - 1]}
                                    <Separator />
                                {/if}
                            {/each}
                        </Card.Content>
                    </Card.Root>

                    <!-- Terms & Submit -->
                    <Card.Root>
                        <Card.Content class="pt-6 space-y-6">
                            <div class="flex items-start space-x-2">
                                <Checkbox id="terms" name="terms" required />
                                <label for="terms" class="text-sm leading-relaxed cursor-pointer">
                                    ข้าพเจ้ายืนยันว่าข้อมูลที่กรอกทั้งหมดเป็นความจริง และยินยอมให้ผู้จัดงานใช้ข้อมูลเพื่อการจัดกิจกรรมค่าย
                                    <span class="text-destructive">*</span>
                                </label>
                            </div>

                            <Separator />

                            <div class="flex flex-col sm:flex-row gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    class="flex-1"
                                    href="/camp/{data.camp.slug}"
                                >
                                    <ArrowLeft class="size-5 mr-2" />
                                    ยกเลิก
                                </Button>
                                <Button
                                    type="submit"
                                    size="lg"
                                    class="flex-1"
                                    disabled={isSubmitting}
                                >
                                    {#if isSubmitting}
                                        กำลังส่งข้อมูล...
                                    {:else}
                                        <Send class="size-5 mr-2" />
                                        ส่งใบสมัคร
                                    {/if}
                                </Button>
                            </div>

                            <p class="text-xs text-muted-foreground text-center">
                                หลังจากส่งใบสมัครแล้ว คุณจะได้รับอีเมลยืนยัน และสามารถติดตามสถานะได้ที่หน้าโปรไฟล์
                            </p>
                        </Card.Content>
                    </Card.Root>
                </form>
            </div>
        </div>
    </section>
</div>

