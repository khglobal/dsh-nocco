// Signed-out visitors go to /login; signed-in visitors skip it.
export default defineNuxtRouteMiddleware(async (to) => {
  const { user, loaded, refresh } = useAuth();
  if (!loaded.value) await refresh();
  if (!user.value && to.path !== '/login') return navigateTo('/login');
  if (user.value && to.path === '/login') return navigateTo('/');
});
