import { readlink, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
/** Access for callers the host does not restrict: the plugin's own tests and scripts. */
export const OPEN = { confined: false, inside: async () => { }, wrap: async (argv) => [...argv], env: {} };
/** The host refused an action, or nobody could be asked. */
export class PermissionDenied extends Error {
    code = 'NOCCO_PERMISSION_DENIED';
    constructor(message) {
        super(message);
        this.name = 'PermissionDenied';
    }
}
/**
 * The path as the file system resolves it: symbolic links followed through
 * the deepest part that exists, the rest appended as written. A path checked
 * this way cannot leave a root through a link.
 */
export async function canonical(path) {
    const absolute = resolve(path);
    try {
        return await realpath(absolute);
    }
    catch (error) {
        if (error.code !== 'ENOENT')
            throw error;
        // A link whose target does not exist yet still decides where a write lands.
        const target = await readlink(absolute).catch(() => undefined);
        if (target !== undefined)
            return canonical(resolve(dirname(absolute), target));
        const parent = dirname(absolute);
        return parent === absolute ? absolute : join(await canonical(parent), basename(absolute));
    }
}
/** Whether a canonical path is a root or lies beneath it. */
export function isUnder(path, root) {
    const rest = relative(root, path);
    return rest === '' || (!rest.startsWith(`..${sep}`) && rest !== '..' && !isAbsolute(rest));
}
/** The directories a session may write under by its standing policy; none unless it may write its workspace. */
async function standingRoots(policy) {
    if (policy?.mode !== 'workspace-write')
        return [];
    // The host's own tools also allow the temporary areas in this mode.
    const roots = [policy.workspaceRoot, ...(policy.additionalWritableRoots ?? []), '/tmp', tmpdir()];
    return [...new Set(await Promise.all(roots.map((root) => canonical(root))))];
}
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
export async function authorize(host, caller, directory, purpose) {
    if (!isAbsolute(directory))
        throw new Error(`directory must be an absolute path: ${directory}`);
    const standing = host.policy?.resolve(caller.agent?.session ? { session: caller.agent.session } : {});
    if (standing?.mode === 'danger-full-access')
        return OPEN;
    const mode = standing?.mode ?? 'unknown';
    const ask = async (reason) => {
        if (!host.approval || !caller.agent) {
            throw new PermissionDenied(`${reason.en}. This needs the user's approval, and this session has no way to ask for it.`);
        }
        const outcome = await host.approval.request({
            agent: caller.agent, toolName: caller.toolName, callId: caller.callId,
            reason: reason.en, displayReason: reason, signal: caller.signal,
        }).catch(() => 'unavailable');
        if (outcome === 'allowed-once')
            return;
        if (outcome === 'cancelled' && caller.signal?.aborted)
            throw caller.signal.reason ?? new PermissionDenied('cancelled');
        throw new PermissionDenied(`${reason.en}. The request for approval ended as: ${outcome}. Nothing was changed.`);
    };
    const target = await canonical(directory);
    let roots = await standingRoots(standing);
    let policy = standing;
    if (!roots.some((root) => isUnder(target, root))) {
        await ask({
            en: `Nocco wants to ${purpose.en} in ${target}, which is outside what this session may write (${mode} mode)`,
            zh: `Nocco 需要在 ${target} 中${purpose.zh}，该位置超出了本会话可写入的范围（${mode} 模式）`,
        });
        // The grant covers this directory and nothing beside it.
        roots = [target];
        policy = { mode: 'workspace-write', workspaceRoot: target, ...(standing?.sessionId === undefined ? {} : { sessionId: standing.sessionId }) };
    }
    let unconfined;
    return {
        confined: true,
        env: { npm_config_cache: join(tmpdir(), 'nocco-npm-cache') },
        async inside(path) {
            const resolved = await canonical(path);
            if (!roots.some((root) => isUnder(resolved, root))) {
                throw new PermissionDenied(`Nocco may not write ${resolved}: it is outside what this session may write (${mode} mode).`);
            }
        },
        async wrap(argv) {
            if (host.sandbox && policy) {
                try {
                    return (await host.sandbox.confine(argv, policy, caller.signal)).argv;
                }
                catch { /* the host cannot confine here: fall through and ask */ }
            }
            // One approval covers the programs of this call.
            unconfined ??= ask({
                en: `Nocco wants to ${purpose.en} in ${target} by running programs that this machine cannot confine to that folder`,
                zh: `Nocco 需要在 ${target} 中${purpose.zh}，但本机无法把所运行的程序限制在该文件夹内`,
            });
            await unconfined;
            return [...argv];
        },
    };
}
/**
 * How to start a program through an Access. Unrestricted callers start it as
 * before; a confined program is started by the host's runner, which on Windows
 * needs the command interpreter to run a script file.
 */
export async function command(access, file, args) {
    const windows = process.platform === 'win32';
    if (!access.confined)
        return { file, args: [...args], shell: windows, env: process.env };
    const [runner = file, ...rest] = await access.wrap(windows ? ['cmd.exe', '/d', '/s', '/c', file, ...args] : [file, ...args]);
    return { file: runner, args: rest, shell: false, env: { ...process.env, ...access.env } };
}
