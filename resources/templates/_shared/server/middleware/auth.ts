// Every /api route needs a signed-in user, except the sign-in routes and the
// development-only routes under /api/_nocco, which do not exist in a built app.
export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname;
  if (!path.startsWith('/api/') || path.startsWith('/api/auth/') || path.startsWith('/api/_nocco/')) return;
  await requireUser(event);
});
