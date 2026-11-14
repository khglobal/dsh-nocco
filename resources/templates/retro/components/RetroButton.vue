<script setup lang="ts">
// A button in one of two retro shapes: a grey bevelled push button, or an
// italic oval for the one action a box leads to.
withDefaults(defineProps<{
  variant?: 'bevel' | 'oval';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}>(), { variant: 'bevel', type: 'button', disabled: false });
</script>

<template>
  <button class="retro-button" :class="`retro-button--${variant}`" :type="type" :disabled="disabled">
    <slot />
  </button>
</template>

<style>
.retro-button { font: inherit; cursor: pointer; color: #000000; }
.retro-button:disabled { cursor: default; color: #808080; text-shadow: 1px 1px 0 #ffffff; }
.retro-button--bevel {
  padding: 3px 14px; background: var(--retro-grey); border: 2px solid; border-color: #ffffff #404040 #404040 #ffffff;
  box-shadow: inset -1px -1px 0 #808080, inset 1px 1px 0 #dfdfdf; border-radius: 0;
}
.retro-button--bevel:active:not(:disabled) { border-color: #404040 #ffffff #ffffff #404040; box-shadow: inset 1px 1px 0 #808080; padding: 4px 13px 2px 15px; }
.retro-button--oval {
  padding: 3px 20px 4px; border-radius: 50%; border: 3px solid var(--nocco-primary); background: var(--retro-oval);
  color: #ffffff; font-family: var(--retro-serif); font-weight: bold; font-style: italic; text-shadow: 1px 1px 0 #003344; box-shadow: 1px 2px 0 rgba(0, 0, 0, 0.4);
}
.retro-button--oval:active:not(:disabled) { transform: translate(1px, 2px); box-shadow: none; }
.retro-button--oval:disabled { background: var(--retro-grey); color: #808080; text-shadow: none; }
.retro-button:focus-visible { outline: 1px dotted #000000; outline-offset: 2px; }
</style>
