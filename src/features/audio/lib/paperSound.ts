export type PaperSoundKind = 'turn-next' | 'turn-prev' | 'unfold' | 'tap' | 'settle';

interface ActivePeelSession {
  source: AudioBufferSourceNode;
  crackleFilter: BiquadFilterNode;
  bodyFilter: BiquadFilterNode;
  gain: GainNode;
  panner: StereoPannerNode | null;
  lastUpdate: number;
}

class PaperSoundEngine {
  private ctx: AudioContext | null = null;
  private rustleBuffer: AudioBuffer | null = null;
  private bodyBuffer: AudioBuffer | null = null;
  private peelSession: ActivePeelSession | null = null;
  private muted = false;

  constructor() {
    try {
      this.muted = localStorage.getItem('daily-prophet:muted') === '1';
    } catch {
      this.muted = false;
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(next: boolean): void {
    this.muted = next;
    if (next) this.stopPeelSession();
    try {
      localStorage.setItem('daily-prophet:muted', next ? '1' : '0');
    } catch {

    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => undefined);
    }
    if (this.ctx && !this.rustleBuffer) {
      this.rustleBuffer = this.createRustleBuffer(this.ctx);
      this.bodyBuffer = this.createBodyBuffer(this.ctx);
    }
    return this.ctx;
  }

  private createRustleBuffer(ctx: AudioContext): AudioBuffer {
    const length = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let burstEnv = 0;

    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;

      if (Math.random() < 0.004) {
        burstEnv = 0.6 + Math.random() * 0.4;
      }
      burstEnv *= 0.992;
      const crinkle = (Math.random() * 2 - 1) * burstEnv * 0.9;

      data[i] = (b0 * 0.18 + b1 * 0.24 + b2 * 0.28 + white * 0.14 + crinkle) * 0.5;
    }
    return buffer;
  }

