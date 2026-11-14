/** The colours an app's pages take from assets/css/design-scheme.css. */
export interface Palette {
  primary: string;
  bg: string;
  text: string;
  textSecondary: string;
  surface: string;
  border: string;
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const KEYS = ['primary', 'bg', 'text', 'textSecondary', 'surface', 'border'] as const;

/** Check a palette received from the page: six `#rrggbb` colours and nothing else. */
export function readPalette(value: unknown): Palette {
  const source = (value ?? {}) as Record<string, unknown>;
  const palette = {} as Palette;
  for (const key of KEYS) {
    const colour = source[key];
    if (typeof colour !== 'string' || !HEX.test(colour)) throw new Error(`palette.${key} must be a #rrggbb colour`);
    palette[key] = colour;
  }
  return palette;
}

/** The contents of design-scheme.css for a palette. Status colours are fixed. */
export function paletteCss(palette: Palette): string {
  return `/* Written by Nocco when a palette is picked in the preview. */
:root {
  --nocco-primary: ${palette.primary};
  --nocco-bg: ${palette.bg};
  --nocco-text: ${palette.text};
  --nocco-text-secondary: ${palette.textSecondary};
  --nocco-surface: ${palette.surface};
  --nocco-border: ${palette.border};
  --nocco-success: #10b981;
  --nocco-warning: #f59e0b;
  --nocco-error: #ef4444;
}
`;
}

/** Palettes offered in the preview tab. */
export const PALETTES: readonly (Palette & { id: string })[] = [
  { id: 'violet', primary: '#9E7FFF', bg: '#ffffff', text: '#171717', textSecondary: '#4b5563', surface: '#f7f7f7', border: '#e5e7eb' },
  { id: 'navy', primary: '#24456D', bg: '#ffffff', text: '#1a1f2c', textSecondary: '#56607a', surface: '#f6f7f9', border: '#e3e7ee' },
  { id: 'emerald', primary: '#0f9d76', bg: '#ffffff', text: '#12211c', textSecondary: '#4c6159', surface: '#f3f8f6', border: '#dbe7e2' },
  { id: 'amber', primary: '#c2700a', bg: '#fffdf8', text: '#231a0d', textSecondary: '#6b5a41', surface: '#faf5ea', border: '#ecdfc6' },
  { id: 'rose', primary: '#d6336c', bg: '#ffffff', text: '#22141a', textSecondary: '#6a4c58', surface: '#fbf4f6', border: '#f0dde3' },
  { id: 'night', primary: '#8ea2ff', bg: '#12141c', text: '#eef0f6', textSecondary: '#a4abbd', surface: '#1b1e29', border: '#2c3040' },
];
