<script setup lang="ts">
definePageMeta({ layout: false });

const { login } = useAuth();
const t = useShellText();
const form = reactive({ username: '', password: '' });
const loading = ref(false);
const error = ref('');

async function submit() {
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
  <main class="login">
    <a-card class="panel" :bordered="false">
      <h1>{{ t.signIn }}</h1>
      <a-form layout="vertical" :model="form" @finish="submit">
        <a-form-item :label="t.username" name="username" :rules="[{ required: true, message: t.usernameRequired }]">
          <a-input v-model:value="form.username" autocomplete="username" />
        </a-form-item>
        <a-form-item :label="t.password" name="password" :rules="[{ required: true, message: t.passwordRequired }]">
          <a-input-password v-model:value="form.password" autocomplete="current-password" />
        </a-form-item>
        <a-alert v-if="error" type="error" :message="error" show-icon class="error" />
        <a-button type="primary" html-type="submit" block :loading="loading">{{ t.signIn }}</a-button>
      </a-form>
    </a-card>
  </main>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--nocco-surface, #f7f7f7);
}
.panel {
  width: 100%;
  max-width: 380px;
  box-shadow: 0 18px 40px -22px rgba(20, 28, 40, 0.24);
}
h1 {
  margin: 0 0 24px;
  font-size: 22px;
  font-weight: 600;
  color: var(--nocco-text, #171717);
}
.error {
  margin-bottom: 16px;
}
</style>
