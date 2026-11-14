export default defineNuxtConfig({
  // The app runs as a single-page app talking to its own server routes.
  ssr: false,
  devtools: { enabled: false },
  app: { head: { title: __APP_NAME_JSON__, htmlAttrs: { lang: '__APP_LANG__' } } },
  // lang: the language the app was created in; shell pages read it for their own text.
  // signIn: 'required' sends signed-out visitors to /login and closes /api to them;
  // 'off' opens the app to everyone, leaving role checks to the routes that call them.
  runtimeConfig: { public: { lang: '__APP_LANG__', signIn: '__APP_SIGN_IN__' } },
  // Ant Design Vue pulls in CommonJS modules (its date library among them).
  // Pre-bundling the library lets the browser load them as ES modules.
  vite: {
    optimizeDeps: { include: ['ant-design-vue', '@ant-design/icons-vue'] },
  },
});
