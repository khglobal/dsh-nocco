<script setup>
// Starting page. Replace it with the app's real home page.
const greeting = ref('Ready to build');
</script>

<template>
  <main class="home">
    <section class="hero">
      <h1>{{ greeting }}</h1>
      <p class="lede">Edit src/pages/index.vue and the preview updates as you save.</p>
      <el-button type="primary" round size="large">Start</el-button>
    </section>
  </main>
</template>

<style scoped>
.home {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 48px 24px;
}
.hero {
  width: 100%;
  max-width: 560px;
  background: var(--surface);
  border-radius: var(--radius-card);
  padding: 56px 48px;
  box-shadow: var(--shadow-card);
  text-align: center;
}
h1 {
  margin: 0 0 12px;
  font-size: 32px;
  font-weight: 600;
}
.lede {
  margin: 0 0 32px;
  color: var(--ink-soft);
  font-size: 15px;
  line-height: 1.6;
}
</style>
