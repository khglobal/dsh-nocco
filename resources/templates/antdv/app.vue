<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { theme } from 'ant-design-vue';
import { ref, onMounted, computed } from 'vue';

const primary = ref('#9E7FFF');
const isDark = ref(false);

const luminance = (hex: string): number => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

onMounted(() => {
  if (typeof window === 'undefined') return;
  const style = getComputedStyle(document.documentElement);
  const p = style.getPropertyValue('--nocco-primary').trim();
  if (p) primary.value = p;
  const bg = style.getPropertyValue('--nocco-bg').trim() || '#ffffff';
  if (/^#[0-9a-fA-F]{3,8}$/.test(bg)) isDark.value = luminance(bg) < 0.5;
});

const themeConfig = computed(() => ({
  algorithm: isDark.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: {
    colorPrimary: primary.value,
    borderRadius: 8,
  },
}));
</script>

<template>
  <a-config-provider :theme="themeConfig" :locale="zhCN">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </a-config-provider>
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
