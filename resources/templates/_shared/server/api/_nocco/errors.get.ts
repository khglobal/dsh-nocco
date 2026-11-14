// Development only: hand the reported page errors to the preview and forget them.
export default defineEventHandler(() => {
  if (!import.meta.dev) throw createError({ statusCode: 404 });
  return { errors: devErrors.take() };
});
