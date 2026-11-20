/** The longest request the enhancer accepts, in characters. */
export declare const ENHANCE_LIMIT = 4000;
/**
 * The prompt that turns a rough request for a web system into a clearer one.
 * The request is quoted as data, in the language it was written in.
 */
export declare function buildEnhancePrompt(request: string): {
    system: string;
    user: string;
};
/** The rewritten request from a model reply, without wrappers a model may add around it. */
export declare function cleanEnhanced(reply: string): string;
