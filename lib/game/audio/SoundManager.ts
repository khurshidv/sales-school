// Singleton sound manager for game audio
// Audio files will be placed in /public/assets/audio/

class SoundManager {
  private static instance: SoundManager | null = null;
  private audioContext: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private muted: boolean = false;
  private bgSource: AudioBufferSourceNode | null = null;
  private bgGain: GainNode | null = null;

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

  // Unlock AudioContext on first user tap
  async unlock(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    // Fire-and-forget warm-up of the most frequently played SFX so the
    // first correct/wrong/choice sound isn't delayed by fetch+decode.
    this.warmupCommon();
  }

  // Preload the small set of SFX that fire on nearly every turn. Runs in
  // parallel; individual failures are silently ignored (matches preload()).
  private warmupCommon(): void {
    const commonSfx = [
      'sfx_choice_select',
      'sfx_correct',
      'sfx_wrong',
      'sfx_combo',
      'sfx_timer_tick',
    ];
    for (const id of commonSfx) {
      // Do not await — let them resolve in the background.
      this.preload(id).catch(() => {});
    }
  }

  // Preload a sound file
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

  // Fire-and-forget play
  play(soundId: string): void {
    if (this.muted || !this.audioContext) return;
    const buffer = this.buffers.get(soundId);
    if (!buffer) return;
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(0);
  }

  // Play background music (loop)
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
      source.stop(0);
    } else {
      const now = this.audioContext.currentTime;
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + fadeMs / 1000);
      source.stop(this.audioContext.currentTime + fadeMs / 1000);
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
