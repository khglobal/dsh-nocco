export default defineNuxtConfig({
  // The app runs as a single-page app talking to its own server routes.
  ssr: false,
  devtools: { enabled: false },
  app: { head: { title: __APP_NAME_JSON__, htmlAttrs: { lang: '__APP_LANG__' } } },
  // The language the app was created in; shell pages read it for their own text.
  runtimeConfig: { public: { lang: '__APP_LANG__' } },
  css: ['vant/lib/index.css'],
  build: {
    transpile: ['vant'],
  },
});
