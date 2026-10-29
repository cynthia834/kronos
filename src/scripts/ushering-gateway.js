/**
 * KRONOS // CALIFORNIA
 * VIP Client Authentication & Full-Screen Cinematic Ushering Gateway
 * Replaces standard video players with a seamless, immersive entrance ushering.
 */

import { haptics } from './haptics.js';

export class UsheringGateway {
  constructor() {
    this.loginModal = document.getElementById('vip-login-modal');
    this.loginForm = document.getElementById('vip-login-form');
    this.passkeyInput = document.getElementById('vip-passkey-input');
    this.portal = document.getElementById('ushering-portal');
    this.video = document.getElementById('ushering-video');
    this.progressBar = document.getElementById('ushering-progress-bar');
    this.skipBtn = document.getElementById('ushering-skip-btn');
    this.stageCard = document.getElementById('ushering-center-stage');
    this.eyebrowEl = document.getElementById('ushering-eyebrow');
    this.titleEl = document.getElementById('ushering-title');
    this.subtitleEl = document.getElementById('ushering-subtitle');
    this.vipNavBtn = document.getElementById('nav-vip-status-btn');

    this.currentPhase = -1;
    this.isUshering = false;

    // Horological phase definitions synchronized with the video
    this.phases = [
      {
        start: 0.0,
        eyebrow: 'PHASE 01 // DISASSEMBLY MATRIX',
        title: 'Aerospace Dissection',
        subtitle: 'Deconstructing the 6 optical layers and K1 neural silicon.'
      },
      {
        start: 2.8,
        eyebrow: 'PHASE 02 // MECHANICAL CALIBER',
        title: 'Swiss Gearing Convergence',
        subtitle: 'High-beat mechanical balance wheel integrated with atomic telemetry.'
      },
      {
        start: 5.2,
        eyebrow: 'PHASE 03 // METALLURGY',
        title: 'Grade 5 Titanium Hermetic Seal',
        subtitle: 'Ti-6Al-4V monobloc housing pressurized to 100M ISO rating.'
      },
      {
        start: 7.2,
        eyebrow: 'PHASE 04 // AUTHENTICATION COMPLETE',
        title: 'Welcome to KRONOS California',
        subtitle: 'Your VIP atelier allocation is confirmed. Ushering into showroom...'
      }
    ];

    this.init();
  }

  init() {
    // 1. Triggers to Open Login Modal
    document.querySelectorAll('[data-open-vip-login]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openLoginModal();
      });
    });

    // 2. Close Login Modal
    document.querySelectorAll('[data-close-vip-login]').forEach((btn) => {
      btn.addEventListener('click', () => this.closeLoginModal());
    });

    // 3. Login Form Submit -> Commences Ushering
    if (this.loginForm) {
      this.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.startUshering();
      });
    }

    // 4. Biometric 1-Click Authenticate Button
    const biometricBtn = document.getElementById('vip-biometric-btn');
    if (biometricBtn) {
      biometricBtn.addEventListener('click', () => {
        if (this.passkeyInput) this.passkeyInput.value = 'CAL-2026-VIP-TOUCH';
        haptics.titaniumActuate();
        setTimeout(() => this.startUshering(), 250);
      });
    }

    // 5. Video Progress & Synchronization
    if (this.video) {
      this.video.addEventListener('timeupdate', () => this.onTimeUpdate());
      this.video.addEventListener('ended', () => this.completeUshering());
    }

    // 6. Skip / Enter Now
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => this.completeUshering());
    }

    // 7. ESC key to skip
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isUshering) {
          this.completeUshering();
        } else if (this.loginModal && this.loginModal.classList.contains('active')) {
          this.closeLoginModal();
        }
      }
    });

    // 8. Replay Ushering via Nav button if already authenticated
    if (this.vipNavBtn) {
      this.vipNavBtn.addEventListener('click', () => {
        this.startUshering();
      });
    }
  }

  openLoginModal() {
    haptics.modeShift();
    if (this.loginModal) {
      this.loginModal.classList.add('active');
      if (this.passkeyInput) this.passkeyInput.focus();
    }
  }

  closeLoginModal() {
    haptics.crownClick(0.8);
    if (this.loginModal) {
      this.loginModal.classList.remove('active');
    }
  }

  startUshering() {
    this.closeLoginModal();
    this.isUshering = true;
    this.currentPhase = -1;

    haptics.titaniumActuate();

    if (this.portal && this.video) {
      this.portal.classList.remove('dissolving');
      this.portal.classList.add('active');

      this.video.currentTime = 0;
      this.video.muted = false; // Attempt unmute on user interaction

      const playPromise = this.video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback to muted if browser policy requires it
          this.video.muted = true;
          this.video.play().catch(() => {});
        });
      }

      this.setPhase(0);
    }
  }

  onTimeUpdate() {
    if (!this.video || !this.video.duration) return;
    const current = this.video.currentTime;
    const duration = this.video.duration;

    // Update bottom progress line
    if (this.progressBar) {
      const pct = (current / duration) * 100;
      this.progressBar.style.width = `${pct}%`;
    }

    // Determine current phase
    let targetPhase = 0;
    for (let i = this.phases.length - 1; i >= 0; i--) {
      if (current >= this.phases[i].start) {
        targetPhase = i;
        break;
      }
    }

    if (targetPhase !== this.currentPhase) {
      this.setPhase(targetPhase);
    }
  }

  setPhase(index) {
    this.currentPhase = index;
    const phase = this.phases[index];
    if (!phase) return;

    haptics.crownClick(1.1);

    if (this.stageCard) {
      this.stageCard.classList.remove('ushering-phase-active');
      setTimeout(() => {
        if (this.eyebrowEl) this.eyebrowEl.textContent = phase.eyebrow;
        if (this.titleEl) this.titleEl.textContent = phase.title;
        if (this.subtitleEl) this.subtitleEl.textContent = phase.subtitle;
        this.stageCard.classList.add('ushering-phase-active');
      }, 150);
    }
  }

  completeUshering() {
    if (!this.isUshering) return;
    this.isUshering = false;

    haptics.titaniumActuate();
    if (this.video) {
      this.video.pause();
    }

    if (this.portal) {
      this.portal.classList.add('dissolving');
      setTimeout(() => {
        this.portal.classList.remove('active');
        this.portal.classList.remove('dissolving');
      }, 850);
    }

    // Update VIP status badge in Nav
    if (this.vipNavBtn) {
      this.vipNavBtn.innerHTML = `
        <span class="pulse-dot" style="background: #10B981; box-shadow: 0 0 8px #10B981;"></span>
        <span>VIP ATELIER ACCESS • REPLAY</span>
      `;
      this.vipNavBtn.title = 'Click to replay the cinematic entrance ushering';
    }

    // Smoothly focus on Hero
    const hero = document.getElementById('hero');
    if (hero) {
      hero.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
