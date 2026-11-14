import type { Strings } from './text.js';

export type DesignSystemId = 'antdv' | 'shadcn' | 'vant';
export type Mode = 'build' | 'discuss';
export const FONTS = ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'] as const;
export type FontId = (typeof FONTS)[number];
export const FEATURES = ['rounded', 'border', 'gradient', 'shadow', 'frosted'] as const;
export type FeatureId = (typeof FEATURES)[number];

/** What the user picked on the home page besides the request itself. */
export interface DraftChoices {
  designSystem: DesignSystemId;
  /** An offered palette's id or a `#rrggbb` main colour. */
  palette?: string;
  font?: FontId;
  features?: readonly FeatureId[];
  mode?: Mode;
  /** Absolute paths of files the user attached. */
  files?: readonly string[];
}

type DraftStrings = Pick<Strings, 'designLine' | 'paletteLine' | 'fontLine' | 'styleLine' | 'modeLine' | 'filesLine' | 'discuss' | FeatureId>;

/**
 * The draft a Build action puts in a new session: the skill invocation, what
 * the user asked for, and one line per choice made on the home page. Choices
 * left at their defaults add no line.
 */
export function buildDraft(request: string, choices: DraftChoices, strings: DraftStrings): string {
  const lines = [`${strings.designLine}${choices.designSystem}`];
  if (choices.palette) lines.push(`${strings.paletteLine}${choices.palette}`);
  if (choices.font) lines.push(`${strings.fontLine}${choices.font}`);
  if (choices.features?.length) lines.push(`${strings.styleLine}${choices.features.map((id) => strings[id]).join(', ')}`);
  if (choices.mode === 'discuss') lines.push(`${strings.modeLine}${strings.discuss}`);
  if (choices.files?.length) lines.push(strings.filesLine, ...choices.files.map((file) => `- ${file}`));
  return `/nocco ${request.trim()}\n\n${lines.join('\n')}`;
}
