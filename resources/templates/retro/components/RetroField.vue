<script setup lang="ts">
// A labelled form row: the label on its own line above the control in the default slot.
defineProps<{ label: string; hint?: string; error?: string }>();
</script>

<template>
  <label class="retro-field">
    <span class="retro-field__label">{{ label }}</span>
    <slot />
    <span v-if="error" class="retro-field__error">{{ error }}</span>
    <span v-else-if="hint" class="retro-field__hint">{{ hint }}</span>
  </label>
</template>

<style>
.retro-field { display: flex; flex-direction: column; gap: 3px; margin-bottom: 10px; }
.retro-field > input, .retro-field > select, .retro-field > textarea { align-self: stretch; }
.retro-field__hint { font-family: var(--retro-sans); font-weight: normal; font-size: 0.85rem; color: var(--nocco-text-secondary); }
.retro-field__error { font-family: var(--retro-sans); font-weight: normal; font-size: 0.85rem; color: var(--nocco-error); }
</style>
