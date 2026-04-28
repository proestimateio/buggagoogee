// audioManager.js
// Singleton procedural chiptune SFX + ambient BGM manager.
// Lazily creates an AudioContext on the first user gesture.

let ctx = null;
let masterGain = null;
let sfxGain = null;
let bgmGain = null;
let bgmFilter = null;
let bgmOsc1 = null;
let bgmOsc2 = null;
let bgmStarted = false;
let bgmEnabled = true;
let sfxEnabled = true;
let masterVolume = 0.7;
let currentWorld = null;

// World chord roots (Hz) and modes
const WORLD_TONES = {
  home:      { root: 261.63, mode: "major",  detune: 6,  filter: 1200 }, // warm C major
  camp:      { root: 130.81, mode: "minor",  detune: 8,  filter: 700  }, // low minor
  overworld: { root: 392.00, mode: "major",  detune: 5,  filter: 2200 }, // bright G major
  space:     { root: 523.25, mode: "airy",   detune: 12, filter: 3200 }, // high airy
  jungle:    { root: 349.23, mode: "jazzy",  detune: 7,  filter: 1800 }, // jazzy F
  ocean:     { root: 174.61, mode: "mellow", detune: 9,  filter: 900  }, // deep mellow
};

function ensureCtx() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = masterVolume;
    masterGain.connect(ctx.destination);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = sfxEnabled ? 1 : 0;
    sfxGain.connect(masterGain);

    bgmGain = ctx.createGain();
    bgmGain.gain.value = 0;
    bgmFilter = ctx.createBiquadFilter();
    bgmFilter.type = "lowpass";
    bgmFilter.frequency.value = 1200;
    bgmGain.connect(bgmFilter);
    bgmFilter.connect(masterGain);
  } catch (e) {
    ctx = null;
  }
  return ctx;
}

function startBgm() {
  if (!ctx || bgmStarted) return;
  try {
    bgmOsc1 = ctx.createOscillator();
    bgmOsc2 = ctx.createOscillator();
    bgmOsc1.type = "sawtooth";
    bgmOsc2.type = "sawtooth";
    bgmOsc1.frequency.value = 220;
    bgmOsc2.frequency.value = 220;
    bgmOsc2.detune.value = 7;
    bgmOsc1.connect(bgmGain);
    bgmOsc2.connect(bgmGain);
    bgmOsc1.start();
    bgmOsc2.start();
    bgmStarted = true;
  } catch (e) {}
}

function playTone(freq, when, dur, type = "sine", vol = 0.18) {
  if (!ctx || !sfxEnabled) return;
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol, when + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g);
    g.connect(sfxGain);
    o.start(when);
    o.stop(when + dur + 0.05);
  } catch (e) {}
}

const SFX = {
  coin:        { notes: [880, 1320],            type: "square",   dur: 0.18 },
  levelup:     { notes: [523, 659, 784, 1047],  type: "triangle", dur: 0.22 },
  click:       { notes: [660],                  type: "square",   dur: 0.07 },
  interact:    { notes: [440, 660],             type: "triangle", dur: 0.12 },
  achievement: { notes: [659, 784, 988, 1319],  type: "sine",     dur: 0.25 },
  minigame_win:{ notes: [523, 659, 784, 1047, 1319], type: "triangle", dur: 0.20 },
  footstep:    { notes: [120],                  type: "sine",     dur: 0.05 },
  chat:        { notes: [880, 1100],            type: "sine",     dur: 0.10 },
  open:        { notes: [330, 494, 659],        type: "triangle", dur: 0.14 },
  error:       { notes: [220, 165],             type: "square",   dur: 0.18 },
  portal:      { notes: [392, 523, 659, 784, 1047, 1319], type: "sine", dur: 0.28 },
};

export function playSound(name) {
  try {
    if (!ensureCtx()) return;
    if (ctx.state === "suspended") {
      // Will resume on enableAudio(); skip to avoid silent ghost notes
      ctx.resume().catch(() => {});
    }
    if (!sfxEnabled) return;
    const cfg = SFX[name];
    if (!cfg) return;
    const now = ctx.currentTime;
    cfg.notes.forEach((freq, i) => {
      playTone(freq, now + i * 0.06, cfg.dur, cfg.type, 0.18);
    });
    if (bgmEnabled && !bgmStarted) startBgm();
    if (bgmEnabled && bgmStarted && bgmGain.gain.value < 0.01) {
      bgmGain.gain.cancelScheduledValues(now);
      bgmGain.gain.linearRampToValueAtTime(0.05, now + 0.5);
    }
  } catch (e) {}
}

export function setBgmWorld(world) {
  try {
    if (!ensureCtx()) return;
    if (!WORLD_TONES[world]) return;
    currentWorld = world;
    if (bgmEnabled && !bgmStarted) startBgm();
    if (!bgmStarted) return;
    const cfg = WORLD_TONES[world];
    const now = ctx.currentTime;
    bgmOsc1.frequency.cancelScheduledValues(now);
    bgmOsc2.frequency.cancelScheduledValues(now);
    bgmOsc1.frequency.linearRampToValueAtTime(cfg.root, now + 0.5);
    bgmOsc2.frequency.linearRampToValueAtTime(cfg.root * 1.5, now + 0.5);
    bgmOsc2.detune.linearRampToValueAtTime(cfg.detune, now + 0.5);
    bgmFilter.frequency.cancelScheduledValues(now);
    bgmFilter.frequency.linearRampToValueAtTime(cfg.filter, now + 0.5);
    bgmGain.gain.cancelScheduledValues(now);
    bgmGain.gain.linearRampToValueAtTime(bgmEnabled ? 0.05 : 0, now + 0.5);
  } catch (e) {}
}

export function setMasterVolume(v) {
  masterVolume = Math.max(0, Math.min(1, v));
  try {
    if (masterGain && ctx) {
      const now = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.linearRampToValueAtTime(masterVolume, now + 0.1);
    }
  } catch (e) {}
}

export function setBgmEnabled(b) {
  bgmEnabled = !!b;
  try {
    if (!ctx || !bgmGain) return;
    const now = ctx.currentTime;
    bgmGain.gain.cancelScheduledValues(now);
    bgmGain.gain.linearRampToValueAtTime(bgmEnabled ? 0.05 : 0, now + 0.4);
    if (bgmEnabled && !bgmStarted) startBgm();
  } catch (e) {}
}

export function setSfxEnabled(b) {
  sfxEnabled = !!b;
  try {
    if (sfxGain && ctx) {
      const now = ctx.currentTime;
      sfxGain.gain.cancelScheduledValues(now);
      sfxGain.gain.linearRampToValueAtTime(sfxEnabled ? 1 : 0, now + 0.1);
    }
  } catch (e) {}
}

export function enableAudio() {
  try {
    ensureCtx();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    if (bgmEnabled && !bgmStarted) startBgm();
    if (currentWorld) setBgmWorld(currentWorld);
  } catch (e) {}
}

export default {
  playSound,
  setBgmWorld,
  setMasterVolume,
  setBgmEnabled,
  setSfxEnabled,
  enableAudio,
};
