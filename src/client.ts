import type { Context } from '@deepseek-ai/cordis';
import { createElement, type ReactElement } from 'react';
import { extractPreviewUrl } from './preview-url.js';
import { text } from './text.js';

export const name = 'dsh-nocco';
/** Only slots is required; the browser tab is optional and has a fallback. */
export const inject: readonly string[] = ['slots'];

/** The part of the host's slots service this plugin uses. */
interface Slots {
  inject(owner: string, setup: () => unknown): unknown;
  register(spec: { name: string; key: string }, component: unknown): unknown;
}
interface SidebarRight { openTab?: (kind: string, options: { params: { url: string } }) => unknown; }

export function apply(ctx: Context): void {
  const open = (url: string): void => {
    const sidebar = ctx.reflect.get('sidebarRight') as SidebarRight | undefined;
    try {
      if (sidebar?.openTab) { sidebar.openTab('browser', { params: { url } }); return; }
    } catch { /* browser tab disabled in this profile: fall through */ }
    window.open(url, '_blank', 'noopener');
  };

  function PreviewRow(props: unknown): ReactElement {
    const strings = text(document.documentElement.lang || navigator.language);
    const url = extractPreviewUrl(props);
    const row = { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 13 } as const;
    if (!url) return createElement('div', { style: row }, strings.stopped);
    return createElement('div', { style: row },
      createElement('span', null, strings.running),
      createElement('a', { href: url, target: '_blank', rel: 'noopener' }, url),
      createElement('button', { type: 'button', onClick: () => open(url) }, strings.open),
    );
  }

  // The slots type augmentation lives in host packages this plugin does not
  // depend on, so the service is read through a local structural type.
  const slots = (ctx as unknown as { slots: Slots }).slots;
  slots.inject('tool.call.toolview', () =>
    slots.register({ name: 'tool.call.toolview', key: 'nocco_preview' }, PreviewRow));
}
