<script lang="ts">
    import type { PageData } from './$types';
    import Header from "$lib/components/Header.svelte";
    import GridPattern from "$lib/components/GridPattern.svelte";
    import WordRotate from "$lib/components/WordRotate.svelte";
    import CampCatalog from "$lib/components/CampCatalog.svelte";
    import { Button } from "$lib/components/ui/button";
    import { ArrowRight, Sparkles, Users } from "@lucide/svelte";

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
    };

    type Props = {
        data: PageData & { camps?: Camp[] };
    };

    let { data }: Props = $props();

    const faculties = [
        "วิศวกรรมศาสตร์",
        "วิทยาศาสตร์",
        "เทคโนโลยีสารสนเทศ",
        "สถาปัตยกรรมศาสตร์",
        "อุตสาหกรรมเกษตร"
    ];
</script>

<div class="w-full min-h-screen flex flex-col items-center justify-start relative overflow-hidden">
    <!-- Background Pattern -->
    <GridPattern
        width={60}
        height={60}
        class="absolute inset-0 h-screen w-full opacity-40"
        fillColor="rgb(255 147 51 / 0.15)"
        strokeWidth={1}
    />

    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>

    <Header />

    <!-- Hero Section -->
    <section class="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 lg:pt-40 pb-16">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
            <!-- Left Content -->
            <div class="space-y-8 z-10">
                <!-- Badge -->
                <!-- <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                    <Sparkles class="w-4 h-4 text-primary" />
                    <span class="text-sm font-medium text-primary">แพลตฟอร์มจัดค่ายสำหรับ สจล.</span>
                </div> -->

                <!-- Main Heading -->
                <div class="space-y-4">
                    <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                        <span class="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            สร้างค่ายกิจกรรม
                        </span>
                        <br />
                        <span class="text-primary">ง่ายๆ ใน 5 นาที</span>
                    </h1>

                    <!-- Rotating Faculty Names -->
                    <div class="flex items-center gap-3 text-2xl sm:text-3xl font-semibold text-muted-foreground h-[3rem]">
                        <span>สำหรับคณะ</span>
                        <WordRotate
                            words={faculties}
                            duration={2500}
                            class="text-2xl sm:text-3xl font-bold text-accent"
                        />
                    </div>
                </div>

                <!-- Description -->
                <p class="text-lg text-muted-foreground leading-relaxed max-w-xl">
                    แพลตฟอร์มที่ช่วยให้คุณสร้างเว็บไซต์รับสมัครค่าย พร้อมระบบจัดการผู้สมัคร 
                    โดยไม่ต้องเขียนโค้ด ทุกคณะ ทุกค่าย รวมอยู่ที่เดียว
                </p>

                <!-- Stats -->
                <div class="flex items-center gap-8 pt-4">
                    <div class="space-y-1">
                        <div class="text-3xl font-bold text-primary">10+</div>
                        <div class="text-sm text-muted-foreground">ค่ายที่เปิดรับ</div>
                    </div>
                    <div class="h-12 w-px bg-border"></div>
                    <div class="space-y-1">
                        <div class="text-3xl font-bold text-accent">500+</div>
                        <div class="text-sm text-muted-foreground">ผู้สมัครทั้งหมด</div>
                    </div>
                    <div class="h-12 w-px bg-border"></div>
                    <div class="space-y-1">
                        <div class="text-3xl font-bold text-secondary-foreground">12</div>
                        <div class="text-sm text-muted-foreground">คณะในเครือข่าย</div>
                    </div>
                </div>

                <!-- CTA Buttons -->
                <div class="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                        href="/auth"
                        size="lg" 
                        class="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 group"
                    >
                        สร้างค่ายของคุณ
                        <ArrowRight class="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button 
                        href="#camps"
                        size="lg" 
                        variant="outline"
                        class="border-2 hover:bg-accent/10 hover:border-accent group"
                    >
                        <Users class="mr-2 w-4 h-4" />
                        ค้นหาค่ายที่เปิดรับ
                    </Button>
                </div>

                <!-- Trust Badge -->
                <div class="flex items-center gap-3 pt-8 text-sm text-muted-foreground">
                    <div class="flex -space-x-2">
                        <div class="w-8 h-8 rounded-full bg-primary/20 border-2 border-background"></div>
                        <div class="w-8 h-8 rounded-full bg-accent/20 border-2 border-background"></div>
                        <div class="w-8 h-8 rounded-full bg-secondary/40 border-2 border-background"></div>
                    </div>
                    <span>เชื่อถือได้จากคณะต่างๆ ภายใน สจล.</span>
                </div>
            </div>

            <!-- Right Image -->
            <div class="relative lg:h-[600px] h-[400px] z-10">
                
                <!-- Image Container -->
                <div class="relative h-full rounded-2xl overflow-hidden">
                    <img 
                        src="/47_1x_shots_so.png" 
                        alt="K-Camp Platform Preview" 
                        class="w-full h-full object-cover shadow-xl"
                    />
                </div>
            </div>
        </div>
    </section>

    <!-- Camp Catalog Section -->
    <CampCatalog initialCamps={data?.camps || []} />

    <!-- Footer Section -->
    <section class="relative w-full py-16 border-t border-border">
        <div class="container mx-auto px-4">
            <div class="max-w-7xl mx-auto text-center space-y-4">
                <h3 class="text-2xl font-bold">พร้อมที่จะสร้างค่ายของคุณแล้วใช่ไหม?</h3>
                <p class="text-muted-foreground">
                    เริ่มต้นใช้งาน K-CAMP ฟรี ไม่มีค่าใช้จ่าย
                </p>
                <Button 
                    href="/auth" 
                    size="lg"
                    class="bg-primary hover:bg-primary/90"
                >
                    เริ่มต้นใช้งานเลย
                    <ArrowRight class="ml-2 size-4" />
                </Button>
            </div>
        </div>
    </section>
</div>