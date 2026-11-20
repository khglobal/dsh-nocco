window.__ModuleLoader__.load({id: "@khglobal/dsh-nocco", factory: function(require) {
const module = { exports: {} };
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.ts
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(client_exports);
var import_react3 = require("react");

// src/home.ts
var import_react = require("react");

// src/draft.ts
var FONTS = ["sans-serif", "serif", "monospace", "cursive", "fantasy"];
var FEATURES = ["rounded", "border", "gradient", "shadow", "frosted"];
function buildDraft(request, choices, strings) {
  const lines = [`${strings.designLine}${choices.designSystem}`, strings.languageLine];
  if (choices.palette) lines.push(`${strings.paletteLine}${choices.palette}`);
  if (choices.font) lines.push(`${strings.fontLine}${choices.font}`);
  if (choices.features?.length) lines.push(`${strings.styleLine}${choices.features.map((id) => strings[id]).join(", ")}`);
  if (choices.mode === "discuss") lines.push(`${strings.modeLine}${strings.discuss}`);
  if (choices.files?.length) lines.push(strings.filesLine, ...choices.files.map((file) => `- ${file}`));
  return `/nocco ${request.trim()}

${lines.join("\n")}`;
}

// src/palette.ts
var FONT_STACKS = {
  "sans-serif": "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
  serif: "Georgia, 'Songti SC', 'Noto Serif CJK SC', 'SimSun', serif",
  monospace: "ui-monospace, 'SF Mono', Menlo, Consolas, 'Noto Sans Mono CJK SC', monospace",
  cursive: "'Snell Roundhand', 'Kaiti SC', 'KaiTi', cursive",
  fantasy: "Papyrus, 'Yuanti SC', fantasy"
};
var PALETTES = [
  { id: "violet", primary: "#9E7FFF", bg: "#ffffff", text: "#171717", textSecondary: "#4b5563", surface: "#f7f7f7", border: "#e5e7eb" },
  { id: "navy", primary: "#24456D", bg: "#ffffff", text: "#1a1f2c", textSecondary: "#56607a", surface: "#f6f7f9", border: "#e3e7ee" },
  { id: "emerald", primary: "#0f9d76", bg: "#ffffff", text: "#12211c", textSecondary: "#4c6159", surface: "#f3f8f6", border: "#dbe7e2" },
  { id: "amber", primary: "#c2700a", bg: "#fffdf8", text: "#231a0d", textSecondary: "#6b5a41", surface: "#faf5ea", border: "#ecdfc6" },
  { id: "rose", primary: "#d6336c", bg: "#ffffff", text: "#22141a", textSecondary: "#6a4c58", surface: "#fbf4f6", border: "#f0dde3" },
  { id: "night", primary: "#8ea2ff", bg: "#12141c", text: "#eef0f6", textSecondary: "#a4abbd", surface: "#1b1e29", border: "#2c3040" }
];

// src/text.ts
var table = {
  zh: {
    open: "\u6253\u5F00\u9884\u89C8",
    running: "\u9884\u89C8\u8FD0\u884C\u4E2D",
    stopped: "\u9884\u89C8\u672A\u8FD0\u884C",
    working: "\u9884\u89C8\u5904\u7406\u4E2D\u2026",
    tagline: "\u63CF\u8FF0\u4F60\u60F3\u8981\u7684\u7CFB\u7EDF\uFF0CNocco \u4E3A\u4F60\u6784\u5EFA\u3002",
    placeholder: "\u4ECA\u5929 Nocco \u80FD\u5E2E\u60A8\u505A\u70B9\u4EC0\u4E48\uFF1F",
    build: "\u6784\u5EFA",
    next: "\u6362\u4E00\u4E2A",
    refresh: "\u91CD\u65B0\u751F\u6210",
    refreshing: "\u751F\u6210\u4E2D\u2026",
    designSystem: "\u8BBE\u8BA1\u4F53\u7CFB",
    antdv: "Ant Design \xB7 \u684C\u9762\u540E\u53F0",
    shadcn: "shadcn \xB7 \u73B0\u4EE3\u7F51\u9875",
    vant: "Vant \xB7 \u79FB\u52A8\u7AEF",
    retro: "\u590D\u53E4 \xB7 90 \u5E74\u4EE3\u7F51\u9875",
    fromModel: "\u7531\u4F60\u7684\u6A21\u578B\u6839\u636E\u5DE5\u4F5C\u533A\u548C\u4F1A\u8BDD\u751F\u6210",
    fromSamples: "\u793A\u4F8B\u60F3\u6CD5",
    previewTitle: "\u9884\u89C8",
    desktop: "\u684C\u9762",
    tablet: "\u5E73\u677F",
    phone: "\u624B\u673A",
    reload: "\u5237\u65B0",
    external: "\u5728\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00",
    palette: "\u914D\u8272",
    paletteHint: "\u70B9\u51FB\u8272\u70B9\uFF0C\u7ACB\u5373\u66F4\u6362\u5E94\u7528\u7684\u914D\u8272\uFF08\u4E0D\u6D88\u8017\u6A21\u578B\uFF09",
    noPreview: "\u8FD8\u6CA1\u6709\u6B63\u5728\u8FD0\u884C\u7684\u9884\u89C8\u3002",
    voice: "\u8BED\u97F3\u8F93\u5165",
    voiceStop: "\u505C\u6B62\u5E76\u8F6C\u5199",
    transcribing: "\u8F6C\u5199\u4E2D\u2026",
    voiceFailed: "\u8BED\u97F3\u8F93\u5165\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u9EA6\u514B\u98CE\u6743\u9650\u548C DSH \u7684\u8BED\u97F3\u8F93\u5165\u8BBE\u7F6E\u3002",
    inspect: "\u9009\u53D6\u5143\u7D20",
    inspecting: "\u5728\u9884\u89C8\u91CC\u70B9\u51FB\u8981\u4FEE\u6539\u7684\u5143\u7D20\uFF08Esc \u53D6\u6D88\uFF09",
    pickedLine: "\u9884\u89C8\u4E2D\u9009\u4E2D\u7684\u5143\u7D20\uFF1A",
    pickedPage: "\u9875\u9762",
    pickedFile: "\u7EC4\u4EF6\u6587\u4EF6",
    fontLine: "\u5B57\u4F53\uFF1A",
    styleLine: "\u754C\u9762\u98CE\u683C\uFF1A",
    modeLine: "\u6A21\u5F0F\uFF1A",
    filesLine: "\u9644\u4EF6\uFF1A",
    discuss: "\u8BA8\u8BBA",
    discussHint: "\u5148\u8BA8\u8BBA\u65B9\u6848\uFF0C\u6682\u4E0D\u52A8\u624B\u6784\u5EFA",
    buildHint: "\u76F4\u63A5\u5F00\u59CB\u6784\u5EFA",
    attach: "\u6DFB\u52A0\u6587\u4EF6",
    uploading: "\u4E0A\u4F20\u4E2D\u2026",
    uploadFailed: "\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25\u3002",
    removeFile: "\u79FB\u9664",
    tabColours: "\u989C\u8272",
    tabTypography: "\u5B57\u4F53",
    tabFeatures: "\u98CE\u683C",
    "sans-serif": "\u65E0\u886C\u7EBF",
    serif: "\u886C\u7EBF",
    monospace: "\u7B49\u5BBD",
    cursive: "\u624B\u5199",
    fantasy: "\u88C5\u9970",
    rounded: "\u5706\u89D2",
    border: "\u7EC6\u8FB9\u6846",
    gradient: "\u6E10\u53D8\u70B9\u7F00",
    shadow: "\u67D4\u548C\u9634\u5F71",
    frosted: "\u6BDB\u73BB\u7483",
    languageLine: "\u754C\u9762\u8BED\u8A00\uFF1A\u4E2D\u6587",
    designLine: "\u8BBE\u8BA1\u4F53\u7CFB\uFF1A",
    paletteLine: "\u914D\u8272\uFF1A",
    colours: "\u914D\u8272\u65B9\u6848",
    defaultColours: "\u6A21\u677F\u9ED8\u8BA4",
    customColour: "\u81EA\u5B9A\u4E49\u4E3B\u8272",
    enhance: "\u4F18\u5316\u63D0\u793A\u8BCD",
    enhanceFailed: "\u4F18\u5316\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u6A21\u578B\u914D\u7F6E\u540E\u91CD\u8BD5\u3002",
    history: "\u5386\u53F2",
    saveCheckpoint: "\u4FDD\u5B58\u68C0\u67E5\u70B9",
    restore: "\u6062\u590D\u5230\u8FD9\u91CC",
    confirmRestore: "\u786E\u8BA4\u6062\u590D",
    cancel: "\u53D6\u6D88",
    current: "\u5F53\u524D",
    filesChanged: "{n} \u4E2A\u6587\u4EF6",
    noCheckpoints: "\u8FD8\u6CA1\u6709\u68C0\u67E5\u70B9\u3002",
    historyNote: "\u6062\u590D\u4F1A\u628A\u5E94\u7528\u7684\u6587\u4EF6\u6539\u56DE\u5F53\u65F6\u7684\u6837\u5B50\uFF0C\u6062\u590D\u524D\u7684\u72B6\u6001\u4E5F\u4F1A\u4FDD\u7559\u4E3A\u68C0\u67E5\u70B9\u3002\u5982\u679C\u90A3\u4E2A\u7248\u672C\u7684\u6570\u636E\u8868\u4E0D\u540C\uFF0C\u5B83\u6CA1\u6709\u7684\u8868\u6216\u5217\u91CC\u7684\u6570\u636E\u4F1A\u88AB\u79FB\u9664\uFF1B\u6062\u590D\u524D\u4F1A\u5148\u5728 .nocco/backups \u91CC\u4FDD\u5B58\u4E00\u4EFD\u6570\u636E\u5E93\u526F\u672C\u3002"
  },
  en: {
    open: "Open preview",
    running: "Preview running",
    stopped: "Preview not running",
    working: "Preview working\u2026",
    tagline: "Describe the system you want, and Nocco builds it.",
    placeholder: "How can Nocco help you today?",
    build: "Build",
    next: "Next",
    refresh: "Regenerate",
    refreshing: "Generating\u2026",
    designSystem: "Design system",
    antdv: "Ant Design \xB7 desktop admin",
    shadcn: "shadcn \xB7 modern web",
    vant: "Vant \xB7 mobile",
    retro: "Retro \xB7 90s web",
    fromModel: "Suggested by your model from your workspaces and sessions",
    fromSamples: "Sample ideas",
    previewTitle: "Preview",
    desktop: "Desktop",
    tablet: "Tablet",
    phone: "Phone",
    reload: "Reload",
    external: "Open in browser",
    palette: "Palette",
    paletteHint: "Click a dot to recolour the app at once, without using the model",
    noPreview: "No preview is running yet.",
    voice: "Voice input",
    voiceStop: "Stop and transcribe",
    transcribing: "Transcribing\u2026",
    voiceFailed: "Voice input failed. Check microphone permission and DSH's voice input settings.",
    inspect: "Inspect",
    inspecting: "Click the element to change in the preview (Esc cancels)",
    pickedLine: "Selected in preview: ",
    pickedPage: "page",
    pickedFile: "component file",
    fontLine: "Font: ",
    styleLine: "Style: ",
    modeLine: "Mode: ",
    filesLine: "Files:",
    discuss: "Discuss",
    discussHint: "Talk the plan through before building",
    buildHint: "Start building right away",
    attach: "Attach files",
    uploading: "Uploading\u2026",
    uploadFailed: "Could not upload the file.",
    removeFile: "Remove",
    tabColours: "Colours",
    tabTypography: "Typography",
    tabFeatures: "Features",
    "sans-serif": "Sans serif",
    serif: "Serif",
    monospace: "Monospace",
    cursive: "Cursive",
    fantasy: "Fantasy",
    rounded: "Rounded corners",
    border: "Subtle border",
    gradient: "Gradient accent",
    shadow: "Soft shadow",
    frosted: "Frosted glass",
    languageLine: "Interface language: English",
    designLine: "Design system: ",
    paletteLine: "Palette: ",
    colours: "Colour scheme",
    defaultColours: "Template default",
    customColour: "Custom main colour",
    enhance: "Enhance prompt",
    enhanceFailed: "Could not enhance the prompt. Check that a model is configured and try again.",
    history: "History",
    saveCheckpoint: "Save checkpoint",
    restore: "Restore this",
    confirmRestore: "Confirm restore",
    cancel: "Cancel",
    current: "current",
    filesChanged: "{n} files",
    noCheckpoints: "No checkpoints yet.",
    historyNote: "Restoring puts the app's files back as they were; the state before it is kept as a checkpoint too. If that version has different tables, data in tables or columns it lacks is removed. A copy of the database is saved in .nocco/backups first."
  }
};
function text(lang) {
  return lang.toLowerCase().startsWith("zh") ? table.zh : table.en;
}
var pageLang = () => document.documentElement.lang || navigator.language || "en";

// src/voice.ts
var VOICE_RATE = 16e3;
var VOICE_SECONDS = 110;
function downsample(samples, fromRate, toRate = VOICE_RATE) {
  if (fromRate === toRate) return samples;
  if (fromRate < toRate) throw new Error("the microphone records below the rate speech recognition needs");
  const ratio = fromRate / toRate;
  const output = new Float32Array(Math.floor(samples.length / ratio));
  for (let index = 0; index < output.length; index += 1) {
    const start = Math.floor(index * ratio);
    const end = Math.min(samples.length, Math.max(start + 1, Math.floor((index + 1) * ratio)));
    let sum = 0;
    for (let position = start; position < end; position += 1) sum += samples[position];
    output[index] = sum / (end - start);
  }
  return output;
}
function encodeWav(samples, rate = VOICE_RATE) {
  const bytes = new Uint8Array(44 + samples.length * 2);
  const view = new DataView(bytes.buffer);
  const ascii = (offset, text2) => {
    for (let index = 0; index < text2.length; index += 1) view.setUint8(offset + index, text2.charCodeAt(index));
  };
  ascii(0, "RIFF");
  view.setUint32(4, bytes.length - 8, true);
  ascii(8, "WAVE");
  ascii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ascii(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let index = 0; index < samples.length; index += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(44 + index * 2, Math.round(clamped < 0 ? clamped * 32768 : clamped * 32767), true);
  }
  return bytes;
}
async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
  const context = new AudioContext();
  const source = context.createMediaStreamSource(stream);
  const tap = context.createScriptProcessor(4096, 1, 1);
  const chunks = [];
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
  const release = () => {
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
    }
  };
}

// src/home.ts
var DESIGN_SYSTEMS = ["antdv", "shadcn", "vant", "retro"];
var CACHE_KEY = "dsh-nocco.suggestions";
var THEMES = {
  light: {
    paper: "linear-gradient(180deg, #f7f9fc 0%, #eef2f8 100%)",
    surface: "rgba(255,255,255,0.86)",
    raised: "#ffffff",
    text: "#141c28",
    muted: "#5b6472",
    faint: "#8a93a1",
    line: "rgba(20,28,40,0.12)",
    accent: "#24456D",
    hover: "rgba(20,28,40,0.06)",
    shadow: "0 1px 2px rgba(20,28,40,0.04), 0 12px 32px -12px rgba(20,28,40,0.18)",
    vignette: "rgba(22,34,64,0.08)",
    glow: 1
  },
  dark: {
    paper: "linear-gradient(180deg, #0e1218 0%, #161b25 100%)",
    surface: "rgba(24,29,37,0.82)",
    raised: "#1e242e",
    text: "#eef1f6",
    muted: "#a5adba",
    faint: "#7c8593",
    line: "rgba(255,255,255,0.12)",
    accent: "#5A7FBB",
    hover: "rgba(255,255,255,0.08)",
    shadow: "0 1px 2px rgba(0,0,0,0.3), 0 12px 32px -12px rgba(0,0,0,0.6)",
    vignette: "rgba(0,0,0,0.3)",
    glow: 0.55
  }
};
var KEYFRAMES = `
@keyframes noccoAuroraA { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(80px,30px) scale(1.08); } 66% { transform: translate(40px,60px) scale(1.05); } }
@keyframes noccoAuroraB { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(-90px,-40px) scale(1.10); } 66% { transform: translate(-30px,-70px) scale(1.06); } }
@keyframes noccoAuroraC { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(60px,-40px) scale(1.06); } 66% { transform: translate(90px,20px) scale(1.10); } }
@keyframes noccoPromptLine { 0% { stroke-dashoffset: 0; visibility: visible; } 28.5% { stroke-dashoffset: -320; visibility: visible; } 29%, 99% { stroke-dashoffset: -320; visibility: hidden; } 99.5% { stroke-dashoffset: 0; visibility: hidden; } 100% { stroke-dashoffset: 0; visibility: visible; } }
@keyframes noccoTypewriterCaret { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes noccoPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
@keyframes noccoSpin { to { transform: rotate(360deg); } }
@keyframes noccoFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.nocco-home textarea::placeholder { color: var(--nocco-home-faint); }
@media (prefers-reduced-motion: reduce) { .nocco-home * { animation: none !important; } }
`;
function hostIsDark() {
  try {
    const scheme = getComputedStyle(document.documentElement).colorScheme;
    if (/\bdark\b/.test(scheme) && !/\blight\b/.test(scheme)) return true;
    if (/\blight\b/.test(scheme) && !/\bdark\b/.test(scheme)) return false;
    return matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}
function useTheme() {
  const [dark, setDark] = (0, import_react.useState)(hostIsDark);
  (0, import_react.useEffect)(() => {
    const update = () => setDark(hostIsDark());
    const watcher = new MutationObserver(update);
    watcher.observe(document.documentElement, { attributes: true });
    const system = matchMedia("(prefers-color-scheme: dark)");
    system.addEventListener("change", update);
    return () => {
      watcher.disconnect();
      system.removeEventListener("change", update);
    };
  }, []);
  return dark ? THEMES.dark : THEMES.light;
}
function readCache(lang) {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null");
    return cached?.lang === lang && Array.isArray(cached.suggestions) ? cached.suggestions : void 0;
  } catch {
    return void 0;
  }
}
function useTypewriter(prompts, index, advance) {
  const [typed, setTyped] = (0, import_react.useState)("");
  const [phase, setPhase] = (0, import_react.useState)("typing");
  const full = prompts[index] ?? "";
  (0, import_react.useEffect)(() => {
    setTyped("");
    setPhase("typing");
  }, [full]);
  (0, import_react.useEffect)(() => {
    let timer;
    if (phase === "typing") {
      timer = typed.length < full.length ? setTimeout(() => setTyped(full.slice(0, typed.length + 1)), 75) : setTimeout(() => setPhase("holding"), 4e3);
    } else if (phase === "holding") {
      timer = setTimeout(() => setPhase("erasing"), 800);
    } else {
      timer = typed.length > 0 ? setTimeout(() => setTyped(full.slice(0, typed.length - 1)), 30) : setTimeout(advance, 0);
    }
    return () => clearTimeout(timer);
  }, [typed, phase, full, advance]);
  return typed;
}
var blob = (style) => (0, import_react.createElement)("div", { style: { position: "absolute", borderRadius: "50%", ...style } });
function Backdrop(props) {
  const { theme } = props;
  return (0, import_react.createElement)(
    "div",
    { "aria-hidden": true, style: { position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: theme.paper } },
    (0, import_react.createElement)(
      "div",
      { style: { position: "absolute", inset: 0, opacity: theme.glow } },
      blob({ top: -220, left: "50%", width: 1100, height: 1100, marginLeft: -550, background: "radial-gradient(circle, oklch(0.62 0.20 295 / 0.42) 0%, transparent 65%)", filter: "blur(55px)", animation: "noccoAuroraA 240s linear infinite" }),
      blob({ bottom: -280, right: -140, width: 900, height: 900, background: "radial-gradient(circle, oklch(0.55 0.22 310 / 0.38) 0%, transparent 70%)", filter: "blur(60px)", animation: "noccoAuroraB 300s linear infinite" }),
      blob({ top: -120, left: -180, width: 680, height: 680, background: "radial-gradient(circle, oklch(0.72 0.16 220 / 0.34) 0%, transparent 70%)", filter: "blur(50px)", animation: "noccoAuroraC 270s linear infinite" }),
      blob({ top: -180, left: "50%", marginLeft: -550, width: 1100, height: 1100, background: "radial-gradient(circle, oklch(0.55 0.16 255 / 0.30) 0%, oklch(0.55 0.16 255 / 0.10) 35%, transparent 65%)", filter: "blur(40px)" }),
      blob({ bottom: -260, right: -140, width: 820, height: 820, background: "radial-gradient(circle, oklch(0.5 0.15 240 / 0.26) 0%, oklch(0.5 0.15 240 / 0.10) 40%, transparent 70%)", filter: "blur(50px)" }),
      blob({ top: 120, left: -200, width: 700, height: 700, background: "radial-gradient(circle, oklch(0.70 0.13 200 / 0.22) 0%, transparent 65%)", filter: "blur(60px)" })
    ),
    (0, import_react.createElement)("div", { style: { position: "absolute", inset: 0, background: `radial-gradient(ellipse 120% 80% at 50% 50%, transparent 50%, ${theme.vignette} 100%)` } })
  );
}
var stroke = { stroke: "currentColor", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
var arrowRight = (0, import_react.createElement)("svg", { width: 11, height: 11, viewBox: "0 0 12 12", "aria-hidden": true }, (0, import_react.createElement)("path", { d: "M2 6h8M7 3l3 3-3 3", strokeWidth: 1.4, ...stroke }));
var arrowUp = (0, import_react.createElement)("svg", { width: 12, height: 12, viewBox: "0 0 12 12", "aria-hidden": true }, (0, import_react.createElement)("path", { d: "M6 2v8M3 5l3-3 3 3", strokeWidth: 1.6, ...stroke }));
var cycle = (0, import_react.createElement)("svg", { width: 11, height: 11, viewBox: "0 0 16 16", "aria-hidden": true }, (0, import_react.createElement)("path", { d: "M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5V5h-2.5", strokeWidth: 1.4, ...stroke }));
var sparkle = (0, import_react.createElement)("svg", { width: 11, height: 11, viewBox: "0 0 16 16", "aria-hidden": true }, (0, import_react.createElement)("path", { d: "M8 2l1.4 4.1L13.5 8l-4.1 1.4L8 13.5 6.6 9.4 2.5 8l4.1-1.9z", strokeWidth: 1.3, ...stroke }));
var cube = (0, import_react.createElement)("svg", { width: 14, height: 14, viewBox: "0 0 16 16", "aria-hidden": true, style: { opacity: 0.7 } }, (0, import_react.createElement)("path", { d: "M8 1.8l5.4 3v6.4L8 14.2l-5.4-3V4.800zM2.800 4.900L8 7.900l5.200-3M8 7.900v6.200", strokeWidth: 1.2, ...stroke }));
var stars = (0, import_react.createElement)("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true }, (0, import_react.createElement)("path", {
  fill: "currentColor",
  fillRule: "evenodd",
  d: "M11.5 6a.5.5 0 0 1-.475-.342l-.263-.789a1 1 0 0 0-.632-.632l-.789-.263a.5.5 0 0 1 0-.949l.789-.263a1 1 0 0 0 .632-.632l.264-.79a.5.5 0 0 1 .948 0l.264.79a1 1 0 0 0 .632.632l.789.263a.5.5 0 0 1 0 .949l-.789.263a1 1 0 0 0-.632.632l-.264.789A.5.5 0 0 1 11.5 6ZM6 13a.667.667 0 0 1-.647-.505l-.23-.92a2.337 2.337 0 0 0-1.696-1.698l-.92-.23a.666.666 0 0 1 0-1.293l.92-.23a2.337 2.337 0 0 0 1.697-1.697l.23-.92a.667.667 0 0 1 1.293 0l.23.92a2.333 2.333 0 0 0 1.696 1.697l.92.23a.666.666 0 0 1 0 1.294l-.92.229a2.332 2.332 0 0 0-1.697 1.697l-.23.921A.667.667 0 0 1 6 13Z"
}), (0, import_react.createElement)("path", { d: "M13.5 9.2l1.25 4.05 4.05 1.25-4.05 1.25-1.25 4.05-1.25-4.05L8.2 14.500l4.050-1.250z", fill: "currentColor" }));
var spinner = (0, import_react.createElement)(
  "svg",
  { width: 18, height: 18, viewBox: "0 0 24 24", "aria-hidden": true, style: { animation: "noccoSpin 800ms linear infinite" } },
  (0, import_react.createElement)("circle", { cx: 12, cy: 12, r: 9, fill: "none", stroke: "currentColor", strokeWidth: 2.5, opacity: 0.25 }),
  (0, import_react.createElement)("path", { d: "M21 12a9 9 0 0 0-9-9", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round" })
);
var swatches = (0, import_react.createElement)(
  "svg",
  { width: 15, height: 15, viewBox: "0 0 16 16", "aria-hidden": true, style: { opacity: 0.75 } },
  (0, import_react.createElement)("path", { d: "M8 1.800a6.200 6.200 0 1 0 0 12.400c.900 0 1.400-.600 1.400-1.300 0-.900-.800-1.200-.800-2 0-.700.600-1.200 1.300-1.200h1.500a2.800 2.800 0 0 0 2.800-2.800C14.200 4.100 11.400 1.800 8 1.800z", strokeWidth: 1.2, ...stroke }),
  (0, import_react.createElement)("circle", { cx: 5.2, cy: 7.4, r: 0.9, fill: "currentColor" }),
  (0, import_react.createElement)("circle", { cx: 7.4, cy: 4.8, r: 0.9, fill: "currentColor" }),
  (0, import_react.createElement)("circle", { cx: 10.6, cy: 5.6, r: 0.9, fill: "currentColor" })
);
var paperclip = (0, import_react.createElement)(
  "svg",
  { width: 15, height: 15, viewBox: "0 0 16 16", "aria-hidden": true, style: { opacity: 0.75 } },
  (0, import_react.createElement)("path", { d: "M13.200 7.300l-5.300 5.300a3.200 3.200 0 0 1-4.500-4.500l5.600-5.600a2.100 2.100 0 0 1 3 3l-5.600 5.600a1 1 0 0 1-1.500-1.500l5-5", strokeWidth: 1.2, ...stroke })
);
var microphone = (0, import_react.createElement)(
  "svg",
  { width: 15, height: 15, viewBox: "0 0 16 16", "aria-hidden": true },
  (0, import_react.createElement)("rect", { x: 5.75, y: 1.75, width: 4.5, height: 7.5, rx: 2.25, strokeWidth: 1.2, ...stroke }),
  (0, import_react.createElement)("path", { d: "M3.500 7.500a4.500 4.500 0 0 0 9 0M8 12v2.250", strokeWidth: 1.2, ...stroke })
);
var caret = (0, import_react.createElement)("svg", { width: 10, height: 10, viewBox: "0 0 12 12", "aria-hidden": true, style: { opacity: 0.6 } }, (0, import_react.createElement)("path", { d: "M3 4.500l3 3 3-3", strokeWidth: 1.4, ...stroke }));
function createHome(api) {
  return function Home() {
    const lang = pageLang();
    const strings = text(lang);
    const theme = useTheme();
    const [request, setRequest] = (0, import_react.useState)("");
    const [designSystem, setDesignSystem] = (0, import_react.useState)("antdv");
    const [choosing, setChoosing] = (0, import_react.useState)(false);
    const [palette, setPalette] = (0, import_react.useState)();
    const [colouring, setColouring] = (0, import_react.useState)(false);
    const [tab, setTab] = (0, import_react.useState)("colours");
    const [font, setFont] = (0, import_react.useState)();
    const [features, setFeatures] = (0, import_react.useState)([]);
    const [mode, setMode] = (0, import_react.useState)("build");
    const [files, setFiles] = (0, import_react.useState)([]);
    const [uploading, setUploading] = (0, import_react.useState)(false);
    const [uploadFailed, setUploadFailed] = (0, import_react.useState)(false);
    const picker = (0, import_react.useRef)(null);
    const attach = (chosen) => {
      if (chosen.length === 0) return;
      setUploading(true);
      setUploadFailed(false);
      Promise.all(chosen.map((file) => api.upload(file))).then((saved) => {
        if (alive.current) setFiles((current) => [...current, ...saved]);
      }).catch(() => {
        if (alive.current) setUploadFailed(true);
      }).finally(() => {
        if (alive.current) setUploading(false);
      });
    };
    const [voice, setVoice] = (0, import_react.useState)("absent");
    const [voiceFailed, setVoiceFailed] = (0, import_react.useState)(false);
    const recording = (0, import_react.useRef)(void 0);
    (0, import_react.useEffect)(() => {
      api.voiceAvailable().then((available) => {
        if (alive.current && available) setVoice("idle");
      }).catch(() => {
      });
      return () => recording.current?.cancel();
    }, []);
    const toggleVoice = () => {
      setVoiceFailed(false);
      if (voice === "idle") {
        setVoice("recording");
        startRecording().then((started) => {
          if (!alive.current) return started.cancel();
          recording.current = started;
        }).catch(() => {
          if (alive.current) {
            setVoice("idle");
            setVoiceFailed(true);
          }
        });
      } else if (voice === "recording" && recording.current) {
        const active = recording.current;
        recording.current = void 0;
        setVoice("transcribing");
        active.stop().then((wav) => api.transcribe(wav)).then((spoken) => {
          if (alive.current && spoken) setRequest((current) => current.trim() ? `${current.trimEnd()} ${spoken}` : spoken);
        }).catch(() => {
          if (alive.current) setVoiceFailed(true);
        }).finally(() => {
          if (alive.current) setVoice("idle");
        });
      }
    };
    const paletteColour = PALETTES.find((item) => item.id === palette)?.primary ?? palette;
    const [prompts, setPrompts] = (0, import_react.useState)(() => readCache(lang) ?? []);
    const [source, setSource] = (0, import_react.useState)("fallback");
    const [index, setIndex] = (0, import_react.useState)(0);
    const [loading, setLoading] = (0, import_react.useState)(false);
    const alive = (0, import_react.useRef)(true);
    (0, import_react.useEffect)(() => () => {
      alive.current = false;
    }, []);
    const load = (refresh) => {
      setLoading(true);
      api.suggestions(lang, refresh).then((result) => {
        if (!alive.current) return;
        setPrompts(result.suggestions);
        setSource(result.source);
        setIndex(0);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ lang, suggestions: result.suggestions }));
        } catch {
        }
      }).catch(() => {
      }).finally(() => {
        if (alive.current) setLoading(false);
      });
    };
    (0, import_react.useEffect)(() => {
      load(false);
    }, []);
    const next = () => setIndex((current) => prompts.length > 0 ? (current + 1) % prompts.length : 0);
    const typed = useTypewriter(prompts, index, next);
    const build = (value) => {
      if (value.trim() && !uploading) api.start(buildDraft(value, { designSystem, palette, font, features, mode, files: files.map((file) => file.path) }, strings));
    };
    const canSend = request.trim().length > 0;
    const box = (0, import_react.useRef)(null);
    (0, import_react.useEffect)(() => {
      const element = box.current;
      if (!element) return;
      element.style.height = "auto";
      element.style.height = `${Math.min(element.scrollHeight, 240)}px`;
    }, [request]);
    const [enhancing, setEnhancing] = (0, import_react.useState)(false);
    const [enhanceFailed, setEnhanceFailed] = (0, import_react.useState)(false);
    const enhance = () => {
      if (!canSend || enhancing) return;
      setEnhancing(true);
      setEnhanceFailed(false);
      api.enhance(request).then((better) => {
        if (alive.current) setRequest(better);
      }).catch(() => {
        if (alive.current) setEnhanceFailed(true);
      }).finally(() => {
        if (alive.current) setEnhancing(false);
      });
    };
    const pill = {
      // `font` comes first: it is a shorthand and would otherwise reset the size and weight after it.
      font: "inherit",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      borderRadius: 999,
      padding: "5px 12px",
      fontSize: 12,
      fontWeight: 500,
      cursor: "pointer",
      border: `1px solid ${theme.line}`,
      background: theme.surface,
      color: theme.muted,
      backdropFilter: "blur(8px)"
    };
    const solidPill = { ...pill, border: 0, padding: "6px 14px", background: theme.accent, color: "#fff", boxShadow: "0 1px 2px rgba(30,64,140,0.25)" };
    return (0, import_react.createElement)(
      "div",
      { className: "nocco-home", style: { position: "relative", height: "100%", overflow: "hidden", color: theme.text, ["--nocco-home-faint"]: theme.faint } },
      (0, import_react.createElement)("style", null, KEYFRAMES),
      (0, import_react.createElement)(Backdrop, { theme }),
      (0, import_react.createElement)(
        "div",
        { style: { position: "relative", height: "100%", overflowY: "auto", boxSizing: "border-box", padding: "0 24px 48px" } },
        // Intro
        (0, import_react.createElement)(
          "div",
          { style: { maxWidth: 672, margin: "clamp(40px, 12vh, 110px) auto 0", textAlign: "center", animation: "noccoFadeIn 500ms ease both" } },
          (0, import_react.createElement)("h1", { style: { margin: "0 0 16px", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.03em", fontSize: "clamp(48px, 7vw, 72px)", color: theme.text } }, "Nocco"),
          (0, import_react.createElement)("p", { style: { margin: "0 0 32px", fontSize: 19, lineHeight: 1.5, color: theme.muted, animation: "noccoFadeIn 500ms 200ms ease both" } }, strings.tagline)
        ),
        // Prompt card
        (0, import_react.createElement)(
          "div",
          { style: { position: "relative", width: "min(672px, 100%)", margin: "0 auto", padding: 12, boxSizing: "border-box", borderRadius: 12, border: `1px solid ${theme.line}`, background: theme.surface, backdropFilter: "blur(12px)", boxShadow: theme.shadow } },
          (0, import_react.createElement)(
            "svg",
            { "aria-hidden": true, style: { position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: 12, overflow: "visible", pointerEvents: "none" } },
            (0, import_react.createElement)("defs", null, (0, import_react.createElement)(
              "linearGradient",
              { id: "nocco-home-line", x1: "0%", y1: "0%", x2: "100%", y2: "0%" },
              (0, import_react.createElement)("stop", { offset: "0%", stopColor: "#5A7FBB", stopOpacity: 0 }),
              (0, import_react.createElement)("stop", { offset: "40%", stopColor: "#5A7FBB", stopOpacity: 0.95 }),
              (0, import_react.createElement)("stop", { offset: "60%", stopColor: "#24456D", stopOpacity: 0.95 }),
              (0, import_react.createElement)("stop", { offset: "100%", stopColor: "#24456D", stopOpacity: 0 })
            )),
            (0, import_react.createElement)("rect", { x: 0, y: 0, width: "100%", height: "100%", rx: 12, pathLength: 320, strokeLinecap: "round", strokeDasharray: "14 306", fill: "transparent", stroke: "url(#nocco-home-line)", strokeWidth: 1.5, style: { animation: "noccoPromptLine 7s linear infinite" } })
          ),
          files.length > 0 || uploading || uploadFailed ? (0, import_react.createElement)(
            "div",
            { style: { position: "relative", display: "flex", flexWrap: "wrap", gap: 6, padding: "4px 8px 0" } },
            ...files.map((file) => (0, import_react.createElement)(
              "span",
              { key: file.path, title: file.path, style: { display: "inline-flex", alignItems: "center", gap: 6, maxWidth: "100%", padding: "3px 4px 3px 8px", borderRadius: 6, fontSize: 12, color: theme.text, background: theme.hover } },
              (0, import_react.createElement)("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, file.name),
              (0, import_react.createElement)("button", {
                type: "button",
                title: strings.removeFile,
                "aria-label": `${strings.removeFile}: ${file.name}`,
                onClick: () => setFiles((current) => current.filter((item) => item.path !== file.path)),
                style: { width: 18, height: 18, padding: 0, border: 0, borderRadius: 4, background: "transparent", color: theme.muted, cursor: "pointer", fontSize: 14, lineHeight: 1 }
              }, "\xD7")
            )),
            uploading ? (0, import_react.createElement)("span", { style: { fontSize: 12, color: theme.muted, padding: "3px 4px" } }, strings.uploading) : null,
            uploadFailed ? (0, import_react.createElement)("span", { role: "alert", style: { fontSize: 12, color: "#b42318", padding: "3px 4px" } }, strings.uploadFailed) : null
          ) : null,
          (0, import_react.createElement)(
            "div",
            { style: { position: "relative" } },
            (0, import_react.createElement)("textarea", {
              ref: box,
              value: request,
              rows: 3,
              readOnly: enhancing,
              placeholder: strings.placeholder,
              "aria-label": strings.placeholder,
              onChange: (event) => setRequest(event.target.value),
              onKeyDown: (event) => {
                if (event.key !== "Enter" || event.shiftKey || event.nativeEvent?.isComposing) return;
                event.preventDefault();
                build(request);
              },
              style: { position: "relative", display: "block", width: "100%", minHeight: 76, padding: "12px 56px 4px 16px", boxSizing: "border-box", resize: "none", border: 0, outline: "none", background: "transparent", color: theme.text, font: "inherit", fontSize: 14, lineHeight: 1.4, opacity: enhancing ? 0.6 : 1 }
            }),
            (0, import_react.createElement)("button", {
              type: "button",
              title: strings.enhance,
              "aria-label": strings.enhance,
              disabled: !canSend || enhancing,
              onClick: enhance,
              style: { position: "absolute", right: 6, bottom: 2, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, border: 0, background: "transparent", color: theme.muted, opacity: canSend || enhancing ? 0.9 : 0.4, cursor: canSend && !enhancing ? "pointer" : "default" }
            }, enhancing ? spinner : stars)
          ),
          voiceFailed ? (0, import_react.createElement)("div", { role: "alert", style: { position: "relative", padding: "4px 16px 0", fontSize: 12, color: "#b42318" } }, strings.voiceFailed) : null,
          enhanceFailed ? (0, import_react.createElement)("div", { role: "alert", style: { position: "relative", padding: "4px 16px 0", fontSize: 12, color: "#b42318" } }, strings.enhanceFailed) : null,
          (0, import_react.createElement)(
            "div",
            { style: { position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px 2px", marginTop: 8, borderTop: `1px solid ${theme.line}` } },
            (0, import_react.createElement)(
              "div",
              { style: { position: "relative" } },
              (0, import_react.createElement)("button", {
                type: "button",
                title: strings.designSystem,
                "aria-haspopup": "listbox",
                "aria-expanded": choosing,
                onClick: () => setChoosing((open) => !open),
                style: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 6, border: 0, background: choosing ? theme.hover : "transparent", color: theme.muted, font: "inherit", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }
              }, cube, strings[designSystem], caret),
              choosing ? (0, import_react.createElement)("div", { style: { position: "fixed", inset: 0, zIndex: 40 }, onClick: () => setChoosing(false) }) : null,
              choosing ? (0, import_react.createElement)(
                "div",
                { role: "listbox", "aria-label": strings.designSystem, style: { position: "absolute", bottom: "100%", left: 0, marginBottom: 4, zIndex: 50, minWidth: 200, padding: "4px 0", borderRadius: 8, border: `1px solid ${theme.line}`, background: theme.raised, boxShadow: "0 10px 30px -8px rgba(20,28,40,0.28)" } },
                ...DESIGN_SYSTEMS.map((id) => (0, import_react.createElement)("button", {
                  key: id,
                  type: "button",
                  role: "option",
                  "aria-selected": designSystem === id,
                  onClick: () => {
                    setDesignSystem(id);
                    setChoosing(false);
                  },
                  style: { display: "block", width: "100%", textAlign: "left", padding: "6px 12px", border: 0, background: "transparent", font: "inherit", fontSize: 14, whiteSpace: "nowrap", cursor: "pointer", color: designSystem === id ? theme.accent : theme.text, fontWeight: designSystem === id ? 600 : 400 }
                }, strings[id]))
              ) : null
            ),
            (0, import_react.createElement)(
              "div",
              { style: { position: "relative" } },
              (0, import_react.createElement)("button", {
                type: "button",
                title: strings.colours,
                "aria-label": strings.colours,
                "aria-haspopup": "dialog",
                "aria-expanded": colouring,
                onClick: () => setColouring((open) => !open),
                style: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 6, border: 0, background: colouring ? theme.hover : "transparent", color: theme.muted, cursor: "pointer" }
              }, swatches, paletteColour ? (0, import_react.createElement)("span", { style: { width: 10, height: 10, borderRadius: 999, background: paletteColour, boxShadow: `0 0 0 1px ${theme.line}` } }) : null),
              colouring ? (0, import_react.createElement)("div", { style: { position: "fixed", inset: 0, zIndex: 40 }, onClick: () => setColouring(false) }) : null,
              colouring ? (0, import_react.createElement)(
                "div",
                { role: "dialog", "aria-label": strings.colours, style: { position: "absolute", bottom: "100%", left: 0, marginBottom: 4, zIndex: 50, width: 248, padding: 10, boxSizing: "border-box", borderRadius: 10, border: `1px solid ${theme.line}`, background: theme.raised, boxShadow: "0 10px 30px -8px rgba(20,28,40,0.28)" } },
                (0, import_react.createElement)(
                  "div",
                  { role: "tablist", style: { display: "flex", gap: 2, padding: 2, marginBottom: 10, borderRadius: 7, background: theme.hover } },
                  ...["colours", "typography", "features"].map((id) => (0, import_react.createElement)("button", {
                    key: id,
                    type: "button",
                    role: "tab",
                    "aria-selected": tab === id,
                    onClick: () => setTab(id),
                    style: { flex: 1, padding: "4px 0", border: 0, borderRadius: 5, font: "inherit", fontSize: 12, fontWeight: 500, cursor: "pointer", color: tab === id ? theme.text : theme.muted, background: tab === id ? theme.raised : "transparent", boxShadow: tab === id ? "0 1px 2px rgba(0,0,0,0.12)" : "none" }
                  }, strings[id === "colours" ? "tabColours" : id === "typography" ? "tabTypography" : "tabFeatures"]))
                ),
                ...tab === "colours" ? [
                  (0, import_react.createElement)(
                    "div",
                    { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 } },
                    ...PALETTES.map((item) => (0, import_react.createElement)(
                      "button",
                      {
                        key: item.id,
                        type: "button",
                        title: item.id,
                        "aria-pressed": palette === item.id,
                        onClick: () => {
                          setPalette(item.id);
                          setColouring(false);
                        },
                        style: { display: "flex", flexDirection: "column", gap: 5, padding: 6, borderRadius: 8, cursor: "pointer", font: "inherit", fontSize: 11, textAlign: "left", textTransform: "capitalize", color: theme.muted, background: "transparent", border: `1px solid ${palette === item.id ? theme.accent : theme.line}`, boxShadow: palette === item.id ? `inset 0 0 0 1px ${theme.accent}` : "none" }
                      },
                      // A miniature of the palette: its page, a surface block and its main colour.
                      (0, import_react.createElement)(
                        "span",
                        { "aria-hidden": true, style: { display: "flex", alignItems: "flex-end", gap: 3, height: 26, padding: 4, boxSizing: "border-box", borderRadius: 5, background: item.bg, border: `1px solid ${item.border}` } },
                        (0, import_react.createElement)("span", { style: { flex: 1, height: "100%", borderRadius: 3, background: item.surface } }),
                        (0, import_react.createElement)("span", { style: { width: 14, height: 8, borderRadius: 3, background: item.primary } })
                      ),
                      item.id
                    ))
                  ),
                  (0, import_react.createElement)(
                    "label",
                    { key: "custom", style: { display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 12, color: theme.muted, cursor: "pointer" } },
                    (0, import_react.createElement)("input", {
                      type: "color",
                      value: /^#[0-9a-f]{6}$/i.test(palette ?? "") ? palette : "#24456d",
                      "aria-label": strings.customColour,
                      onChange: (event) => setPalette(event.target.value.toLowerCase()),
                      style: { width: 24, height: 24, padding: 0, border: 0, background: "transparent", cursor: "pointer" }
                    }),
                    strings.customColour
                  ),
                  (0, import_react.createElement)("button", {
                    key: "default",
                    type: "button",
                    onClick: () => {
                      setPalette(void 0);
                      setColouring(false);
                    },
                    style: { marginTop: 8, padding: "4px 0", border: 0, background: "transparent", font: "inherit", fontSize: 12, cursor: "pointer", color: palette ? theme.accent : theme.faint }
                  }, strings.defaultColours)
                ] : tab === "typography" ? [
                  (0, import_react.createElement)(
                    "div",
                    { key: "fonts", style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 } },
                    ...FONTS.map((id) => (0, import_react.createElement)(
                      "button",
                      {
                        key: id,
                        type: "button",
                        "aria-pressed": font === id,
                        onClick: () => setFont(font === id ? void 0 : id),
                        style: { display: "flex", alignItems: "baseline", gap: 8, padding: "6px 8px", borderRadius: 8, cursor: "pointer", textAlign: "left", color: theme.text, background: "transparent", border: `1px solid ${font === id ? theme.accent : theme.line}`, boxShadow: font === id ? `inset 0 0 0 1px ${theme.accent}` : "none" }
                      },
                      (0, import_react.createElement)("span", { "aria-hidden": true, style: { fontFamily: FONT_STACKS[id], fontSize: 18, lineHeight: 1 } }, "Aa"),
                      (0, import_react.createElement)("span", { style: { fontSize: 11, color: theme.muted } }, strings[id])
                    ))
                  )
                ] : [
                  (0, import_react.createElement)(
                    "div",
                    { key: "features", style: { display: "flex", flexDirection: "column", gap: 2 } },
                    ...FEATURES.map((id) => (0, import_react.createElement)(
                      "label",
                      { key: id, style: { display: "flex", alignItems: "center", gap: 8, padding: "5px 4px", fontSize: 13, color: theme.text, cursor: "pointer" } },
                      (0, import_react.createElement)("input", {
                        type: "checkbox",
                        checked: features.includes(id),
                        onChange: () => setFeatures(features.includes(id) ? features.filter((item) => item !== id) : [...features, id]),
                        style: { accentColor: theme.accent, margin: 0 }
                      }),
                      strings[id]
                    ))
                  )
                ]
              ) : null
            ),
            (0, import_react.createElement)("input", {
              ref: picker,
              type: "file",
              multiple: true,
              hidden: true,
              accept: ".xlsx,.csv,.tsv,.docx,.md,.markdown,.txt",
              onChange: (event) => {
                attach([...event.target.files ?? []]);
                event.target.value = "";
              }
            }),
            (0, import_react.createElement)("button", {
              type: "button",
              title: strings.attach,
              "aria-label": strings.attach,
              disabled: uploading,
              onClick: () => picker.current?.click(),
              style: { display: "inline-flex", alignItems: "center", padding: "4px 8px", borderRadius: 6, border: 0, background: "transparent", color: theme.muted, cursor: "pointer" }
            }, paperclip),
            voice === "absent" ? null : (0, import_react.createElement)(
              "button",
              {
                type: "button",
                disabled: voice === "transcribing",
                "aria-pressed": voice === "recording",
                title: voice === "recording" ? strings.voiceStop : voice === "transcribing" ? strings.transcribing : strings.voice,
                "aria-label": voice === "recording" ? strings.voiceStop : strings.voice,
                onClick: toggleVoice,
                style: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 6, border: 0, cursor: voice === "transcribing" ? "default" : "pointer", font: "inherit", fontSize: 12, color: voice === "recording" ? "#d92d20" : theme.muted, background: voice === "recording" ? "rgba(217,45,32,0.10)" : "transparent" }
              },
              voice === "transcribing" ? spinner : microphone,
              voice === "recording" ? (0, import_react.createElement)("span", { "aria-hidden": true, style: { width: 7, height: 7, borderRadius: 999, background: "#d92d20", animation: "noccoPulse 1s ease-in-out infinite" } }) : null
            ),
            (0, import_react.createElement)("span", { style: { flex: 1 } }),
            (0, import_react.createElement)(
              "div",
              { role: "tablist", style: { display: "inline-flex", padding: 2, borderRadius: 6, border: `1px solid ${theme.line}`, background: theme.hover } },
              ...["discuss", "build"].map((id) => (0, import_react.createElement)("button", {
                key: id,
                type: "button",
                role: "tab",
                "aria-selected": mode === id,
                title: id === "discuss" ? strings.discussHint : strings.buildHint,
                onClick: () => setMode(id),
                style: { padding: "4px 10px", border: 0, borderRadius: 4, font: "inherit", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", color: mode === id ? theme.text : theme.muted, background: mode === id ? theme.raised : "transparent", boxShadow: mode === id ? "0 1px 2px rgba(0,0,0,0.08)" : "none" }
              }, strings[id]))
            ),
            (0, import_react.createElement)("button", {
              type: "button",
              disabled: !canSend,
              title: strings.build,
              onClick: () => build(request),
              style: {
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                height: 30,
                padding: "0 12px",
                borderRadius: 8,
                border: 0,
                color: "#fff",
                font: "inherit",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "-0.005em",
                background: theme.accent,
                opacity: canSend ? 1 : 0.55,
                cursor: canSend ? "pointer" : "default",
                boxShadow: canSend ? "0 2px 6px rgba(30,64,140,0.35), 0 0 0 1px rgba(255,255,255,0.15) inset" : "0 1px 2px rgba(30,64,140,0.2)"
              }
            }, strings.build, arrowUp)
          )
        ),
        // Suggested builds
        (0, import_react.createElement)(
          "div",
          { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 14, margin: "36px auto 0", width: "min(820px, 100%)" } },
          (0, import_react.createElement)(
            "div",
            { "aria-live": "off", style: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: 28, maxWidth: "100%", fontSize: 15, lineHeight: 1.5, letterSpacing: "-0.005em", textAlign: "center", color: theme.text } },
            (0, import_react.createElement)(
              "span",
              null,
              typed,
              (0, import_react.createElement)("span", { "aria-hidden": true, style: { display: "inline-block", width: 1.5, height: "0.95em", marginLeft: 2, verticalAlign: "middle", background: theme.accent, animation: "noccoTypewriterCaret 900ms steps(2) infinite" } })
            )
          ),
          (0, import_react.createElement)(
            "div",
            { style: { display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" } },
            (0, import_react.createElement)("button", { type: "button", disabled: prompts.length === 0, onClick: () => build(prompts[index] ?? ""), style: solidPill }, strings.build, arrowRight),
            (0, import_react.createElement)("button", { type: "button", disabled: prompts.length < 2, onClick: next, style: pill }, cycle, strings.next),
            (0, import_react.createElement)("button", { type: "button", disabled: loading, onClick: () => load(true), style: pill }, sparkle, loading ? strings.refreshing : strings.refresh)
          ),
          (0, import_react.createElement)("div", { style: { fontSize: 11, color: theme.faint } }, source === "model" ? strings.fromModel : strings.fromSamples)
        )
      )
    );
  };
}
function HomeIcon(props) {
  const size = props.size ?? 16;
  return (0, import_react.createElement)(
    "svg",
    { width: size, height: size, viewBox: "0 0 64 64", "aria-hidden": true },
    (0, import_react.createElement)("rect", { width: 64, height: 64, rx: 14, fill: "#24456D" }),
    (0, import_react.createElement)("path", { d: "M20 46V18h5l14 19V18h5v28h-5L25 27v19z", fill: "#fff" })
  );
}

