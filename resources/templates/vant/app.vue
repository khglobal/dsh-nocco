<script setup lang="ts">
import { Locale } from 'vant';
import zhCN from 'vant/es/locale/lang/zh-CN';
Locale.use('zh-CN', zhCN);
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
@import './assets/css/design-scheme.css';
body {
  margin: 0;
  padding: 0;
  background: var(--nocco-bg, #ffffff);
  color: var(--nocco-text, #171717);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}
</style>
