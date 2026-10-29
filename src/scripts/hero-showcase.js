/**
 * KRONOS // CALIFORNIA
 * Hero Cinematic Environment Controller
 *
 * Smart Assembly & Consistent Watch Controller:
 * - Scrolling DOWN through the site: Consistently shows the completed watch (last frame),
 *   holding steady behind all sections without assembly distraction.
 * - Scrolling BACK UP to the top: Automatically repeats the caliber assembly process from
 *   the beginning, revealing the watch creation afresh.
 * - Sits at the completed watch once assembly finishes.
 * - Mode toggle allows interactive live dial or manual replay anytime.
 */

import { haptics } from './haptics.js';

export class HeroShowcase {
  constructor() {
    this.video           = document.getElementById('hero-cinematic-video');
    this.heroEnv         = document.getElementById('hero-env');
    this.btnShowVideo    = document.getElementById('btn-show-video');
    this.btnShowDial     = document.getElementById('btn-show-dial');
    this.canvasContainer = document.getElementById('hero-canvas-container');

    this._wasScrolledDown   = false;
    this._hasCompletedIntro = false;

    this.init();
  }

  init() {
    if (!this.video) return;

    this.video.muted = true;
    this.video.volume = 0;
    this.video.loop = false;
    this.video.removeAttribute('loop');

    const getMaxDuration = () => Math.max(0, (this.video.duration || 10.006) - 0.08);

    const lockToLastFrame = () => {
      this.video.pause();
      this.video.currentTime = getMaxDuration();
      this._hasCompletedIntro = true;
    };

    // When the assembly reveal finishes naturally:
    this.video.addEventListener('ended', () => {
      lockToLastFrame();
    });

    // Hold final frame right before end boundary
    this.video.addEventListener('timeupdate', () => {
      if (this.video.duration && this.video.currentTime >= getMaxDuration()) {
        lockToLastFrame();
      }
    });

    // Start playing assembly reveal on initial load
    const startInitialAssembly = () => {
      this.video.muted = true;
      this.video.playbackRate = 1.6;

      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      if (scrollY > 80) {
        this._wasScrolledDown = true;
        lockToLastFrame();
      } else {
        this._wasScrolledDown = false;
        this.video.currentTime = 0;
        this.video.play().catch(() => {
          lockToLastFrame();
        });
      }
    };

    if (this.video.readyState >= 2) {
      startInitialAssembly();
    } else {
      this.video.addEventListener('canplay', startInitialAssembly, { once: true });
      this.video.addEventListener('loadedmetadata', startInitialAssembly, { once: true });
    }

    // SCROLL LISTENER:
    // 1. Scrolling DOWN: Lock to completed last-frame watch consistently
    // 2. Scrolling UP to top: Automatically repeat the assembly process from the beginning!
    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

      if (scrollY > 120) {
        // User is scrolled down into page content
        this._wasScrolledDown = true;
        if (!this.video.paused || this.video.currentTime < getMaxDuration() - 0.15) {
          lockToLastFrame();
        }
      } else if (scrollY < 40) {
        // User scrolled all the way back up to the home section!
        if (this._wasScrolledDown) {
          this._wasScrolledDown = false;
          // Repeat the assembly process from the beginning!
          this.replayAssembly();
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mode Toggle:
    if (this.btnShowVideo) {
      this.btnShowVideo.addEventListener('click', () => {
        this.showMode('video');
        haptics.titaniumActuate?.();
        this.replayAssembly();
      });
    }
    if (this.btnShowDial) {
      this.btnShowDial.addEventListener('click', () => {
        this.showMode('dial');
        haptics.titaniumActuate?.();
      });
    }
  }

  replayAssembly() {
    if (!this.video) return;
    this.video.currentTime = 0;
    this.video.playbackRate = 1.6;
    this._hasCompletedIntro = false;
    this.video.play().catch(() => {});
  }

  showMode(mode) {
    if (mode === 'video') {
      if (this.heroEnv) this.heroEnv.style.display = 'block';
      if (this.canvasContainer) {
        this.canvasContainer.style.opacity       = '0';
        this.canvasContainer.style.pointerEvents = 'none';
        setTimeout(() => { this.canvasContainer.style.display = 'none'; }, 350);
      }
      if (this.btnShowVideo) this.btnShowVideo.classList.add('active');
      if (this.btnShowDial)  this.btnShowDial.classList.remove('active');
    } else {
      if (this.canvasContainer) {
        this.canvasContainer.style.display = 'flex';
        requestAnimationFrame(() => {
          this.canvasContainer.style.opacity       = '1';
          this.canvasContainer.style.pointerEvents = 'auto';
        });
      }
      if (this.btnShowVideo) this.btnShowVideo.classList.remove('active');
      if (this.btnShowDial)  this.btnShowDial.classList.add('active');
    }
  }

  destroy() {
    // No-op
  }
}
