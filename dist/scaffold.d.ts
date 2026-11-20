type RunResult = {
    status: number | null;
    output: string;
};
/** Runs a program in the app directory and reports how it ended. */
export type Runner = (file: string, args: string[], cwd: string) => RunResult | Promise<RunResult>;
/** The design systems an app can be built on; each is one template directory. */
export declare const DESIGN_SYSTEMS: readonly ["antdv", "shadcn", "vant", "retro"];
export type DesignSystem = (typeof DESIGN_SYSTEMS)[number];
export interface ScaffoldInput {
    directory: string;
    appName: string;
    language: 'zh-CN' | 'en';
    designSystem: DesignSystem;
    /** An offered palette's id or a `#rrggbb` main colour; the template's own colours when absent or unknown. */
    palette?: string;
    /** False opens the app to everyone; otherwise every page and route needs a signed-in user. */
    signIn?: boolean;
    /** One of the offered font names; the template's own font when absent or unknown. */
    font?: string;
}
export interface ScaffoldResult {
    directory: string;
    designSystem: DesignSystem;
    packageManager: 'pnpm' | 'npm' | null;
    installed: boolean;
    installOutput: string;
    /** The first account, created when the app first starts. */
    admin: {
        username: string;
        password: string;
    };
    /** Whether visitors must sign in before they can use the app. */
    signIn: 'required' | 'off';
}
/**
 * Create an app from a design-system template in an empty directory: copy the
 * template and the files every template shares, fill in its name, write its
 * secrets, and install its dependencies.
 */
export declare function scaffold(input: ScaffoldInput, deps?: {
    templatesDir?: string;
    run?: Runner;
}): Promise<ScaffoldResult>;
export {};
