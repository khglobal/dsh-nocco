export interface AuthUser {
  username: string;
  role: string;
}

/** Sign-in state shared by every page. */
export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null);
  const loaded = useState<boolean>('auth-loaded', () => false);

  async function refresh(): Promise<void> {
    const result = await $fetch<{ user: AuthUser | null }>('/api/auth/me');
    user.value = result.user;
    loaded.value = true;
  }

  async function login(username: string, password: string): Promise<void> {
    user.value = await $fetch<AuthUser>('/api/auth/login', { method: 'POST', body: { username, password } });
    loaded.value = true;
  }

  async function logout(): Promise<void> {
    await $fetch('/api/auth/logout', { method: 'POST' });
    user.value = null;
    await navigateTo('/login');
  }

  /** True when the signed-in user holds one of the given roles. */
  const hasRole = (...roles: string[]): boolean => Boolean(user.value && roles.includes(user.value.role));

  return { user, loaded, refresh, login, logout, hasRole };
}
