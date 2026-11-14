export default defineNuxtConfig({
  // The app runs as a single-page app talking to its own server routes.
  ssr: false,
  devtools: { enabled: false },
  app: { head: { title: __APP_NAME_JSON__, htmlAttrs: { lang: '__APP_LANG__' } } },
  modules: ['shadcn-nuxt', '@nuxtjs/tailwindcss'],
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },
});
