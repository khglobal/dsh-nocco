import { type Access } from './permissions.js';
export interface PreviewState {
    running: boolean;
    url?: string;
    output: string[];
}
export interface PreviewManager {
    /** Start the app's dev server, or return the one already running. The server and its sync work run through the given access. */
    start(directory: string, access?: Access): Promise<PreviewState>;
    status(directory: string): PreviewState;
    stop(directory: string): Promise<PreviewState>;
    stopAll(): Promise<void>;
    /** The apps being served right now. */
    list(): {
        directory: string;
        url: string;
        access: Access;
    }[];
}
/**
 * Work that must be repeated whenever one file of the app changes, such as
 * applying the database schema. It also runs once before the server starts.
 */
export interface PreviewSync {
    /** Path of the watched file, relative to the app directory. */
    file: string;
    /** Does the work and returns lines to show in the preview output. */
    run(directory: string, access: Access): Promise<string[]>;
}
/** One dev server per app directory, bound to loopback. */
export declare function createPreviewManager(options?: {
    command?: (directory: string, port: number) => {
        file: string;
        args: string[];
    };
    readyTimeoutMs?: number;
    sync?: PreviewSync;
}): PreviewManager;
