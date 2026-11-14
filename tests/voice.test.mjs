import { test } from 'node:test';
import assert from 'node:assert/strict';
import { downsample, encodeWav, VOICE_RATE } from '../dist/voice.js';
import { createVoice, VOICE_LIMIT } from '../dist/home-api.js';
import { describePicked } from '../dist/preview-tab.js';
import { text } from '../dist/text.js';

// The same checks DSH's speech service applies to a recording before transcribing it.
function isCanonicalWave(bytes) {
  const data = Buffer.from(bytes);
  return data.length >= 46 && data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WAVE'
    && data.toString('ascii', 12, 16) === 'fmt ' && data.readUInt32LE(16) === 16 && data.readUInt16LE(20) === 1
    && data.readUInt16LE(22) === 1 && data.readUInt32LE(24) === 16000 && data.readUInt32LE(28) === 32000
    && data.readUInt16LE(32) === 2 && data.readUInt16LE(34) === 16 && data.toString('ascii', 36, 40) === 'data'
    && data.readUInt32LE(4) === data.length - 8 && data.readUInt32LE(40) === data.length - 44 && (data.length - 44) % 2 === 0;
}

test('a recording becomes the WAV file the speech service accepts', () => {
  const second = Float32Array.from({ length: 48000 }, (_, index) => Math.sin(index / 10));
  const resampled = downsample(second, 48000);
  assert.equal(resampled.length, VOICE_RATE);
  const wav = encodeWav(resampled);
  assert.ok(isCanonicalWave(wav));
  assert.equal(wav.length, 44 + VOICE_RATE * 2);
});

test('samples are averaged, clamped and kept when already at the right rate', () => {
  assert.deepEqual([...downsample(Float32Array.from([0, 0.5, 1, 1, 1, 1]), 48000, 16000)], [0.5, 1]);
  const same = Float32Array.from([0.5]);
  assert.equal(downsample(same, 16000), same);
  assert.throws(() => downsample(same, 8000), /below the rate/);
  const view = new DataView(encodeWav(Float32Array.from([2, -2, 0])).buffer);
  assert.deepEqual([view.getInt16(44, true), view.getInt16(46, true), view.getInt16(48, true)], [32767, -32768, 0]);
});

test('voice is offered only while the selected recogniser is ready', async () => {
  const speech = (phase) => ({
    snapshot: () => ({ providers: [{ id: 'a', preparation: { phase: 'ready' } }, { id: 'b', preparation: { phase } }], selection: { providerId: 'b' } }),
    resolve: (request) => request,
    transcribe: async (spec) => ({ text: `  heard ${spec.audio.byteLength} bytes ` }),
  });
  assert.equal(createVoice(() => undefined).available(), false);
  assert.equal(createVoice(() => speech('downloading')).available(), false);
  assert.equal(createVoice(() => speech('standby')).available(), true);
  assert.deepEqual(await createVoice(() => speech('ready')).transcribe(new Uint8Array(10)), { text: 'heard 10 bytes' });
  await assert.rejects(createVoice(() => undefined).transcribe(new Uint8Array(1)), /not enabled/);
  await assert.rejects(createVoice(() => speech('ready')).transcribe({ byteLength: VOICE_LIMIT + 1 }), /too long/);
});

test('a picked element is described in one line for the agent', () => {
  const picked = { tag: 'button', text: 'Import', classes: 'ant-btn ant-btn-primary', file: '/app/pages/records.vue', page: '/records' };
  assert.equal(describePicked(picked, text('en')),
    'Selected in preview: <button class="ant-btn ant-btn-primary"> · "Import" · page /records · component file /app/pages/records.vue\n');
  assert.equal(describePicked({ tag: 'div', text: '', classes: '', file: '', page: '/' }, text('zh')), '预览中选中的元素：<div> · 页面 /\n');
});
