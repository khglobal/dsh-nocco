export default defineNuxtConfig({
  // The app runs as a single-page app talking to its own server routes.
  ssr: false,
  devtools: { enabled: false },
  app: { head: { title: __APP_NAME_JSON__, htmlAttrs: { lang: '__APP_LANG__' } } },
  build: {
    transpile: ['ant-design-vue', '@ant-design/icons-vue'],
  },
});
