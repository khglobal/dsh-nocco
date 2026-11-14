<script setup lang="ts">
// Nocco placeholder for the Vant mobile template — replaced when the
// AI generates real pages. Designed for phone viewports: curved
// gradient header, floating status card, tap-nothing-yet CTA. Uses
// Vant components where appropriate; everything else is plain CSS so
// the AI can rewrite freely without fighting framework assumptions.
import { onMounted, ref } from 'vue';

const mounted = ref(false);
onMounted(() => { mounted.value = true; });
</script>

<template>
  <div class="nocco-mobile" :class="{ in: mounted }">
    <!-- Curved gradient header -->
    <div class="hero">
      <div class="hero-inner">
        <svg class="mark" viewBox="0 0 95 83" aria-hidden="true">
          <path fill="#fff" fill-rule="evenodd" d="M50.642 59.608c-3.468 0-6.873-1.261-8.827-3.973l-.69 3.198-12.729 6.762 1.374-6.762 9.27-42.04h11.35l-3.279 14.818c2.649-2.9 5.108-3.973 8.26-3.973 6.81 0 11.35 4.477 11.35 12.675 0 8.45-5.233 19.295-16.079 19.295Zm4.351-16.9c0 3.91-2.774 6.874-6.368 6.874-2.018 0-3.847-.757-5.045-2.08l1.766-7.757c1.324-1.324 2.837-2.08 4.603-2.08 2.711 0 5.044 2.017 5.044 5.044Z" clip-rule="evenodd" />
        </svg>
        <div class="brand">Nocco</div>

        <div class="chip">
          <span class="ping"><span class="ping-in" /></span>
          <span>尚未生成 · Not Built</span>
        </div>

        <h1 class="title">你的应用<br />即将在这里诞生</h1>
        <p class="subtitle">Your app will be born right here.</p>
      </div>
      <svg class="curve" viewBox="0 0 375 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0 Q187.5 50 375 0 V40 H0 Z" fill="#f7f5ff" />
      </svg>
    </div>

    <!-- Status card + steps -->
    <main class="body">
      <div class="status-card">
        <div class="status-header">
          <div class="status-icon">
            <span class="orbit" />
            <span class="core" />
          </div>
          <div class="status-text">
            <div class="status-title">等待你的第一条指令</div>
            <div class="status-sub">Awaiting your first prompt</div>
          </div>
        </div>
        <div class="status-hint">
          在左侧对话栏里描述你想要做什么 —— 比如"一个记账本"或"员工签到打卡页面"。
        </div>
      </div>

      <div class="steps">
        <div class="step">
          <div class="num">01</div>
          <div class="step-copy">
            <div class="step-title">描述 · Describe</div>
            <div class="step-desc">用一句话说清你想要的应用。</div>
          </div>
        </div>
        <div class="divider" />
        <div class="step">
          <div class="num">02</div>
          <div class="step-copy">
            <div class="step-title">生成 · Generate</div>
            <div class="step-desc">Nocco 自动写出页面、路由、数据。</div>
          </div>
        </div>
        <div class="divider" />
        <div class="step">
          <div class="num">03</div>
          <div class="step-copy">
            <div class="step-title">使用 · Use</div>
            <div class="step-desc">用管理员账号登录，数据真实保存。</div>
          </div>
        </div>
      </div>

      <div class="footer-meta">
        <span>Nuxt 3</span>
        <span>·</span>
        <span>Vant Mobile</span>
        <span>·</span>
        <span>模板未修改</span>
      </div>
    </main>
  </div>
</template>

<style scoped>
.nocco-mobile {
  min-height: 100vh;
  background: #f7f5ff;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  -webkit-font-smoothing: antialiased;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 600ms ease-out, transform 600ms cubic-bezier(0.2, 0.9, 0.2, 1);
}
.nocco-mobile.in { opacity: 1; transform: translateY(0); }

/* Hero */
.hero {
  position: relative;
  background:
    radial-gradient(ellipse at 20% 0%, #b69eff 0%, transparent 50%),
    linear-gradient(165deg, #502d93 0%, #2d1959 60%, #1a0e38 100%);
  color: #fff;
  overflow: hidden;
}
.hero-inner {
  padding: 56px 24px 72px;
  position: relative;
  z-index: 2;
}
.mark {
  width: 28px; height: auto;
  filter: drop-shadow(0 4px 12px rgba(183, 158, 255, 0.8));
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
}
.brand {
  display: inline-block;
  vertical-align: middle;
  font-weight: 600;
  letter-spacing: 0.06em;
  font-size: 14px;
  opacity: 0.92;
}

.chip {
  margin-top: 28px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 11px;
  letter-spacing: 0.04em;
}
.ping {
  position: relative;
  width: 8px; height: 8px;
  display: inline-flex;
}
.ping::before {
  content: '';
  position: absolute; inset: 0;
  border-radius: 50%;
  background: #fff;
  opacity: 0.6;
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
.ping-in {
  position: relative;
  width: 8px; height: 8px; border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
}
@keyframes ping {
  75%, 100% { transform: scale(2.2); opacity: 0; }
}

.title {
  margin: 20px 0 6px;
  font-size: 32px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.01em;
}
.subtitle {
  margin: 0;
  font-size: 13px;
  opacity: 0.65;
  letter-spacing: 0.02em;
  font-style: italic;
}

.curve {
  display: block;
  width: 100%;
  height: 40px;
  margin-top: -24px;
  position: relative;
  z-index: 2;
}

/* Body */
.body {
  padding: 4px 16px 40px;
}
.status-card {
  margin-top: -16px !important;
  border-radius: 14px !important;
  overflow: hidden;
  box-shadow: 0 12px 32px -12px rgba(45, 25, 89, 0.18);
  padding: 20px;
  background: #fff;
}
.status-header {
  display: flex; align-items: center; gap: 14px;
}
.status-icon {
  position: relative;
  width: 44px; height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #efe7ff 0%, #d4c5ff 100%);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.orbit {
  position: absolute;
  width: 32px; height: 32px;
  border: 1.5px solid rgba(118, 69, 232, 0.3);
  border-top-color: #7645e8;
  border-radius: 50%;
  animation: spin 2.4s linear infinite;
}
.core {
  width: 10px; height: 10px; border-radius: 50%;
  background: linear-gradient(135deg, #b69eff, #7645e8);
  box-shadow: 0 0 12px rgba(118, 69, 232, 0.6);
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.status-title {
  font-size: 15px; font-weight: 600;
  color: #2d1959;
}
.status-sub {
  font-size: 11px;
  color: #8a7bb0;
  margin-top: 2px;
  letter-spacing: 0.02em;
}
.status-hint {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed #e6deff;
  font-size: 13px;
  line-height: 1.6;
  color: #5b4888;
}

.steps {
  margin-top: 20px;
  border-radius: 14px;
  background: #fff;
  padding: 4px 0;
  box-shadow: 0 12px 32px -12px rgba(45, 25, 89, 0.1);
}
.step {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 20px;
}
.num {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 12px;
  color: #7645e8;
  font-weight: 600;
  letter-spacing: 0.04em;
  width: 28px;
  flex-shrink: 0;
}
.step-title {
  font-size: 14px; font-weight: 600;
  color: #2d1959;
}
.step-desc {
  margin-top: 3px;
  font-size: 12px;
  color: #8a7bb0;
  line-height: 1.5;
}
.divider {
  height: 1px;
  background: #f0eaff;
  margin-left: 62px;
}

.footer-meta {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 11px;
  color: #a699c9;
  letter-spacing: 0.04em;
}
</style>
