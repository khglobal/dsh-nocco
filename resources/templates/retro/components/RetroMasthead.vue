<script setup lang="ts">
// A name in slanted block capitals, optionally flanked by speed lines and
// followed by a tagline. Use it as a page's masthead or anywhere a title should shout.
withDefaults(defineProps<{ to?: string; rays?: boolean; tagline?: string; align?: 'left' | 'center' }>(), { to: '', rays: true, tagline: '', align: 'center' });
</script>

<template>
  <div class="retro-mast" :class="`retro-mast--${align}`">
    <div class="retro-mast__line">
      <span v-if="rays" class="retro-mast__rays" aria-hidden="true" />
      <NuxtLink v-if="to" :to="to" class="retro-mast__name"><slot /></NuxtLink>
      <span v-else class="retro-mast__name"><slot /></span>
      <span v-if="rays" class="retro-mast__rays retro-mast__rays--right" aria-hidden="true" />
    </div>
    <p v-if="tagline" class="retro-mast__tagline">{{ tagline }}</p>
  </div>
</template>

<style>
.retro-mast--center { text-align: center; }
.retro-mast__line { display: inline-flex; align-items: center; gap: 14px; }
.retro-mast__name {
  font-family: Impact, 'Arial Black', 'Heiti SC', 'SimHei', var(--retro-sans); font-size: clamp(2rem, 6vw, 3.4rem); line-height: 1; letter-spacing: 0.04em; text-transform: uppercase;
  text-decoration: none; transform: rotate(-2deg) skewX(-6deg); display: inline-block;
  color: var(--nocco-primary); -webkit-text-stroke: 1px rgba(0, 0, 0, 0.6);
  text-shadow: 2px 2px 0 var(--nocco-surface), 4px 4px 0 rgba(0, 0, 0, 0.35);
}
.retro-mast__name:visited { color: var(--nocco-primary); }
/* Three short strokes flying off each side of the name. */
.retro-mast__rays { width: 34px; height: 30px; flex: none; background:
  linear-gradient(var(--nocco-warning), var(--nocco-warning)) 0 2px / 100% 3px no-repeat,
  linear-gradient(var(--nocco-warning), var(--nocco-warning)) 6px 13px / 80% 3px no-repeat,
  linear-gradient(var(--nocco-warning), var(--nocco-warning)) 0 24px / 100% 3px no-repeat;
  transform: rotate(8deg); }
.retro-mast__rays--right { transform: scaleX(-1) rotate(8deg); }
.retro-mast__tagline { margin: 8px 0 0; font-family: var(--retro-serif); font-size: 1.3rem; }
</style>
