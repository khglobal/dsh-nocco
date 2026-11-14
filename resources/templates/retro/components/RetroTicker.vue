<script setup lang="ts">
// One line of text that scrolls across, for announcements. It stands still when the user prefers reduced motion.
withDefaults(defineProps<{ seconds?: number }>(), { seconds: 14 });
</script>

<template>
  <div class="retro-ticker"><span :style="{ animationDuration: `${seconds}s` }"><slot /></span></div>
</template>

<style>
.retro-ticker { overflow: hidden; white-space: nowrap; background: #000000; color: #33ff33; font-family: 'Courier New', Courier, monospace; padding: 3px 0; border: 2px solid; border-color: #808080 #dfdfdf #dfdfdf #808080; }
.retro-ticker > span { display: inline-block; min-width: 100%; animation: retro-slide linear infinite; }
</style>
