import type { H3Event } from 'h3';

export interface SessionUser {
  userId: number;
  username: string;
  role: string;
}

/** The signed-in session, sealed in a cookie with the secret from .env. */
export function getAuthSession(event: H3Event) {
  return useSession<Partial<SessionUser>>(event, {
    password: process.env.NUXT_SESSION_PASSWORD || '',
    name: 'app-session',
    maxAge: 60 * 60 * 24 * 7,
    // While developing, the app is shown inside the Nocco preview, which is a
    // different site from the app itself, so the cookie must be allowed in a
    // cross-site frame. Browsers accept a Secure cookie on loopback addresses.
    cookie: import.meta.dev
      ? { sameSite: 'none', secure: true }
      : { sameSite: 'lax', secure: getRequestProtocol(event) === 'https' },
  });
}

/** The signed-in user, or a 401 error. */
export async function requireUser(event: H3Event): Promise<SessionUser> {
  const { data } = await getAuthSession(event);
  if (!data.userId || !data.username || !data.role) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' });
  }
  return { userId: data.userId, username: data.username, role: data.role };
}

/** The signed-in user if they hold one of the roles, or a 403 error. */
export async function requireRole(event: H3Event, ...roles: string[]): Promise<SessionUser> {
  const user = await requireUser(event);
  if (!roles.includes(user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Not allowed for this role' });
  }
  return user;
}
