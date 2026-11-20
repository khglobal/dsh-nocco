export const FONTS = ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'];
export const FEATURES = ['rounded', 'border', 'gradient', 'shadow', 'frosted'];
/**
 * The draft a Build action puts in a new session: the skill invocation, what
 * the user asked for, and one line per choice made on the home page. Choices
 * left at their defaults add no line.
 */
export function buildDraft(request, choices, strings) {
    // The app is made in the language DSH itself is showing, unless the request says otherwise.
    const lines = [`${strings.designLine}${choices.designSystem}`, strings.languageLine];
    if (choices.palette)
        lines.push(`${strings.paletteLine}${choices.palette}`);
    if (choices.font)
        lines.push(`${strings.fontLine}${choices.font}`);
    if (choices.features?.length)
        lines.push(`${strings.styleLine}${choices.features.map((id) => strings[id]).join(', ')}`);
    if (choices.mode === 'discuss')
        lines.push(`${strings.modeLine}${strings.discuss}`);
    if (choices.files?.length)
        lines.push(strings.filesLine, ...choices.files.map((file) => `- ${file}`));
    return `/nocco ${request.trim()}\n\n${lines.join('\n')}`;
}
