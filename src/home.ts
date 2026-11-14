import { createElement as h, useEffect, useRef, useState, type CSSProperties, type ReactElement } from 'react';
import { buildDraft, type DesignSystemId } from './draft.js';
import { pageLang, text } from './text.js';

export interface HomeApi {
  /** Suggested builds; `refresh` asks the model again. */
  suggestions(lang: string, refresh: boolean): Promise<{ suggestions: string[]; source: 'model' | 'fallback' }>;
  /** Open a new session with this draft. */
  start(draft: string): void;
}

const ACCENT = '#24456D';
const DESIGN_SYSTEMS: readonly DesignSystemId[] = ['antdv', 'shadcn', 'vant'];
const CACHE_KEY = 'dsh-nocco.suggestions';

const chip: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '5px 12px',
  fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(128,128,128,0.35)',
  background: 'transparent', color: 'inherit',
};
const primary: CSSProperties = { ...chip, border: 0, padding: '6px 14px', background: ACCENT, color: '#fff', boxShadow: '0 1px 2px rgba(30,64,140,0.25)' };

function readCache(lang: string): string[] | undefined {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as { lang?: string; suggestions?: unknown } | null;
    return cached?.lang === lang && Array.isArray(cached.suggestions) ? (cached.suggestions as string[]) : undefined;
  } catch { return undefined; }
}

/** One lane that types a suggestion, holds it, erases it and moves to the next. */
function useTypewriter(prompts: readonly string[], index: number, advance: () => void): string {
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState<'typing' | 'holding' | 'erasing'>('typing');
  const full = prompts[index] ?? '';
  useEffect(() => { setTyped(''); setPhase('typing'); }, [full]);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (phase === 'typing') {
      timer = typed.length < full.length
        ? setTimeout(() => setTyped(full.slice(0, typed.length + 1)), 75)
        : setTimeout(() => setPhase('holding'), 4000);
    } else if (phase === 'holding') {
      timer = setTimeout(() => setPhase('erasing'), 800);
    } else {
      timer = typed.length > 0 ? setTimeout(() => setTyped(full.slice(0, typed.length - 1)), 30) : setTimeout(advance, 0);
    }
    return () => clearTimeout(timer);
  }, [typed, phase, full, advance]);
  return typed;
}

/** The Nocco home page: prompt box, design-system choice and suggested builds. */
export function createHome(api: HomeApi): () => ReactElement {
  return function Home(): ReactElement {
    const lang = pageLang();
    const strings = text(lang);
    const [request, setRequest] = useState('');
    const [designSystem, setDesignSystem] = useState<DesignSystemId>('antdv');
    const [prompts, setPrompts] = useState<string[]>(() => readCache(lang) ?? []);
    const [source, setSource] = useState<'model' | 'fallback'>('fallback');
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const alive = useRef(true);
    useEffect(() => () => { alive.current = false; }, []);

    const load = (refresh: boolean): void => {
      setLoading(true);
      api.suggestions(lang, refresh).then((result) => {
        if (!alive.current) return;
        setPrompts(result.suggestions);
        setSource(result.source);
        setIndex(0);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ lang, suggestions: result.suggestions })); } catch { /* storage unavailable */ }
      }).catch(() => { /* keep what is shown */ }).finally(() => { if (alive.current) setLoading(false); });
    };
    useEffect(() => { load(false); }, []);

    const next = (): void => setIndex((current) => (prompts.length > 0 ? (current + 1) % prompts.length : 0));
    const typed = useTypewriter(prompts, index, next);
    const build = (value: string): void => { if (value.trim()) api.start(buildDraft(value, designSystem, strings)); };

    return h('div', { style: { height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', boxSizing: 'border-box' } },
      h('div', { style: { width: 'min(820px, 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 } },
        h('h1', { style: { margin: 0, fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em' } }, 'Nocco'),
        h('p', { style: { margin: 0, fontSize: 16, opacity: 0.7, textAlign: 'center' } }, strings.tagline),
        h('div', { style: { width: '100%', borderRadius: 16, border: '1px solid rgba(128,128,128,0.3)', padding: 14, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 } },
          h('textarea', {
            value: request, rows: 3, placeholder: strings.placeholder, 'aria-label': strings.placeholder,
            onChange: (event: { target: { value: string } }) => setRequest(event.target.value),
            onKeyDown: (event: { key: string; metaKey: boolean; ctrlKey: boolean }) => { if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) build(request); },
            style: { width: '100%', resize: 'vertical', border: 0, outline: 'none', background: 'transparent', color: 'inherit', font: 'inherit', fontSize: 15, lineHeight: 1.5, boxSizing: 'border-box' },
          }),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
            h('span', { style: { fontSize: 12, opacity: 0.6 } }, strings.designSystem),
            ...DESIGN_SYSTEMS.map((id) => h('button', {
              key: id, type: 'button', 'aria-pressed': designSystem === id, onClick: () => setDesignSystem(id),
              style: designSystem === id ? { ...chip, borderColor: ACCENT, boxShadow: `inset 0 0 0 1px ${ACCENT}` } : chip,
            }, strings[id])),
            h('span', { style: { flex: 1 } }),
            h('button', { type: 'button', disabled: !request.trim(), onClick: () => build(request), style: { ...primary, opacity: request.trim() ? 1 : 0.5 } }, strings.build),
          ),
        ),
        h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 12 } },
          h('div', { 'aria-live': 'off', style: { minHeight: 26, fontSize: 15, textAlign: 'center' } },
            typed,
            h('span', { 'aria-hidden': true, style: { display: 'inline-block', width: 1.5, height: '0.95em', marginLeft: 2, verticalAlign: 'middle', background: ACCENT } }),
          ),
          h('div', { style: { display: 'inline-flex', gap: 8 } },
            h('button', { type: 'button', disabled: prompts.length === 0, onClick: () => build(prompts[index] ?? ''), style: primary }, strings.build),
            h('button', { type: 'button', disabled: prompts.length < 2, onClick: next, style: chip }, strings.next),
            h('button', { type: 'button', disabled: loading, onClick: () => load(true), style: chip }, loading ? strings.refreshing : strings.refresh),
          ),
          h('div', { style: { fontSize: 11, opacity: 0.5 } }, source === 'model' ? strings.fromModel : strings.fromSamples),
        ),
      ),
    );
  };
}

/** The sidebar icon for the home page. */
export function HomeIcon(props: { size?: number }): ReactElement {
  const size = props.size ?? 16;
  return h('svg', { width: size, height: size, viewBox: '0 0 64 64', 'aria-hidden': true },
    h('rect', { width: 64, height: 64, rx: 14, fill: ACCENT }),
    h('path', { d: 'M20 46V18h5l14 19V18h5v28h-5L25 27v19z', fill: '#fff' }),
  );
}
