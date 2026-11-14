import { createElement as h, useState, type CSSProperties, type ReactElement } from 'react';
import { PALETTES, type Palette } from './palette.js';
import { pageLang, text } from './text.js';

export interface PreviewTabApi {
  /** Recolour the app served at this address. */
  setPalette(url: string, palette: Palette): Promise<void>;
}

const WIDTHS = [['desktop', '100%'], ['tablet', '820px'], ['phone', '390px']] as const;
const button: CSSProperties = { border: '1px solid rgba(128,128,128,0.35)', borderRadius: 6, padding: '3px 8px', fontSize: 12, background: 'transparent', color: 'inherit', cursor: 'pointer' };

/** The right-sidebar tab that shows a running app with width, reload and palette controls. */
export function createPreviewTab(api: PreviewTabApi): (props: { useTabInfo?: () => { tab?: { navigation?: { params?: { url?: string } } } } }) => ReactElement {
  return function PreviewTab(props): ReactElement {
    const strings = text(pageLang());
    const url = props.useTabInfo?.().tab?.navigation?.params?.url;
    const [width, setWidth] = useState<string>('100%');
    const [generation, setGeneration] = useState(0);
    if (!url) return h('div', { style: { padding: 24, fontSize: 13, opacity: 0.7 } }, strings.noPreview);

    return h('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', flexWrap: 'wrap', borderBottom: '1px solid rgba(128,128,128,0.25)' } },
        ...WIDTHS.map(([id, value]) => h('button', {
          key: id, type: 'button', 'aria-pressed': width === value, onClick: () => setWidth(value),
          style: width === value ? { ...button, borderColor: 'currentColor' } : button,
        }, strings[id])),
        h('button', { type: 'button', onClick: () => setGeneration((current) => current + 1), style: button }, strings.reload),
        h('a', { href: url, target: '_blank', rel: 'noopener', style: { ...button, textDecoration: 'none' } }, strings.external),
        h('span', { style: { flex: 1 } }),
        h('span', { style: { fontSize: 12, opacity: 0.6 } }, strings.palette),
        ...PALETTES.map((palette) => h('button', {
          key: palette.id, type: 'button', title: palette.id, 'aria-label': `${strings.palette}: ${palette.id}`,
          onClick: () => { void api.setPalette(url, palette).catch(() => {}); },
          style: { width: 18, height: 18, borderRadius: 999, border: `2px solid ${palette.bg}`, outline: '1px solid rgba(128,128,128,0.5)', background: palette.primary, cursor: 'pointer', padding: 0 },
        })),
      ),
      h('div', { style: { flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center', background: 'rgba(128,128,128,0.12)' } },
        h('iframe', { key: generation, src: url, title: strings.previewTitle, style: { width, maxWidth: '100%', height: '100%', border: 0, background: '#fff' } }),
      ),
    );
  };
}
