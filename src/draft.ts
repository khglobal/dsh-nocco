import type { Strings } from './text.js';

export type DesignSystemId = 'antdv' | 'shadcn' | 'vant';

/**
 * The draft a Build action puts in a new session: the skill invocation, what
 * the user asked for, and the design system they picked on the home page.
 */
export function buildDraft(request: string, designSystem: DesignSystemId, strings: Pick<Strings, 'designLine'>): string {
  return `/nocco ${request.trim()}\n\n${strings.designLine}${designSystem}`;
}
