<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageData } from "./$types";
    import Button from "$lib/components/ui/button/button.svelte";
    import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
    import Label from '$lib/components/ui/label/label.svelte';
    import * as Card from "$lib/components/ui/card";
    import * as Avatar from "$lib/components/ui/avatar";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    let isagree = $state(false);
</script>

<div class="flex items-center justify-center min-h-[80vh]">
    <Card.Root class="w-[550px]">
        <Card.Header class="text-center">
            <Card.Title>Authentication</Card.Title>
            <Card.Description>
                {#if data.user}
                    จัดการบัญชีของคุณ
                {:else}
                    ลงชื่อเข้าใช้
                {/if}
            </Card.Description>
        </Card.Header>
        <Card.Content>
            {#if data.user}
                <div class="flex flex-col items-center gap-4">
                    <Avatar.Root class="h-20 w-20">
                        <Avatar.Image src={data.user.avatar} alt={data.user.email} />
                        <Avatar.Fallback>{data.user.email[0].toUpperCase()}</Avatar.Fallback>
                    </Avatar.Root>
                    <div class="text-center">
                        <p class="text-sm font-medium">{data.user.email}</p>
                    </div>
                    <form method="post" action="?/logout" use:enhance class="w-full space-y-4">
                        <Button 
                            type="submit" 
                            variant="destructive" 
                            class="w-full"
                        >
                            Logout
                        </Button>
                        <a href="/" class="text-sm text-gray-500"><Button variant="outline" class="w-full">กลับไปดูค่ายที่สนใจเลยย</Button></a>
                    </form>
                </div>
            {:else}
                <form method="post" action="?/google" use:enhance class="space-y-4">
                    <Button 
                        type="submit" 
                        variant="outline" 
                        class="w-full"
                        disabled={!isagree}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        </svg>
                        <span class="ml-2">Continue with Google</span>
                    </Button>
                    <div class="mt-2 flex items-center justify-center gap-2">
                        <Checkbox id="terms" bind:checked={isagree} aria-labelledby="terms-label" />
                        <Label
                          id="terms-label"
                          for="terms"
                          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          ยอมรับ <a href="/terms" class="text-primary underline">ข้อกำหนดและเงื่อนไข</a> และ <a href="/privacy" class="text-primary underline">นโยบายความเป็นส่วนตัว</a>
                        </Label>
                    </div>
                </form>
            {/if}
        </Card.Content>
    </Card.Root>
</div>