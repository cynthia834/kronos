/**
 * KRONOS Haptic Audio Engine
 * Procedural Horological Acoustics via Web Audio API.
 * Requires 0 external audio files. Generates microsecond-accurate acoustic detents.
 */

class HapticAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.initialized = true;
      }
    } catch (e) {
      console.warn('Web Audio not supported or blocked', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Subtle mechanical crown ratchet click (micro detent)
   */
  crownClick(pitch = 1.0) {
    if (!this.enabled) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // High frequency acoustic metallic ping
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(3200 * pitch, t);
    osc.frequency.exponentialRampToValueAtTime(800 * pitch, t + 0.015);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.Q.setValueAtTime(4.0, t);

    gain.gain.setValueAtTime(0.045, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.02);
  }

  /**
   * Watch complication switch / mode toggle
   */
  modeShift() {
    if (!this.enabled) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(1900, t + 0.04);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  /**
   * Alias for ceramic detent acoustic pulse
   */
  ceramicDetent() {
    this.modeShift();
  }

  /**
   * Deep titanium case button click
   */
  titaniumActuate() {
    if (!this.enabled) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Sub oscillator for solid mechanical resonance
    const oscLow = this.ctx.createOscillator();
    const gainLow = this.ctx.createGain();
    oscLow.type = 'sine';
    oscLow.frequency.setValueAtTime(180, t);
    oscLow.frequency.exponentialRampToValueAtTime(50, t + 0.04);
    gainLow.gain.setValueAtTime(0.08, t);
    gainLow.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

    // High click for crisp edge
    const oscHigh = this.ctx.createOscillator();
    const gainHigh = this.ctx.createGain();
    oscHigh.type = 'triangle';
    oscHigh.frequency.setValueAtTime(2800, t);
    oscHigh.frequency.exponentialRampToValueAtTime(400, t + 0.02);
    gainHigh.gain.setValueAtTime(0.05, t);
    gainHigh.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);

    oscLow.connect(gainLow);
    gainLow.connect(this.ctx.destination);

    oscHigh.connect(gainHigh);
    gainHigh.connect(this.ctx.destination);

    oscLow.start(t);
    oscHigh.start(t);
    oscLow.stop(t + 0.05);
    oscHigh.stop(t + 0.03);
  }
}

export const haptics = new HapticAudioEngine();
