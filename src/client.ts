import type { Context } from '@deepseek-ai/cordis';
import { createElement, useEffect, type ReactElement } from 'react';
import { createHome, HomeIcon } from './home.js';
import type { Palette } from './palette.js';
import { button, createPreviewTab, type CheckpointItem } from './preview-tab.js';
import { extractPreviewUrl } from './preview-url.js';
import { FALLBACK, langOf } from './suggest.js';
import { pageLang, text } from './text.js';

export const name = 'dsh-nocco';
/** Only slots is required; every other host service is optional and has a fallback. */
export const inject: readonly string[] = ['slots'];

const PANEL = 'nocco';
const TAB_ID = 'dsh-nocco';
const TAB_KIND = 'nocco-preview';

/**
 * The parts of host services this plugin uses, typed by shape: their own type
 * declarations live in host packages the plugin does not depend on.
 */
interface Slots {
  inject(owner: string, setup: () => unknown): unknown;
  register(spec: Record<string, unknown>, component: unknown): unknown;
}
interface Host {
  slots: Slots;
  get(name: string): unknown;
  inject(deps: readonly string[], callback: (ctx: Host) => void): unknown;
  effect(setup: () => unknown, label?: string): unknown;
}
interface Layout { selectPanel(id: string | null): void; }
interface UiWorkspace { startSession(workspaceId?: string, options?: Record<string, unknown>): void; }
interface SidebarRight { openTab(kind: string, options: { params: { url: string } }): unknown; }
interface SidebarRightTabs { register(definition: Record<string, unknown>): unknown; }

async function post<T>(path: string, body: unknown): Promise<T> {
  // Relative to the document so a host served under a path prefix still works.
  const response = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return await response.json() as T;
}

export function apply(context: Context): void {
  const ctx = context as unknown as Host;
  const opened = new Set<string>();
  // Optional services, filled in while the host provides them.
  let sidebar: SidebarRight | undefined;

  /** Show a running app: the plugin's own tab, else the built-in browser tab, else a new window. */
  const open = (url: string): void => {
    for (const kind of [TAB_KIND, 'browser']) {
      try { if (sidebar) { sidebar.openTab(kind, { params: { url } }); return; } } catch { /* that tab is not available here */ }
    }
    window.open(url, '_blank', 'noopener');
  };

  function PreviewRow(props: unknown): ReactElement {
    const strings = text(pageLang());
    const url = extractPreviewUrl(props);
    // The first time a running preview shows up in the conversation, bring it into view.
    useEffect(() => {
      if (!url || opened.has(url)) return;
      opened.add(url);
      try { sidebar?.openTab(TAB_KIND, { params: { url } }); } catch { /* no session surface or no tab: the row keeps its button */ }
    }, [url]);
    const row = { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 13 } as const;
    // Until the call has a result there is nothing to say about the server yet.
    const settled = (props as { phase?: string } | null)?.phase === 'result';
    if (!url) return createElement('div', { style: { ...row, opacity: 0.7 } }, settled ? strings.stopped : strings.working);
    return createElement('div', { style: row },
      createElement('span', null, strings.running),
      createElement('a', { href: url, target: '_blank', rel: 'noopener' }, url),
      createElement('button', { type: 'button', onClick: () => open(url), style: button }, strings.open),
    );
  }

  ctx.slots.inject('tool.call.toolview', () =>
    ctx.slots.register({ name: 'tool.call.toolview', key: 'nocco_preview' }, PreviewRow));

  // Home page: needs the layout service to be selectable from the sidebar.
  ctx.inject(['layout', 'uiWorkspace'], (inner) => {
    const Home = createHome({
      // If the Host half cannot answer, show the sample ideas instead of an empty lane.
      suggestions: (lang, refresh) => post<{ suggestions: string[]; source: 'model' | 'fallback' }>('api/nocco.suggestions', { lang, refresh })
        .catch(() => ({ suggestions: [...FALLBACK[langOf(lang)]], source: 'fallback' as const })),
      start: (draft) => {
        // Leave the home page first: the draft is written into the conversation
        // view, which only exists once that view is showing.
        (inner.get('layout') as Layout).selectPanel(null);
        (inner.get('uiWorkspace') as UiWorkspace).startSession(undefined, { prompt: draft, whenDraftExists: 'replace' });
      },
    });
    inner.slots.inject('sidebar.panellist', () =>
      inner.slots.register({ name: 'sidebar.panellist', id: PANEL, label: 'Nocco', order: 5 }, HomeIcon));
    inner.slots.inject('main', () => inner.slots.register({ name: 'main', key: PANEL }, Home));
  });

  // Preview tab: needs the right sidebar and its tab registry.
  ctx.inject(['sidebarRight', 'sidebarRightTabs'], (inner) => {
    const PreviewTab = createPreviewTab({
      setPalette: async (url: string, palette: Palette) => { await post('api/nocco.palette', { url, palette }); },
      checkpoints: async (url, action, id) => (await post<{ checkpoints: CheckpointItem[] }>('api/nocco.checkpoints', { url, action, id })).checkpoints,
    });
    const tabs = inner.get('sidebarRightTabs') as SidebarRightTabs;
    sidebar = inner.get('sidebarRight') as SidebarRight;
    inner.effect(() => () => { sidebar = undefined; }, 'nocco.sidebar');
    inner.effect(() => tabs.register({ id: TAB_ID, kind: TAB_KIND, title: () => text(pageLang()).previewTitle }), 'nocco.preview-tab');
    inner.slots.inject('sidebar.right.pane.tab', () =>
      inner.slots.register({ name: 'sidebar.right.pane.tab', key: TAB_ID }, PreviewTab));
  });
}
