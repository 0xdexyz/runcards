import type { TrackId } from '../content';
import { mulberry32 } from './random';

/**
 * Tiny generative music engine for the hero player.
 * Each "track" is a 4-bar loop synthesised live with the Web Audio API.
 */

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

interface PluckOptions {
  type?: OscillatorType;
  decay?: number;
  delay?: number;
  reverb?: number;
}

class Voices {
  constructor(
    private readonly ctx: AudioContext,
    private readonly dry: AudioNode,
    private readonly delaySend: AudioNode,
    private readonly reverbSend: AudioNode,
    private readonly noise: AudioBuffer,
  ) {}

  private route(node: AudioNode, delay = 0, reverb = 0) {
    node.connect(this.dry);
    for (const [amount, target] of [
      [delay, this.delaySend],
      [reverb, this.reverbSend],
    ] as const) {
      if (amount <= 0) continue;
      const send = this.ctx.createGain();
      send.gain.value = amount;
      node.connect(send);
      send.connect(target);
    }
  }

  private osc(type: OscillatorType, freq: number, t: number, stop: number, dest: AudioNode, detune = 0) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = detune;
    o.connect(dest);
    o.start(t);
    o.stop(stop);
    return o;
  }

  pad(notes: number[], t: number, dur: number, level: number, bright: number, type: OscillatorType = 'sawtooth') {
    const { ctx } = this;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(bright * 0.55, t);
    filter.frequency.linearRampToValueAtTime(bright, t + dur * 0.5);
    filter.frequency.linearRampToValueAtTime(bright * 0.7, t + dur);
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.linearRampToValueAtTime(level, t + Math.min(0.9, dur * 0.3));
    amp.gain.setValueAtTime(level, t + dur * 0.8);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.9);
    filter.connect(amp);
    let last: OscillatorNode | null = null;
    for (const note of notes) {
      for (const detune of [-7, 8]) last = this.osc(type, hz(note), t, t + dur + 1, filter, detune);
    }
    if (last) last.onended = () => amp.disconnect();
    this.route(amp, 0, 0.35);
  }

  pluck(note: number, t: number, level: number, opts: PluckOptions = {}) {
    const { ctx } = this;
    const decay = opts.decay ?? 0.4;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(5200, t);
    filter.frequency.exponentialRampToValueAtTime(700, t + decay);
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.linearRampToValueAtTime(level, t + 0.005);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    filter.connect(amp);
    const o = this.osc(opts.type ?? 'triangle', hz(note), t, t + decay + 0.05, filter);
    o.onended = () => amp.disconnect();
    this.route(amp, opts.delay ?? 0.25, opts.reverb ?? 0.2);
  }

  /** Two-operator FM voice with a soft, keys-like attack. */
  keys(notes: number[], t: number, dur: number, level: number) {
    const { ctx } = this;
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.linearRampToValueAtTime(level, t + 0.01);
    amp.gain.exponentialRampToValueAtTime(level * 0.45, t + dur * 0.8);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.5);
    const stop = t + dur + 0.6;
    let last: OscillatorNode | null = null;
    for (const note of notes) {
      const f = hz(note);
      const carrier = this.osc('sine', f, t, stop, amp);
      const index = ctx.createGain();
      index.gain.setValueAtTime(f * 2.2, t);
      index.gain.exponentialRampToValueAtTime(f * 0.25, t + 0.6);
      this.osc('sine', f, t, stop, index);
      index.connect(carrier.frequency);
      last = carrier;
    }
    if (last) last.onended = () => amp.disconnect();
    this.route(amp, 0.12, 0.3);
  }

  bass(note: number, t: number, dur: number, level: number, type: OscillatorType = 'sine') {
    const { ctx } = this;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 520;
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.linearRampToValueAtTime(level, t + 0.02);
    amp.gain.setValueAtTime(level, t + dur * 0.7);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.12);
    filter.connect(amp);
    const o = this.osc(type, hz(note), t, t + dur + 0.2, filter);
    o.onended = () => amp.disconnect();
    this.route(amp);
  }

  kick(t: number, level: number) {
    const amp = this.ctx.createGain();
    amp.gain.setValueAtTime(level, t);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.36);
    const o = this.osc('sine', 140, t, t + 0.4, amp);
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    o.onended = () => amp.disconnect();
    this.route(amp);
  }

  noiseHit(t: number, level: number, decay: number, type: BiquadFilterType, freq: number, reverb = 0) {
    const { ctx } = this;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(level, t);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    src.connect(filter);
    filter.connect(amp);
    src.start(t, Math.random() * 0.5);
    src.stop(t + decay + 0.02);
    src.onended = () => amp.disconnect();
    this.route(amp, 0, reverb);
  }
}

