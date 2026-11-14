<script setup>
// Root shell. Pages in src/pages/ mount into <router-view />.
</script>

<template>
  <div class="app-root">
    <router-view />
  </div>
</template>

<style>
.app-root {
  min-height: 100vh;
  background: var(--paper-grad);
  color: var(--ink);
}
</style>