// src/preview-tab.ts
var import_react2 = require("react");
var WIDTHS = [["desktop", "100%"], ["tablet", "820px"], ["phone", "390px"]];
var LINE = "rgba(128,128,128,0.28)";
var ACCENT = "#24456D";
var button = {
  border: `1px solid ${LINE}`,
  borderRadius: 6,
  padding: "3px 9px",
  fontSize: 12,
  lineHeight: "18px",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  whiteSpace: "nowrap"
};
var pressed = { ...button, borderColor: "currentColor", fontWeight: 600 };
var solid = { ...button, background: ACCENT, borderColor: ACCENT, color: "#fff" };
function describePicked(element, strings) {
  const parts = [`<${element.tag}${element.classes ? ` class="${element.classes}"` : ""}>`];
  if (element.text) parts.push(`"${element.text}"`);
  parts.push(`${strings.pickedPage} ${element.page}`);
  if (element.file) parts.push(`${strings.pickedFile} ${element.file}`);
  return `${strings.pickedLine}${parts.join(" \xB7 ")}
`;
}
function ago(seconds, now, lang) {
  const elapsed = Math.max(0, now - seconds);
  const format = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  if (elapsed < 60) return format.format(0, "second");
  if (elapsed < 3600) return format.format(-Math.floor(elapsed / 60), "minute");
  if (elapsed < 86400) return format.format(-Math.floor(elapsed / 3600), "hour");
  return format.format(-Math.floor(elapsed / 86400), "day");
}
function History(props) {
  const { url, api, strings, lang } = props;
  const [items, setItems] = (0, import_react2.useState)();
  const [failure, setFailure] = (0, import_react2.useState)("");
  const [asking, setAsking] = (0, import_react2.useState)();
  const [busy, setBusy] = (0, import_react2.useState)(false);
  const act = (0, import_react2.useCallback)(async (action, id) => {
    try {
      setItems(await api.checkpoints(url, action, id));
      setFailure("");
    } catch (error) {
      setFailure(error instanceof Error ? error.message : String(error));
    }
  }, [api, url]);
  (0, import_react2.useEffect)(() => {
    void act("list");
    const timer = setInterval(() => {
      void act("list");
    }, 5e3);
    return () => clearInterval(timer);
  }, [act]);
  const run = async (action, id) => {
    setBusy(true);
    await act(action, id);
    setBusy(false);
    setAsking(void 0);
    if (action === "restore") props.onRestored();
  };
  const now = Date.now() / 1e3;
  return (0, import_react2.createElement)(
    "aside",
    { style: { width: 264, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: 0, borderLeft: `1px solid ${LINE}`, fontSize: 12 } },
    (0, import_react2.createElement)(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderBottom: `1px solid ${LINE}` } },
      (0, import_react2.createElement)("strong", { style: { flex: 1, fontSize: 13 } }, strings.history),
      (0, import_react2.createElement)("button", { type: "button", disabled: busy, onClick: () => {
        void run("save");
      }, style: button }, strings.saveCheckpoint)
    ),
    (0, import_react2.createElement)("div", { style: { padding: "6px 10px", opacity: 0.6, lineHeight: 1.5 } }, strings.historyNote),
    failure ? (0, import_react2.createElement)("div", { role: "alert", style: { padding: "6px 10px", color: "#b42318" } }, failure) : null,
    (0, import_react2.createElement)(
      "ol",
      { style: { flex: 1, minHeight: 0, overflowY: "auto", margin: 0, padding: "4px 10px 12px", listStyle: "none" } },
      items === void 0 ? null : items.length === 0 ? (0, import_react2.createElement)("li", { style: { opacity: 0.6, padding: "8px 0" } }, strings.noCheckpoints) : items.map((item, index) => (0, import_react2.createElement)(
        "li",
        { key: item.id, style: { display: "flex", gap: 10, position: "relative", paddingBottom: 14 } },
        // The rail: a dot per checkpoint, joined by a line to the one before it.
        (0, import_react2.createElement)(
          "div",
          { "aria-hidden": true, style: { width: 10, flexShrink: 0, position: "relative" } },
          (0, import_react2.createElement)("span", { style: { position: "absolute", top: 4, left: 0, width: 10, height: 10, borderRadius: 999, boxSizing: "border-box", border: `2px solid ${ACCENT}`, background: index === 0 ? ACCENT : "transparent" } }),
          index < items.length - 1 ? (0, import_react2.createElement)("span", { style: { position: "absolute", top: 16, bottom: -16, left: 4, width: 2, background: LINE } }) : null
        ),
        (0, import_react2.createElement)(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          (0, import_react2.createElement)("div", { style: { fontSize: 13, fontWeight: index === 0 ? 600 : 400, overflowWrap: "anywhere" } }, item.label),
          (0, import_react2.createElement)(
            "div",
            { style: { opacity: 0.6, marginTop: 2 } },
            [ago(item.time, now, lang), strings.filesChanged.replace("{n}", String(item.filesChanged)), index === 0 ? strings.current : ""].filter(Boolean).join(" \xB7 ")
          ),
          index === 0 ? null : asking === item.id ? (0, import_react2.createElement)(
            "div",
            { style: { display: "flex", gap: 6, marginTop: 6 } },
            (0, import_react2.createElement)("button", { type: "button", disabled: busy, onClick: () => {
              void run("restore", item.id);
            }, style: solid }, strings.confirmRestore),
            (0, import_react2.createElement)("button", { type: "button", disabled: busy, onClick: () => setAsking(void 0), style: button }, strings.cancel)
          ) : (0, import_react2.createElement)("button", { type: "button", onClick: () => setAsking(item.id), style: { ...button, marginTop: 6 } }, strings.restore)
        )
      ))
    )
  );
}
function createPreviewTab(api) {
  return function PreviewTab(props) {
    const lang = pageLang();
    const strings = text(lang);
    const url = props.useTabInfo?.().tab?.navigation?.params?.url;
    const [width, setWidth] = (0, import_react2.useState)("100%");
    const [generation, setGeneration] = (0, import_react2.useState)(0);
    const [palette, setPalette] = (0, import_react2.useState)();
    const [history, setHistory] = (0, import_react2.useState)(false);
    const [inspecting, setInspecting] = (0, import_react2.useState)(false);
    const frame = (0, import_react2.useRef)(null);
    (0, import_react2.useEffect)(() => {
      if (!url) return void 0;
      const origin = new URL(url).origin;
      const receive = (event) => {
        if (event.origin !== origin || event.source !== frame.current?.contentWindow || event.data?.type !== "nocco:picked") return;
        setInspecting(false);
        const picked = event.data.element;
        if (picked && typeof picked.tag === "string") {
          api.insert(describePicked({
            tag: String(picked.tag).slice(0, 40),
            text: String(picked.text ?? "").slice(0, 80),
            classes: String(picked.classes ?? "").slice(0, 120),
            file: String(picked.file ?? "").slice(0, 300),
            page: String(picked.page ?? "").slice(0, 200)
          }, strings));
        }
      };
      window.addEventListener("message", receive);
      return () => window.removeEventListener("message", receive);
    }, [url, strings]);
    const inspect = (on) => {
      if (!url) return;
      setInspecting(on);
      frame.current?.contentWindow?.postMessage({ type: "nocco:inspect", on }, new URL(url).origin);
    };
    if (!url) return (0, import_react2.createElement)("div", { style: { padding: 24, fontSize: 13, opacity: 0.7 } }, strings.noPreview);
    const reload = () => setGeneration((current) => current + 1);
    return (0, import_react2.createElement)(
      "div",
      { style: { display: "flex", flexDirection: "column", height: "100%", minHeight: 0 } },
      (0, import_react2.createElement)(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", flexWrap: "wrap", borderBottom: `1px solid ${LINE}` } },
        ...WIDTHS.map(([id, value]) => (0, import_react2.createElement)("button", {
          key: id,
          type: "button",
          "aria-pressed": width === value,
          onClick: () => setWidth(value),
          style: width === value ? pressed : button
        }, strings[id])),
        (0, import_react2.createElement)("button", { type: "button", onClick: reload, style: button }, strings.reload),
        (0, import_react2.createElement)("a", { href: url, target: "_blank", rel: "noopener", style: { ...button, textDecoration: "none" } }, strings.external),
        (0, import_react2.createElement)("button", { type: "button", "aria-pressed": inspecting, title: strings.inspecting, onClick: () => inspect(!inspecting), style: inspecting ? pressed : button }, strings.inspect),
        (0, import_react2.createElement)("span", { style: { flex: 1 } }),
        (0, import_react2.createElement)(
          "span",
          { role: "group", "aria-label": strings.palette, title: strings.paletteHint, style: { display: "inline-flex", alignItems: "center", gap: 10, padding: "0 6px" } },
          (0, import_react2.createElement)("span", { style: { fontSize: 12, opacity: 0.65, marginRight: -2 } }, strings.palette),
          ...PALETTES.map((item) => (0, import_react2.createElement)("button", {
            key: item.id,
            type: "button",
            title: `${strings.palette}: ${item.id}`,
            "aria-label": `${strings.palette}: ${item.id}`,
            "aria-pressed": palette === item.id,
            onClick: () => {
              setPalette(item.id);
              void api.setPalette(url, item).catch(() => setPalette(void 0));
            },
            style: {
              width: 14,
              height: 14,
              borderRadius: 999,
              padding: 0,
              cursor: "pointer",
              border: 0,
              outlineOffset: 4,
              // Each swatch shows the palette's main colour ringed by its background colour.
              background: item.primary,
              boxShadow: `0 0 0 2px ${item.bg}, 0 0 0 3px ${LINE}`,
              outline: palette === item.id ? "2px solid currentColor" : "none"
            }
          }))
        ),
        (0, import_react2.createElement)("button", { type: "button", "aria-pressed": history, onClick: () => setHistory((open) => !open), style: history ? pressed : button }, strings.history)
      ),
      inspecting ? (0, import_react2.createElement)("div", { role: "status", style: { padding: "5px 10px", fontSize: 12, color: "#fff", background: ACCENT } }, strings.inspecting) : null,
      (0, import_react2.createElement)(
        "div",
        { style: { flex: 1, minHeight: 0, display: "flex" } },
        (0, import_react2.createElement)(
          "div",
          { style: { flex: 1, minWidth: 0, display: "flex", justifyContent: "center", background: "rgba(128,128,128,0.12)" } },
          (0, import_react2.createElement)("iframe", { ref: frame, key: generation, src: url, title: strings.previewTitle, style: { width, maxWidth: "100%", height: "100%", border: 0, background: "#fff" } })
        ),
        history ? (0, import_react2.createElement)(History, { url, api, strings, lang, onRestored: reload }) : null
      )
    );
  };
}

