// Development only: report this page's runtime errors to the app's own server,
// where the preview picks them up. A built app does nothing here.
export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.dev) return;
  const report = (error: unknown): void => {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    void fetch('/api/_nocco/errors', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message, page: location.pathname }),
    }).catch(() => {});
  };
  nuxtApp.hook('vue:error', report);
  window.addEventListener('error', (event) => report(event.error ?? event.message));
  window.addEventListener('unhandledrejection', (event) => report(event.reason));
});
