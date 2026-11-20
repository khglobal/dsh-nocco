import type { Strings } from './text.js';
export type DesignSystemId = 'antdv' | 'shadcn' | 'vant' | 'retro';
export type Mode = 'build' | 'discuss';
export declare const FONTS: readonly ["sans-serif", "serif", "monospace", "cursive", "fantasy"];
export type FontId = (typeof FONTS)[number];
export declare const FEATURES: readonly ["rounded", "border", "gradient", "shadow", "frosted"];
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
type DraftStrings = Pick<Strings, 'languageLine' | 'designLine' | 'paletteLine' | 'fontLine' | 'styleLine' | 'modeLine' | 'filesLine' | 'discuss' | FeatureId>;
/**
 * The draft a Build action puts in a new session: the skill invocation, what
 * the user asked for, and one line per choice made on the home page. Choices
 * left at their defaults add no line.
 */
export declare function buildDraft(request: string, choices: DraftChoices, strings: DraftStrings): string;
export {};
