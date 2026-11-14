<script setup lang="ts">
// The page speaks the language the app was created in.
const zh = useIsChinese();
// Nocco placeholder — replaced when the AI generates real pages.
// Design intent: architectural "blueprint" feel. Dashed grid, serif
// display type, Nocco purple gradient mark. Makes it unmistakable
// that the workspace is ready but no app exists yet.
import { computed, onMounted, ref } from 'vue';

const mounted = ref(false);
const now = ref(new Date());
onMounted(() => {
  mounted.value = true;
  setInterval(() => { now.value = new Date(); }, 1000);
});
const clock = computed(() =>
  now.value.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
);
</script>

<template>
  <div class="nocco-blueprint">
    <div class="grid-bg" />
    <div class="vignette" />

    <header class="bar">
      <div class="brandline">
        <svg class="mark" viewBox="0 0 95 83" aria-hidden="true">
          <defs>
            <linearGradient id="ng" x1="47.5" x2="47.5" y1="0" y2="82.4" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#F8F5FF" />
              <stop offset="40%" stop-color="#B69EFF" />
              <stop offset="70%" stop-color="#7645E8" />
              <stop offset="100%" stop-color="#2D1959" />
            </linearGradient>
          </defs>
          <path fill="url(#ng)" d="M66.657 0H28.343a7.948 7.948 0 0 0-6.887 3.979L2.288 37.235a7.948 7.948 0 0 0 0 7.938L21.456 78.43a7.948 7.948 0 0 0 6.887 3.979h38.314a7.948 7.948 0 0 0 6.886-3.98l19.17-33.256a7.948 7.948 0 0 0 0-7.938L73.542 3.98A7.948 7.948 0 0 0 66.657 0Z" />
          <path fill="#fff" fill-rule="evenodd" d="M50.642 59.608c-3.468 0-6.873-1.261-8.827-3.973l-.69 3.198-12.729 6.762 1.374-6.762 9.27-42.04h11.35l-3.279 14.818c2.649-2.9 5.108-3.973 8.26-3.973 6.81 0 11.35 4.477 11.35 12.675 0 8.45-5.233 19.295-16.079 19.295Zm4.351-16.9c0 3.91-2.774 6.874-6.368 6.874-2.018 0-3.847-.757-5.045-2.08l1.766-7.757c1.324-1.324 2.837-2.08 4.603-2.08 2.711 0 5.044 2.017 5.044 5.044Z" />
        </svg>
        <div class="wordmark">NOCCO · {{ zh ? '待构建工区' : 'WORKSPACE' }}</div>
      </div>
      <div class="meta">
        <span class="dot" /> {{ zh ? '空白画布' : 'UNBUILT CANVAS' }} · {{ clock }}
      </div>
    </header>

    <main class="stage" :class="{ in: mounted }">
      <div class="measure">
        <div class="stamp">
          <span>{{ zh ? '尚未生成' : 'NOT YET BUILT' }}</span>
        </div>

        <h1 class="display">
          <span>{{ zh ? '你的应用将在此处生成' : 'An app will live here.' }}</span>
        </h1>

        <p class="lede">
          {{ zh
            ? '这是 Nocco 为每个新项目保留的空白画布。在对话里描述你想要的内容，页面会自动生成：真实组件、真实数据、真实路由。'
            : 'This is the blank canvas Nocco hands every new project. Describe what you want in the chat and the page rewrites itself: real components, real data, real routing.' }}
        </p>

        <div class="cards">
          <article class="card">
            <header>01 / STEP</header>
            <h3>{{ zh ? '在对话中描述' : 'Describe it in the chat' }}</h3>
            <p>{{ zh ? '用一句话说出你想要的系统。' : 'Say what system you want in a sentence.' }}</p>
          </article>
          <article class="card accent">
            <header>02 / STEP</header>
            <h3>{{ zh ? '观察实时更新' : 'Watch it update' }}</h3>
            <p>{{ zh ? '页面、组件和路由会在这个预览里实时出现。' : 'Pages, components and routes appear live in this preview.' }}</p>
          </article>
          <article class="card">
            <header>03 / STEP</header>
            <h3>{{ zh ? '直接使用' : 'Use it' }}</h3>
            <p>{{ zh ? '系统可以直接使用，数据真实保存。' : 'Use the system with real, stored data.' }}</p>
          </article>
        </div>

        <footer class="sig">
          <span>{{ zh ? '框架' : 'Framework' }}</span><b>Nuxt 3 · Ant Design Vue</b>
          <span>{{ zh ? '状态' : 'Status' }}</span><b>{{ zh ? '等待第一次生成' : 'Awaiting first generation' }}</b>
          <span>{{ zh ? '模板' : 'Template' }}</span><b>antdv · desktop</b>
        </footer>
      </div>
    </main>
  </div>
