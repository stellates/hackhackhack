// Web Audio API procedural BGM sequencer & SFX for THE HOLLYWOOD HACKER v2
// The AudioContext clock is the single source of truth for gameplay timing,
// so the music, the notes on screen, and hit judgments always stay in sync.

export const BPM = 128;
export const BEAT_SEC = 60 / BPM;
/** Beats of count-in before beat 0 (READY x4 → 3, 2, 1 → HACK!) */
export const COUNT_IN_BEATS = 8;
/** 16 bars @128 BPM = exactly 30.0 seconds */
export const SONG_BEATS = 64;

// One chord per bar, 4-bar loop: Em - C - D - B
const BASS_ROOTS = [82.41, 65.41, 73.42, 61.74];
const ARP_TONES = [
  [329.63, 392.0, 493.88, 659.25],
  [261.63, 329.63, 392.0, 523.25],
  [293.66, 369.99, 440.0, 587.33],
  [246.94, 311.13, 369.99, 493.88]
];
const ARP_ORDER = [0, 1, 2, 3, 2, 1, 2, 3];
const BASS_OCTAVE = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1];
/** Final ENTER lands on beat 60 → everything after is the outro */
const OUTRO_STEP = 60 * 4;

class SoundManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bgmBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private muted = false;

  // Song clock
  private songStart = 0;
  private fallbackStart = 0;
  private nextStepTime = 0;
  private step = 0;
  private schedulerId: number | null = null;
  private playing = false;

  /** Must be called from a user gesture (autoplay policy). Safe to call repeatedly. */
  public init(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor({ latencyHint: 'interactive' });
      this.ctx = ctx;

      this.master = ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      this.master.connect(ctx.destination);

      this.bgmBus = ctx.createGain();
      this.bgmBus.gain.value = 0.42;
      this.bgmBus.connect(this.master);

      this.sfxBus = ctx.createGain();
      this.sfxBus.gain.value = 0.8;
      this.sfxBus.connect(this.master);

      // One shared second of white noise, reused by every noise voice
      this.noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    } catch {
      console.warn('Web Audio API not supported on this browser.');
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : 0.9, this.ctx.currentTime, 0.01);
    }
    return this.muted;
  }

  private trackBuffers: Map<string, AudioBuffer> = new Map();
  private currentTrackSource: AudioBufferSourceNode | null = null;
  private isUsingAudioFile = false;

  public isAudioTrackActive(): boolean {
    return this.isUsingAudioFile;
  }

  /** Preloads audio track for specified difficulty with resilient fallback paths */
  public async preloadTrack(diff: string, filePath: string): Promise<boolean> {
    this.init();
    if (!this.ctx) return false;

    const baseClean = (import.meta.env.BASE_URL || './').replace(/\/$/, '');
    const fileClean = filePath.replace(/^\.?\//, '');
    
    // Unique list of path candidates to handle GitHub Pages subfolders & root deployments
    const candidatePaths = Array.from(new Set([
      filePath,
      `./${fileClean}`,
      fileClean,
      `${baseClean}/${fileClean}`,
      `/${fileClean}`
    ]));

    for (const testPath of candidatePaths) {
      try {
        const res = await fetch(testPath);
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          // Ensure we didn't receive a 200 HTML fallback page from SPA router
          if (contentType.includes('text/html')) continue;

          const arrayBuf = await res.arrayBuffer();
          const audioBuf = await this.ctx.decodeAudioData(arrayBuf);
          this.trackBuffers.set(diff, audioBuf);
          console.log(`[SoundManager] Loaded track for ${diff} from ${testPath} (${audioBuf.duration.toFixed(1)}s)`);
          return true;
        }
      } catch {
        // Continue to next candidate
      }
    }

    console.warn(`[SoundManager] Could not load audio track for ${diff} from candidates:`, candidatePaths);
    return false;
  }

  /** Starts the audio track for given difficulty with precise Web Audio timing */
  public startTrack(diff: string, delaySeconds = 0): void {
    this.init();
    this.stopTrack();
    this.restoreBgmVolume();

    const buffer = this.trackBuffers.get(diff);
    if (this.ctx && buffer && this.bgmBus) {
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(this.bgmBus);
      const startTime = this.ctx.currentTime + delaySeconds;
      src.start(startTime);
      src.onended = () => {
        if (this.currentTrackSource === src) {
          this.currentTrackSource = null;
          this.playing = false;
        }
      };
      this.currentTrackSource = src;
      this.songStart = startTime;
      this.isUsingAudioFile = true;
      this.playing = true;
      return;
    }

    // Fallback to internal procedural synth if track not ready
    this.startSong();
  }

  /** Gentle volume duck when entering result modal so player can admire their score while track finishes */
  public duckBgmForResults(): void {
    if (this.ctx && this.bgmBus) {
      this.bgmBus.gain.setTargetAtTime(0.32, this.ctx.currentTime, 0.3);
    }
  }

  public restoreBgmVolume(): void {
    if (this.ctx && this.bgmBus) {
      this.bgmBus.gain.setTargetAtTime(0.42, this.ctx.currentTime, 0.05);
    }
  }

  public stopTrack(): void {
    if (this.currentTrackSource) {
      try {
        this.currentTrackSource.stop();
        this.currentTrackSource.disconnect();
      } catch {
        // ignore if already stopped
      }
      this.currentTrackSource = null;
    }
    this.isUsingAudioFile = false;
    this.stopSong();
  }

  /** Starts the count-in + song. Beat 0 (game start) arrives after COUNT_IN_BEATS. */
  public startSong(): void {
    this.init();
    this.stopSong();
    this.playing = true;
    this.isUsingAudioFile = false;
    this.step = -COUNT_IN_BEATS * 4;

    if (!this.ctx) {
      this.fallbackStart = performance.now() + COUNT_IN_BEATS * BEAT_SEC * 1000;
      return;
    }
    const firstStep = this.ctx.currentTime + 0.15;
    this.songStart = firstStep + COUNT_IN_BEATS * BEAT_SEC;
    this.nextStepTime = firstStep;
    this.schedulerId = window.setInterval(() => this.schedule(), 25);
    this.schedule();
  }

  public stopSong(): void {
    this.playing = false;
    if (this.schedulerId !== null) {
      clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
  }

  /**
   * Seconds since beat 0 of what the player is *hearing right now*
   * (negative during the count-in). Output latency is compensated.
   */
  public getSongTime(): number {
    const ctx = this.ctx;
    if (!ctx) return (performance.now() - this.fallbackStart) / 1000;

    if (typeof ctx.getOutputTimestamp === 'function') {
      const ts = ctx.getOutputTimestamp();
      if (ts.contextTime && ts.performanceTime) {
        return ts.contextTime + (performance.now() - ts.performanceTime) / 1000 - this.songStart;
      }
    }
    return ctx.currentTime - (ctx.outputLatency || ctx.baseLatency || 0) - this.songStart;
  }

  private schedule(): void {
    if (!this.ctx || !this.playing) return;
    const stepDur = BEAT_SEC / 4;
    while (this.nextStepTime < this.ctx.currentTime + 0.12) {
      if (this.step >= SONG_BEATS * 4) {
        this.stopSong();
        return;
      }
      this.playStep(this.step, this.nextStepTime);
      this.nextStepTime += stepDur;
      this.step++;
    }
  }

  private playStep(step: number, t: number): void {
    // ---- Count-in: hats + clicks, snare roll into beat 0 ----
    if (step < 0) {
      const beat = Math.floor(step / 4);
      const inBeat = ((step % 4) + 4) % 4;
      if (inBeat === 0) this.countTick(t, beat >= -3);
      if (inBeat % 2 === 0) this.hat(t, 0.05, false);
      if (beat === -1) this.snare(t, 0.12 + inBeat * 0.07);
      return;
    }

    const bar = Math.floor(step / 16);
    const s = step % 16;
    const chord = bar % 4;

    // ---- Outro: the final ENTER slam rings out ----
    if (step >= OUTRO_STEP) {
      if (step === OUTRO_STEP) {
        this.kick(t);
        this.crash(t);
        this.tone('sine', 90, 30, 1.6, 0.7, this.bgmBus, t);
      }
      if (step % 2 === 0) {
        const fade = 1 - (step - OUTRO_STEP) / 16;
        this.arp(t, ARP_TONES[0][ARP_ORDER[(step / 2) % 8]] * 2, 0.05 * fade);
      }
      return;
    }

    // ---- Main groove ----
    if (s === 0 && bar % 4 === 0) this.crash(t); // ENTER downbeats (beats 16 / 32 / 48)
    if (s % 4 === 0) this.kick(t);
    if (s === 4 || s === 12) this.snare(t, 0.35);
    if (s % 4 === 2) this.hat(t, 0.12, true);
    else this.hat(t, 0.04, false);

    this.bass(t, BASS_ROOTS[chord] * (BASS_OCTAVE[s] ? 2 : 1));
    if (s % 2 === 0) this.arp(t, ARP_TONES[chord][ARP_ORDER[(s / 2) % 8]], 0.07);

    // Snare roll leading into every ENTER downbeat
    if ((bar % 4 === 3 || bar === 14) && s >= 12) this.snare(t, 0.15 + (s - 12) * 0.07);
  }

  // ===================== SYNTH VOICES =====================

  private tone(type: OscillatorType, f0: number, f1: number, dur: number, vol: number, bus: AudioNode | null, when?: number): void {
    if (!this.ctx || !bus) return;
    const t = when ?? this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(bus);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private noise(type: BiquadFilterType, freq: number, dur: number, vol: number, bus: AudioNode | null, when?: number): void {
    if (!this.ctx || !bus || !this.noiseBuffer) return;
    const t = when ?? this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(freq, t);
    filter.Q.value = 1.2;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(bus);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.02);
  }

  private kick(t: number): void {
    this.tone('sine', 150, 42, 0.16, 0.9, this.bgmBus, t);
  }

  private snare(t: number, vol: number): void {
    this.tone('triangle', 230, 110, 0.09, vol * 0.6, this.bgmBus, t);
    this.noise('highpass', 1800, 0.13, vol, this.bgmBus, t);
  }

  private hat(t: number, vol: number, open: boolean): void {
    this.noise('highpass', 7000, open ? 0.09 : 0.03, vol, this.bgmBus, t);
  }

  private crash(t: number): void {
    this.noise('highpass', 4000, 1.1, 0.25, this.bgmBus, t);
  }

  private bass(t: number, freq: number): void {
    if (!this.ctx || !this.bgmBus) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);
    filter.type = 'lowpass';
    filter.Q.value = 6;
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(220, t + 0.12);
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    osc.connect(filter);
    filter.connect(g);
    g.connect(this.bgmBus);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  private arp(t: number, freq: number, vol: number): void {
    this.tone('triangle', freq, freq, 0.12, vol, this.bgmBus, t);
  }

  private countTick(t: number, accent: boolean): void {
    const f = accent ? 1318.5 : 880;
    this.tone('square', f, f, 0.07, accent ? 0.12 : 0.05, this.sfxBus, t);
  }

  // ===================== GAMEPLAY SFX =====================

  /** Burst-zone keystroke: crisp mechanical click */
  public playKey(): void {
    this.noise('bandpass', 1800 + Math.random() * 900, 0.025, 0.14, this.sfxBus);
    this.tone('sine', 1600, 300, 0.03, 0.04, this.sfxBus);
  }

  /** SHIFT / SPACE note hit */
  public playHit(lane: string, judgment: string): void {
    if (lane === 'SHIFT') {
      this.tone('sawtooth', 420, 1500, 0.13, 0.12, this.sfxBus);
      this.noise('highpass', 5000, 0.06, 0.08, this.sfxBus);
    } else {
      this.tone('triangle', 784, 1175, 0.1, 0.22, this.sfxBus);
      this.noise('bandpass', 2600, 0.05, 0.12, this.sfxBus);
    }
    if (judgment === 'PERFECT') this.tone('sine', 2093, 2093, 0.18, 0.07, this.sfxBus);
  }

  /** The big one: ENTER slam = sub boom + power chord */
  public playEnterSlam(perfect: boolean): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.tone('triangle', 170, 32, 0.4, 0.7, this.sfxBus);
    this.noise('lowpass', 1200, 0.3, 0.45, this.sfxBus);
    [523.25, 659.25, 783.99].forEach((f, i) => {
      this.tone('square', f, f, 0.28, perfect ? 0.06 : 0.04, this.sfxBus, now + i * 0.025);
    });
  }

  public playMiss(): void {
    this.tone('sawtooth', 150, 90, 0.22, 0.12, this.sfxBus);
    this.tone('sawtooth', 157, 94, 0.22, 0.12, this.sfxBus);
  }

  /** Special key pressed with nothing to hit */
  public playWrong(): void {
    this.tone('square', 220, 110, 0.12, 0.12, this.sfxBus);
    this.noise('bandpass', 700, 0.08, 0.15, this.sfxBus);
  }

  /** Stray keystroke outside a burst zone */
  public playNoise(): void {
    this.noise('bandpass', 500, 0.07, 0.16, this.sfxBus);
    this.tone('square', 95, 95, 0.06, 0.05, this.sfxBus);
  }

  public playBurstClear(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [784, 988, 1175, 1568].forEach((f, i) => this.tone('triangle', f, f, 0.15, 0.12, this.sfxBus, now + i * 0.05));
  }

  public playBurstFail(): void {
    this.tone('sawtooth', 330, 90, 0.35, 0.12, this.sfxBus);
  }

  public playLogBeep(): void {
    const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
    const f = freqs[Math.floor(Math.random() * freqs.length)];
    this.tone('sine', f, f * 1.2, 0.04, 0.04, this.sfxBus);
  }

  /** Triumphant cyber arpeggio for ACCESS GRANTED */
  public playAccessGranted(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const chord = [261.63, 329.63, 392.0, 493.88, 587.33, 783.99, 1046.5];
    chord.forEach((f, i) => this.tone(i % 2 === 0 ? 'sine' : 'triangle', f, f, 0.9, 0.16, this.sfxBus, now + i * 0.07));
    this.tone('sine', 100, 30, 1.2, 0.4, this.sfxBus);
  }

  // Compatibility and helper SFX methods
  public playCountdownStep(count: number): void {
    this.init();
    if (!this.ctx) return;
    if (count > 0) {
      // 3, 2, 1 countdown beep
      this.tone('square', 880, 880, 0.08, 0.16, this.sfxBus);
    } else {
      // 0 = HACK!!
      this.tone('sawtooth', 523.25, 1046.5, 0.22, 0.25, this.sfxBus);
      this.tone('sine', 1046.5, 2093.0, 0.25, 0.18, this.sfxBus);
    }
  }

  public playKeyClick(isEnter?: boolean): void {
    if (isEnter) {
      this.playEnterSlam(true);
    } else {
      this.playKey();
    }
  }

  public playShiftHit(): void {
    this.playHit('SHIFT', 'PERFECT');
  }

  public playPerfectHit(): void {
    this.playHit('SPACE', 'PERFECT');
  }

  public playGreatHit(): void {
    this.playHit('SPACE', 'GREAT');
  }

  public playMissHit(): void {
    this.playMiss();
  }

  public startBgm(): void {
    this.startSong();
  }

  public stopBgm(): void {
    this.stopSong();
  }

  public playCountdownTick(accent: boolean = false): void {
    if (!this.ctx) return;
    this.countTick(this.ctx.currentTime, accent);
  }

  public playAlarm(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let k = 0; k < 3; k++) {
      this.tone('sawtooth', 880, 440, 0.28, 0.16, this.sfxBus, now + k * 0.3);
    }
    this.tone('sine', 80, 30, 1.0, 0.5, this.sfxBus);
  }
}

export const sound = new SoundManager();
