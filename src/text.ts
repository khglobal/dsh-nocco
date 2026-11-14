const table = {
  zh: { open: '打开预览', running: '预览运行中', stopped: '预览未运行' },
  en: { open: 'Open preview', running: 'Preview running', stopped: 'Preview not running' },
} as const;

/** Tool-view strings for the given language tag; English for anything but Chinese. */
export function text(lang: string): { open: string; running: string; stopped: string } {
  return lang.toLowerCase().startsWith('zh') ? table.zh : table.en;
}
