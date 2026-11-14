// Signed-out visitors go to /login; signed-in visitors skip it. An app
// created with sign-in off is open to everyone and never redirects.
export default defineNuxtRouteMiddleware(async (to) => {
  const required = useRuntimeConfig().public.signIn !== 'off';
  const { user, loaded, refresh } = useAuth();
  if (!loaded.value) await refresh();
  if (required && !user.value && to.path !== '/login') return navigateTo('/login');
  if (user.value && to.path === '/login') return navigateTo('/');
});
