const LOOPBACK = /http:\/\/127\.0\.0\.1:\d{2,5}\//;
/**
 * Find the preview URL in a tool view's props. The props shape differs by
 * phase and host version, so this reads every string it can reach instead of
 * depending on one field.
 */
export function extractPreviewUrl(props) {
    const seen = new Set();
    const visit = (value, depth) => {
        if (typeof value === 'string')
            return LOOPBACK.exec(value)?.[0];
        if (!value || typeof value !== 'object' || depth > 8 || seen.has(value))
            return undefined;
        seen.add(value);
        for (const item of Object.values(value)) {
            const found = visit(item, depth + 1);
            if (found)
                return found;
        }
        return undefined;
    };
    return visit(props, 0);
}
