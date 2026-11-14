// Every /api route needs a signed-in user, except the sign-in routes and the
// development-only routes under /api/_nocco, which do not exist in a built app.
// An app created with sign-in off leaves its routes open; a route that must
// stay restricted there calls requireUser or requireRole itself.
export default defineEventHandler(async (event) => {
  if (useRuntimeConfig(event).public.signIn === 'off') return;
  const path = getRequestURL(event).pathname;
  if (!path.startsWith('/api/') || path.startsWith('/api/auth/') || path.startsWith('/api/_nocco/')) return;
  await requireUser(event);
});
