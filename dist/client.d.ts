import type { Context } from '@deepseek-ai/cordis';
export declare const name = "dsh-nocco";
/** Only slots is required; every other host service is optional and has a fallback. */
export declare const inject: readonly string[];
export declare function apply(context: Context): void;
