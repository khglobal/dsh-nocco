const table = {
  zh: {
    open: '打开预览', running: '预览运行中', stopped: '预览未运行', working: '预览处理中…',
    tagline: '描述你想要的系统，Nocco 为你构建。',
    placeholder: '今天 Nocco 能帮您做点什么？',
    build: '构建', next: '换一个', refresh: '重新生成', refreshing: '生成中…',
    designSystem: '设计体系',
    antdv: 'Ant Design · 桌面后台', shadcn: 'shadcn · 现代网页', vant: 'Vant · 移动端',
    fromModel: '由你的模型根据工作区和会话生成', fromSamples: '示例想法',
    previewTitle: '预览', desktop: '桌面', tablet: '平板', phone: '手机',
    reload: '刷新', external: '在浏览器中打开', palette: '配色', paletteHint: '点击色点，立即更换应用的配色（不消耗模型）', noPreview: '还没有正在运行的预览。',
    voice: '语音输入', voiceStop: '停止并转写', transcribing: '转写中…', voiceFailed: '语音输入失败，请检查麦克风权限和 DSH 的语音输入设置。',
    inspect: '选取元素', inspecting: '在预览里点击要修改的元素（Esc 取消）', pickedLine: '预览中选中的元素：', pickedPage: '页面', pickedFile: '组件文件',
    fontLine: '字体：', styleLine: '界面风格：', modeLine: '模式：', filesLine: '附件：',
    discuss: '讨论', discussHint: '先讨论方案，暂不动手构建', buildHint: '直接开始构建',
    attach: '添加文件', uploading: '上传中…', uploadFailed: '文件上传失败。', removeFile: '移除',
    tabColours: '颜色', tabTypography: '字体', tabFeatures: '风格',
    'sans-serif': '无衬线', serif: '衬线', monospace: '等宽', cursive: '手写', fantasy: '装饰',
    rounded: '圆角', border: '细边框', gradient: '渐变点缀', shadow: '柔和阴影', frosted: '毛玻璃',
    designLine: '设计体系：', paletteLine: '配色：', colours: '配色方案', defaultColours: '模板默认', customColour: '自定义主色',
    enhance: '优化提示词', enhanceFailed: '优化失败，请检查模型配置后重试。',
    history: '历史', saveCheckpoint: '保存检查点', restore: '恢复到这里', confirmRestore: '确认恢复', cancel: '取消',
    current: '当前', filesChanged: '{n} 个文件', noCheckpoints: '还没有检查点。',
    historyNote: '恢复会把应用的文件改回当时的样子，恢复前的状态也会保留为检查点。如果那个版本的数据表不同，它没有的表或列里的数据会被移除；恢复前会先在 .nocco/backups 里保存一份数据库副本。',
  },
  en: {
    open: 'Open preview', running: 'Preview running', stopped: 'Preview not running', working: 'Preview working…',
    tagline: 'Describe the system you want, and Nocco builds it.',
    placeholder: 'How can Nocco help you today?',
    build: 'Build', next: 'Next', refresh: 'Regenerate', refreshing: 'Generating…',
    designSystem: 'Design system',
    antdv: 'Ant Design · desktop admin', shadcn: 'shadcn · modern web', vant: 'Vant · mobile',
    fromModel: 'Suggested by your model from your workspaces and sessions', fromSamples: 'Sample ideas',
    previewTitle: 'Preview', desktop: 'Desktop', tablet: 'Tablet', phone: 'Phone',
    reload: 'Reload', external: 'Open in browser', palette: 'Palette', paletteHint: 'Click a dot to recolour the app at once, without using the model', noPreview: 'No preview is running yet.',
    voice: 'Voice input', voiceStop: 'Stop and transcribe', transcribing: 'Transcribing…', voiceFailed: 'Voice input failed. Check microphone permission and DSH\'s voice input settings.',
    inspect: 'Inspect', inspecting: 'Click the element to change in the preview (Esc cancels)', pickedLine: 'Selected in preview: ', pickedPage: 'page', pickedFile: 'component file',
    fontLine: 'Font: ', styleLine: 'Style: ', modeLine: 'Mode: ', filesLine: 'Files:',
    discuss: 'Discuss', discussHint: 'Talk the plan through before building', buildHint: 'Start building right away',
    attach: 'Attach files', uploading: 'Uploading…', uploadFailed: 'Could not upload the file.', removeFile: 'Remove',
    tabColours: 'Colours', tabTypography: 'Typography', tabFeatures: 'Features',
    'sans-serif': 'Sans serif', serif: 'Serif', monospace: 'Monospace', cursive: 'Cursive', fantasy: 'Fantasy',
    rounded: 'Rounded corners', border: 'Subtle border', gradient: 'Gradient accent', shadow: 'Soft shadow', frosted: 'Frosted glass',
    designLine: 'Design system: ', paletteLine: 'Palette: ', colours: 'Colour scheme', defaultColours: 'Template default', customColour: 'Custom main colour',
    enhance: 'Enhance prompt', enhanceFailed: 'Could not enhance the prompt. Check that a model is configured and try again.',
    history: 'History', saveCheckpoint: 'Save checkpoint', restore: 'Restore this', confirmRestore: 'Confirm restore', cancel: 'Cancel',
    current: 'current', filesChanged: '{n} files', noCheckpoints: 'No checkpoints yet.',
    historyNote: 'Restoring puts the app\'s files back as they were; the state before it is kept as a checkpoint too. If that version has different tables, data in tables or columns it lacks is removed. A copy of the database is saved in .nocco/backups first.',
  },
} as const;

export type Strings = { readonly [K in keyof (typeof table)['en']]: string };

/** Interface strings for the given language tag; English for anything but Chinese. */
export function text(lang: string): Strings {
  return lang.toLowerCase().startsWith('zh') ? table.zh : table.en;
}

/** The language tag of the page the plugin is rendered in. */
export const pageLang = (): string => document.documentElement.lang || navigator.language || 'en';
