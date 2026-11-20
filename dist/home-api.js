import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { buildEnhancePrompt, cleanEnhanced, ENHANCE_LIMIT } from './enhance.js';
import { fontIn, paletteCss, readPalette } from './palette.js';
import { buildSuggestPrompt, FALLBACK, langOf, parseSuggestions, SUGGESTION_COUNT } from './suggest.js';
const MAX_WORKSPACES = 5;
const MAX_FILES = 40;
const MAX_SESSIONS = 20;
const SKIP = new Set(['node_modules', 'dist', 'build']);
/**
 * Follow optional host services as they come and go. A plugin only sees a
 * service it has asked for, so each one is requested on its own and a missing
 * one never holds the plugin back.
 */
export function trackServices(ctx, names) {
    const host = ctx;
    const found = new Map();
    for (const name of names) {
        host.inject([name], (inner) => {
            found.set(name, inner.get(name));
            inner.effect(() => () => { found.delete(name); });
        });
    }
    return (name) => found.get(name);
}
/** Titles found anywhere in a title-snapshot result, whatever container it uses. */
function titlesIn(value) {
    const items = value instanceof Map ? [...value.values()] : Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [];
    return items.flatMap((item) => {
        const title = item?.title;
        const text = typeof title === 'string' ? title : title?.title;
        return typeof text === 'string' && text.trim() ? [text.trim().slice(0, 80)] : [];
    });
}
/** Names only: workspace titles, their top-level entries, and recent session titles. */
export async function gatherContext(get, signal) {
    const context = { workspaces: [], sessions: [] };
    try {
        for (const workspace of (get('workspaceRegistry')?.list() ?? []).slice(0, MAX_WORKSPACES)) {
            if (!workspace.path)
                continue;
            const names = await readdir(workspace.path).catch(() => []);
            context.workspaces.push({
                title: workspace.title || workspace.path.split(/[\\/]/).pop() || 'workspace',
                files: names.filter((name) => !name.startsWith('.') && !SKIP.has(name)).slice(0, MAX_FILES),
            });
        }
    }
    catch { /* no workspace service: suggestions use what else there is */ }
    try {
        const query = get('sessionQuery');
        const records = (await query?.listSessions(signal) ?? []).slice(0, MAX_SESSIONS);
        const ids = records.flatMap((record) => (record.header?.id ? [record.header.id] : []));
        if (query?.readTitleSnapshots && ids.length > 0)
            context.sessions = titlesIn(await query.readTitleSnapshots(ids, signal));
    }
    catch { /* no session service */ }
    return context;
}
/** One model call with the user's default model, outside any session. */
async function askModel(get, system, user, signal) {
    const llm = get('llm');
    const selection = get('agentDefaultModel')?.currentSelection();
    if (!llm || !selection)
        throw new Error('no model is available to this plugin');
    // Loaded at call time so a host without this package still loads the plugin.
    const moduleName = '@deepseek-ai/dsh-llm';
    const { createUserMessage, BlockAssembler } = await import(moduleName);
    const call = await llm.prepareCall({ provider: selection.provider, model: selection.model, maxTokens: 4096 }, signal);
    const assembler = new BlockAssembler();
    const messages = [createUserMessage({ content: [{ type: 'text', text: user }], source: { kind: 'dsh-nocco' } })];
    for await (const chunk of call.stream({ ...call.config, system, purpose: 'nocco-home', signal, messages }))
        assembler.push(chunk);
    const finish = assembler.finish;
    if (finish?.kind === 'error' || finish?.kind === 'aborted')
        throw new Error(`model call failed: ${finish.failure?.code ?? finish.kind}`);
    const blocks = assembler.blocks();
    const reply = blocks.flatMap((block) => (block.type === 'text' && typeof block.text === 'string' ? [block.text] : [])).join('');
    if (!reply.trim())
        throw new Error(`the model reply held no text (finish: ${finish?.kind ?? 'unknown'}; blocks: ${blocks.map((block) => block.type).join(',') || 'none'})`);
    return reply;
}
/** Rewrite a rough request into a clearer one with the user's default model. */
export function createEnhancer(get, ask = askModel) {
    return async function enhance(request) {
        const original = typeof request === 'string' ? request.trim() : '';
        if (!original)
            throw new Error('there is no request to improve');
        if (original.length > ENHANCE_LIMIT)
            throw new Error(`the request is longer than ${ENHANCE_LIMIT} characters`);
        const { system, user } = buildEnhancePrompt(original);
        const text = cleanEnhanced(await ask(get, system, user, AbortSignal.timeout(60000)));
        if (!text)
            throw new Error('the model returned nothing to use');
        return { text };
    };
}
/** The largest recording accepted for transcription, in bytes; matches the speech service's default. */
export const VOICE_LIMIT = 4 * 1024 * 1024;
/** Voice input through DSH's own speech service: whether it is ready, and transcription of one recording. */
export function createVoice(get) {
    const ready = (speech) => {
        const { providers, selection } = speech.snapshot();
        const chosen = providers.find((provider) => provider.id === selection?.providerId) ?? providers[0];
        return ['ready', 'standby'].includes(chosen?.preparation?.phase ?? '');
    };
    return {
        available() {
            const speech = get('speechToText');
            try {
                return Boolean(speech && ready(speech));
            }
            catch {
                return false;
            }
        },
        async transcribe(audio) {
            const speech = get('speechToText');
            if (!speech)
                throw new Error('voice input is not enabled in DSH');
            if (audio.byteLength > VOICE_LIMIT)
                throw new Error('the recording is too long');
            const { text } = await speech.transcribe(speech.resolve({ audio }), AbortSignal.timeout(120000));
            return { text: text.trim() };
        },
    };
}
/** Suggested builds for the home page, cached per language until refreshed. */
export function createSuggester(get, ask = askModel) {
    const cache = new Map();
    return async function suggest(lang, refresh) {
        const cached = cache.get(lang);
        if (cached && !refresh)
            return cached;
        let result;
        try {
            const signal = AbortSignal.timeout(45000);
            const { system, user } = buildSuggestPrompt(await gatherContext(get, signal), lang);
            const suggestions = parseSuggestions(await ask(get, system, user, signal));
            if (suggestions.length < SUGGESTION_COUNT / 2)
                throw new Error('the model reply held too few usable suggestions');
            result = { suggestions, source: 'model' };
        }
        catch (error) {
            result = { suggestions: [...FALLBACK[lang]], source: 'fallback', reason: error instanceof Error ? error.message : String(error) };
        }
        // A failed refresh keeps earlier model suggestions rather than replacing them with samples.
        if (result.source === 'fallback' && cached?.source === 'model')
            return cached;
        cache.set(lang, result);
        return result;
    };
}
const json = (value, status = 200) => Response.json(value, { status });
/** The largest file the home page may attach, in bytes. */
export const UPLOAD_LIMIT = 25 * 1024 * 1024;
/**
 * Keep a file the user attached on the home page where the agent can read it.
 * It lands in its own folder under the system's temporary directory, under
 * its own name with path separators removed.
 */
