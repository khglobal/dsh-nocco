import type { Context } from '@deepseek-ai/cordis';
export declare const name = "dsh-nocco";
/** Both services are required: without them the plugin has nothing to offer. */
export declare const inject: readonly string[];
export declare function apply(ctx: Context): void;
