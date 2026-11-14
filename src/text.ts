const table = {
  zh: {
    open: '打开预览', running: '预览运行中', stopped: '预览未运行',
    tagline: '描述你想要的系统，Nocco 为你构建。',
    placeholder: '今天 Nocco 能帮您做点什么？',
    build: '构建', next: '换一个', refresh: '重新生成', refreshing: '生成中…',
    designSystem: '设计体系',
    antdv: 'Ant Design · 桌面后台', shadcn: 'shadcn · 现代网页', vant: 'Vant · 移动端',
    fromModel: '由你的模型根据工作区和会话生成', fromSamples: '示例想法',
    previewTitle: '预览', desktop: '桌面', tablet: '平板', phone: '手机',
    reload: '刷新', external: '在浏览器中打开', palette: '配色', noPreview: '还没有正在运行的预览。',
    designLine: '设计体系：',
  },
  en: {
    open: 'Open preview', running: 'Preview running', stopped: 'Preview not running',
    tagline: 'Describe the system you want, and Nocco builds it.',
    placeholder: 'How can Nocco help you today?',
    build: 'Build', next: 'Next', refresh: 'Regenerate', refreshing: 'Generating…',
    designSystem: 'Design system',
    antdv: 'Ant Design · desktop admin', shadcn: 'shadcn · modern web', vant: 'Vant · mobile',
    fromModel: 'Suggested by your model from your workspaces and sessions', fromSamples: 'Sample ideas',
    previewTitle: 'Preview', desktop: 'Desktop', tablet: 'Tablet', phone: 'Phone',
    reload: 'Reload', external: 'Open in browser', palette: 'Palette', noPreview: 'No preview is running yet.',
    designLine: 'Design system: ',
  },
} as const;

export type Strings = { readonly [K in keyof (typeof table)['en']]: string };

/** Interface strings for the given language tag; English for anything but Chinese. */
export function text(lang: string): Strings {
  return lang.toLowerCase().startsWith('zh') ? table.zh : table.en;
}

/** The language tag of the page the plugin is rendered in. */
export const pageLang = (): string => document.documentElement.lang || navigator.language || 'en';
