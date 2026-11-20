/** What the plugin could read about the user, used to make suggestions personal. */
export interface SuggestContext {
    workspaces: {
        title: string;
        files: string[];
    }[];
    sessions: string[];
}
export type Lang = 'zh' | 'en';
export declare const SUGGESTION_COUNT = 6;
/** Shown when no model is configured or generation fails: the original Nocco home page examples. */
export declare const FALLBACK: Record<Lang, readonly string[]>;
export declare const langOf: (tag: unknown) => Lang;
/** The request sent to the model. Folder and session names are data, not instructions. */
export declare function buildSuggestPrompt(context: SuggestContext, lang: Lang): {
    system: string;
    user: string;
};
/** Pull the suggestions out of a model reply; empty when the reply is unusable. */
export declare function parseSuggestions(reply: string): string[];
