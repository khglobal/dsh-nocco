import { createElement as h, useEffect, useRef, useState, type CSSProperties, type ReactElement } from 'react';
import { buildDraft, FEATURES, FONTS, type DesignSystemId, type FeatureId, type FontId, type Mode } from './draft.js';
import { FONT_STACKS, PALETTES } from './palette.js';
import { pageLang, text } from './text.js';
import { startRecording, type Recording } from './voice.js';

export interface HomeApi {
  /** Suggested builds; `refresh` asks the model again. */
  suggestions(lang: string, refresh: boolean): Promise<{ suggestions: string[]; source: 'model' | 'fallback' }>;
  /** Rewrite a rough request into a clearer one with the user's model. */
  enhance(request: string): Promise<string>;
  /** Whether DSH's voice input is enabled and ready. */
  voiceAvailable(): Promise<boolean>;
  /** Turn one WAV recording into text with DSH's speech service. */
  transcribe(wav: Uint8Array): Promise<string>;
  /** Keep an attached file where the agent can read it; returns its path there. */
  upload(file: File): Promise<{ name: string; path: string }>;
  /** Open a new session with this draft. */
  start(draft: string): void;
}

const DESIGN_SYSTEMS: readonly DesignSystemId[] = ['antdv', 'shadcn', 'vant', 'retro'];
const CACHE_KEY = 'dsh-nocco.suggestions';

/** The Nocco look in light and dark, taken from the Nocco web app's own tokens. */
const THEMES = {
  light: {
    paper: 'linear-gradient(180deg, #f7f9fc 0%, #eef2f8 100%)', surface: 'rgba(255,255,255,0.86)', raised: '#ffffff',
    text: '#141c28', muted: '#5b6472', faint: '#8a93a1', line: 'rgba(20,28,40,0.12)', accent: '#24456D', hover: 'rgba(20,28,40,0.06)',
    shadow: '0 1px 2px rgba(20,28,40,0.04), 0 12px 32px -12px rgba(20,28,40,0.18)', vignette: 'rgba(22,34,64,0.08)', glow: 1,
  },
  dark: {
    paper: 'linear-gradient(180deg, #0e1218 0%, #161b25 100%)', surface: 'rgba(24,29,37,0.82)', raised: '#1e242e',
    text: '#eef1f6', muted: '#a5adba', faint: '#7c8593', line: 'rgba(255,255,255,0.12)', accent: '#5A7FBB', hover: 'rgba(255,255,255,0.08)',
    shadow: '0 1px 2px rgba(0,0,0,0.3), 0 12px 32px -12px rgba(0,0,0,0.6)', vignette: 'rgba(0,0,0,0.3)', glow: 0.55,
  },
} as const;
type Theme = (typeof THEMES)[keyof typeof THEMES];

const KEYFRAMES = `
@keyframes noccoAuroraA { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(80px,30px) scale(1.08); } 66% { transform: translate(40px,60px) scale(1.05); } }
@keyframes noccoAuroraB { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(-90px,-40px) scale(1.10); } 66% { transform: translate(-30px,-70px) scale(1.06); } }
@keyframes noccoAuroraC { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(60px,-40px) scale(1.06); } 66% { transform: translate(90px,20px) scale(1.10); } }
@keyframes noccoPromptLine { 0% { stroke-dashoffset: 0; visibility: visible; } 28.5% { stroke-dashoffset: -320; visibility: visible; } 29%, 99% { stroke-dashoffset: -320; visibility: hidden; } 99.5% { stroke-dashoffset: 0; visibility: hidden; } 100% { stroke-dashoffset: 0; visibility: visible; } }
@keyframes noccoTypewriterCaret { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes noccoPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
@keyframes noccoSpin { to { transform: rotate(360deg); } }
@keyframes noccoFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.nocco-home textarea::placeholder { color: var(--nocco-home-faint); }
@media (prefers-reduced-motion: reduce) { .nocco-home * { animation: none !important; } }
`;

/**
 * Whether the host page is showing its dark theme. DSH states the theme as the
 * page's colour scheme; the system preference stands in when it states none.
 */
