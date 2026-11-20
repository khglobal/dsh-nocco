import { type CSSProperties, type ReactElement } from 'react';
import { type Palette } from './palette.js';
import { type Strings } from './text.js';
export interface CheckpointItem {
    id: string;
    label: string;
    time: number;
    filesChanged: number;
}
export interface PreviewTabApi {
    /** Recolour the app served at this address. */
    setPalette(url: string, palette: Palette): Promise<void>;
    /** Put text into the open session's message box. */
    insert(text: string): void;
    /** List the checkpoints of the app served at this address, after an optional save or restore. */
    checkpoints(url: string, action: 'list' | 'save' | 'restore', id?: string): Promise<CheckpointItem[]>;
}
export declare const button: CSSProperties;
/** What the app reports about an element the user picked in it. */
export interface PickedElement {
    tag: string;
    text: string;
    classes: string;
    file: string;
    page: string;
}
/** The line that tells the agent which element the user picked, in the page's language. */
export declare function describePicked(element: PickedElement, strings: Pick<Strings, 'pickedLine' | 'pickedPage' | 'pickedFile'>): string;
/** A short account of how long ago a moment was, in the given language. */
export declare function ago(seconds: number, now: number, lang: string): string;
/** The right-sidebar tab that shows a running app with width, reload, palette and history controls. */
export declare function createPreviewTab(api: PreviewTabApi): (props: {
    useTabInfo?: () => {
        tab?: {
            navigation?: {
                params?: {
                    url?: string;
                };
            };
        };
    };
}) => ReactElement;
