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
  <main class="min-h-screen flex items-center justify-center p-6 bg-muted/40">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle class="text-xl">{{ t.signIn }}</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="grid gap-4" @submit.prevent="submit">
          <div class="grid gap-2">
            <Label for="username">{{ t.username }}</Label>
            <Input id="username" v-model="username" autocomplete="username" required />
          </div>
          <div class="grid gap-2">
            <Label for="password">{{ t.password }}</Label>
            <Input id="password" v-model="password" type="password" autocomplete="current-password" required />
          </div>
          <p v-if="error" class="text-sm text-destructive" role="alert">{{ error }}</p>
          <Button type="submit" class="w-full" :disabled="loading">{{ t.signIn }}</Button>
        </form>
      </CardContent>
    </Card>
  </main>
</template>
