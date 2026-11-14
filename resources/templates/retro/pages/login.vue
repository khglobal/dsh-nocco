<script setup lang="ts">
definePageMeta({ layout: false });

const { login } = useAuth();
const t = useShellText();
const name = String(useRuntimeConfig().public.name);
const form = reactive({ username: '', password: '' });
const loading = ref(false);
const error = ref('');

async function submit() {
  if (!form.username || !form.password) {
    error.value = !form.username ? t.usernameRequired : t.passwordRequired;
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    await login(form.username, form.password);
    await navigateTo('/');
  } catch {
    error.value = t.wrongCredentials;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="retro-login">
    <h1 class="retro-login__name">{{ name }}</h1>
    <RetroBox :title="t.signIn" class="retro-login__box">
      <form @submit.prevent="submit">
        <RetroField :label="t.username">
          <input v-model="form.username" name="username" autocomplete="username" />
        </RetroField>
        <RetroField :label="t.password" :error="error">
          <input v-model="form.password" name="password" type="password" autocomplete="current-password" />
        </RetroField>
        <RetroButton type="submit" :disabled="loading">{{ t.signIn }}</RetroButton>
      </form>
    </RetroBox>
  </main>
</template>

<style>
.retro-login {
  min-height: 100vh; box-sizing: border-box; padding: 48px 16px; display: flex; flex-direction: column; align-items: center; gap: 28px;
  background-color: var(--nocco-surface);
  background-image:
    linear-gradient(color-mix(in srgb, var(--nocco-surface) 78%, #000000) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--nocco-surface) 78%, #000000) 1px, transparent 1px);
  background-size: 26px 26px;
}
.retro-login__name {
  margin: 0; font-family: Impact, 'Arial Black', 'Heiti SC', 'SimHei', var(--retro-sans); font-size: clamp(2rem, 7vw, 3.2rem); letter-spacing: 0.04em; text-transform: uppercase;
  transform: rotate(-2deg) skewX(-6deg); color: var(--nocco-primary); -webkit-text-stroke: 1px #400000; text-shadow: 2px 2px 0 #ffffff, 4px 4px 0 rgba(0, 0, 0, 0.35);
}
.retro-login__box { width: 100%; max-width: 360px; }
</style>
