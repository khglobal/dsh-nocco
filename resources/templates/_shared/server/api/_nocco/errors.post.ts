// Development only: pages report their runtime errors here so the preview can show them.
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) throw createError({ statusCode: 404 });
  const body = await readBody<{ message?: unknown; page?: unknown }>(event);
  const message = String(body?.message ?? '').slice(0, 600);
  if (message) devErrors.add({ message, page: String(body?.page ?? '').slice(0, 200), time: Date.now() });
  return { ok: true };
});