  private createBodyBuffer(ctx: AudioContext): AudioBuffer {
    const length = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.035 * white) / 1.035;
      data[i] = last * 2.4;
    }
    return buffer;
  }

  startPeel(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.rustleBuffer) return;

    this.stopPeelSession();

    const source = ctx.createBufferSource();
    source.buffer = this.rustleBuffer;
    source.loop = true;

    const crackleFilter = ctx.createBiquadFilter();
    crackleFilter.type = 'bandpass';
    crackleFilter.frequency.value = 950;
    crackleFilter.Q.value = 1.35;

    const bodyFilter = ctx.createBiquadFilter();
    bodyFilter.type = 'highpass';
    bodyFilter.frequency.value = 170;

    const gain = ctx.createGain();
    gain.gain.value = 0.0001;

    let panner: StereoPannerNode | null = null;
    source.connect(bodyFilter);
    bodyFilter.connect(crackleFilter);

    if (typeof ctx.createStereoPanner === 'function') {
      panner = ctx.createStereoPanner();
      panner.pan.value = 0.4;
      crackleFilter.connect(panner);
      panner.connect(gain);
    } else {
      crackleFilter.connect(gain);
    }

    gain.connect(ctx.destination);
    source.start(ctx.currentTime, Math.random() * 1.5);

    this.peelSession = {
      source,
      crackleFilter,
      bodyFilter,
      gain,
      panner,
      lastUpdate: ctx.currentTime,
    };
  }

  updatePeel(speed: number, progress: number): void {
    if (this.muted || !this.ctx || !this.peelSession) return;
    const now = this.ctx.currentTime;
    const clampedSpeed = Math.min(3.5, Math.max(0, speed));
    const targetGain = Math.min(0.34, clampedSpeed * 0.16);
    const targetFreq = 620 + Math.min(1800, clampedSpeed * 680) + Math.sin(progress * Math.PI) * 280;

    this.peelSession.gain.gain.setTargetAtTime(targetGain, now, 0.025);
    this.peelSession.crackleFilter.frequency.setTargetAtTime(targetFreq, now, 0.03);
    if (this.peelSession.panner) {
      const pan = Math.max(-0.75, Math.min(0.75, 0.55 - progress * 1.1));
      this.peelSession.panner.pan.setTargetAtTime(pan, now, 0.03);
    }
    this.peelSession.lastUpdate = now;
  }

  endPeel(completed: boolean): void {
    this.stopPeelSession();
    if (!this.muted) {
      this.play(completed ? 'settle' : 'tap');
    }
  }

  private stopPeelSession(): void {
    if (!this.peelSession || !this.ctx) return;
    const session = this.peelSession;
    this.peelSession = null;
    try {
      const now = this.ctx.currentTime;
      session.gain.gain.setTargetAtTime(0.0001, now, 0.02);
      session.source.stop(now + 0.08);
    } catch {

    }
  }

  play(kind: PaperSoundKind): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.rustleBuffer || !this.bodyBuffer) return;

    const now = ctx.currentTime;
    const pitch = 0.93 + Math.random() * 0.14;

    if (kind === 'tap') {
      this.voice(ctx, this.rustleBuffer, {
        start: now,
        duration: 0.11,
        fStart: 1100 * pitch,
        fPeak: 1750 * pitch,
        fEnd: 680 * pitch,
        q: 1.8,
        gain: 0.08,
        pan: 0,
      });
      return;
    }

    if (kind === 'settle') {

      this.voice(ctx, this.rustleBuffer, {
        start: now,
        duration: 0.26,
        fStart: 1350 * pitch,
        fPeak: 820 * pitch,
        fEnd: 340 * pitch,
        q: 1.25,
        gain: 0.19,
        pan: -0.25,
      });
      this.voice(ctx, this.bodyBuffer, {
        start: now + 0.03,
        duration: 0.22,
        fStart: 240,
        fPeak: 140,
        fEnd: 85,
        q: 0.9,
        gain: 0.22,
        pan: -0.2,
      });
      return;
    }

    if (kind === 'unfold') {
      this.voice(ctx, this.bodyBuffer, {
        start: now,
        duration: 0.42,
        fStart: 180,
        fPeak: 290,
        fEnd: 110,
        q: 0.85,
        gain: 0.25,
        pan: 0,
      });
      this.voice(ctx, this.rustleBuffer, {
        start: now + 0.02,
        duration: 0.48,
        fStart: 520 * pitch,
        fPeak: 1650 * pitch,
        fEnd: 480 * pitch,
        q: 1.15,
        gain: 0.22,
        pan: -0.2,
      });
      this.voice(ctx, this.rustleBuffer, {
        start: now + 0.14,
        duration: 0.36,
        fStart: 880 * pitch,
        fPeak: 2100 * pitch,
        fEnd: 620 * pitch,
        q: 1.5,
        gain: 0.15,
        pan: 0.25,
      });
      return;
    }

    const dir = kind === 'turn-next' ? 1 : -1;

    this.voice(ctx, this.rustleBuffer, {
      start: now,
      duration: 0.16,
      fStart: 780 * pitch,
      fPeak: 2150 * pitch,
      fEnd: 1200 * pitch,
      q: 1.7,
      gain: 0.14,
      pan: 0.48 * dir,
    });

    this.voice(ctx, this.bodyBuffer, {
      start: now + 0.04,
      duration: 0.42,
      fStart: 150,
      fPeak: 280,
      fEnd: 95,
      q: 0.85,
      gain: 0.26,
      pan: 0.05 * dir,
    });

    this.voice(ctx, this.rustleBuffer, {
      start: now + 0.05,
      duration: 0.44,
      fStart: 480 * pitch,
      fPeak: 1580 * pitch,
      fEnd: 390 * pitch,
      q: 1.05,
      gain: 0.27,
      pan: -0.15 * dir,
    });

    this.voice(ctx, this.rustleBuffer, {
      start: now + 0.34,
      duration: 0.22,
      fStart: 1120 * pitch,
      fPeak: 680 * pitch,
      fEnd: 290 * pitch,
      q: 1.4,
      gain: 0.16,
      pan: -0.45 * dir,
    });
  }

  private voice(
    ctx: AudioContext,
    buffer: AudioBuffer,
    opts: {
      start: number;
      duration: number;
      fStart: number;
      fPeak: number;
      fEnd: number;
      q: number;
      gain: number;
      pan: number;
    },
  ): void {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = opts.q;
    filter.frequency.setValueAtTime(opts.fStart, opts.start);
    filter.frequency.exponentialRampToValueAtTime(opts.fPeak, opts.start + opts.duration * 0.42);
    filter.frequency.exponentialRampToValueAtTime(opts.fEnd, opts.start + opts.duration);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, opts.start);
    env.gain.exponentialRampToValueAtTime(opts.gain, opts.start + opts.duration * 0.24);
    env.gain.exponentialRampToValueAtTime(opts.gain * 0.58, opts.start + opts.duration * 0.7);
    env.gain.exponentialRampToValueAtTime(0.0001, opts.start + opts.duration);

    source.connect(filter);
    if (typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      panner.pan.value = opts.pan;
      filter.connect(panner);
      panner.connect(env);
    } else {
      filter.connect(env);
    }

    env.connect(ctx.destination);
    source.start(opts.start, Math.random() * 1.2, opts.duration + 0.05);
    source.stop(opts.start + opts.duration + 0.04);
  }
}

export const paperSound = new PaperSoundEngine();
