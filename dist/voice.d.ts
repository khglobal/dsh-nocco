/** The sample rate DSH's speech service accepts. */
export declare const VOICE_RATE = 16000;
/** The longest recording sent for transcription, in seconds; the service's own limit is a little higher. */
export declare const VOICE_SECONDS = 110;
/** Resample mono audio to the speech service's rate by averaging the source samples each output sample spans. */
export declare function downsample(samples: Float32Array, fromRate: number, toRate?: number): Float32Array;
/** Encode mono audio as the canonical 16-bit PCM WAV file the speech service validates. */
export declare function encodeWav(samples: Float32Array, rate?: number): Uint8Array;
export interface Recording {
    /** Stop recording and return the audio as a WAV file. */
    stop(): Promise<Uint8Array>;
    /** Stop recording and discard the audio. */
    cancel(): void;
}
/**
 * Record from the microphone until stopped. Recording ends by itself at the
 * length limit; `stop` then returns what was captured.
 */
export declare function startRecording(): Promise<Recording>;
