/**
 * What one tool call may do to one app directory, as the host decided it.
 *
 * The host gives every session a file policy and an approval channel. A tool
 * that writes files or starts programs asks {@link authorize} for an Access
 * before it does either, and does both only through it.
 */
export interface Access {
    /** False when the host restricts nothing for this session. */
    readonly confined: boolean;
    /** Throws unless a write to this path stays inside what was allowed. */
    inside(path: string): Promise<void>;
    /** The command to start in place of the given one, so the program runs under the host's confinement. */
    wrap(argv: readonly string[]): Promise<string[]>;
    /** Extra environment for programs started through {@link wrap}. */
    readonly env: Readonly<Record<string, string>>;
}
/** Access for callers the host does not restrict: the plugin's own tests and scripts. */
export declare const OPEN: Access;
/** The host refused an action, or nobody could be asked. */
export declare class PermissionDenied extends Error {
    readonly code = "NOCCO_PERMISSION_DENIED";
    constructor(message: string);
}
type Policy = {
    mode: string;
    workspaceRoot: string;
    additionalWritableRoots?: readonly string[];
    sessionId?: unknown;
};
/** The host services a permission decision needs; any of them may be absent. */
export interface PermissionHost {
    /** The session file policy (`ctx.sandboxPolicy`). */
    policy?: {
        resolve(request?: {
            session?: unknown;
        }): Policy;
    };
    /** Process confinement (`ctx.sandbox`). */
    sandbox?: {
        confine(argv: readonly string[], policy: Policy, signal?: AbortSignal): Promise<{
            argv: string[];
        }>;
    };
    /** The approval channel (`ctx.approval`). */
    approval?: {
        request(request: {
            agent: unknown;
            toolName: string;
            callId?: unknown;
            reason: string;
            displayReason?: {
                en: string;
                [locale: string]: string;
            };
            signal?: AbortSignal;
        }): Promise<string>;
    };
}
/** The tool call a decision is made for. */
export interface Caller {
    toolName: string;
    agent?: {
        session?: unknown;
    };
    callId?: unknown;
    signal?: AbortSignal;
}
/**
 * The path as the file system resolves it: symbolic links followed through
 * the deepest part that exists, the rest appended as written. A path checked
 * this way cannot leave a root through a link.
 */
export declare function canonical(path: string): Promise<string>;
/** Whether a canonical path is a root or lies beneath it. */
export declare function isUnder(path: string, root: string): boolean;
/**
 * Decide whether a tool call may write and run programs in an app directory.
 *
 * A session the host does not restrict gets open access. Otherwise the
 * directory must lie where the session may write; when it does not, the host's
 * approval channel is asked once for this call, and a grant covers that
 * directory only. Programs then run under the host's process confinement,
 * limited to the same place. Where the host cannot confine a program, running
 * it unconfined needs its own approval. Every refusal throws
 * {@link PermissionDenied} before anything is written or started.
 */
export declare function authorize(host: PermissionHost, caller: Caller, directory: string, purpose: {
    en: string;
    zh: string;
}): Promise<Access>;
/**
 * How to start a program through an Access. Unrestricted callers start it as
 * before; a confined program is started by the host's runner, which on Windows
 * needs the command interpreter to run a script file.
 */
export declare function command(access: Access, file: string, args: readonly string[]): Promise<{
    file: string;
    args: string[];
    shell: boolean;
    env: NodeJS.ProcessEnv;
}>;
export {};
