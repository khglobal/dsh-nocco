import type { Context } from '@deepseek-ai/cordis';
import { createElement, useEffect, type ReactElement } from 'react';
import { createHome, HomeIcon } from './home.js';
import type { Palette } from './palette.js';
import { createPreviewTab } from './preview-tab.js';
import { extractPreviewUrl } from './preview-url.js';
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

  /** Show a running app: the plugin's own tab, else the built-in browser tab, else a new window. */
  const open = (url: string): void => {
    const sidebar = ctx.get('sidebarRight') as SidebarRight | undefined;
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
      const sidebar = ctx.get('sidebarRight') as SidebarRight | undefined;
      try { sidebar?.openTab(TAB_KIND, { params: { url } }); } catch { /* no session surface or no tab: the row keeps its button */ }
    }, [url]);
    const row = { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 13 } as const;
    if (!url) return createElement('div', { style: row }, strings.stopped);
    return createElement('div', { style: row },
      createElement('span', null, strings.running),
      createElement('a', { href: url, target: '_blank', rel: 'noopener' }, url),
      createElement('button', { type: 'button', onClick: () => open(url) }, strings.open),
    );
  }

  ctx.slots.inject('tool.call.toolview', () =>
    ctx.slots.register({ name: 'tool.call.toolview', key: 'nocco_preview' }, PreviewRow));

  // Home page: needs the layout service to be selectable from the sidebar.
  ctx.inject(['layout'], (inner) => {
    const Home = createHome({
      suggestions: (lang, refresh) => post('api/nocco.suggestions', { lang, refresh }),
      start: (draft) => {
        const workspace = inner.get('uiWorkspace') as UiWorkspace | undefined;
        workspace?.startSession(undefined, { prompt: draft, whenDraftExists: 'replace' });
        (inner.get('layout') as Layout | undefined)?.selectPanel(null);
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
    });
    const tabs = inner.get('sidebarRightTabs') as SidebarRightTabs;
    inner.effect(() => tabs.register({ id: TAB_ID, kind: TAB_KIND, title: () => text(pageLang()).previewTitle }), 'nocco.preview-tab');
    inner.slots.inject('sidebar.right.pane.tab', () =>
      inner.slots.register({ name: 'sidebar.right.pane.tab', key: TAB_ID }, PreviewTab));
  });
}
