<script setup lang="ts">
definePageMeta({ layout: false });

const { login } = useAuth();
const t = useShellText();
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function submit() {
  loading.value = true;
  error.value = '';
  try {
    await login(username.value, password.value);
    await navigateTo('/');
  } catch {
    error.value = t.wrongCredentials;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="login">
    <h1>{{ t.signIn }}</h1>
    <van-form @submit="submit">
      <van-cell-group inset>
        <van-field v-model="username" name="username" :label="t.username" autocomplete="username" :rules="[{ required: true, message: t.usernameRequired }]" />
        <van-field v-model="password" type="password" name="password" :label="t.password" autocomplete="current-password" :rules="[{ required: true, message: t.passwordRequired }]" />
      </van-cell-group>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <div class="actions">
        <van-button round block type="primary" native-type="submit" :loading="loading">{{ t.signIn }}</van-button>
      </div>
    </van-form>
  </main>
</template>

<style scoped>
.login {
  min-height: 100vh;
  padding: 72px 0 24px;
  background: var(--nocco-surface, #f7f7f7);
}
h1 {
  margin: 0 0 24px;
  padding: 0 32px;
  font-size: 24px;
  font-weight: 600;
  color: var(--nocco-text, #171717);
}
.error {
  margin: 12px 32px 0;
  font-size: 13px;
  color: var(--nocco-error, #ef4444);
}
.actions {
  margin: 24px 16px 0;
}
</style>
