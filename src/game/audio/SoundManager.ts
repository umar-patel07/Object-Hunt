/**
 * Procedural Web Audio Sound Manager for Hide & Seek: Object World
 */
class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isMuted: boolean = false;
  private musicInterval: number | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();

      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.setVolumes(0.8, 0.4);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(sfx: number, music: number) {
    if (!this.sfxGain || !this.musicGain) return;
    this.sfxGain.gain.value = this.isMuted ? 0 : sfx;
    this.musicGain.gain.value = this.isMuted ? 0 : music;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- Sound Effects ---

  public playTransform() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Pop/poof bubble
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);

    // Sparkle chime
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(600, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.2);

    gain2.gain.setValueAtTime(0.2, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.25);
  }

  public playDiscovery() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 triumph!

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const t = now + idx * 0.08;
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  public playIncorrectBuzz() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.setValueAtTime(110, now + 0.1);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playLostChance() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Double dramatic dissonant hit
    [0, 0.12].forEach((offset, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(idx === 0 ? 160 : 120, now + offset);
      osc.frequency.exponentialRampToValueAtTime(80, now + offset + 0.18);

      gain.gain.setValueAtTime(0.35, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + offset);
      osc.stop(now + offset + 0.2);
    });
  }

  public playSeekerEliminated() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Sad descending trombone / fail triad
    [180, 150, 120, 90].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      const t = now + idx * 0.18;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq - 15, t + 0.22);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  public playInspectClick() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playClick() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playFootstep() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playCountdownTick(isFinal: boolean = false) {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isFinal ? 880 : 440, now);

    gain.gain.setValueAtTime(isFinal ? 0.35 : 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.3 : 0.08));

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + (isFinal ? 0.3 : 0.08));
  }

  public playTaunt() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Cheerful whistle slide
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.45);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  public playVictory() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73];

    notes.forEach((f, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f;

      const t = now + idx * 0.12;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.6);
    });
  }

  // Soft rhythmic playful ambient chord progression
  public startAmbientMusic() {
    this.init();
    if (this.musicInterval) return;

    const chords = [
      [261.63, 329.63, 392.00], // C
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
      [196.00, 246.94, 293.66], // G
    ];
    let step = 0;

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      const chord = chords[step % chords.length];
      step++;

      chord.forEach((freq) => {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + 1.8);
      });
    }, 2000);
  }

  public stopAmbientMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundManager = new SoundManager();
