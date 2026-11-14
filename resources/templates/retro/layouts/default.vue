<script setup lang="ts">
// The page frame of the retro design system: a tiled sidebar of links, a
// masthead with the app's name, the page, and a footer of bracketed links.
// The link lists are yours to change as the system grows.
const { user, logout } = useAuth();
const zh = useIsChinese();
const name = String(useRuntimeConfig().public.name);

const sections = [
  { title: zh ? '快速通道' : 'Fast track', links: [{ to: '/', label: zh ? '首页' : 'Home' }] },
];
const footer = [{ to: '/', label: zh ? '首页' : 'Home' }];
</script>

<template>
  <div class="retro-page">
    <nav class="retro-side">
      <div v-for="section in sections" :key="section.title" class="retro-side__section">
        <div class="retro-side__title"><span class="retro-side__dot" />{{ section.title }}:</div>
        <ul class="retro-dots">
          <li v-for="link in section.links" :key="link.to"><NuxtLink :to="link.to">{{ link.label }}</NuxtLink></li>
        </ul>
      </div>
      <div v-if="user" class="retro-side__user">
        <div>{{ user.username }}</div>
        <a href="#" @click.prevent="logout()">{{ zh ? '退出登录' : 'Sign out' }}</a>
      </div>
    </nav>
    <div class="retro-main">
      <header class="retro-mast">
        <span class="retro-mast__rays" aria-hidden="true" />
        <NuxtLink to="/" class="retro-mast__name">{{ name }}</NuxtLink>
        <span class="retro-mast__rays retro-mast__rays--right" aria-hidden="true" />
      </header>
      <main class="retro-content"><slot /></main>
      <footer class="retro-foot">
        <hr />
        <p class="retro-center">
          <template v-for="link in footer" :key="link.to">[<NuxtLink :to="link.to">{{ link.label }}</NuxtLink>] </template>
        </p>
      </footer>
    </div>
  </div>
</template>

<style>
.retro-page { display: flex; min-height: 100vh; }
.retro-side {
  flex: 0 0 200px; box-sizing: border-box; padding: 10px 8px 24px; font-family: var(--retro-serif); font-weight: bold; font-size: 1.05rem;
  /* A sheet of small tiles in the palette's surface colour. */
  background-color: var(--nocco-surface);
  background-image:
    linear-gradient(color-mix(in srgb, var(--nocco-surface) 78%, #000000) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--nocco-surface) 78%, #000000) 1px, transparent 1px);
  background-size: 26px 26px;
  border-right: 6px solid #111111; box-shadow: 4px 0 0 var(--nocco-primary), 8px 0 6px rgba(0, 0, 0, 0.3);
}
.retro-side__section + .retro-side__section { margin-top: 12px; }
.retro-side__title { font-style: italic; font-size: 1.2rem; text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.5); margin-bottom: 2px; }
.retro-side__dot { display: inline-block; width: 12px; height: 12px; margin-right: 4px; border-radius: 50%; background: var(--nocco-primary); border: 2px solid #111111; vertical-align: -1px; }
.retro-side ul { margin: 0; }
.retro-side li { margin: 1px 0; }
.retro-side__user { margin-top: 20px; padding-top: 8px; border-top: 2px groove rgba(255, 255, 255, 0.7); font-size: 0.95rem; }
.retro-main { flex: 1; min-width: 0; padding: 14px 24px 24px 28px; }
.retro-mast { display: flex; align-items: center; justify-content: center; gap: 14px; max-width: 780px; margin-bottom: 14px; }
.retro-mast__name {
  font-family: Impact, 'Arial Black', 'Heiti SC', 'SimHei', var(--retro-sans); font-size: clamp(2rem, 6vw, 3.4rem); line-height: 1; letter-spacing: 0.04em; text-transform: uppercase;
  text-decoration: none; transform: rotate(-2deg) skewX(-6deg); display: inline-block;
  color: var(--nocco-primary); -webkit-text-stroke: 1px #400000;
  text-shadow: 2px 2px 0 var(--nocco-surface), 4px 4px 0 rgba(0, 0, 0, 0.35);
}
.retro-mast__name:visited { color: var(--nocco-primary); }
/* Three short strokes flying off each side of the name. */
.retro-mast__rays { width: 34px; height: 30px; flex: none; background:
  linear-gradient(var(--nocco-warning), var(--nocco-warning)) 0 2px / 100% 3px no-repeat,
  linear-gradient(var(--nocco-warning), var(--nocco-warning)) 6px 13px / 80% 3px no-repeat,
  linear-gradient(var(--nocco-warning), var(--nocco-warning)) 0 24px / 100% 3px no-repeat;
  transform: rotate(8deg); }
.retro-mast__rays--right { transform: scaleX(-1) rotate(8deg); }
.retro-content { max-width: 780px; }
.retro-foot { max-width: 780px; font-family: var(--retro-serif); margin-top: 20px; }
@media (max-width: 640px) {
  .retro-page { flex-direction: column; }
  .retro-side { flex-basis: auto; border-right: 0; border-bottom: 6px solid #111111; box-shadow: 0 4px 0 var(--nocco-primary); }
  .retro-main { padding: 14px 12px 20px; }
}
</style>
