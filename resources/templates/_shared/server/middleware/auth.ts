// Every /api route needs a signed-in user, except the sign-in routes.
export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname;
  if (!path.startsWith('/api/') || path.startsWith('/api/auth/')) return;
  await requireUser(event);
});
