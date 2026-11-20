import { type ReactElement } from 'react';
export interface HomeApi {
    /** Suggested builds; `refresh` asks the model again. */
    suggestions(lang: string, refresh: boolean): Promise<{
        suggestions: string[];
        source: 'model' | 'fallback';
    }>;
    /** Rewrite a rough request into a clearer one with the user's model. */
    enhance(request: string): Promise<string>;
    /** Whether DSH's voice input is enabled and ready. */
    voiceAvailable(): Promise<boolean>;
    /** Turn one WAV recording into text with DSH's speech service. */
    transcribe(wav: Uint8Array): Promise<string>;
    /** Keep an attached file where the agent can read it; returns its path there. */
    upload(file: File): Promise<{
        name: string;
        path: string;
    }>;
    /** Open a new session with this draft. */
    start(draft: string): void;
}
/** The Nocco home page: the Nocco web app's home, with a prompt box, design-system choice and suggested builds. */
export declare function createHome(api: HomeApi): () => ReactElement;
/** The sidebar icon for the home page. */
export declare function HomeIcon(props: {
    size?: number;
}): ReactElement;
