import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractPreviewUrl } from '../dist/preview-url.js';
import { text } from '../dist/text.js';

test('finds the URL in a rendered JSON result', () => {
  const props = { phase: 'result', block: { result: [{ type: 'text', text: '{"running":true,"url":"http://127.0.0.1:5173/","output":[]}' }] } };
  assert.equal(extractPreviewUrl(props), 'http://127.0.0.1:5173/');
});

test('finds the URL when the result is already an object', () => {
  assert.equal(extractPreviewUrl({ block: { value: { url: 'http://127.0.0.1:4000/' } } }), 'http://127.0.0.1:4000/');
});

test('ignores anything that is not a loopback URL', () => {
  assert.equal(extractPreviewUrl({ block: { text: 'see https://example.com/ and http://10.0.0.5:80/' } }), undefined);
});

test('returns undefined for a stopped server, cycles and empty input', () => {
  assert.equal(extractPreviewUrl({ block: { text: '{"running":false,"output":[]}' } }), undefined);
  const cyclic = {}; cyclic.self = cyclic;
  assert.equal(extractPreviewUrl(cyclic), undefined);
  assert.equal(extractPreviewUrl(undefined), undefined);
});

test('strings exist in both languages', () => {
  assert.equal(text('zh-CN').open, '打开预览');
  assert.equal(text('en').open, 'Open preview');
  assert.equal(text('fr').open, 'Open preview');
});
