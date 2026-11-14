<script setup lang="ts">
import { onMounted } from 'vue';

const luminance = (hex: string): number => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

onMounted(() => {
  if (typeof window === 'undefined') return;
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--nocco-bg').trim() || '#ffffff';
  if (/^#[0-9a-fA-F]{3,8}$/.test(bg) && luminance(bg) < 0.5) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});
</script>

<template>
  <!-- With no font chosen for the app the variable is unset and the font is inherited. -->
  <div class="min-h-screen bg-background text-foreground" style="font-family: var(--nocco-font)">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
@import './assets/css/design-scheme.css';
</style>