interface TrackDef {
  bpm: number;
  steps: number;
  play: (v: Voices, step: number, t: number, stepDur: number) => void;
}

const lowTidePattern = (() => {
  const rand = mulberry32(7);
  const scale = [74, 76, 78, 81, 83, 86, 88, 90];
  return Array.from({ length: 64 }, (_, i) => {
    const hit = i % 8 === 0 || rand() < 0.36;
    return hit ? scale[Math.floor(rand() * scale.length)] : 0;
  });
})();

const TRACKS: Record<TrackId, TrackDef> = {
  afterglow: {
    bpm: 84,
    steps: 64,
    play(v, step, t, sd) {
      const bar = Math.floor(step / 16);
      const s = step % 16;
      const chords = [
        [57, 60, 64, 67, 71],
        [53, 57, 60, 64, 67],
        [52, 55, 59, 60, 64],
        [55, 59, 62, 64, 67],
      ];
      const roots = [45, 41, 48, 43];
      const chord = chords[bar];
      if (s === 0) {
        v.pad(chord, t, sd * 16, 0.022, 1150);
        v.bass(roots[bar], t, sd * 14, 0.17);
      }
      const arp = [0, 2, 1, 3, 2, 4, 3, 1];
      if (s % 2 === 0 || s === 7 || s === 15) {
        const note = chord[arp[(s >> 1) % arp.length] % chord.length] + 12;
        v.pluck(note, t, s % 4 === 0 ? 0.05 : 0.034, { decay: 0.55, delay: 0.35, reverb: 0.3 });
      }
    },
  },
  lowtide: {
    bpm: 100,
    steps: 64,
    play(v, step, t, sd) {
      const bar = Math.floor(step / 16);
      const s = step % 16;
      const chords = [
        [50, 57, 61, 64, 66],
        [47, 54, 57, 62, 66],
        [43, 50, 54, 59, 62],
        [45, 52, 57, 59, 64],
      ];
      const roots = [50, 47, 43, 45];
      if (s === 0) {
        v.pad(chords[bar], t, sd * 16, 0.03, 1500, 'triangle');
        v.bass(roots[bar], t, sd * 6, 0.16);
      }
      if (s === 8) v.bass(roots[bar], t, sd * 6, 0.12);
      const note = lowTidePattern[step];
      if (note) v.pluck(note, t, 0.045, { type: 'sine', decay: 0.7, delay: 0.5, reverb: 0.35 });
      if (s % 4 === 2) v.noiseHit(t, 0.012, 0.05, 'highpass', 8000);
    },
  },
  nightbus: {
    bpm: 92,
    steps: 64,
    play(v, step, t, sd) {
      const bar = Math.floor(step / 16);
      const s = step % 16;
      const chords = [
        [52, 55, 59, 62, 66],
        [48, 52, 55, 59, 64],
        [45, 52, 55, 59, 60],
        [47, 52, 54, 57, 59],
      ];
      const roots = [40, 36, 45, 47];
      if (s === 0) v.keys(chords[bar], t, sd * 6, 0.05);
      if (s === 10) v.keys(chords[bar], t, sd * 4, 0.035);
      if (s === 0 || s === 8 || (bar === 3 && s === 11)) v.kick(t, 0.5);
      if (s === 4 || s === 12) v.noiseHit(t, 0.09, 0.16, 'bandpass', 1700, 0.25);
      if (s % 2 === 0) v.noiseHit(t, s % 4 === 2 ? 0.035 : 0.016, 0.05, 'highpass', 7600);
      const root = roots[bar];
      if (s === 0) v.bass(root, t, sd * 3, 0.2, 'triangle');
      if (s === 3) v.bass(root + 12, t, sd * 2, 0.12, 'triangle');
      if (s === 8) v.bass(root, t, sd * 3, 0.18, 'triangle');
      if (s === 14) v.bass(root + 7, t, sd * 2, 0.12, 'triangle');
    },
  },
};

