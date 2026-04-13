// Singleton sound manager for game audio
// Audio files are in /public/assets/sounds/
//
// iOS Safari constraints addressed here:
// 1. AudioContext must be created+resumed inside a user gesture call stack
// 2. audio.play() must be called inside a user gesture (no async gap)
// 3. createMediaElementSource() is unreliable on iOS — use AudioBuffer only
// 4. First AudioBufferSourceNode.start() must happen in gesture context

// All known SFX IDs — preloaded on first user interaction
const ALL_SFX = [
  'sfx_choice_select',
  'sfx_correct',
  'sfx_wrong',
  'sfx_combo',
  'sfx_timer_tick',
  'sfx_achievement',
  'sfx_life_lost',
  'sfx_life_gain',
  'sfx_fail',
  'sfx_day_complete',
  'sfx_grandmaster',
  'sfx_coin',
];

class SoundManager {
  private static instance: SoundManager | null = null;
  private audioContext: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private muted: boolean = false;
  private bgSource: AudioBufferSourceNode | null = null;
  private bgGain: GainNode | null = null;
  private unlocked: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.muted = localStorage.getItem('sales-school-muted') === '1';
    }
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /** Whether AudioContext has been unlocked by a user gesture. */
  isUnlocked(): boolean {
    return this.unlocked;
  }

  /**
   * Unlock AudioContext on first user tap.
   * MUST be called synchronously from a user gesture handler (click/touchend).
   *
   * iOS Safari requires AudioContext creation AND resume() in the same
   * synchronous call stack as the user gesture. Any async gap (await,
   * setTimeout, Promise.then) breaks it.
   */
  unlock(): void {
    if (this.unlocked) return;

    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    // Resume synchronously — iOS needs this in the gesture call stack
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Play a silent buffer to fully unlock on iOS.
    // Some iOS versions require an actual AudioBufferSourceNode.start()
    // in the gesture stack before they'll allow future play() calls.
    this.playSilent();

    this.unlocked = true;

    // Preload ALL SFX in background (total ~500KB)
    this.warmupAll();
  }

  /** Play a tiny silent buffer — required to unlock iOS audio pipeline. */
  private playSilent(): void {
    if (!this.audioContext) return;
    const buf = this.audioContext.createBuffer(1, 1, this.audioContext.sampleRate);
    const src = this.audioContext.createBufferSource();
    src.buffer = buf;
    src.connect(this.audioContext.destination);
    src.start(0);
  }

  // Preload all SFX in parallel. Runs in background, never blocks.
  private warmupAll(): void {
    for (const id of ALL_SFX) {
      this.preload(id).catch(() => {});
    }
  }

  /**
   * Preload a sound file into an AudioBuffer.
   * Works for both SFX and BGM — all audio uses AudioBufferSourceNode
   * (not <audio> element) for iOS compatibility.
   */
  async preload(soundId: string): Promise<void> {
    if (this.buffers.has(soundId) || !this.audioContext) return;
    try {
      const folder = soundId.startsWith('bgm_') ? 'bgm' : 'sfx';
      const response = await fetch(`/assets/sounds/${folder}/${soundId}.mp3`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.buffers.set(soundId, audioBuffer);
    } catch {
      // Audio file not found — silent fail (files may not exist yet)
    }
  }

  // Fire-and-forget play (SFX only)
  play(soundId: string): void {
    if (this.muted || !this.audioContext) return;
    const buffer = this.buffers.get(soundId);
    if (!buffer) return;
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(0);
  }

  /**
   * Play background music (loop).
   * Uses AudioBufferSourceNode (not <audio>) for iOS compatibility.
   * Buffer must be preloaded first via preload().
   */
  playBgMusic(soundId: string, volume = 0.3): void {
    if (this.muted || !this.audioContext) return;

    // Stop any existing background music immediately
    this.stopBgMusic(0);

    const buffer = this.buffers.get(soundId);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start(0);

    this.bgSource = source;
    this.bgGain = gainNode;
  }

  // Stop background music with fade
  stopBgMusic(fadeMs = 500): void {
    if (!this.bgSource || !this.bgGain || !this.audioContext) return;

    const source = this.bgSource;
    const gain = this.bgGain;

    if (fadeMs <= 0) {
      try { source.stop(0); } catch { /* already stopped */ }
    } else {
      const now = this.audioContext.currentTime;
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + fadeMs / 1000);
      try { source.stop(this.audioContext.currentTime + fadeMs / 1000); } catch { /* already stopped */ }
    }

    this.bgSource = null;
    this.bgGain = null;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) this.stopBgMusic(0);
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sales-school-muted', muted ? '1' : '0');
    }
  }

  isMuted(): boolean {
    return this.muted;
  }
}

export default SoundManager;
