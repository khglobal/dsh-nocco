import { createElement as h, useCallback, useEffect, useRef, useState } from 'react';
import { PALETTES } from './palette.js';
import { pageLang, text } from './text.js';
const WIDTHS = [['desktop', '100%'], ['tablet', '820px'], ['phone', '390px']];
const LINE = 'rgba(128,128,128,0.28)';
const ACCENT = '#24456D';
export const button = {
    border: `1px solid ${LINE}`, borderRadius: 6, padding: '3px 9px', fontSize: 12, lineHeight: '18px',
    background: 'transparent', color: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap',
};
const pressed = { ...button, borderColor: 'currentColor', fontWeight: 600 };
const solid = { ...button, background: ACCENT, borderColor: ACCENT, color: '#fff' };
/** The line that tells the agent which element the user picked, in the page's language. */
export function describePicked(element, strings) {
    const parts = [`<${element.tag}${element.classes ? ` class="${element.classes}"` : ''}>`];
    if (element.text)
        parts.push(`"${element.text}"`);
    parts.push(`${strings.pickedPage} ${element.page}`);
    if (element.file)
        parts.push(`${strings.pickedFile} ${element.file}`);
    return `${strings.pickedLine}${parts.join(' · ')}\n`;
}
/** A short account of how long ago a moment was, in the given language. */
export function ago(seconds, now, lang) {
    const elapsed = Math.max(0, now - seconds);
    const format = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
    if (elapsed < 60)
        return format.format(0, 'second');
    if (elapsed < 3600)
        return format.format(-Math.floor(elapsed / 60), 'minute');
    if (elapsed < 86400)
        return format.format(-Math.floor(elapsed / 3600), 'hour');
    return format.format(-Math.floor(elapsed / 86400), 'day');
}
function History(props) {
    const { url, api, strings, lang } = props;
    const [items, setItems] = useState();
    const [failure, setFailure] = useState('');
    const [asking, setAsking] = useState();
    const [busy, setBusy] = useState(false);
    const act = useCallback(async (action, id) => {
        try {
            setItems(await api.checkpoints(url, action, id));
            setFailure('');
        }
        catch (error) {
            setFailure(error instanceof Error ? error.message : String(error));
        }
    }, [api, url]);
    // Checkpoints appear as the agent works, so keep the list fresh while it shows.
    useEffect(() => {
        void act('list');
        const timer = setInterval(() => { void act('list'); }, 5000);
        return () => clearInterval(timer);
    }, [act]);
    const run = async (action, id) => {
        setBusy(true);
        await act(action, id);
        setBusy(false);
        setAsking(undefined);
        if (action === 'restore')
            props.onRestored();
    };
    const now = Date.now() / 1000;
    return h('aside', { style: { width: 264, flexShrink: 0, display: 'flex', flexDirection: 'column', minHeight: 0, borderLeft: `1px solid ${LINE}`, fontSize: 12 } }, h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderBottom: `1px solid ${LINE}` } }, h('strong', { style: { flex: 1, fontSize: 13 } }, strings.history), h('button', { type: 'button', disabled: busy, onClick: () => { void run('save'); }, style: button }, strings.saveCheckpoint)), h('div', { style: { padding: '6px 10px', opacity: 0.6, lineHeight: 1.5 } }, strings.historyNote), failure ? h('div', { role: 'alert', style: { padding: '6px 10px', color: '#b42318' } }, failure) : null, h('ol', { style: { flex: 1, minHeight: 0, overflowY: 'auto', margin: 0, padding: '4px 10px 12px', listStyle: 'none' } }, items === undefined ? null
        : items.length === 0 ? h('li', { style: { opacity: 0.6, padding: '8px 0' } }, strings.noCheckpoints)
            : items.map((item, index) => h('li', { key: item.id, style: { display: 'flex', gap: 10, position: 'relative', paddingBottom: 14 } }, 
            // The rail: a dot per checkpoint, joined by a line to the one before it.
            h('div', { 'aria-hidden': true, style: { width: 10, flexShrink: 0, position: 'relative' } }, h('span', { style: { position: 'absolute', top: 4, left: 0, width: 10, height: 10, borderRadius: 999, boxSizing: 'border-box', border: `2px solid ${ACCENT}`, background: index === 0 ? ACCENT : 'transparent' } }), index < items.length - 1 ? h('span', { style: { position: 'absolute', top: 16, bottom: -16, left: 4, width: 2, background: LINE } }) : null), h('div', { style: { flex: 1, minWidth: 0 } }, h('div', { style: { fontSize: 13, fontWeight: index === 0 ? 600 : 400, overflowWrap: 'anywhere' } }, item.label), h('div', { style: { opacity: 0.6, marginTop: 2 } }, [ago(item.time, now, lang), strings.filesChanged.replace('{n}', String(item.filesChanged)), index === 0 ? strings.current : ''].filter(Boolean).join(' · ')), index === 0 ? null
                : asking === item.id
                    ? h('div', { style: { display: 'flex', gap: 6, marginTop: 6 } }, h('button', { type: 'button', disabled: busy, onClick: () => { void run('restore', item.id); }, style: solid }, strings.confirmRestore), h('button', { type: 'button', disabled: busy, onClick: () => setAsking(undefined), style: button }, strings.cancel))
                    : h('button', { type: 'button', onClick: () => setAsking(item.id), style: { ...button, marginTop: 6 } }, strings.restore))))));
}
/** The right-sidebar tab that shows a running app with width, reload, palette and history controls. */
export function createPreviewTab(api) {
    return function PreviewTab(props) {
        const lang = pageLang();
        const strings = text(lang);
        const url = props.useTabInfo?.().tab?.navigation?.params?.url;
        const [width, setWidth] = useState('100%');
        const [generation, setGeneration] = useState(0);
        const [palette, setPalette] = useState();
        const [history, setHistory] = useState(false);
        const [inspecting, setInspecting] = useState(false);
        const frame = useRef(null);
        // The app answers a pick request with the element the user clicked, or nothing when they cancel.
        useEffect(() => {
            if (!url)
                return undefined;
            const origin = new URL(url).origin;
            const receive = (event) => {
                if (event.origin !== origin || event.source !== frame.current?.contentWindow || event.data?.type !== 'nocco:picked')
                    return;
                setInspecting(false);
                const picked = event.data.element;
                if (picked && typeof picked.tag === 'string') {
                    api.insert(describePicked({
                        tag: String(picked.tag).slice(0, 40), text: String(picked.text ?? '').slice(0, 80), classes: String(picked.classes ?? '').slice(0, 120),
                        file: String(picked.file ?? '').slice(0, 300), page: String(picked.page ?? '').slice(0, 200),
                    }, strings));
                }
            };
            window.addEventListener('message', receive);
            return () => window.removeEventListener('message', receive);
        }, [url, strings]);
        const inspect = (on) => {
            if (!url)
                return;
            setInspecting(on);
            frame.current?.contentWindow?.postMessage({ type: 'nocco:inspect', on }, new URL(url).origin);
        };
        if (!url)
            return h('div', { style: { padding: 24, fontSize: 13, opacity: 0.7 } }, strings.noPreview);
        const reload = () => setGeneration((current) => current + 1);
        return h('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 } }, h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', flexWrap: 'wrap', borderBottom: `1px solid ${LINE}` } }, ...WIDTHS.map(([id, value]) => h('button', {
            key: id, type: 'button', 'aria-pressed': width === value, onClick: () => setWidth(value),
            style: width === value ? pressed : button,
        }, strings[id])), h('button', { type: 'button', onClick: reload, style: button }, strings.reload), h('a', { href: url, target: '_blank', rel: 'noopener', style: { ...button, textDecoration: 'none' } }, strings.external), h('button', { type: 'button', 'aria-pressed': inspecting, title: strings.inspecting, onClick: () => inspect(!inspecting), style: inspecting ? pressed : button }, strings.inspect), h('span', { style: { flex: 1 } }), h('span', { role: 'group', 'aria-label': strings.palette, title: strings.paletteHint, style: { display: 'inline-flex', alignItems: 'center', gap: 10, padding: '0 6px' } }, h('span', { style: { fontSize: 12, opacity: 0.65, marginRight: -2 } }, strings.palette), ...PALETTES.map((item) => h('button', {
            key: item.id, type: 'button', title: `${strings.palette}: ${item.id}`, 'aria-label': `${strings.palette}: ${item.id}`, 'aria-pressed': palette === item.id,
            onClick: () => { setPalette(item.id); void api.setPalette(url, item).catch(() => setPalette(undefined)); },
            style: {
                width: 14, height: 14, borderRadius: 999, padding: 0, cursor: 'pointer', border: 0, outlineOffset: 4,
                // Each swatch shows the palette's main colour ringed by its background colour.
                background: item.primary, boxShadow: `0 0 0 2px ${item.bg}, 0 0 0 3px ${LINE}`,
                outline: palette === item.id ? '2px solid currentColor' : 'none',
            },
        }))), h('button', { type: 'button', 'aria-pressed': history, onClick: () => setHistory((open) => !open), style: history ? pressed : button }, strings.history)), inspecting ? h('div', { role: 'status', style: { padding: '5px 10px', fontSize: 12, color: '#fff', background: ACCENT } }, strings.inspecting) : null, h('div', { style: { flex: 1, minHeight: 0, display: 'flex' } }, h('div', { style: { flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center', background: 'rgba(128,128,128,0.12)' } }, h('iframe', { ref: frame, key: generation, src: url, title: strings.previewTitle, style: { width, maxWidth: '100%', height: '100%', border: 0, background: '#fff' } })), history ? h(History, { url, api, strings, lang, onRestored: reload }) : null));
    };
}
