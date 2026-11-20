/**
 * Find the preview URL in a tool view's props. The props shape differs by
 * phase and host version, so this reads every string it can reach instead of
 * depending on one field.
 */
export declare function extractPreviewUrl(props: unknown): string | undefined;
