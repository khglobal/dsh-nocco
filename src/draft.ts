import type { Strings } from './text.js';

export type DesignSystemId = 'antdv' | 'shadcn' | 'vant';

/**
 * The draft a Build action puts in a new session: the skill invocation, what
 * the user asked for, and the design system and palette they picked on the
 * home page. No palette line is written when none was picked.
 */
export function buildDraft(
  request: string, designSystem: DesignSystemId, strings: Pick<Strings, 'designLine' | 'paletteLine'>, palette?: string,
): string {
  const lines = [`${strings.designLine}${designSystem}`];
  if (palette) lines.push(`${strings.paletteLine}${palette}`);
  return `/nocco ${request.trim()}\n\n${lines.join('\n')}`;
}
