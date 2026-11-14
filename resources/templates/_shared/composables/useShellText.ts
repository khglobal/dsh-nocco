const table = {
  zh: {
    signIn: '登录', username: '用户名', password: '密码',
    usernameRequired: '请输入用户名', passwordRequired: '请输入密码',
    wrongCredentials: '用户名或密码不正确',
  },
  en: {
    signIn: 'Sign in', username: 'Username', password: 'Password',
    usernameRequired: 'Enter your username', passwordRequired: 'Enter your password',
    wrongCredentials: 'Wrong username or password',
  },
} as const;

/** True when the app was created in Chinese. */
export const useIsChinese = (): boolean => String(useRuntimeConfig().public.lang).toLowerCase().startsWith('zh');

/** Text of the built-in pages, in the language the app was created in. */
export const useShellText = () => (useIsChinese() ? table.zh : table.en);
