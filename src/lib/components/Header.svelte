<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Menu, X } from "@lucide/svelte";

    let mobileMenuOpen = $state(false);
</script>

<!-- Desktop Navigation -->
<nav class="mx-auto absolute top-10 left-1/2 -translate-x-1/2 w-[90vw] md:w-[60vw] z-50 rounded-full bg-card/10 backdrop-blur-[1px]">
    <!-- Desktop Menu -->
    <div class="hidden md:flex w-full items-center justify-between gap-4 px-6 py-3 rounded-full border border-border shadow-lg">
        <a href="/" class="hover:text-primary transition-colors font-medium">หน้าหลัก</a>
        <a href="/camps" class="hover:text-primary transition-colors font-medium">ค้นหาค่าย</a>
        <a href="/" class="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">K-CAMP</a>
        <a href="/create" class="hover:text-primary transition-colors font-medium">สร้างค่าย</a>
        <a href="/auth" class="hover:text-primary transition-colors font-medium">เข้าสู่ระบบ</a>
    </div>

    <!-- Mobile Menu -->
    <div class="flex md:hidden w-full items-center justify-between gap-2 px-4 py-2 rounded-full border border-border shadow-lg">
        <Button 
            variant="ghost" 
            size="icon" 
            class="shrink-0"
            onclick={() => mobileMenuOpen = !mobileMenuOpen}
        >
            {#if mobileMenuOpen}
                <X class="size-6" />
            {:else}
                <Menu class="size-6" />
            {/if}
            <span class="sr-only">เปิดเมนู</span>
        </Button>

        <h1 class="text-xl font-bold flex-1 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">K-CAMP</h1>
        
        <div class="w-10 shrink-0"></div> <!-- Spacer for centering -->
    </div>
</nav>

<!-- Mobile Dropdown Menu -->
{#if mobileMenuOpen}
    <!-- Backdrop -->
    <button
        class="fixed inset-0 bg-black/50 z-40 md:hidden"
        onclick={() => mobileMenuOpen = false}
        aria-label="ปิดเมนู"
    ></button>
    
    <!-- Menu Panel -->
    <div class="fixed top-24 left-4 right-4 bg-card border border-border rounded-xl shadow-2xl z-50 md:hidden overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200">
        <nav class="flex flex-col p-4">
            <a 
                href="/" 
                class="text-lg hover:text-primary hover:bg-accent/20 transition-colors py-3 px-4 rounded-lg"
                onclick={() => mobileMenuOpen = false}
            >
                หน้าหลัก
            </a>
            <a 
                href="/camps" 
                class="text-lg hover:text-primary hover:bg-accent/20 transition-colors py-3 px-4 rounded-lg"
                onclick={() => mobileMenuOpen = false}
            >
                ค้นหาค่าย
            </a>
            <a 
                href="/create" 
                class="text-lg hover:text-primary hover:bg-accent/20 transition-colors py-3 px-4 rounded-lg"
                onclick={() => mobileMenuOpen = false}
            >
                สร้างค่าย
            </a>
            <a 
                href="/about" 
                class="text-lg hover:text-primary hover:bg-accent/20 transition-colors py-3 px-4 rounded-lg"
                onclick={() => mobileMenuOpen = false}
            >
                เกี่ยวกับเรา
            </a>
            <div class="border-t border-border my-2"></div>
            <a 
                href="/auth" 
                class="text-lg text-primary hover:bg-primary/10 transition-colors py-3 px-4 rounded-lg font-semibold"
                onclick={() => mobileMenuOpen = false}
            >
                เข้าสู่ระบบ
            </a>
        </nav>
    </div>
{/if}