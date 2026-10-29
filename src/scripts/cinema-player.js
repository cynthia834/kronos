/**
 * KRONOS // CALIFORNIA
 * Genesis 4K Cinema Player & Horology Dissection Film Controller
 */

import { haptics } from './haptics.js';

export class CinemaPlayer {
  constructor(sectionId = 'genesis-film') {
    this.section = document.getElementById(sectionId);
    if (!this.section) return;

    this.video = document.getElementById('genesis-video');
    this.playBtn = document.getElementById('cinema-play-btn');
    this.playOverlay = document.getElementById('cinema-play-overlay');
    this.muteBtn = document.getElementById('cinema-mute-btn');
    this.scrubber = document.getElementById('cinema-scrubber');
    this.progressFill = document.getElementById('cinema-progress-fill');
    this.currentTimeEl = document.getElementById('cinema-current-time');
    this.durationEl = document.getElementById('cinema-duration');
    this.ambientBtn = document.getElementById('cinema-ambient-btn');
    this.fullscreenBtn = document.getElementById('cinema-fullscreen-btn');
    this.theaterWrapper = document.getElementById('cinema-theater-frame');
    this.chapterBtns = document.querySelectorAll('.cinema-chapter-btn');

    this.isDraggingScrubber = false;

    this.init();
  }

  init() {
    if (!this.video) return;

    // 1. Play / Pause Handlers
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.togglePlay());
    }
    if (this.playOverlay) {
      this.playOverlay.addEventListener('click', () => this.togglePlay());
    }

    // Video click toggles play
    this.video.addEventListener('click', () => this.togglePlay());

    // 2. Video state events
    this.video.addEventListener('play', () => this.updatePlayState(true));
    this.video.addEventListener('pause', () => this.updatePlayState(false));
    this.video.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.video.addEventListener('loadedmetadata', () => this.onMetadataLoaded());

    // 3. Mute / Unmute
    if (this.muteBtn) {
      this.muteBtn.addEventListener('click', () => this.toggleMute());
    }

    // 4. Interactive Timeline Scrubber
    if (this.scrubber) {
      this.scrubber.addEventListener('click', (e) => this.seekToEvent(e));
      this.scrubber.addEventListener('mousedown', () => { this.isDraggingScrubber = true; });
      window.addEventListener('mouseup', () => { this.isDraggingScrubber = false; });
      window.addEventListener('mousemove', (e) => {
        if (this.isDraggingScrubber) this.seekToEvent(e);
      });
    }

    // 5. Chapter Buttons
    this.chapterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const time = parseFloat(btn.dataset.time || 0);
        this.seekTo(time);
        this.video.play().catch(() => {});
        this.setActiveChapter(btn);
        haptics.titaniumActuate();
      });
    });

    // 6. Ambient Cinema Dimmer Mode
    if (this.ambientBtn) {
      this.ambientBtn.addEventListener('click', () => this.toggleAmbientMode());
    }

    // 7. Fullscreen Toggle
    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    // 8. Viewport Intersection Observer (play when entering, pause when out of view)
    this.initIntersectionObserver();

    // 9. Hero "Watch Film" button integration
    const heroFilmBtn = document.getElementById('hero-watch-film-btn');
    if (heroFilmBtn) {
      heroFilmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.section.scrollIntoView({ behavior: 'smooth' });
        this.video.play().catch(() => {});
        haptics.crownClick(1.2);
      });
    }
  }

  togglePlay() {
    haptics.titaniumActuate();
    if (this.video.paused) {
      this.video.play().catch(() => {});
    } else {
      this.video.pause();
    }
  }

  updatePlayState(isPlaying) {
    if (this.playOverlay) {
      this.playOverlay.classList.toggle('playing', isPlaying);
    }
    if (this.playBtn) {
      this.playBtn.innerHTML = isPlaying
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
      this.playBtn.setAttribute('aria-label', isPlaying ? 'Pause Genesis Film' : 'Play Genesis Film');
    }
  }

  toggleMute() {
    this.video.muted = !this.video.muted;
    haptics.ceramicDetent();
    if (this.muteBtn) {
      this.muteBtn.innerHTML = this.video.muted
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
      this.muteBtn.setAttribute('aria-label', this.video.muted ? 'Unmute Audio' : 'Mute Audio');
    }
  }

  onMetadataLoaded() {
    if (this.durationEl && this.video.duration) {
      this.durationEl.textContent = this.formatTime(this.video.duration);
    }
  }

  onTimeUpdate() {
    if (!this.video.duration) return;
    const current = this.video.currentTime;
    const duration = this.video.duration;
    const progressPercent = (current / duration) * 100;

    if (this.progressFill) {
      this.progressFill.style.width = `${progressPercent}%`;
    }

    if (this.currentTimeEl) {
      this.currentTimeEl.textContent = this.formatTime(current);
    }

    // Auto-update active chapter according to current second
    this.updateChapterHighlight(current);
  }

  seekToEvent(e) {
    if (!this.scrubber || !this.video.duration) return;
    const rect = this.scrubber.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    this.video.currentTime = pos * this.video.duration;
    haptics.crownClick(0.8);
  }

  seekTo(seconds) {
    if (this.video) {
      this.video.currentTime = seconds;
    }
  }

  updateChapterHighlight(time) {
    let activeBtn = null;
    this.chapterBtns.forEach((btn) => {
      const btnTime = parseFloat(btn.dataset.time || 0);
      if (time >= btnTime) {
        activeBtn = btn;
      }
    });

    if (activeBtn) {
      this.setActiveChapter(activeBtn);
    }
  }

  setActiveChapter(targetBtn) {
    this.chapterBtns.forEach((btn) => btn.classList.remove('active'));
    targetBtn.classList.add('active');
  }

  toggleAmbientMode() {
    document.body.classList.toggle('cinema-theater-mode');
    const isTheater = document.body.classList.contains('cinema-theater-mode');
    haptics.titaniumActuate();
    if (this.ambientBtn) {
      this.ambientBtn.style.color = isTheater ? 'var(--accent-gold)' : 'var(--text-secondary)';
      this.ambientBtn.title = isTheater ? 'Exit Cinema Theater Dimmer' : 'Enter Cinema Theater Dimmer';
    }
  }

  toggleFullscreen() {
    haptics.ceramicDetent();
    const frame = this.theaterWrapper || this.video;
    if (!document.fullscreenElement) {
      if (frame.requestFullscreen) {
        frame.requestFullscreen().catch(() => {});
      } else if (frame.webkitRequestFullscreen) {
        frame.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  initIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Autoplay when in view
            this.video.play().catch(() => {});
          } else {
            // Pause when out of view to preserve resources
            this.video.pause();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(this.section);
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}
