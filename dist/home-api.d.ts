import type { Context } from '@deepseek-ai/cordis';
import type { Checkpoints } from './checkpoints.js';
import type { PreviewManager } from './preview.js';
import { type Lang, type SuggestContext } from './suggest.js';
export interface SuggestionsResult {
    suggestions: string[];
    /** `model` when the user's model wrote them; `fallback` with the reason otherwise. */
    source: 'model' | 'fallback';
    reason?: string;
}
/** Looks up a host service by name; undefined when the host does not have it. */
export type Lookup = (name: string) => unknown;
/**
 * Follow optional host services as they come and go. A plugin only sees a
 * service it has asked for, so each one is requested on its own and a missing
 * one never holds the plugin back.
 */
export declare function trackServices(ctx: Context, names: readonly string[]): Lookup;
/** Names only: workspace titles, their top-level entries, and recent session titles. */
export declare function gatherContext(get: Lookup, signal?: AbortSignal): Promise<SuggestContext>;
/** One model call with the user's default model, outside any session. */
declare function askModel(get: Lookup, system: string, user: string, signal: AbortSignal): Promise<string>;
/** Rewrite a rough request into a clearer one with the user's default model. */
export declare function createEnhancer(get: Lookup, ask?: typeof askModel): (request: unknown) => Promise<{
    text: string;
}>;
/** The largest recording accepted for transcription, in bytes; matches the speech service's default. */
export declare const VOICE_LIMIT: number;
/** Voice input through DSH's own speech service: whether it is ready, and transcription of one recording. */
export declare function createVoice(get: Lookup): {
    available(): boolean;
    transcribe(audio: Uint8Array): Promise<{
        text: string;
    }>;
};
/** Suggested builds for the home page, cached per language until refreshed. */
export declare function createSuggester(get: Lookup, ask?: typeof askModel): (lang: Lang, refresh: boolean) => Promise<SuggestionsResult>;
/** The largest file the home page may attach, in bytes. */
export declare const UPLOAD_LIMIT: number;
/**
 * Keep a file the user attached on the home page where the agent can read it.
 * It lands in its own folder under the system's temporary directory, under
 * its own name with path separators removed.
 */
export declare function saveUpload(name: string, bytes: Uint8Array, root?: string): Promise<{
    name: string;
    path: string;
}>;
/**
 * Routes the plugin's pages call. They exist while the host's connection
 * service does; without it the pages fall back on their own.
 */
export declare function registerHomeApi(ctx: Context, previews: PreviewManager, checkpoints: Checkpoints): void;
export {};