function makeImpulse(ctx: AudioContext, seconds: number) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
  }
  return buffer;
}

function makeNoise(ctx: AudioContext) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

const LOOKAHEAD = 0.12;
const VOLUME = 0.5;

export class GenerativePlayer {
  private readonly ctx: AudioContext;
  private readonly master: GainNode;
  private readonly delay: DelayNode;
  private readonly voices: Voices;
  private trackId: TrackId | null = null;
  private track: TrackDef = TRACKS.afterglow;
  private step = 0;
  private nextTime = 0;
  private loopStart = 0;
  private timer = 0;
  private suspendTimer = 0;

  constructor() {
    const ctx = new AudioContext();
    this.ctx = ctx;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.knee.value = 12;
    comp.ratio.value = 3;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(comp);
    comp.connect(ctx.destination);

    const dry = ctx.createGain();
    dry.connect(this.master);

    const delayIn = ctx.createGain();
    this.delay = ctx.createDelay(1.5);
    const feedback = ctx.createGain();
    feedback.gain.value = 0.36;
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 2400;
    delayIn.connect(this.delay);
    this.delay.connect(tone);
    tone.connect(feedback);
    feedback.connect(this.delay);
    tone.connect(this.master);

    const reverbIn = ctx.createGain();
    const reverb = ctx.createConvolver();
    reverb.buffer = makeImpulse(ctx, 2.8);
    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    reverbIn.connect(reverb);
    reverb.connect(wet);
    wet.connect(this.master);

    this.voices = new Voices(ctx, dry, delayIn, reverbIn, makeNoise(ctx));
  }

  private get stepDuration() {
    return 60 / this.track.bpm / 4;
  }

  async play(id: TrackId) {
    window.clearTimeout(this.suspendTimer);
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    const now = this.ctx.currentTime;
    if (id !== this.trackId) {
      this.trackId = id;
      this.track = TRACKS[id];
      this.step = 0;
      this.nextTime = now + 0.06;
      this.loopStart = this.nextTime;
      this.delay.delayTime.setValueAtTime(this.stepDuration * 3, now);
    }
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(VOLUME, now, 0.08);
    window.clearInterval(this.timer);
    this.timer = window.setInterval(() => this.schedule(), 25);
    this.schedule();
  }

  pause() {
    window.clearInterval(this.timer);
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(0, now, 0.06);
    this.suspendTimer = window.setTimeout(() => void this.ctx.suspend(), 400);
  }

  /** Position inside the current loop, 0–1. */
  progress() {
    const loop = this.track.steps * this.stepDuration;
    const t = this.ctx.currentTime - this.loopStart;
    return (((t % loop) + loop) % loop) / loop;
  }

  dispose() {
    window.clearInterval(this.timer);
    window.clearTimeout(this.suspendTimer);
    void this.ctx.close();
  }

  private schedule() {
    const now = this.ctx.currentTime;
    const sd = this.stepDuration;
    if (this.nextTime < now) {
      // The tab was throttled: skip ahead instead of firing a burst of late notes.
      const skipped = Math.ceil((now - this.nextTime) / sd);
      this.step = (this.step + skipped) % this.track.steps;
      this.nextTime += skipped * sd;
    }
    while (this.nextTime < now + LOOKAHEAD) {
      this.track.play(this.voices, this.step, this.nextTime, sd);
      this.nextTime += sd;
      this.step = (this.step + 1) % this.track.steps;
    }
  }
}
