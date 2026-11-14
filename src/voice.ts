/** The sample rate DSH's speech service accepts. */
export const VOICE_RATE = 16000;
/** The longest recording sent for transcription, in seconds; the service's own limit is a little higher. */
export const VOICE_SECONDS = 110;

/** Resample mono audio to the speech service's rate by averaging the source samples each output sample spans. */
export function downsample(samples: Float32Array, fromRate: number, toRate = VOICE_RATE): Float32Array {
  if (fromRate === toRate) return samples;
  if (fromRate < toRate) throw new Error('the microphone records below the rate speech recognition needs');
  const ratio = fromRate / toRate;
  const output = new Float32Array(Math.floor(samples.length / ratio));
  for (let index = 0; index < output.length; index += 1) {
    const start = Math.floor(index * ratio);
    const end = Math.min(samples.length, Math.max(start + 1, Math.floor((index + 1) * ratio)));
    let sum = 0;
    for (let position = start; position < end; position += 1) sum += samples[position]!;
    output[index] = sum / (end - start);
  }
  return output;
}

/** Encode mono audio as the canonical 16-bit PCM WAV file the speech service validates. */
export function encodeWav(samples: Float32Array, rate = VOICE_RATE): Uint8Array {
  const bytes = new Uint8Array(44 + samples.length * 2);
  const view = new DataView(bytes.buffer);
  const ascii = (offset: number, text: string): void => { for (let index = 0; index < text.length; index += 1) view.setUint8(offset + index, text.charCodeAt(index)); };
  ascii(0, 'RIFF'); view.setUint32(4, bytes.length - 8, true); ascii(8, 'WAVE');
  ascii(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  ascii(36, 'data'); view.setUint32(40, samples.length * 2, true);
  for (let index = 0; index < samples.length; index += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[index]!));
    view.setInt16(44 + index * 2, Math.round(clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff), true);
  }
  return bytes;
}

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
export async function startRecording(): Promise<Recording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
  const context = new AudioContext();
  const source = context.createMediaStreamSource(stream);
  // A script processor is deprecated but needs no separately served worklet file, which a plugin bundle cannot ship.
  const tap = context.createScriptProcessor(4096, 1, 1);
  const chunks: Float32Array[] = [];
  let captured = 0;
  const limit = VOICE_SECONDS * context.sampleRate;
  tap.onaudioprocess = (event) => {
    if (captured >= limit) return;
    const chunk = new Float32Array(event.inputBuffer.getChannelData(0));
    chunks.push(chunk);
    captured += chunk.length;
  };
  source.connect(tap);
  tap.connect(context.destination);
  const release = (): void => {
    tap.onaudioprocess = null;
    source.disconnect();
    tap.disconnect();
    for (const track of stream.getTracks()) track.stop();
    void context.close();
  };
  return {
    cancel: release,
    stop: async () => {
      const rate = context.sampleRate;
      release();
      const joined = new Float32Array(Math.min(captured, limit));
      let offset = 0;
      for (const chunk of chunks) {
        if (offset >= joined.length) break;
        joined.set(chunk.subarray(0, joined.length - offset), offset);
        offset += chunk.length;
      }
      return encodeWav(downsample(joined, rate));
    },
  };
}
