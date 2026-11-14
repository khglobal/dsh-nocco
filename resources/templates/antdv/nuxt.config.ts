export default defineNuxtConfig({
  // The app runs as a single-page app talking to its own server routes.
  ssr: false,
  devtools: { enabled: false },
  app: { head: { title: __APP_NAME_JSON__, htmlAttrs: { lang: '__APP_LANG__' } } },
  // Ant Design Vue pulls in CommonJS modules (its date library among them).
  // Pre-bundling the library lets the browser load them as ES modules.
  vite: {
    optimizeDeps: { include: ['ant-design-vue', '@ant-design/icons-vue'] },
  },
});
