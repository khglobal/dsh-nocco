import { createElement, useEffect, useSyncExternalStore } from 'react';
import { createHome, HomeIcon } from './home.js';
import { button, createPreviewTab } from './preview-tab.js';
import { extractPreviewUrl } from './preview-url.js';
import { FALLBACK, langOf } from './suggest.js';
import { pageLang, text } from './text.js';
export const name = 'dsh-nocco';
/** Only slots is required; every other host service is optional and has a fallback. */
export const inject = ['slots'];
const PANEL = 'nocco';
const TAB_ID = 'dsh-nocco';
const TAB_KIND = 'nocco-preview';
async function post(path, body) {
    // Relative to the document so a host served under a path prefix still works.
    const response = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok)
        throw new Error(`${path} returned ${response.status}`);
    return await response.json();
}
export function apply(context) {
    const ctx = context;
    const opened = new Set();
    // Optional services, filled in while the host provides them.
    let sidebar;
    /** Show a running app: the plugin's own tab, else the built-in browser tab, else a new window. */
    const open = (url) => {
        for (const kind of [TAB_KIND, 'browser']) {
            try {
                if (sidebar) {
                    sidebar.openTab(kind, { params: { url } });
                    return;
                }
            }
            catch { /* that tab is not available here */ }
        }
        window.open(url, '_blank', 'noopener');
    };
    function PreviewRow(props) {
        const strings = text(pageLang());
        const url = extractPreviewUrl(props);
        // The first time a running preview shows up in the conversation, bring it into view.
        useEffect(() => {
            if (!url || opened.has(url))
                return;
            opened.add(url);
            try {
                sidebar?.openTab(TAB_KIND, { params: { url } });
            }
            catch { /* no session surface or no tab: the row keeps its button */ }
        }, [url]);
        const row = { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 13 };
        // Until the call has a result there is nothing to say about the server yet.
        const settled = props?.phase === 'result';
        if (!url)
            return createElement('div', { style: { ...row, opacity: 0.7 } }, settled ? strings.stopped : strings.working);
        return createElement('div', { style: row }, createElement('span', null, strings.running), createElement('a', { href: url, target: '_blank', rel: 'noopener' }, url), createElement('button', { type: 'button', onClick: () => open(url), style: button }, strings.open));
    }
    ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({ name: 'tool.call.toolview', key: 'nocco_preview' }, PreviewRow));
    // A draft the home page has just handed to a new session and wants sent.
    let pending;
    const compact = (value) => value.replace(/\s+/g, ' ').trim();
    // Text the preview wants put into the open session's message box.
    const inserts = [];
    const listeners = new Set();
    let insertVersion = 0;
    const insertIntoComposer = (value) => {
        inserts.push(value);
        insertVersion += 1;
        for (const listener of listeners)
            listener();
    };
    const subscribeInserts = (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
    /**
     * The plugin's hand in a session's composer. It renders nothing; it lives
     * there because that is where a session gives a plugin the actions that
     * edit and submit its input. It sends the home page's draft once the new
     * session holds it, and inserts text the preview asks for.
     */
    function ComposerBridge(props) {
        const session = props;
        const draft = session.useInput?.((state) => state.draft) ?? '';
        const phase = session.useInput?.((state) => state.phase) ?? '';
        const version = useSyncExternalStore(subscribeInserts, () => insertVersion);
        useEffect(() => {
            if (!pending)
                return;
            // A draft that never arrives must not be sent later, when the user has typed something else.
            if (Date.now() - pending.at > 15000) {
                pending = undefined;
                return;
            }
            if (phase !== 'plain' || compact(draft) !== compact(pending.draft))
                return;
            pending = undefined;
            session.inputActions?.submit();
        }, [draft, phase]);
        useEffect(() => {
            const actions = session.inputActions;
            if (!actions || inserts.length === 0)
                return;
            for (const value of inserts.splice(0))
                actions.insertText(value, actions.captureInsertion());
        }, [version]);
        return null;
    }
    ctx.slots.inject('conversation.input.overlay', () => ctx.slots.register({ name: 'conversation.input.overlay', id: 'nocco-bridge', order: 99 }, ComposerBridge));
    // Home page: needs the layout service to be selectable from the sidebar.
    ctx.inject(['layout', 'uiWorkspace'], (inner) => {
        const Home = createHome({
            // If the Host half cannot answer, show the sample ideas instead of an empty lane.
            suggestions: (lang, refresh) => post('api/nocco.suggestions', { lang, refresh })
                .catch(() => ({ suggestions: [...FALLBACK[langOf(lang)]], source: 'fallback' })),
            upload: async (file) => {
                const response = await fetch('api/nocco.upload', { method: 'POST', headers: { 'x-nocco-filename': encodeURIComponent(file.name) }, body: file });
                if (!response.ok)
                    throw new Error(`upload returned ${response.status}`);
                return await response.json();
            },
            voiceAvailable: async () => (await post('api/nocco.voice', {})).available === true,
            transcribe: async (wav) => {
                const response = await fetch('api/nocco.transcribe', { method: 'POST', headers: { 'content-type': 'audio/wav' }, body: new Blob([wav.slice()]) });
                if (!response.ok)
                    throw new Error(`transcription returned ${response.status}`);
                return (await response.json()).text;
            },
            enhance: async (request) => (await post('api/nocco.enhance', { text: request })).text,
            start: (draft) => {
                // Leave the home page first: the draft is written into the conversation
                // view, which only exists once that view is showing.
                inner.get('layout').selectPanel(null);
                pending = { draft, at: Date.now() };
                inner.get('uiWorkspace').startSession(undefined, { prompt: draft, whenDraftExists: 'replace' });
            },
        });
        inner.slots.inject('sidebar.panellist', () => inner.slots.register({ name: 'sidebar.panellist', id: PANEL, label: 'Nocco', order: 5 }, HomeIcon));
        inner.slots.inject('main', () => inner.slots.register({ name: 'main', key: PANEL }, Home));
    });
    // Preview tab: needs the right sidebar and its tab registry.
    ctx.inject(['sidebarRight', 'sidebarRightTabs'], (inner) => {
        const PreviewTab = createPreviewTab({
            setPalette: async (url, palette) => { await post('api/nocco.palette', { url, palette }); },
            insert: insertIntoComposer,
            checkpoints: async (url, action, id) => (await post('api/nocco.checkpoints', { url, action, id })).checkpoints,
        });
        const tabs = inner.get('sidebarRightTabs');
        sidebar = inner.get('sidebarRight');
        inner.effect(() => () => { sidebar = undefined; }, 'nocco.sidebar');
        inner.effect(() => tabs.register({ id: TAB_ID, kind: TAB_KIND, title: () => text(pageLang()).previewTitle }), 'nocco.preview-tab');
        inner.slots.inject('sidebar.right.pane.tab', () => inner.slots.register({ name: 'sidebar.right.pane.tab', key: TAB_ID }, PreviewTab));
    });
}