export async function saveUpload(name, bytes, root = join(tmpdir(), 'nocco-uploads')) {
    const clean = basename(name.replace(/\\/g, '/')).replace(/[\u0000-\u001f]/g, '').trim();
    if (!clean || clean === '.' || clean === '..')
        throw new Error('the file has no usable name');
    if (bytes.byteLength === 0)
        throw new Error('the file is empty');
    if (bytes.byteLength > UPLOAD_LIMIT)
        throw new Error(`the file is larger than ${UPLOAD_LIMIT / 1024 / 1024} MB`);
    const folder = join(root, randomBytes(6).toString('hex'));
    await mkdir(folder, { recursive: true });
    const path = join(folder, clean);
    await writeFile(path, bytes);
    return { name: clean, path };
}
/**
 * Routes the plugin's pages call. They exist while the host's connection
 * service does; without it the pages fall back on their own.
 */
export function registerHomeApi(ctx, previews, checkpoints) {
    const services = trackServices(ctx, ['llm', 'agentDefaultModel', 'workspaceRegistry', 'sessionQuery', 'speechToText']);
    const voice = createVoice(services);
    const suggest = createSuggester(services);
    const enhance = createEnhancer(services);
    const handle = (work) => async (request) => {
        try {
            const body = request.method === 'POST' ? await request.json().catch(() => ({})) : {};
            return json(await work(body));
        }
        catch (error) {
            return json({ error: error instanceof Error ? error.message : String(error) }, 400);
        }
    };
    // Pages name an app by the address of its running preview, never by a path.
    const served = (url) => {
        const preview = previews.list().find((item) => item.url === url);
        if (!preview)
            throw new Error('no running preview has that address');
        return preview;
    };
    const host = ctx;
    host.inject(['connection'], (inner) => {
        const connection = inner.get('connection');
        const disposers = [
            connection.fetch.register({
                path: '/api/nocco.suggestions', methods: ['POST'], requestBody: 'buffered',
                fetch: handle((body) => suggest(langOf(body.lang), body.refresh === true)),
            }),
            connection.fetch.register({
                // The file's bytes are the body; its name travels percent-encoded in a header.
                path: '/api/nocco.upload', methods: ['POST'], requestBody: 'buffered',
                fetch: async (request) => {
                    try {
                        const name = decodeURIComponent(request.headers.get('x-nocco-filename') ?? '');
                        return json(await saveUpload(name, new Uint8Array(await request.arrayBuffer())));
                    }
                    catch (error) {
                        return json({ error: error instanceof Error ? error.message : String(error) }, 400);
                    }
                },
            }),
            connection.fetch.register({
                // POST like the others: the host's gateway refuses a plugin's GET routes.
                path: '/api/nocco.voice', methods: ['POST'], requestBody: 'buffered',
                fetch: handle(async () => ({ available: voice.available() })),
            }),
            connection.fetch.register({
                // The body is one WAV recording.
                path: '/api/nocco.transcribe', methods: ['POST'], requestBody: 'buffered',
                fetch: async (request) => {
                    try {
                        return json(await voice.transcribe(new Uint8Array(await request.arrayBuffer())));
                    }
                    catch (error) {
                        return json({ error: error instanceof Error ? error.message : String(error) }, 400);
                    }
                },
            }),
            connection.fetch.register({
                path: '/api/nocco.enhance', methods: ['POST'], requestBody: 'buffered',
                fetch: handle((body) => enhance(body.text)),
            }),
            connection.fetch.register({
                path: '/api/nocco.previews', methods: ['POST'], requestBody: 'buffered',
                fetch: handle(async () => ({ previews: previews.list().map(({ directory, url }) => ({ directory, url })) })),
            }),
            connection.fetch.register({
                path: '/api/nocco.palette', methods: ['POST'], requestBody: 'buffered',
                fetch: handle(async (body) => {
                    // Only an app this plugin is serving can be recoloured, and only with validated colours.
                    const app = served(body.url);
                    const file = join(app.directory, 'assets', 'css', 'design-scheme.css');
                    await app.access.inside(file);
                    // Recolouring keeps the font the app was created with.
                    const font = fontIn(await readFile(file, 'utf8').catch(() => ''));
                    await writeFile(file, paletteCss(readPalette(body.palette), font));
                    return { ok: true };
                }),
            }),
            connection.fetch.register({
                path: '/api/nocco.checkpoints', methods: ['POST'], requestBody: 'buffered',
                fetch: handle(async (body) => {
                    // The page acts on a running preview, within what the call that started it was allowed.
                    const { directory, access } = served(body.url);
                    if (body.action === 'save')
                        await checkpoints.save(directory, typeof body.label === 'string' ? body.label : undefined, access);
                    else if (body.action === 'restore')
                        await checkpoints.restore(directory, String(body.id ?? ''), access);
                    else if (body.action !== 'list')
                        throw new Error('action must be list, save or restore');
                    return { checkpoints: await checkpoints.list(directory, access) };
                }),
            }),
        ];
        inner.effect(() => () => { for (const dispose of disposers)
            void dispose(); });
    });
}
