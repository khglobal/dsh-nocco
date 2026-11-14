<script setup lang="ts">
// A flat grey side panel for secondary information beside the main boxes.
defineProps<{ title?: string }>();
</script>

<template>
  <aside class="retro-panel">
    <h3 v-if="title" class="retro-panel__title">{{ title }}</h3>
    <slot />
  </aside>
</template>

<style>
.retro-panel { background: var(--retro-grey); padding: 10px 10px 12px; flex: 0 1 220px; }
.retro-panel__title { font-size: 1.2rem; }
.retro-panel > :last-child { margin-bottom: 0; }
</style>
