<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import * as Card from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';
    import { Input } from '$lib/components/ui/input';
    import { 
        Search, 
        Calendar, 
        MapPin, 
        Users, 
        Sparkles,
        ArrowRight,
        Loader2
    } from '@lucide/svelte';
	import { getFileUrl } from '$lib/utils';
	import type { RecordModel } from 'pocketbase';

    type Camp = {
        id: string;
        title: string;
        slug: string;
        short_description: string;
        banner: string;
        category: string;
        location: string;
        start_date: string;
        end_date: string;
        max_participants: number;
        current_participants: number;
        registration_fee: number;
        featured: boolean;
        status: string;
        expand?: {
            faculty?: { name_th: string; color?: string };
            organizer?: { name: string };
        };
    };

    type SearchResult = {
        score: number;
        record: Camp;
        matched_text: string;
    };

    type Props = {
        initialCamps?: Camp[];
    };

    let { initialCamps = [] }: Props = $props();

    // State
    let searchQuery = $state('');
    let searchResults = $state<Camp[]>(initialCamps);
    let isSearching = $state(false);
    let hasSearched = $state(false);
    let searchDebounceTimer: number;

    const SEARCH_API_URL = 'http://localhost:8000';

    // Category labels
    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            academic: 'วิชาการ',
            skills: 'พัฒนาทักษะ',
            competition: 'แข่งขัน',
            volunteer: 'จิตอาสา',
            cultural: 'วัฒนธรรม',
            sports: 'กีฬา',
            technology: 'เทคโนโลยี',
            leadership: 'ผู้นำ',
            other: 'อื่นๆ'
        };
        return labels[category] || category;
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('th-TH', {
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    // Semantic search function
    const performSearch = async (query: string) => {
        if (!query.trim()) {
            searchResults = initialCamps;
            hasSearched = false;
            return;
        }

        isSearching = true;
        hasSearched = true;

        try {
            const response = await fetch(`${SEARCH_API_URL}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    collection: 'camps'
                })
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            searchResults = data.results.map((result: SearchResult) => result.record && result.score > 0.5 ? result.record : null).filter((result: Camp | null) => result !== null);
        } catch (error) {
            console.error('Search error:', error);
            // Fallback to showing initial camps
            searchResults = initialCamps;
        } finally {
            isSearching = false;
        }
    };

    // Debounced search
    const handleSearchInput = (event: Event) => {
        const target = event.target as HTMLInputElement;
        searchQuery = target.value;

        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = window.setTimeout(() => {
            performSearch(searchQuery);
        }, 1000);
    };

    // Get spots remaining
    const getSpotsRemaining = (camp: Camp) => {
        return camp.max_participants - camp.current_participants;
    };

    // Calculate progress percentage
    const getProgressPercentage = (camp: Camp) => {
        return (camp.current_participants / camp.max_participants) * 100;
    };
</script>

<section class="py-16 bg-gradient-to-b from-background via-accent/5 to-background" id="camps">
    <div class="container mx-auto px-4">
        <div class="max-w-7xl mx-auto space-y-12">
            <!-- Header -->
            <div class="text-center space-y-4">
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                    <Sparkles class="size-4 text-primary" />
                    <span class="text-sm font-medium text-primary">ค้นพบค่ายที่ใช่สำหรับคุณ</span>
                </div>
                <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold">
                    <span class="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        ค่ายที่เปิดรับสมัคร
                    </span>
                </h2>
                <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
                    ค้นหาค่ายที่คุณสนใจด้วย AI Search ที่เข้าใจความต้องการของคุณ
                </p>
            </div>

            <!-- Search Bar -->
            <div class="max-w-2xl mx-auto">
                <div class="relative group">
                    <Search class="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        type="text"
                        placeholder="ค้นหาค่าย เช่น 'ค่ายเขียนโปรแกรม', 'ค่ายผู้นำ', 'ค่ายวิทยาศาสตร์'..."
                        class="pl-12 pr-12 h-14 text-lg bg-card/50 backdrop-blur-sm border-2 focus:border-primary shadow-lg"
                        value={searchQuery}
                        oninput={handleSearchInput}
                    />
                    {#if isSearching}
                        <Loader2 class="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-primary animate-spin" />
                    {/if}
                </div>
                {#if hasSearched && searchQuery}
                    <p class="mt-3 text-sm text-muted-foreground text-center">
                        {#if isSearching}
                            กำลังค้นหา...
                        {:else}
                            พบ {searchResults.length} ค่ายที่ตรงกับ "{searchQuery}"
                        {/if}
                    </p>
                {/if}
            </div>

            <!-- Camp Grid -->
            {#if searchResults.length === 0 && hasSearched}
                <div class="text-center py-16 space-y-4">
                    <div class="size-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                        <Search class="size-10 text-muted-foreground" />
                    </div>
                    <h3 class="text-xl font-semibold">ไม่พบค่ายที่ตรงกับการค้นหา</h3>
                    <p class="text-muted-foreground">ลองใช้คำค้นหาอื่น หรือเรียกดูค่ายทั้งหมด</p>
                    <Button onclick={() => { searchQuery = ''; performSearch(''); }}>
                        ดูค่ายทั้งหมด
                    </Button>
                </div>
            {:else}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {#each searchResults as camp (camp.id)}
                        <Card.Root class="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
                            <!-- Banner Image -->
                            <a href="/camp/{camp.slug}" class="block relative aspect-video overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                                {#if camp.banner}
                                    <img 
                                        src={getFileUrl(camp as unknown as RecordModel, camp.banner)} 
                                        alt={camp.title}
                                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                {:else}
                                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-accent">
                                        <Sparkles class="size-16 text-white/50" />
                                    </div>
                                {/if}
                                
                                <!-- Featured Badge -->
                                {#if camp.featured}
                                    <div class="absolute top-3 right-3">
                                        <Badge class="gap-1 bg-yellow-500/90 text-white border-0">
                                            <Sparkles class="size-3" />
                                            แนะนำ
                                        </Badge>
                                    </div>
                                {/if}

                                <!-- Registration Status Overlay -->
                                <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                    <div class="flex items-center justify-between text-white text-sm">
                                        <span class="font-semibold">
                                            {camp.current_participants}/{camp.max_participants} คน
                                        </span>
                                        {#if getSpotsRemaining(camp) > 0}
                                            <span class="text-green-300">เปิดรับสมัคร</span>
                                        {:else}
                                            <span class="text-red-300">เต็มแล้ว</span>
                                        {/if}
                                    </div>
                                    <div class="mt-1 w-full bg-white/20 rounded-full h-1 overflow-hidden">
                                        <div 
                                            class="h-full bg-white/90 transition-all rounded-full"
                                            style="width: {getProgressPercentage(camp)}%"
                                        ></div>
                                    </div>
                                </div>
                            </a>

                            <Card.Content class="pt-6 space-y-4">
                                <!-- Category & Faculty -->
                                <div class="flex items-center gap-2 flex-wrap">
                                    <Badge variant="secondary" class="text-xs">
                                        {getCategoryLabel(camp.category)}
                                    </Badge>
                                    {#if camp.expand?.faculty}
                                        <Badge 
                                            variant="outline" 
                                            class="text-xs"
                                            style={camp.expand.faculty.color ? `border-color: ${camp.expand.faculty.color}; color: ${camp.expand.faculty.color}` : ''}
                                        >
                                            {camp.expand.faculty.name_th}
                                        </Badge>
                                    {/if}
                                </div>

                                <!-- Title -->
                                <a href="/camp/{camp.slug}" class="block">
                                    <h3 class="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                                        {camp.title}
                                    </h3>
                                </a>

                                <!-- Description -->
                                <p class="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                    {camp.short_description}
                                </p>

                                <!-- Info Grid -->
                                <div class="space-y-2 text-sm">
                                    <div class="flex items-center gap-2 text-muted-foreground">
                                        <Calendar class="size-4 shrink-0" />
                                        <span class="truncate">
                                            {formatDate(camp.start_date)}
                                            {#if camp.start_date !== camp.end_date}
                                                - {formatDate(camp.end_date)}
                                            {/if}
                                        </span>
                                    </div>
                                    <div class="flex items-center gap-2 text-muted-foreground">
                                        <MapPin class="size-4 shrink-0" />
                                        <span class="truncate">{camp.location}</span>
                                    </div>
                                    <div class="flex items-center gap-2 text-muted-foreground">
                                        <Users class="size-4 shrink-0" />
                                        <span>
                                            {#if camp.registration_fee > 0}
                                                ค่าสมัคร {camp.registration_fee.toLocaleString()} บาท
                                            {:else}
                                                <span class="text-green-600 font-semibold">ฟรี</span>
                                            {/if}
                                        </span>
                                    </div>
                                </div>

                                <!-- CTA Button -->
                                <Button 
                                    href="/camp/{camp.slug}" 
                                    class="w-full group/btn"
                                    variant={getSpotsRemaining(camp) > 0 ? 'default' : 'secondary'}
                                    disabled={getSpotsRemaining(camp) <= 0}
                                >
                                    {#if getSpotsRemaining(camp) > 0}
                                        ดูรายละเอียด
                                        <ArrowRight class="ml-2 size-4 group-hover/btn:translate-x-1 transition-transform" />
                                    {:else}
                                        รับสมัครเต็มแล้ว
                                    {/if}
                                </Button>
                            </Card.Content>
                        </Card.Root>
                    {/each}
                </div>
            {/if}

            <!-- View All Button -->
            {#if !hasSearched || (hasSearched && searchResults.length > 0)}
                <div class="text-center pt-8">
                    <Button 
                        size="lg" 
                        variant="outline"
                        href="/camps"
                        class="group"
                    >
                        ดูค่ายทั้งหมด
                        <ArrowRight class="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            {/if}
        </div>
    </div>
</section>

