/**
 * KRONOS // CALIFORNIA
 * Master Application Entrypoint
 */

import { KronosWatchDial } from './scripts/watch-dial.js';
import { KronosConfigurator } from './scripts/configurator.js';
import { HardwareExplodedViewer } from './scripts/hardware-exploded.js';
import { WatchOSSimulator } from './scripts/watchos-simulator.js';
import { ConciergeModal } from './scripts/concierge-modal.js';
import { UsheringGateway } from './scripts/ushering-gateway.js';
import { HeroShowcase } from './scripts/hero-showcase.js';
import { haptics } from './scripts/haptics.js';

document.addEventListener('DOMContentLoaded', () => {
  // 0. Initialize Hero Showcase (Autoplays 4K video immediately on load)
  const heroShowcase = new HeroShowcase();

  // 1. Initialize Hero 60fps Canvas Watch
  const heroCanvas = document.getElementById('hero-watch-canvas');
  let watchDial = null;
  if (heroCanvas) {
    watchDial = new KronosWatchDial(heroCanvas, {
      theme: 'california',
      accentColor: '#D4AF37',
      metalColor: '#E6E6ED'
    });

    // Parallax interactive lighting on mouse move
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / rect.width - 0.5;
        const normY = (e.clientY - rect.top) / rect.height - 0.5;
        watchDial.setParallax(normX, normY);
      });
      heroSection.addEventListener('mouseleave', () => {
        watchDial.setParallax(0, 0);
      });
    }
  }

  // 2. Initialize 360° Studio Configurator
  const configurator = new KronosConfigurator(watchDial);

  // 3. Initialize Exploded Hardware Dissection Stage
  const explodedViewer = new HardwareExplodedViewer('exploded-hardware-stage');

  // 4. Initialize Living WatchOS Touch Simulator
  const watchOS = new WatchOSSimulator();

  // 5. Initialize Concierge Reservation Drawer & Monogram Engraving
  const concierge = new ConciergeModal(configurator);

  // 6. Initialize VIP Client Login & Cinematic Ushering Gateway
  const ushering = new UsheringGateway();

  // 7. Audio Haptic Feedback Toggle
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioStatusText = document.getElementById('audio-status-label');
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      const isEnabled = haptics.toggleSound();
      if (audioStatusText) {
        audioStatusText.textContent = isEnabled ? 'SOUND: ON' : 'SOUND: OFF';
      }
      audioToggleBtn.style.opacity = isEnabled ? '1' : '0.5';
      if (isEnabled) haptics.crownClick(1.2);
    });
  }

  // 7. Interactive Digital Crown click on hero watch
  const crownEl = document.getElementById('watch-crown-hardware');
  if (crownEl) {
    crownEl.addEventListener('click', () => {
      haptics.crownClick(1.4);
      crownEl.style.transform = 'translateY(-50%) scale(0.96)';
      setTimeout(() => {
        crownEl.style.transform = 'translateY(-50%)';
      }, 150);
    });
  }

  // 8. Interactive Bezel tactile rotation on click
  const watchChassis = document.getElementById('watch-hardware-chassis');
  if (watchChassis) {
    watchChassis.addEventListener('click', () => {
      haptics.titaniumActuate();
    });
  }

  console.log('⚡ KRONOS // CALIFORNIA luxury experience initialized successfully.');
});