</template>

<style scoped>
.nocco-blueprint {
  min-height: 100vh;
  position: relative;
  background:
    radial-gradient(ellipse at 20% -10%, #2d1959 0%, transparent 45%),
    radial-gradient(ellipse at 110% 120%, #4a2f8c 0%, transparent 50%),
    #0b0716;
  color: #efe7ff;
  overflow: hidden;
  font-family: 'Times New Roman', 'Songti SC', 'STSong', serif;
}
.grid-bg {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(183, 158, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(183, 158, 255, 0.08) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
  pointer-events: none;
}
.vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 30%, rgba(11, 7, 22, 0.8) 90%);
  pointer-events: none;
}
.bar {
  position: relative;
  padding: 28px 56px;
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px dashed rgba(183, 158, 255, 0.25);
  letter-spacing: 0.14em;
  font-size: 11px;
  font-family: 'SF Mono', 'Courier New', monospace;
  text-transform: uppercase;
  color: rgba(239, 231, 255, 0.7);
}
.brandline { display: flex; align-items: center; gap: 14px; }
.mark { width: 28px; height: auto; filter: drop-shadow(0 0 12px rgba(138, 95, 255, 0.6)); }
.wordmark { font-family: inherit; }
.meta { display: flex; align-items: center; gap: 10px; }
.dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #8a5fff;
  box-shadow: 0 0 0 4px rgba(138, 95, 255, 0.25), 0 0 16px rgba(138, 95, 255, 0.9);
  animation: pulse 2.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

.stage {
  position: relative;
  padding: 80px 56px 100px;
  display: flex;
  justify-content: center;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 900ms ease-out, transform 900ms cubic-bezier(0.2, 0.9, 0.2, 1);
}
.stage.in { opacity: 1; transform: translateY(0); }
.measure { max-width: 920px; width: 100%; }

.stamp {
  display: inline-flex; gap: 16px;
  padding: 8px 14px;
  border: 1px solid rgba(255, 180, 90, 0.5);
  color: #ffb45a;
  font-family: 'SF Mono', 'Courier New', monospace;
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  margin-bottom: 28px;
  background: rgba(255, 180, 90, 0.08);
  transform: rotate(-1deg);
}

.display {
  font-size: clamp(44px, 7vw, 92px);
  line-height: 0.98;
  margin: 0 0 36px;
  font-weight: 400;
  letter-spacing: -0.02em;
}
.display span { display: block; }
.display .faint {
  font-size: clamp(28px, 4vw, 52px);
  color: rgba(239, 231, 255, 0.4);
  margin-top: 6px;
  font-style: italic;
}

.lede {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 17px;
  line-height: 1.65;
  max-width: 640px;
  color: rgba(239, 231, 255, 0.78);
  margin: 0 0 14px;
}
.lede.zh { color: rgba(239, 231, 255, 0.55); margin-bottom: 48px; }

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2px;
  background: rgba(183, 158, 255, 0.15);
  border: 1px solid rgba(183, 158, 255, 0.15);
  margin-bottom: 56px;
}
.card {
  background: #0b0716;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}
.card header {
  font-family: 'SF Mono', 'Courier New', monospace;
  font-size: 10px;
  letter-spacing: 0.22em;
  color: rgba(183, 158, 255, 0.8);
  margin-bottom: 14px;
}
.card h3 { margin: 0 0 8px; font-size: 18px; font-weight: 500; }
.card p { margin: 0; font-size: 13px; line-height: 1.6; color: rgba(239, 231, 255, 0.6); }
.card em { color: #b69eff; font-style: normal; }
.card.accent {
  background: linear-gradient(145deg, #2d1959 0%, #0b0716 80%);
}

.sig {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 20px;
  padding-top: 24px;
  border-top: 1px dashed rgba(183, 158, 255, 0.25);
  font-family: 'SF Mono', 'Courier New', monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
}
.sig span { color: rgba(239, 231, 255, 0.45); text-transform: uppercase; }
.sig b { font-weight: 500; color: #efe7ff; }

@media (max-width: 640px) {
  .bar { padding: 20px 24px; }
  .stage { padding: 48px 24px 60px; }
  .meta { display: none; }
}
</style>