function hostIsDark(): boolean {
  try {
    const scheme = getComputedStyle(document.documentElement).colorScheme;
    if (/\bdark\b/.test(scheme) && !/\blight\b/.test(scheme)) return true;
    if (/\blight\b/.test(scheme) && !/\bdark\b/.test(scheme)) return false;
    return matchMedia('(prefers-color-scheme: dark)').matches;
  } catch { return false; }
}

/** The Nocco theme matching the host's, kept current while the host switches themes. */
function useTheme(): Theme {
  const [dark, setDark] = useState(hostIsDark);
  useEffect(() => {
    const update = (): void => setDark(hostIsDark());
    const watcher = new MutationObserver(update);
    watcher.observe(document.documentElement, { attributes: true });
    const system = matchMedia('(prefers-color-scheme: dark)');
    system.addEventListener('change', update);
    return () => { watcher.disconnect(); system.removeEventListener('change', update); };
  }, []);
  return dark ? THEMES.dark : THEMES.light;
}

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

const blob = (style: CSSProperties): ReactElement => h('div', { style: { position: 'absolute', borderRadius: '50%', ...style } });

/** The ambient backdrop of the Nocco home page: slow aurora clouds over a paper gradient. */
function Backdrop(props: { theme: Theme }): ReactElement {
  const { theme } = props;
  return h('div', { 'aria-hidden': true, style: { position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', background: theme.paper } },
    h('div', { style: { position: 'absolute', inset: 0, opacity: theme.glow } },
      blob({ top: -220, left: '50%', width: 1100, height: 1100, marginLeft: -550, background: 'radial-gradient(circle, oklch(0.62 0.20 295 / 0.42) 0%, transparent 65%)', filter: 'blur(55px)', animation: 'noccoAuroraA 240s linear infinite' }),
      blob({ bottom: -280, right: -140, width: 900, height: 900, background: 'radial-gradient(circle, oklch(0.55 0.22 310 / 0.38) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'noccoAuroraB 300s linear infinite' }),
      blob({ top: -120, left: -180, width: 680, height: 680, background: 'radial-gradient(circle, oklch(0.72 0.16 220 / 0.34) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'noccoAuroraC 270s linear infinite' }),
      blob({ top: -180, left: '50%', marginLeft: -550, width: 1100, height: 1100, background: 'radial-gradient(circle, oklch(0.55 0.16 255 / 0.30) 0%, oklch(0.55 0.16 255 / 0.10) 35%, transparent 65%)', filter: 'blur(40px)' }),
      blob({ bottom: -260, right: -140, width: 820, height: 820, background: 'radial-gradient(circle, oklch(0.5 0.15 240 / 0.26) 0%, oklch(0.5 0.15 240 / 0.10) 40%, transparent 70%)', filter: 'blur(50px)' }),
      blob({ top: 120, left: -200, width: 700, height: 700, background: 'radial-gradient(circle, oklch(0.70 0.13 200 / 0.22) 0%, transparent 65%)', filter: 'blur(60px)' }),
    ),
    h('div', { style: { position: 'absolute', inset: 0, background: `radial-gradient(ellipse 120% 80% at 50% 50%, transparent 50%, ${theme.vignette} 100%)` } }),
  );
}

const stroke = { stroke: 'currentColor', fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const arrowRight = h('svg', { width: 11, height: 11, viewBox: '0 0 12 12', 'aria-hidden': true }, h('path', { d: 'M2 6h8M7 3l3 3-3 3', strokeWidth: 1.4, ...stroke }));
const arrowUp = h('svg', { width: 12, height: 12, viewBox: '0 0 12 12', 'aria-hidden': true }, h('path', { d: 'M6 2v8M3 5l3-3 3 3', strokeWidth: 1.6, ...stroke }));
const cycle = h('svg', { width: 11, height: 11, viewBox: '0 0 16 16', 'aria-hidden': true }, h('path', { d: 'M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5V5h-2.5', strokeWidth: 1.4, ...stroke }));
const sparkle = h('svg', { width: 11, height: 11, viewBox: '0 0 16 16', 'aria-hidden': true }, h('path', { d: 'M8 2l1.4 4.1L13.5 8l-4.1 1.4L8 13.5 6.6 9.4 2.5 8l4.1-1.9z', strokeWidth: 1.3, ...stroke }));
const cube = h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', 'aria-hidden': true, style: { opacity: 0.7 } }, h('path', { d: 'M8 1.8l5.4 3v6.4L8 14.2l-5.4-3V4.800zM2.800 4.900L8 7.900l5.200-3M8 7.900v6.200', strokeWidth: 1.2, ...stroke }));
const stars = h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true }, h('path', {
  fill: 'currentColor', fillRule: 'evenodd',
  d: 'M11.5 6a.5.5 0 0 1-.475-.342l-.263-.789a1 1 0 0 0-.632-.632l-.789-.263a.5.5 0 0 1 0-.949l.789-.263a1 1 0 0 0 .632-.632l.264-.79a.5.5 0 0 1 .948 0l.264.79a1 1 0 0 0 .632.632l.789.263a.5.5 0 0 1 0 .949l-.789.263a1 1 0 0 0-.632.632l-.264.789A.5.5 0 0 1 11.5 6ZM6 13a.667.667 0 0 1-.647-.505l-.23-.92a2.337 2.337 0 0 0-1.696-1.698l-.92-.23a.666.666 0 0 1 0-1.293l.92-.23a2.337 2.337 0 0 0 1.697-1.697l.23-.92a.667.667 0 0 1 1.293 0l.23.92a2.333 2.333 0 0 0 1.696 1.697l.92.23a.666.666 0 0 1 0 1.294l-.92.229a2.332 2.332 0 0 0-1.697 1.697l-.23.921A.667.667 0 0 1 6 13Z',
}), h('path', { d: 'M13.5 9.2l1.25 4.05 4.05 1.25-4.05 1.25-1.25 4.05-1.25-4.05L8.2 14.500l4.050-1.250z', fill: 'currentColor' }));
const spinner = h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', 'aria-hidden': true, style: { animation: 'noccoSpin 800ms linear infinite' } },
  h('circle', { cx: 12, cy: 12, r: 9, fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, opacity: 0.25 }),
  h('path', { d: 'M21 12a9 9 0 0 0-9-9', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' }));
const swatches = h('svg', { width: 15, height: 15, viewBox: '0 0 16 16', 'aria-hidden': true, style: { opacity: 0.75 } },
  h('path', { d: 'M8 1.800a6.200 6.200 0 1 0 0 12.400c.900 0 1.400-.600 1.400-1.300 0-.900-.800-1.200-.800-2 0-.700.600-1.200 1.300-1.200h1.500a2.800 2.800 0 0 0 2.800-2.800C14.200 4.100 11.400 1.800 8 1.800z', strokeWidth: 1.2, ...stroke }),
  h('circle', { cx: 5.2, cy: 7.4, r: 0.9, fill: 'currentColor' }), h('circle', { cx: 7.4, cy: 4.800, r: 0.9, fill: 'currentColor' }), h('circle', { cx: 10.600, cy: 5.600, r: 0.9, fill: 'currentColor' }));
const paperclip = h('svg', { width: 15, height: 15, viewBox: '0 0 16 16', 'aria-hidden': true, style: { opacity: 0.75 } },
  h('path', { d: 'M13.200 7.300l-5.300 5.300a3.200 3.200 0 0 1-4.500-4.500l5.600-5.600a2.100 2.100 0 0 1 3 3l-5.600 5.600a1 1 0 0 1-1.500-1.500l5-5', strokeWidth: 1.2, ...stroke }));
const microphone = h('svg', { width: 15, height: 15, viewBox: '0 0 16 16', 'aria-hidden': true },
  h('rect', { x: 5.750, y: 1.750, width: 4.500, height: 7.500, rx: 2.250, strokeWidth: 1.2, ...stroke }),
  h('path', { d: 'M3.500 7.500a4.500 4.500 0 0 0 9 0M8 12v2.250', strokeWidth: 1.2, ...stroke }));
const caret = h('svg', { width: 10, height: 10, viewBox: '0 0 12 12', 'aria-hidden': true, style: { opacity: 0.6 } }, h('path', { d: 'M3 4.500l3 3 3-3', strokeWidth: 1.4, ...stroke }));

/** The Nocco home page: the Nocco web app's home, with a prompt box, design-system choice and suggested builds. */
export function createHome(api: HomeApi): () => ReactElement {
  return function Home(): ReactElement {
    const lang = pageLang();
    const strings = text(lang);
    const theme = useTheme();
    const [request, setRequest] = useState('');
    const [designSystem, setDesignSystem] = useState<DesignSystemId>('antdv');
    const [choosing, setChoosing] = useState(false);
    // An offered palette's id, a custom `#rrggbb` main colour, or nothing for the template's own colours.
    const [palette, setPalette] = useState<string | undefined>();
    const [colouring, setColouring] = useState(false);
    const [tab, setTab] = useState<'colours' | 'typography' | 'features'>('colours');
    const [font, setFont] = useState<FontId | undefined>();
    const [features, setFeatures] = useState<readonly FeatureId[]>([]);
    const [mode, setMode] = useState<Mode>('build');
    const [files, setFiles] = useState<readonly { name: string; path: string }[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadFailed, setUploadFailed] = useState(false);
    const picker = useRef<HTMLInputElement | null>(null);
    const attach = (chosen: readonly File[]): void => {
      if (chosen.length === 0) return;
      setUploading(true);
      setUploadFailed(false);
      Promise.all(chosen.map((file) => api.upload(file)))
        .then((saved) => { if (alive.current) setFiles((current) => [...current, ...saved]); })
        .catch(() => { if (alive.current) setUploadFailed(true); })
        .finally(() => { if (alive.current) setUploading(false); });
    };
    // Voice input is offered only while DSH's own voice input is enabled and ready.
    const [voice, setVoice] = useState<'absent' | 'idle' | 'recording' | 'transcribing'>('absent');
    const [voiceFailed, setVoiceFailed] = useState(false);
    const recording = useRef<Recording | undefined>(undefined);
    useEffect(() => {
      api.voiceAvailable().then((available) => { if (alive.current && available) setVoice('idle'); }).catch(() => {});
      return () => recording.current?.cancel();
    }, []);
    const toggleVoice = (): void => {
      setVoiceFailed(false);
      if (voice === 'idle') {
        setVoice('recording');
        startRecording().then((started) => {
          if (!alive.current) return started.cancel();
          recording.current = started;
        }).catch(() => { if (alive.current) { setVoice('idle'); setVoiceFailed(true); } });
      } else if (voice === 'recording' && recording.current) {
        const active = recording.current;
        recording.current = undefined;
        setVoice('transcribing');
        active.stop().then((wav) => api.transcribe(wav)).then((spoken) => {
          if (alive.current && spoken) setRequest((current) => (current.trim() ? `${current.trimEnd()} ${spoken}` : spoken));
        }).catch(() => { if (alive.current) setVoiceFailed(true); })
          .finally(() => { if (alive.current) setVoice('idle'); });
      }
    };
    const paletteColour = PALETTES.find((item) => item.id === palette)?.primary ?? palette;
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
    const build = (value: string): void => {
      if (value.trim() && !uploading) api.start(buildDraft(value, { designSystem, palette, font, features, mode, files: files.map((file) => file.path) }, strings));
    };
    const canSend = request.trim().length > 0;
    // The box grows with what is typed, up to a limit, as the original does.
    const box = useRef<HTMLTextAreaElement | null>(null);
    useEffect(() => {
      const element = box.current;
      if (!element) return;
      element.style.height = 'auto';
      element.style.height = `${Math.min(element.scrollHeight, 240)}px`;
    }, [request]);
    const [enhancing, setEnhancing] = useState(false);
    const [enhanceFailed, setEnhanceFailed] = useState(false);
    const enhance = (): void => {
      if (!canSend || enhancing) return;
      setEnhancing(true);
      setEnhanceFailed(false);
      api.enhance(request).then((better) => { if (alive.current) setRequest(better); })
        .catch(() => { if (alive.current) setEnhanceFailed(true); })
        .finally(() => { if (alive.current) setEnhancing(false); });
    };

    const pill: CSSProperties = {
      // `font` comes first: it is a shorthand and would otherwise reset the size and weight after it.
      font: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 500,
      cursor: 'pointer', border: `1px solid ${theme.line}`, background: theme.surface, color: theme.muted, backdropFilter: 'blur(8px)',
    };
    const solidPill: CSSProperties = { ...pill, border: 0, padding: '6px 14px', background: theme.accent, color: '#fff', boxShadow: '0 1px 2px rgba(30,64,140,0.25)' };

    return h('div', { className: 'nocco-home', style: { position: 'relative', height: '100%', overflow: 'hidden', color: theme.text, ['--nocco-home-faint' as string]: theme.faint } },
      h('style', null, KEYFRAMES),
      h(Backdrop, { theme }),
      h('div', { style: { position: 'relative', height: '100%', overflowY: 'auto', boxSizing: 'border-box', padding: '0 24px 48px' } },
        // Intro
        h('div', { style: { maxWidth: 672, margin: 'clamp(40px, 12vh, 110px) auto 0', textAlign: 'center', animation: 'noccoFadeIn 500ms ease both' } },
          h('h1', { style: { margin: '0 0 16px', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em', fontSize: 'clamp(48px, 7vw, 72px)', color: theme.text } }, 'Nocco'),
          h('p', { style: { margin: '0 0 32px', fontSize: 19, lineHeight: 1.5, color: theme.muted, animation: 'noccoFadeIn 500ms 200ms ease both' } }, strings.tagline),
        ),
        // Prompt card
        h('div', { style: { position: 'relative', width: 'min(672px, 100%)', margin: '0 auto', padding: 12, boxSizing: 'border-box', borderRadius: 12, border: `1px solid ${theme.line}`, background: theme.surface, backdropFilter: 'blur(12px)', boxShadow: theme.shadow } },
          h('svg', { 'aria-hidden': true, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 12, overflow: 'visible', pointerEvents: 'none' } },
            h('defs', null, h('linearGradient', { id: 'nocco-home-line', x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
              h('stop', { offset: '0%', stopColor: '#5A7FBB', stopOpacity: 0 }), h('stop', { offset: '40%', stopColor: '#5A7FBB', stopOpacity: 0.95 }),
              h('stop', { offset: '60%', stopColor: '#24456D', stopOpacity: 0.95 }), h('stop', { offset: '100%', stopColor: '#24456D', stopOpacity: 0 }))),
            h('rect', { x: 0, y: 0, width: '100%', height: '100%', rx: 12, pathLength: 320, strokeLinecap: 'round', strokeDasharray: '14 306', fill: 'transparent', stroke: 'url(#nocco-home-line)', strokeWidth: 1.5, style: { animation: 'noccoPromptLine 7s linear infinite' } }),
          ),
          files.length > 0 || uploading || uploadFailed ? h('div', { style: { position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 8px 0' } },
            ...files.map((file) => h('span', { key: file.path, title: file.path, style: { display: 'inline-flex', alignItems: 'center', gap: 6, maxWidth: '100%', padding: '3px 4px 3px 8px', borderRadius: 6, fontSize: 12, color: theme.text, background: theme.hover } },
              h('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, file.name),
              h('button', {
                type: 'button', title: strings.removeFile, 'aria-label': `${strings.removeFile}: ${file.name}`,
                onClick: () => setFiles((current) => current.filter((item) => item.path !== file.path)),
                style: { width: 18, height: 18, padding: 0, border: 0, borderRadius: 4, background: 'transparent', color: theme.muted, cursor: 'pointer', fontSize: 14, lineHeight: 1 },
              }, '×'))),
            uploading ? h('span', { style: { fontSize: 12, color: theme.muted, padding: '3px 4px' } }, strings.uploading) : null,
            uploadFailed ? h('span', { role: 'alert', style: { fontSize: 12, color: '#b42318', padding: '3px 4px' } }, strings.uploadFailed) : null,
          ) : null,
          h('div', { style: { position: 'relative' } },
          h('textarea', {
            ref: box, value: request, rows: 3, readOnly: enhancing, placeholder: strings.placeholder, 'aria-label': strings.placeholder,
            onChange: (event: { target: { value: string } }) => setRequest(event.target.value),
            onKeyDown: (event: { key: string; shiftKey: boolean; nativeEvent?: { isComposing?: boolean }; preventDefault(): void }) => {
              // Enter sends, Shift+Enter breaks the line; Enter that confirms an input-method candidate does neither.
              if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent?.isComposing) return;
              event.preventDefault();
              build(request);
            },
            style: { position: 'relative', display: 'block', width: '100%', minHeight: 76, padding: '12px 56px 4px 16px', boxSizing: 'border-box', resize: 'none', border: 0, outline: 'none', background: 'transparent', color: theme.text, font: 'inherit', fontSize: 14, lineHeight: 1.4, opacity: enhancing ? 0.6 : 1 },
          }),
          h('button', {
            type: 'button', title: strings.enhance, 'aria-label': strings.enhance, disabled: !canSend || enhancing, onClick: enhance,
            style: { position: 'absolute', right: 6, bottom: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: 0, background: 'transparent', color: theme.muted, opacity: canSend || enhancing ? 0.9 : 0.4, cursor: canSend && !enhancing ? 'pointer' : 'default' },
          }, enhancing ? spinner : stars),
          ),
          voiceFailed ? h('div', { role: 'alert', style: { position: 'relative', padding: '4px 16px 0', fontSize: 12, color: '#b42318' } }, strings.voiceFailed) : null,
          enhanceFailed ? h('div', { role: 'alert', style: { position: 'relative', padding: '4px 16px 0', fontSize: 12, color: '#b42318' } }, strings.enhanceFailed) : null,
          h('div', { style: { position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px 2px', marginTop: 8, borderTop: `1px solid ${theme.line}` } },
            h('div', { style: { position: 'relative' } },
              h('button', {
                type: 'button', title: strings.designSystem, 'aria-haspopup': 'listbox', 'aria-expanded': choosing, onClick: () => setChoosing((open) => !open),
                style: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 6, border: 0, background: choosing ? theme.hover : 'transparent', color: theme.muted, font: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' },
              }, cube, strings[designSystem], caret),
              choosing ? h('div', { style: { position: 'fixed', inset: 0, zIndex: 40 }, onClick: () => setChoosing(false) }) : null,
              choosing ? h('div', { role: 'listbox', 'aria-label': strings.designSystem, style: { position: 'absolute', bottom: '100%', left: 0, marginBottom: 4, zIndex: 50, minWidth: 200, padding: '4px 0', borderRadius: 8, border: `1px solid ${theme.line}`, background: theme.raised, boxShadow: '0 10px 30px -8px rgba(20,28,40,0.28)' } },
                ...DESIGN_SYSTEMS.map((id) => h('button', {
                  key: id, type: 'button', role: 'option', 'aria-selected': designSystem === id,
                  onClick: () => { setDesignSystem(id); setChoosing(false); },
                  style: { display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', border: 0, background: 'transparent', font: 'inherit', fontSize: 14, whiteSpace: 'nowrap', cursor: 'pointer', color: designSystem === id ? theme.accent : theme.text, fontWeight: designSystem === id ? 600 : 400 },
                }, strings[id])),
              ) : null,
            ),
            h('div', { style: { position: 'relative' } },
              h('button', {
                type: 'button', title: strings.colours, 'aria-label': strings.colours, 'aria-haspopup': 'dialog', 'aria-expanded': colouring, onClick: () => setColouring((open) => !open),
                style: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 6, border: 0, background: colouring ? theme.hover : 'transparent', color: theme.muted, cursor: 'pointer' },
              }, swatches, paletteColour ? h('span', { style: { width: 10, height: 10, borderRadius: 999, background: paletteColour, boxShadow: `0 0 0 1px ${theme.line}` } }) : null),
              colouring ? h('div', { style: { position: 'fixed', inset: 0, zIndex: 40 }, onClick: () => setColouring(false) }) : null,
              colouring ? h('div', { role: 'dialog', 'aria-label': strings.colours, style: { position: 'absolute', bottom: '100%', left: 0, marginBottom: 4, zIndex: 50, width: 248, padding: 10, boxSizing: 'border-box', borderRadius: 10, border: `1px solid ${theme.line}`, background: theme.raised, boxShadow: '0 10px 30px -8px rgba(20,28,40,0.28)' } },
                h('div', { role: 'tablist', style: { display: 'flex', gap: 2, padding: 2, marginBottom: 10, borderRadius: 7, background: theme.hover } },
                  ...(['colours', 'typography', 'features'] as const).map((id) => h('button', {
                    key: id, type: 'button', role: 'tab', 'aria-selected': tab === id, onClick: () => setTab(id),
                    style: { flex: 1, padding: '4px 0', border: 0, borderRadius: 5, font: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: tab === id ? theme.text : theme.muted, background: tab === id ? theme.raised : 'transparent', boxShadow: tab === id ? '0 1px 2px rgba(0,0,0,0.12)' : 'none' },
                  }, strings[id === 'colours' ? 'tabColours' : id === 'typography' ? 'tabTypography' : 'tabFeatures'])),
                ),
                ...(tab === 'colours' ? [
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 } },
                    ...PALETTES.map((item) => h('button', {
                      key: item.id, type: 'button', title: item.id, 'aria-pressed': palette === item.id,
                      onClick: () => { setPalette(item.id); setColouring(false); },
                      style: { display: 'flex', flexDirection: 'column', gap: 5, padding: 6, borderRadius: 8, cursor: 'pointer', font: 'inherit', fontSize: 11, textAlign: 'left', textTransform: 'capitalize', color: theme.muted, background: 'transparent', border: `1px solid ${palette === item.id ? theme.accent : theme.line}`, boxShadow: palette === item.id ? `inset 0 0 0 1px ${theme.accent}` : 'none' },
                    },
                      // A miniature of the palette: its page, a surface block and its main colour.
                      h('span', { 'aria-hidden': true, style: { display: 'flex', alignItems: 'flex-end', gap: 3, height: 26, padding: 4, boxSizing: 'border-box', borderRadius: 5, background: item.bg, border: `1px solid ${item.border}` } },
                        h('span', { style: { flex: 1, height: '100%', borderRadius: 3, background: item.surface } }),
                        h('span', { style: { width: 14, height: 8, borderRadius: 3, background: item.primary } })),
                      item.id)),
                  ),
                  h('label', { key: 'custom', style: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 12, color: theme.muted, cursor: 'pointer' } },
                    h('input', {
                      type: 'color', value: /^#[0-9a-f]{6}$/i.test(palette ?? '') ? palette : '#24456d', 'aria-label': strings.customColour,
                      onChange: (event: { target: { value: string } }) => setPalette(event.target.value.toLowerCase()),
                      style: { width: 24, height: 24, padding: 0, border: 0, background: 'transparent', cursor: 'pointer' },
                    }), strings.customColour),
                  h('button', {
                    key: 'default', type: 'button', onClick: () => { setPalette(undefined); setColouring(false); },
                    style: { marginTop: 8, padding: '4px 0', border: 0, background: 'transparent', font: 'inherit', fontSize: 12, cursor: 'pointer', color: palette ? theme.accent : theme.faint },
                  }, strings.defaultColours),
                ] : tab === 'typography' ? [
                  h('div', { key: 'fonts', style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 } },
                    ...FONTS.map((id) => h('button', {
                      key: id, type: 'button', 'aria-pressed': font === id, onClick: () => setFont(font === id ? undefined : id),
                      style: { display: 'flex', alignItems: 'baseline', gap: 8, padding: '6px 8px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', color: theme.text, background: 'transparent', border: `1px solid ${font === id ? theme.accent : theme.line}`, boxShadow: font === id ? `inset 0 0 0 1px ${theme.accent}` : 'none' },
                    }, h('span', { 'aria-hidden': true, style: { fontFamily: FONT_STACKS[id], fontSize: 18, lineHeight: 1 } }, 'Aa'),
                      h('span', { style: { fontSize: 11, color: theme.muted } }, strings[id]))),
                  ),
                ] : [
                  h('div', { key: 'features', style: { display: 'flex', flexDirection: 'column', gap: 2 } },
                    ...FEATURES.map((id) => h('label', { key: id, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '5px 4px', fontSize: 13, color: theme.text, cursor: 'pointer' } },
                      h('input', {
                        type: 'checkbox', checked: features.includes(id),
                        onChange: () => setFeatures(features.includes(id) ? features.filter((item) => item !== id) : [...features, id]),
                        style: { accentColor: theme.accent, margin: 0 },
                      }), strings[id])),
                  ),
                ]),
              ) : null,
            ),
            h('input', {
              ref: picker, type: 'file', multiple: true, hidden: true, accept: '.xlsx,.csv,.tsv,.docx,.md,.markdown,.txt',
              onChange: (event: { target: HTMLInputElement }) => { attach([...(event.target.files ?? [])]); event.target.value = ''; },
            }),
            h('button', {
              type: 'button', title: strings.attach, 'aria-label': strings.attach, disabled: uploading, onClick: () => picker.current?.click(),
              style: { display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: 6, border: 0, background: 'transparent', color: theme.muted, cursor: 'pointer' },
            }, paperclip),
            voice === 'absent' ? null : h('button', {
              type: 'button', disabled: voice === 'transcribing', 'aria-pressed': voice === 'recording',
              title: voice === 'recording' ? strings.voiceStop : voice === 'transcribing' ? strings.transcribing : strings.voice,
              'aria-label': voice === 'recording' ? strings.voiceStop : strings.voice, onClick: toggleVoice,
              style: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 6, border: 0, cursor: voice === 'transcribing' ? 'default' : 'pointer', font: 'inherit', fontSize: 12, color: voice === 'recording' ? '#d92d20' : theme.muted, background: voice === 'recording' ? 'rgba(217,45,32,0.10)' : 'transparent' },
            }, voice === 'transcribing' ? spinner : microphone,
              voice === 'recording' ? h('span', { 'aria-hidden': true, style: { width: 7, height: 7, borderRadius: 999, background: '#d92d20', animation: 'noccoPulse 1s ease-in-out infinite' } }) : null),
            h('span', { style: { flex: 1 } }),
            h('div', { role: 'tablist', style: { display: 'inline-flex', padding: 2, borderRadius: 6, border: `1px solid ${theme.line}`, background: theme.hover } },
              ...(['discuss', 'build'] as const).map((id) => h('button', {
                key: id, type: 'button', role: 'tab', 'aria-selected': mode === id, title: id === 'discuss' ? strings.discussHint : strings.buildHint, onClick: () => setMode(id),
                style: { padding: '4px 10px', border: 0, borderRadius: 4, font: 'inherit', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer', color: mode === id ? theme.text : theme.muted, background: mode === id ? theme.raised : 'transparent', boxShadow: mode === id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' },
              }, strings[id])),
            ),
            h('button', {
              type: 'button', disabled: !canSend, title: strings.build, onClick: () => build(request),
              style: {
                display: 'inline-flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 8, border: 0, color: '#fff', font: 'inherit', fontSize: 12, fontWeight: 600,
                letterSpacing: '-0.005em', background: theme.accent, opacity: canSend ? 1 : 0.55, cursor: canSend ? 'pointer' : 'default',
                boxShadow: canSend ? '0 2px 6px rgba(30,64,140,0.35), 0 0 0 1px rgba(255,255,255,0.15) inset' : '0 1px 2px rgba(30,64,140,0.2)',
              },
            }, strings.build, arrowUp),
          ),
        ),
        // Suggested builds
        h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, margin: '36px auto 0', width: 'min(820px, 100%)' } },
          h('div', { 'aria-live': 'off', style: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 28, maxWidth: '100%', fontSize: 15, lineHeight: 1.5, letterSpacing: '-0.005em', textAlign: 'center', color: theme.text } },
            h('span', null, typed,
              h('span', { 'aria-hidden': true, style: { display: 'inline-block', width: 1.5, height: '0.95em', marginLeft: 2, verticalAlign: 'middle', background: theme.accent, animation: 'noccoTypewriterCaret 900ms steps(2) infinite' } })),
          ),
          h('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' } },
            h('button', { type: 'button', disabled: prompts.length === 0, onClick: () => build(prompts[index] ?? ''), style: solidPill }, strings.build, arrowRight),
            h('button', { type: 'button', disabled: prompts.length < 2, onClick: next, style: pill }, cycle, strings.next),
            h('button', { type: 'button', disabled: loading, onClick: () => load(true), style: pill }, sparkle, loading ? strings.refreshing : strings.refresh),
          ),
          h('div', { style: { fontSize: 11, color: theme.faint } }, source === 'model' ? strings.fromModel : strings.fromSamples),
        ),
      ),
    );
  };
}

/** The sidebar icon for the home page. */
export function HomeIcon(props: { size?: number }): ReactElement {
  const size = props.size ?? 16;
  return h('svg', { width: size, height: size, viewBox: '0 0 64 64', 'aria-hidden': true },
    h('rect', { width: 64, height: 64, rx: 14, fill: '#24456D' }),
    h('path', { d: 'M20 46V18h5l14 19V18h5v28h-5L25 27v19z', fill: '#fff' }),
  );
}
