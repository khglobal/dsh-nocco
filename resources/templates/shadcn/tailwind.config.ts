import type { Config } from 'tailwindcss';

/** A palette colour as a Tailwind colour that still accepts an opacity, such as `bg-primary/80`. */
const tone = (name: string, fallback: string): string =>
  `color-mix(in srgb, var(--nocco-${name}, ${fallback}) calc(<alpha-value> * 100%), transparent)`;

export default {
  darkMode: 'class',
  content: [
    './components/**/*.{js,ts,vue}',
    './composables/**/*.{js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      // Every theme colour comes from the app's palette in
      // assets/css/design-scheme.css, so the components follow the colour
      // scheme the user picks. `tone` keeps Tailwind's opacity modifiers working.
      colors: {
        border: tone('border', '#e5e7eb'),
        input: tone('border', '#e5e7eb'),
        ring: tone('primary', '#9E7FFF'),
        background: tone('bg', '#ffffff'),
        foreground: tone('text', '#171717'),
        primary: { DEFAULT: tone('primary', '#9E7FFF'), foreground: tone('on-primary', '#ffffff') },
        secondary: { DEFAULT: tone('surface', '#f7f7f7'), foreground: tone('text', '#171717') },
        destructive: { DEFAULT: tone('error', '#ef4444'), foreground: '#ffffff' },
        muted: { DEFAULT: tone('surface', '#f7f7f7'), foreground: tone('text-secondary', '#4b5563') },
        accent: { DEFAULT: tone('surface', '#f7f7f7'), foreground: tone('text', '#171717') },
        popover: { DEFAULT: tone('bg', '#ffffff'), foreground: tone('text', '#171717') },
        card: { DEFAULT: tone('bg', '#ffffff'), foreground: tone('text', '#171717') },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
} satisfies Config;
