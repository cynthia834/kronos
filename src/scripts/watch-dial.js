/**
 * KRONOS 60fps Mechanical & Solar Watch Canvas Dial Engine
 * High-precision vector rendering with retina DPI scaling and smooth sweeping movement.
 */

export class KronosWatchDial {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.theme = options.theme || 'california'; // 'california', 'chronograph', 'stealth'
    this.accentColor = options.accentColor || '#D4AF37'; // Gold
    this.metalColor = options.metalColor || '#E6E6ED'; // Titanium
    this.isRunning = false;
    this.rafId = null;
    this.size = 360;
    this.dpr = window.devicePixelRatio || 1;
    this.parallaxX = 0;
    this.parallaxY = 0;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.start();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.size = Math.min(rect.width, rect.height) || 360;
    this.canvas.width = this.size * this.dpr;
    this.canvas.height = this.size * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  setTheme(theme) {
    this.theme = theme;
  }

  setAccentColor(color) {
    this.accentColor = color;
  }

  setMetalColor(color) {
    this.metalColor = color;
  }

  setParallax(x, y) {
    this.parallaxX = x * 15;
    this.parallaxY = y * 15;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    const loop = (timestamp) => {
      if (!this.isRunning) return;
      this.render(timestamp);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  getCaliforniaTime() {
    const now = new Date();
    // Convert to California (Pacific Time)
    const ptString = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    const ptDate = new Date(ptString);
    const ms = now.getMilliseconds();
    const seconds = ptDate.getSeconds() + ms / 1000;
    const minutes = ptDate.getMinutes() + seconds / 60;
    const hours = (ptDate.getHours() % 12) + minutes / 60;
    return { hours, minutes, seconds, date: ptDate.getDate(), ptDate };
  }

  render(timestamp) {
    const { ctx, size } = this;
    const center = size / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, size, size);

    // Save initial state
    ctx.save();
    ctx.translate(center, center);

    // 1. Dial Base Gradient (Obsidian Sunburst)
    const baseGrad = ctx.createRadialGradient(
      this.parallaxX, this.parallaxY, 20,
      0, 0, radius
    );
    baseGrad.addColorStop(0, '#131318');
    baseGrad.addColorStop(0.65, '#0A0A0D');
    baseGrad.addColorStop(1, '#050507');

    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Bezel Chapter Ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(0, 0, radius - 16, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Render Hour & Minute Track Indices
    this.renderHourMarkers(radius - 22);

    // 4. Sub-Dials (Horological Complications)
    this.renderSubDials(radius);

    // 5. Inscriptions (California Haute Horlogerie Branding)
    this.renderBranding(radius);

    // 6. Clock Hands
    const time = this.getCaliforniaTime();
    this.renderHands(time, radius);

    // 7. Sapphire Glass Crystal Sheen & Optical Glare
    this.renderSapphireReflection(radius);

    ctx.restore();
  }

  renderHourMarkers(r) {
    const { ctx, theme } = this;

    for (let i = 0; i < 60; i++) {
      const angle = (i * Math.PI) / 30;
      const isMajor = i % 5 === 0;
      const markerLength = isMajor ? 12 : 5;
      const innerR = r - markerLength;

      const x1 = Math.sin(angle) * r;
      const y1 = -Math.cos(angle) * r;
      const x2 = Math.sin(angle) * innerR;
      const y2 = -Math.cos(angle) * innerR;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);

      if (isMajor) {
        ctx.strokeStyle = this.accentColor;
        ctx.lineWidth = 2.2;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1;
      }
      ctx.stroke();
    }

    // Classic California Dial Indices: Roman (10, 11, 1, 2), Arabic (4, 5, 7, 8)
    if (theme === 'california') {
      ctx.font = '600 13px Outfit, sans-serif';
      ctx.fillStyle = '#E8E8EE';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const californiaIndices = [
        { val: 'XII', hour: 12, isRoman: true },
        { val: 'I', hour: 1, isRoman: true },
        { val: 'II', hour: 2, isRoman: true },
        { val: '—', hour: 3, isBar: true },
        { val: '4', hour: 4 },
        { val: '5', hour: 5 },
        { val: 'VI', hour: 6, isRoman: true },
        { val: '7', hour: 7 },
        { val: '8', hour: 8 },
        { val: '—', hour: 9, isBar: true },
        { val: 'X', hour: 10, isRoman: true },
        { val: 'XI', hour: 11, isRoman: true },
      ];

      californiaIndices.forEach((item) => {
        const rad = ((item.hour * 30) * Math.PI) / 180;
        const textRadius = r - 26;
        const x = Math.sin(rad) * textRadius;
        const y = -Math.cos(rad) * textRadius;

        if (item.hour === 12) {
          // Iconic inverted lumed triangle at 12 o'clock
          ctx.fillStyle = this.accentColor;
          ctx.beginPath();
          ctx.moveTo(x, y - 7);
          ctx.lineTo(x - 6, y + 5);
          ctx.lineTo(x + 6, y + 5);
          ctx.closePath();
          ctx.fill();
        } else if (item.isBar) {
          ctx.fillStyle = this.accentColor;
          ctx.fillRect(x - 5, y - 2, 10, 4);
        } else {
          ctx.fillStyle = '#DCDCE6';
          ctx.fillText(item.val, x, y);
        }
      });
    }
  }

  renderSubDials(radius) {
    const { ctx } = this;
    const subRadius = radius * 0.28;

    // Sub-dial 1: California Solar Complication (Top at Y = -radius * 0.42)
    const topY = -radius * 0.40;
    ctx.save();
    ctx.translate(0, topY);

    ctx.beginPath();
    ctx.arc(0, 0, subRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Subtle sun icon
    ctx.fillStyle = this.accentColor;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '700 8px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('SOLAR // 37°N', 0, subRadius - 6);

    ctx.restore();

    // Sub-dial 2: Cardiac Telemetry & Chrono (Bottom at Y = radius * 0.40)
    const botY = radius * 0.40;
    ctx.save();
    ctx.translate(0, botY);

    ctx.beginPath();
    ctx.arc(0, 0, subRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // ECG pulse dot
    const pulseOffset = (Date.now() / 400) % Math.PI;
    const glowRad = 4 + Math.sin(pulseOffset) * 1.5;
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(0, 0, glowRad, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '700 8px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#10B981';
    ctx.fillText('72 BPM', 0, subRadius - 6);

    ctx.restore();
  }

  renderBranding(radius) {
    const { ctx } = this;

    // Brand Name
    ctx.font = '700 12px Outfit, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('K R O N O S', 0, -radius * 0.14);

    // Provenance Line
    ctx.font = '500 8px JetBrains Mono, monospace';
    ctx.fillStyle = this.accentColor;
    ctx.fillText('CALIFORNIA', 0, -radius * 0.07);

    // Depth & Certification
    ctx.font = '500 7px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('GRADE 5 TITANIUM • 100M', 0, radius * 0.17);
  }

  renderHands(time, radius) {
    const { ctx } = this;
    const { hours, minutes, seconds } = time;

    // 1. Hour Hand (Titanium Skeleton with Gold Fill)
    const hourAngle = (hours * 30 * Math.PI) / 180;
    this.drawHand(hourAngle, radius * 0.52, 6.5, '#E8E8EE', '#C4C4D0');

    // 2. Minute Hand (Slender Tapered Titanium Lance)
    const minuteAngle = (minutes * 6 * Math.PI) / 180;
    this.drawHand(minuteAngle, radius * 0.76, 4.5, '#F4F4F8', '#A2A2B0');

    // 3. Sweeping Second Hand (California Golden Lance)
    const secondAngle = (seconds * 6 * Math.PI) / 180;
    ctx.save();
    ctx.rotate(secondAngle);

    ctx.strokeStyle = this.accentColor;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 22); // Counter-balance tail
    ctx.lineTo(0, -radius * 0.88);
    ctx.stroke();

    // Red/Gold tip
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(0, -radius * 0.88, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Counter-weight circle
    ctx.beginPath();
    ctx.arc(0, 14, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = this.accentColor;
    ctx.fill();

    ctx.restore();

    // 4. Center Hand Pinion Cap (Polished Titanium Rosette)
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = '#22222B';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = this.accentColor;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = this.accentColor;
    ctx.fill();
  }

  drawHand(angle, length, width, baseColor, edgeColor) {
    const { ctx } = this;
    ctx.save();
    ctx.rotate(angle);

    // Soft Hand Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.moveTo(-width / 2, 10);
    ctx.lineTo(-width / 2.5, -length + 15);
    ctx.lineTo(0, -length);
    ctx.lineTo(width / 2.5, -length + 15);
    ctx.lineTo(width / 2, 10);
    ctx.closePath();
    ctx.fill();

    // Inner Luminescent Groove
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -length + 16);
    ctx.stroke();

    ctx.restore();
  }

  renderSapphireReflection(radius) {
    const { ctx } = this;
    // Optical double-domed crystal curve sheen
    const grad = ctx.createLinearGradient(
      -radius + this.parallaxX, -radius + this.parallaxY,
      radius + this.parallaxX, radius + this.parallaxY
    );
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.03)');
    grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.05)'); // AR coating blue reflection
    grad.addColorStop(0.75, 'rgba(255, 255, 255, 0.01)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.06)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
