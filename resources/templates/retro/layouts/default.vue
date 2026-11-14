<script setup lang="ts">
// The frame every page of this app shares. This arrangement is only a
// starting point: RetroPage decides where navigation sits (`nav`), what lies
// behind it (`navBackdrop`) and behind the page (`backdrop`), and every slot
// is optional. Shape it to the system being built.
const { user, logout } = useAuth();
const zh = useIsChinese();
const name = String(useRuntimeConfig().public.name);

const sections = [
  { title: zh ? '快速通道' : 'Fast track', links: [{ to: '/', label: zh ? '首页' : 'Home' }] },
];
const footer = [{ to: '/', label: zh ? '首页' : 'Home' }];
</script>

<template>
  <RetroPage nav="left" nav-backdrop="grid" backdrop="none">
    <template #nav>
      <div v-for="section in sections" :key="section.title" class="retro-nav-section">
        <div class="retro-nav-title"><span class="retro-nav-dot" />{{ section.title }}:</div>
        <ul class="retro-dots">
          <li v-for="link in section.links" :key="link.to"><NuxtLink :to="link.to">{{ link.label }}</NuxtLink></li>
        </ul>
      </div>
      <div v-if="user" class="retro-nav-user">
        <div>{{ user.username }}</div>
        <a href="#" @click.prevent="logout()">{{ zh ? '退出登录' : 'Sign out' }}</a>
      </div>
    </template>
    <template #masthead><RetroMasthead to="/">{{ name }}</RetroMasthead></template>
    <slot />
    <template #footer>
      <p class="retro-center">
        <template v-for="link in footer" :key="link.to">[<NuxtLink :to="link.to">{{ link.label }}</NuxtLink>] </template>
      </p>
    </template>
  </RetroPage>
</template>
