import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { users } from '../../db/schema';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event);
  const username = String(body?.username ?? '').trim();
  const password = String(body?.password ?? '');
  const [user] = username ? await db.select().from(users).where(eq(users.username, username)) : [];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: 'Wrong username or password' });
  }
  const session = await getAuthSession(event);
  await session.update({ userId: user.id, username: user.username, role: user.role });
  return { username: user.username, role: user.role };
});
