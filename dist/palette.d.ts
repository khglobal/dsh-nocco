/** The colours an app's pages take from assets/css/design-scheme.css. */
export interface Palette {
    primary: string;
    bg: string;
    text: string;
    textSecondary: string;
    surface: string;
    border: string;
}
/** Check a palette received from the page: six `#rrggbb` colours and nothing else. */
export declare function readPalette(value: unknown): Palette;
/** Font stacks an app can be created with, by the name the home page offers. */
export declare const FONT_STACKS: Readonly<Record<string, string>>;
/** Black or white, whichever reads better on the given `#rrggbb` colour. */
export declare function onColour(hex: string): string;
/** The font stack recorded in a design-scheme.css, if it has one. */
export declare const fontIn: (css: string) => string | undefined;
/**
 * The contents of design-scheme.css for a palette, with the app's font stack
 * when it has one. Status colours are fixed.
 */
export declare function paletteCss(palette: Palette, font?: string): string;
/** Palettes offered on the home page and in the preview tab. */
export declare const PALETTES: readonly (Palette & {
    id: string;
})[];
/**
 * The palette a name or colour stands for: the id of an offered palette, or a
 * `#rrggbb` colour, which becomes the main colour of a light palette.
 */
export declare function resolvePalette(value: string | undefined): Palette | undefined;
