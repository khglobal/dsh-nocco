<script setup lang="ts">
// Nocco placeholder for the shadcn-vue template — replaced when the AI
// generates real pages. Minimal/editorial take: one huge typographic
// statement, a breathing gradient mark, and unmistakable "not built
// yet" status. Pure Tailwind so shadcn projects stay dependency-light.
import { onMounted, ref } from 'vue';

const mounted = ref(false);
onMounted(() => { mounted.value = true; });
</script>

<template>
  <div
    class="relative min-h-screen overflow-hidden bg-[#faf8ff] dark:bg-[#0a0614] transition-opacity duration-700"
    :class="mounted ? 'opacity-100' : 'opacity-0'"
  >
    <!-- Ambient gradient mesh -->
    <div class="pointer-events-none absolute inset-0 opacity-70">
      <div class="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,_#b69eff_0%,_transparent_60%)] blur-3xl" />
      <div class="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,_#7645e8_0%,_transparent_60%)] blur-3xl" />
    </div>

    <!-- Fine noise/grain overlay -->
    <div
      class="start-grain pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.05] mix-blend-overlay"
    />

    <!-- Top bar -->
    <header class="relative z-10 flex items-center justify-between border-b border-[#e6deff] dark:border-[#1f1538] px-8 py-5">
      <div class="flex items-center gap-3">
        <svg class="h-7 w-auto drop-shadow-[0_4px_14px_rgba(118,69,232,0.5)]" viewBox="0 0 95 83" aria-hidden="true">
          <defs>
            <linearGradient id="shadcn-ng" x1="47.5" x2="47.5" y1="0" y2="82.4">
              <stop offset="0%" stop-color="#F8F5FF" />
              <stop offset="40%" stop-color="#B69EFF" />
              <stop offset="70%" stop-color="#7645E8" />
              <stop offset="100%" stop-color="#2D1959" />
            </linearGradient>
          </defs>
          <path fill="url(#shadcn-ng)" d="M66.657 0H28.343a7.948 7.948 0 0 0-6.887 3.979L2.288 37.235a7.948 7.948 0 0 0 0 7.938L21.456 78.43a7.948 7.948 0 0 0 6.887 3.979h38.314a7.948 7.948 0 0 0 6.886-3.98l19.17-33.256a7.948 7.948 0 0 0 0-7.938L73.542 3.98A7.948 7.948 0 0 0 66.657 0Z" />
          <path fill="#fff" fill-rule="evenodd" d="M50.642 59.608c-3.468 0-6.873-1.261-8.827-3.973l-.69 3.198-12.729 6.762 1.374-6.762 9.27-42.04h11.35l-3.279 14.818c2.649-2.9 5.108-3.973 8.26-3.973 6.81 0 11.35 4.477 11.35 12.675 0 8.45-5.233 19.295-16.079 19.295Zm4.351-16.9c0 3.91-2.774 6.874-6.368 6.874-2.018 0-3.847-.757-5.045-2.08l1.766-7.757c1.324-1.324 2.837-2.08 4.603-2.08 2.711 0 5.044 2.017 5.044 5.044Z" clip-rule="evenodd" />
        </svg>
        <span class="text-sm font-medium tracking-wide text-[#2d1959] dark:text-[#efe7ff]">Nocco</span>
      </div>

      <!-- Live status chip -->
      <div class="flex items-center gap-2 rounded-full border border-[#e6deff] dark:border-[#1f1538] bg-white/60 dark:bg-white/5 px-3 py-1.5 text-xs backdrop-blur-sm">
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8a5fff] opacity-60"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-[#7645e8]"></span>
        </span>
        <span class="font-medium text-[#2d1959] dark:text-[#efe7ff]">尚未生成 · Not Built Yet</span>
      </div>
    </header>

    <!-- Hero -->
    <main class="relative z-10 mx-auto flex min-h-[calc(100vh-73px)] max-w-5xl flex-col justify-center px-8 py-20">
      <!-- Gradient mark -->
      <div class="mb-10 h-20 w-20 rounded-2xl bg-gradient-to-br from-[#b69eff] via-[#7645e8] to-[#2d1959] shadow-[0_20px_60px_-20px_rgba(118,69,232,0.6)] animate-[breathe_4s_ease-in-out_infinite]" />

      <!-- English display -->
      <h1 class="font-serif text-6xl font-light leading-[0.95] tracking-tight text-[#0a0614] dark:text-[#efe7ff] md:text-8xl">
        Your app lives
        <span class="italic text-transparent bg-clip-text bg-gradient-to-r from-[#7645e8] to-[#b69eff]">here</span>
        — once you describe it.
      </h1>

      <!-- Chinese sub-display -->
      <p class="mt-6 font-serif text-2xl font-light leading-snug text-[#5b4888] dark:text-[#b69eff] md:text-3xl">
        在对话里告诉 Nocco 你想要什么，这个页面会自动变成你的应用。
      </p>

      <!-- Three-step hint -->
      <div class="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div class="border-t border-[#e6deff] dark:border-[#1f1538] pt-4">
          <div class="font-mono text-[10px] tracking-widest text-[#8a5fff]">01 · PROMPT</div>
          <p class="mt-2 text-sm leading-relaxed text-[#2d1959] dark:text-[#efe7ff]">
            Describe what you want in the chat — plain language, English or 中文.
          </p>
        </div>
        <div class="border-t border-[#e6deff] dark:border-[#1f1538] pt-4">
          <div class="font-mono text-[10px] tracking-widest text-[#8a5fff]">02 · GENERATE</div>
          <p class="mt-2 text-sm leading-relaxed text-[#2d1959] dark:text-[#efe7ff]">
            Nocco writes real components, pages, routes, and data wiring live in this preview.
          </p>
        </div>
        <div class="border-t border-[#e6deff] dark:border-[#1f1538] pt-4">
          <div class="font-mono text-[10px] tracking-widest text-[#8a5fff]">03 · USE</div>
          <p class="mt-2 text-sm leading-relaxed text-[#2d1959] dark:text-[#efe7ff]">
            Sign in with the admin account and use the system with real, stored data.
          </p>
        </div>
      </div>

      <!-- Footer tag -->
      <div class="mt-20 flex items-center justify-between text-xs text-[#8a5fff] font-mono tracking-wider">
        <span>NUXT 3 · SHADCN-VUE · TAILWIND</span>
        <span>AWAITING FIRST GENERATION</span>
      </div>
    </main>
  </div>
</template>

<style>
/* Base64 keeps the image address free of characters that need escaping. */
.start-grain {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC45IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAxIDAiLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsdGVyPSJ1cmwoI24pIi8+PC9zdmc+');
}
@keyframes breathe {
  0%, 100% { transform: scale(1); box-shadow: 0 20px 60px -20px rgba(118, 69, 232, 0.6); }
  50% { transform: scale(1.03); box-shadow: 0 25px 80px -15px rgba(118, 69, 232, 0.9); }
}
</style>
