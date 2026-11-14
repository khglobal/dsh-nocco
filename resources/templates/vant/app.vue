<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
@import './assets/css/design-scheme.css';
/* Vant's own theme variables follow the app's palette. They live here, not in
   the palette file, because that file is rewritten whenever a colour scheme is picked. */
:root {
  --van-primary-color: var(--nocco-primary);
  --van-success-color: var(--nocco-success);
  --van-warning-color: var(--nocco-warning);
  --van-danger-color: var(--nocco-error);
  --van-text-color: var(--nocco-text);
  --van-text-color-2: var(--nocco-text-secondary);
  --van-background: var(--nocco-surface);
  --van-background-2: var(--nocco-bg);
  --van-border-color: var(--nocco-border);
}
body {
  margin: 0;
  padding: 0;
  background: var(--nocco-bg, #ffffff);
  color: var(--nocco-text, #171717);
  font-family: var(--nocco-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif);
}
</style>
