export default defineEventHandler(async (event) => {
  const { data } = await getAuthSession(event);
  if (!data.userId) return { user: null };
  return { user: { username: data.username, role: data.role } };
});
