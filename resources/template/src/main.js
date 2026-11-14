import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
// vite-plugin-pages produces this virtual module from src/pages/*.vue.
import routes from '~pages';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './assets/app.css';
import App from './App.vue';

const app = createApp(App);
const router = createRouter({ history: createWebHistory(), routes });

// Every Element Plus icon is usable as a bare tag inside <el-icon>.
for (const [name, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(name, component);
}

const locale = document.documentElement.lang.startsWith('zh') ? zhCn : en;
app.use(ElementPlus, { locale });
app.use(createPinia());
app.use(router);
app.mount('#app');

// A new file in src/pages changes the route table; swap it in place so the
// page does not need a full reload.
if (import.meta.hot) {
  import.meta.hot.accept('~pages', (mod) => {
    const next = mod?.default;
    if (!Array.isArray(next)) return;
    for (const route of router.getRoutes()) {
      if (route.name) router.removeRoute(route.name);
    }
    for (const route of next) router.addRoute(route);
    router.replace(router.currentRoute.value.fullPath).catch(() => {});
  });
}
