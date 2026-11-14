<script setup lang="ts">
// A small shouting label, as in "NEW!". `blink` makes it flash, which respects reduced-motion settings.
withDefaults(defineProps<{ tone?: 'primary' | 'success' | 'warning' | 'error'; blink?: boolean }>(), { tone: 'error', blink: false });
</script>

<template>
  <span class="retro-badge" :class="[`retro-badge--${tone}`, { 'retro-blink': blink }]"><slot /></span>
</template>

<style>
.retro-badge { display: inline-block; padding: 0 6px; font-family: var(--retro-serif); font-weight: bold; font-style: italic; font-size: 0.85rem; color: #ffffff; transform: rotate(-4deg); border: 1px solid #000000; }
.retro-badge--primary { background: var(--nocco-primary); color: var(--nocco-on-primary, #ffffff); }
.retro-badge--success { background: var(--nocco-success); }
.retro-badge--warning { background: var(--nocco-warning); }
.retro-badge--error { background: var(--nocco-error); }
.retro-blink { animation: retro-blink 1s steps(1) infinite; }
</style>
