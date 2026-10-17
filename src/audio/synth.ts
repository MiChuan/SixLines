export class RitualAudio {
  private ctx: AudioContext | null = null;
  muted = false;

  unlock(): void {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    gain = 0.08,
    delay = 0,
  ): void {
    if (this.muted || !this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  private noise(dur: number, gain = 0.04, delay = 0): void {
    if (this.muted || !this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const n = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    g.gain.value = gain;
    src.connect(filter);
    filter.connect(g);
    g.connect(this.ctx.destination);
    src.start(t0);
  }

  playCoinDrop(index: number): void {
    this.tone(880 - index * 60, 0.18, 'triangle', 0.07, index * 0.14);
    this.tone(220, 0.25, 'sine', 0.04, index * 0.14 + 0.05);
  }

  playShake(): void {
    this.noise(0.9, 0.035);
    this.tone(90, 1.0, 'sine', 0.03);
  }

  playLand(index: number): void {
    this.tone(520 + index * 40, 0.12, 'square', 0.05, index * 0.08);
    this.tone(180, 0.2, 'triangle', 0.04, index * 0.08 + 0.04);
  }

  playBell(): void {
    this.tone(220, 1.6, 'sine', 0.1);
    this.tone(330, 1.4, 'sine', 0.06, 0.02);
    this.tone(440, 1.2, 'triangle', 0.04, 0.05);
  }
}
