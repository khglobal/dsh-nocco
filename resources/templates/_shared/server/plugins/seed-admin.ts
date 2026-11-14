import { count } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';

// On first start, create the admin account from the password in .env.
export default defineNitroPlugin(async () => {
  const password = process.env.NOCCO_ADMIN_PASSWORD;
  if (!password) return;
  try {
    const [row] = await db.select({ total: count() }).from(users);
    if (row && row.total > 0) return;
    await db.insert(users).values({ username: 'admin', passwordHash: hashPassword(password), role: 'admin' });
  } catch (error) {
    console.error('[seed-admin] could not create the admin account:', error);
  }
});
