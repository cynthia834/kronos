/**
 * KRONOS WatchOS Interactive Complications Simulator
 * Simulates real-time watchOS micro-apps: Solar Orbit, Live ECG Cardiac, and Mountain Compass.
 */

import { haptics } from './haptics.js';

export class WatchOSSimulator {
  constructor() {
    this.container = document.getElementById('watchos-simulator');
    if (!this.container) return;

    this.activeScreen = 'solar'; // 'solar', 'ecg', 'compass'
    this.screenContainers = this.container.querySelectorAll('[data-os-screen]');
    this.screenNavButtons = document.querySelectorAll('[data-os-nav]');
    this.digitalCrown = document.getElementById('sim-digital-crown');
    this.ecgCanvas = document.getElementById('ecg-waveform-canvas');
    this.compassDial = document.getElementById('compass-rotating-ring');

    this.ecgCtx = this.ecgCanvas ? this.ecgCanvas.getContext('2d') : null;
    this.ecgPoints = [];
    this.ecgIndex = 0;
    this.animId = null;

    this.init();
  }

  init() {
    this.bindEvents();
    this.initECG();
    this.updateScreen(this.activeScreen);
    this.startClockTicker();
  }

  bindEvents() {
    this.screenNavButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const screen = btn.dataset.osNav;
        if (this.activeScreen !== screen) {
          this.activeScreen = screen;
          haptics.modeShift();
          this.updateScreen(screen);
        }
      });
    });

    // Digital Crown interactive rotation
    if (this.digitalCrown) {
      let isDragging = false;
      let startY = 0;
      let currentRot = 0;

      const onStart = (clientY) => {
        isDragging = true;
        startY = clientY;
      };

      const onMove = (clientY) => {
        if (!isDragging) return;
        const delta = clientY - startY;
        if (Math.abs(delta) > 8) {
          currentRot += delta > 0 ? 15 : -15;
          this.digitalCrown.style.transform = `rotate(${currentRot}deg)`;
          haptics.crownClick(1.0 + (Math.abs(currentRot % 360) / 360) * 0.5);
          startY = clientY;

          // Scroll next screen on crown spin
          if (delta > 30) this.cycleScreen(1);
          else if (delta < -30) this.cycleScreen(-1);
        }
      };

      const onEnd = () => { isDragging = false; };

      this.digitalCrown.addEventListener('mousedown', (e) => onStart(e.clientY));
      window.addEventListener('mousemove', (e) => onMove(e.clientY));
      window.addEventListener('mouseup', onEnd);

      this.digitalCrown.addEventListener('touchstart', (e) => onStart(e.touches[0].clientY), { passive: true });
      window.addEventListener('touchmove', (e) => onMove(e.touches[0].clientY), { passive: true });
      window.addEventListener('touchend', onEnd);
    }
  }

  cycleScreen(dir) {
    const screens = ['solar', 'ecg', 'compass'];
    let idx = screens.indexOf(this.activeScreen);
    idx = (idx + dir + screens.length) % screens.length;
    this.activeScreen = screens[idx];
    this.updateScreen(this.activeScreen);
  }

  updateScreen(screenName) {
    this.screenContainers.forEach(sc => {
      sc.classList.toggle('active', sc.dataset.osScreen === screenName);
    });
    this.screenNavButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.osNav === screenName);
    });
  }

  initECG() {
    if (!this.ecgCanvas || !this.ecgCtx) return;

    // High resolution setup
    const rect = this.ecgCanvas.getBoundingClientRect();
    const w = rect.width || 240;
    const h = rect.height || 90;
    this.ecgCanvas.width = w * 2;
    this.ecgCanvas.height = h * 2;
    this.ecgCtx.scale(2, 2);

    const length = 120;
    this.ecgPoints = new Array(length).fill(h / 2);

    const drawECG = () => {
      if (this.activeScreen === 'ecg') {
        const nextVal = this.generateECGValue(this.ecgIndex++, h);
        this.ecgPoints.push(nextVal);
        if (this.ecgPoints.length > length) this.ecgPoints.shift();

        this.renderECG(w, h);
      }
      this.animId = requestAnimationFrame(drawECG);
    };

    drawECG();
  }

  generateECGValue(step, height) {
    const base = height / 2;
    const phase = step % 45;

    // Standard P-Q-R-S-T cardiac cycle waveform
    if (phase === 8) return base - 6;      // P wave
    if (phase === 9) return base - 10;
    if (phase === 10) return base - 4;
    if (phase === 15) return base + 8;     // Q drop
    if (phase === 17) return base - 38;    // R peak (tall spike)
    if (phase === 19) return base + 18;    // S dip
    if (phase === 21) return base;         // ST segment
    if (phase === 28) return base - 14;    // T wave
    if (phase === 30) return base - 12;
    if (phase === 32) return base;

    return base + (Math.random() - 0.5) * 1.5; // subtle physiological noise
  }

  renderECG(w, h) {
    const ctx = this.ecgCtx;
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Glowing cardiac path
    ctx.beginPath();
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
    ctx.shadowBlur = 8;

    const stepX = w / (this.ecgPoints.length - 1);
    this.ecgPoints.forEach((pt, i) => {
      const x = i * stepX;
      if (i === 0) ctx.moveTo(x, pt);
      else ctx.lineTo(x, pt);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  startClockTicker() {
    const timeEls = document.querySelectorAll('[data-live-california-time]');
    const updateTime = () => {
      const now = new Date();
      const ptString = now.toLocaleTimeString('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      timeEls.forEach(el => { el.textContent = ptString; });
    };
    updateTime();
    setInterval(updateTime, 1000);
  }
}