// src/preview-url.ts
var LOOPBACK = /http:\/\/127\.0\.0\.1:\d{2,5}\//;
function extractPreviewUrl(props) {
  const seen = /* @__PURE__ */ new Set();
  const visit = (value, depth) => {
    if (typeof value === "string") return LOOPBACK.exec(value)?.[0];
    if (!value || typeof value !== "object" || depth > 8 || seen.has(value)) return void 0;
    seen.add(value);
    for (const item of Object.values(value)) {
      const found = visit(item, depth + 1);
      if (found) return found;
    }
    return void 0;
  };
  return visit(props, 0);
}

// src/suggest.ts
var FALLBACK = {
  zh: [
    "\u505A\u4E00\u4E2A\u4F1A\u5458\u7BA1\u7406\u7CFB\u7EDF\uFF0C\u652F\u6301\u5206\u7EC4\u3001\u7B49\u7EA7\u548C\u79EF\u5206",
    "\u505A\u4E00\u4E2A\u5DE5\u5355\u7CFB\u7EDF\uFF0C\u5BA2\u6237\u63D0\u4EA4\u3001\u5206\u6D3E\u5904\u7406\u3001\u72B6\u6001\u6D41\u8F6C",
    "\u505A\u4E00\u4E2A\u5E93\u5B58\u76D8\u70B9\u5E94\u7528\uFF0C\u5165\u5E93\u3001\u51FA\u5E93\u3001\u9884\u8B66\u63D0\u9192",
    "\u505A\u4E00\u4E2A\u7EBF\u7D22\u7BA1\u7406 CRM\uFF0C\u8DDF\u8FDB\u8BB0\u5F55\u3001\u8F6C\u5316\u6F0F\u6597",
    "\u505A\u4E00\u4E2A\u5458\u5DE5\u8003\u52E4\u6253\u5361\u7CFB\u7EDF\uFF0C\u652F\u6301\u8BF7\u5047\u5BA1\u6279",
    "\u505A\u4E00\u4E2A\u8BFE\u7A0B\u62A5\u540D\u7CFB\u7EDF\uFF0C\u73ED\u7EA7\u7BA1\u7406\u3001\u5B66\u5458\u6863\u6848"
  ],
  en: [
    "Build a member management system with groups, tiers, and points",
    "Build a ticketing system: customers submit, staff triage and track status",
    "Build an inventory app: stock in/out with low-stock alerts",
    "Build a lead management CRM with follow-up notes and a conversion funnel",
    "Build an employee attendance system with leave approval workflow",
    "Build a course registration system with class and student records"
  ]
};
var langOf = (tag) => String(tag ?? "").toLowerCase().startsWith("zh") ? "zh" : "en";

