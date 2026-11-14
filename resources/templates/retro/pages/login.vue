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
  <main class="retro-login retro-pattern retro-pattern--grid">
    <RetroMasthead :rays="false">{{ name }}</RetroMasthead>
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
.retro-login { min-height: 100vh; box-sizing: border-box; padding: 48px 16px; display: flex; flex-direction: column; align-items: center; gap: 28px; }
.retro-login__box { width: 100%; max-width: 360px; }
</style>
