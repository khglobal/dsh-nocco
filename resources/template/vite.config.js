import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Pages from 'vite-plugin-pages';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  plugins: [
    vue(),
    // A file at src/pages/<name>.vue becomes the /<name> route.
    Pages({ dirs: 'src/pages', extensions: ['vue'] }),
    // Vue, Vue Router, Pinia and VueUse APIs need no import statement.
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
      resolvers: [ElementPlusResolver({ importStyle: false })],
      dts: false,
    }),
    // Element Plus components need no import statement. Styles come from
    // the single stylesheet import in src/main.js.
    Components({ resolvers: [ElementPlusResolver({ importStyle: false })], dts: false }),
  ],
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'element-plus', '@element-plus/icons-vue',
      '@supabase/supabase-js', '@vueuse/core', 'dayjs', 'echarts', 'lodash-es', 'vue-echarts', 'zod'],
  },
});
