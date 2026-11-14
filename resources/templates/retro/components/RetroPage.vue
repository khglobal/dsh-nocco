<script setup lang="ts">
// The frame of a retro page. Nothing about it is fixed: navigation can sit on
// either side, across the top, or be left out; the navigation area and the
// page each take any backdrop; the masthead and footer are optional slots.
withDefaults(defineProps<{
  /** Where the navigation area sits. `none` leaves it out. */
  nav?: 'left' | 'right' | 'top' | 'none';
  /** Backdrop of the navigation area. */
  navBackdrop?: 'grid' | 'dots' | 'stripes' | 'checker' | 'plain';
  /** Backdrop of the page behind the content. */
  backdrop?: 'grid' | 'dots' | 'stripes' | 'checker' | 'plain' | 'none';
  /** Widest the content column grows; any CSS length, or `none` for the full width. */
  width?: string;
  /** Centre the content column instead of starting it at the left. */
  centered?: boolean;
}>(), { nav: 'left', navBackdrop: 'grid', backdrop: 'none', width: '780px', centered: false });
</script>

<template>
  <div class="retro-page" :class="[`retro-page--nav-${nav}`, backdrop === 'none' ? '' : `retro-pattern retro-pattern--${backdrop}`]">
    <nav v-if="nav !== 'none' && $slots.nav" class="retro-page__nav retro-pattern" :class="`retro-pattern--${navBackdrop}`">
      <slot name="nav" />
    </nav>
    <div class="retro-page__main" :class="{ 'retro-page__main--centered': centered }" :style="{ '--retro-page-width': width }">
      <header v-if="$slots.masthead" class="retro-page__mast"><slot name="masthead" /></header>
      <main class="retro-page__content"><slot /></main>
      <footer v-if="$slots.footer" class="retro-page__foot"><hr /><slot name="footer" /></footer>
    </div>
  </div>
</template>

<style>
.retro-page { display: flex; min-height: 100vh; }
.retro-page--nav-right { flex-direction: row-reverse; }
.retro-page--nav-top { flex-direction: column; }
.retro-page__nav { box-sizing: border-box; padding: 10px 8px 24px; font-family: var(--retro-serif); font-weight: bold; font-size: 1.05rem; }
.retro-page--nav-left > .retro-page__nav, .retro-page--nav-right > .retro-page__nav { flex: 0 0 200px; }
.retro-page--nav-left > .retro-page__nav { border-right: 6px solid #111111; box-shadow: 4px 0 0 var(--nocco-primary), 8px 0 6px rgba(0, 0, 0, 0.3); }
.retro-page--nav-right > .retro-page__nav { border-left: 6px solid #111111; box-shadow: -4px 0 0 var(--nocco-primary), -8px 0 6px rgba(0, 0, 0, 0.3); }
.retro-page--nav-top > .retro-page__nav { padding: 8px 16px; border-bottom: 6px solid #111111; box-shadow: 0 4px 0 var(--nocco-primary); }
/* Across the top, each section of links runs in a row. */
.retro-page--nav-top > .retro-page__nav, .retro-page--nav-top > .retro-page__nav ul { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 18px; margin: 0; }
.retro-page__main { flex: 1; min-width: 0; padding: 14px 24px 24px 28px; }
.retro-page__main > * { max-width: var(--retro-page-width, 780px); }
.retro-page__main--centered > * { margin-left: auto; margin-right: auto; }
.retro-page__mast { margin-bottom: 14px; }
.retro-page__foot { font-family: var(--retro-serif); margin-top: 20px; }
@media (max-width: 640px) {
  .retro-page, .retro-page--nav-right { flex-direction: column; }
  .retro-page > .retro-page__nav { flex-basis: auto; border: 0; border-bottom: 6px solid #111111; box-shadow: 0 4px 0 var(--nocco-primary); }
  .retro-page__main { padding: 14px 12px 20px; }
}
</style>