// src/client.ts
var name = "dsh-nocco";
var inject = ["slots"];
var PANEL = "nocco";
var TAB_ID = "dsh-nocco";
var TAB_KIND = "nocco-preview";
async function post(path, body) {
  const response = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return await response.json();
}
function apply(context) {
  const ctx = context;
  const opened = /* @__PURE__ */ new Set();
  let sidebar;
  const open = (url) => {
    for (const kind of [TAB_KIND, "browser"]) {
      try {
        if (sidebar) {
          sidebar.openTab(kind, { params: { url } });
          return;
        }
      } catch {
      }
    }
    window.open(url, "_blank", "noopener");
  };
  function PreviewRow(props) {
    const strings = text(pageLang());
    const url = extractPreviewUrl(props);
    (0, import_react3.useEffect)(() => {
      if (!url || opened.has(url)) return;
      opened.add(url);
      try {
        sidebar?.openTab(TAB_KIND, { params: { url } });
      } catch {
      }
    }, [url]);
    const row = { display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 13 };
    const settled = props?.phase === "result";
    if (!url) return (0, import_react3.createElement)("div", { style: { ...row, opacity: 0.7 } }, settled ? strings.stopped : strings.working);
    return (0, import_react3.createElement)(
      "div",
      { style: row },
      (0, import_react3.createElement)("span", null, strings.running),
      (0, import_react3.createElement)("a", { href: url, target: "_blank", rel: "noopener" }, url),
      (0, import_react3.createElement)("button", { type: "button", onClick: () => open(url), style: button }, strings.open)
    );
  }
  ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({ name: "tool.call.toolview", key: "nocco_preview" }, PreviewRow));
  let pending;
  const compact = (value) => value.replace(/\s+/g, " ").trim();
  const inserts = [];
  const listeners = /* @__PURE__ */ new Set();
  let insertVersion = 0;
  const insertIntoComposer = (value) => {
    inserts.push(value);
    insertVersion += 1;
    for (const listener of listeners) listener();
  };
  const subscribeInserts = (listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  function ComposerBridge(props) {
    const session = props;
    const draft = session.useInput?.((state) => state.draft) ?? "";
    const phase = session.useInput?.((state) => state.phase) ?? "";
    const version = (0, import_react3.useSyncExternalStore)(subscribeInserts, () => insertVersion);
    (0, import_react3.useEffect)(() => {
      if (!pending) return;
      if (Date.now() - pending.at > 15e3) {
        pending = void 0;
        return;
      }
      if (phase !== "plain" || compact(draft) !== compact(pending.draft)) return;
      pending = void 0;
      session.inputActions?.submit();
    }, [draft, phase]);
    (0, import_react3.useEffect)(() => {
      const actions = session.inputActions;
      if (!actions || inserts.length === 0) return;
      for (const value of inserts.splice(0)) actions.insertText(value, actions.captureInsertion());
    }, [version]);
    return null;
  }
  ctx.slots.inject("conversation.input.overlay", () => ctx.slots.register({ name: "conversation.input.overlay", id: "nocco-bridge", order: 99 }, ComposerBridge));
  ctx.inject(["layout", "uiWorkspace"], (inner) => {
    const Home = createHome({
      // If the Host half cannot answer, show the sample ideas instead of an empty lane.
      suggestions: (lang, refresh) => post("api/nocco.suggestions", { lang, refresh }).catch(() => ({ suggestions: [...FALLBACK[langOf(lang)]], source: "fallback" })),
      upload: async (file) => {
        const response = await fetch("api/nocco.upload", { method: "POST", headers: { "x-nocco-filename": encodeURIComponent(file.name) }, body: file });
        if (!response.ok) throw new Error(`upload returned ${response.status}`);
        return await response.json();
      },
      voiceAvailable: async () => (await post("api/nocco.voice", {})).available === true,
      transcribe: async (wav) => {
        const response = await fetch("api/nocco.transcribe", { method: "POST", headers: { "content-type": "audio/wav" }, body: new Blob([wav.slice()]) });
        if (!response.ok) throw new Error(`transcription returned ${response.status}`);
        return (await response.json()).text;
      },
      enhance: async (request) => (await post("api/nocco.enhance", { text: request })).text,
      start: (draft) => {
        inner.get("layout").selectPanel(null);
        pending = { draft, at: Date.now() };
        inner.get("uiWorkspace").startSession(void 0, { prompt: draft, whenDraftExists: "replace" });
      }
    });
    inner.slots.inject("sidebar.panellist", () => inner.slots.register({ name: "sidebar.panellist", id: PANEL, label: "Nocco", order: 5 }, HomeIcon));
    inner.slots.inject("main", () => inner.slots.register({ name: "main", key: PANEL }, Home));
  });
  ctx.inject(["sidebarRight", "sidebarRightTabs"], (inner) => {
    const PreviewTab = createPreviewTab({
      setPalette: async (url, palette) => {
        await post("api/nocco.palette", { url, palette });
      },
      insert: insertIntoComposer,
      checkpoints: async (url, action, id) => (await post("api/nocco.checkpoints", { url, action, id })).checkpoints
    });
    const tabs = inner.get("sidebarRightTabs");
    sidebar = inner.get("sidebarRight");
    inner.effect(() => () => {
      sidebar = void 0;
    }, "nocco.sidebar");
    inner.effect(() => tabs.register({ id: TAB_ID, kind: TAB_KIND, title: () => text(pageLang()).previewTitle }), "nocco.preview-tab");
    inner.slots.inject("sidebar.right.pane.tab", () => inner.slots.register({ name: "sidebar.right.pane.tab", key: TAB_ID }, PreviewTab));
  });
}

return module.exports;
}});
