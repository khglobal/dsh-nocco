<script setup lang="ts">
// A content box with a thick coloured border, an oval title tab and an
// optional oval action on the right: the building block of a retro page.
withDefaults(defineProps<{
  /** Shown in the oval tab above the box. */
  title?: string;
  /** `primary` uses the palette's main colour for the border; `plain` uses grey. */
  tone?: 'primary' | 'plain';
}>(), { title: '', tone: 'primary' });
</script>

<template>
  <section class="retro-box" :class="`retro-box--${tone}`">
    <header v-if="title || $slots.action" class="retro-box__head">
      <span v-if="title" class="retro-box__tab">{{ title }}</span>
      <span class="retro-box__action"><slot name="action" /></span>
    </header>
    <div class="retro-box__frame">
      <div class="retro-box__body"><slot /></div>
    </div>
  </section>
</template>

<style>
.retro-box { --retro-box-colour: var(--nocco-primary); }
.retro-box--plain { --retro-box-colour: var(--nocco-border); }
.retro-box__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin-bottom: -10px; padding: 0 2px; position: relative; z-index: 1; }
.retro-box__tab {
  display: inline-block; padding: 5px 22px 6px; border-radius: 50%; transform: rotate(-2deg);
  font-family: var(--retro-serif); font-weight: bold; font-style: italic; font-size: 1.05rem; letter-spacing: 0.02em; text-transform: uppercase;
  color: var(--nocco-on-primary, #ffffff); background: var(--retro-box-colour);
  border: 3px solid var(--nocco-surface); box-shadow: 2px 3px 0 rgba(0, 0, 0, 0.45); text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);
}
.retro-box__action { margin-left: auto; }
.retro-box__frame { border: 9px solid var(--retro-box-colour); border-top-width: 22px; background: var(--nocco-bg); }
.retro-box__body { padding: 12px 14px; }
.retro-box__body > :last-child { margin-bottom: 0; }
</style>
