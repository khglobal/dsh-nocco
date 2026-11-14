<script setup lang="ts">
definePageMeta({ layout: false });

const { login } = useAuth();
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
    error.value = '用户名或密码不正确';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="login">
    <a-card class="panel" :bordered="false">
      <h1>登录</h1>
      <a-form layout="vertical" :model="form" @finish="submit">
        <a-form-item label="用户名" name="username" :rules="[{ required: true, message: '请输入用户名' }]">
          <a-input v-model:value="form.username" autocomplete="username" />
        </a-form-item>
        <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model:value="form.password" autocomplete="current-password" />
        </a-form-item>
        <a-alert v-if="error" type="error" :message="error" show-icon class="error" />
        <a-button type="primary" html-type="submit" block :loading="loading">登录</a-button>
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
