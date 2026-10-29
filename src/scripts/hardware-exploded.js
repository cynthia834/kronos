/**
 * KRONOS Exploded Architecture Dissection
 * Controls interactive 3D layering, perspective disassembly, and layer inspection.
 */

import { haptics } from './haptics.js';

export class HardwareExplodedViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.layers = this.container.querySelectorAll('[data-exploded-layer]');
    this.slider = document.getElementById('exploded-slider');
    this.separationDisplay = document.getElementById('exploded-depth-display');
    this.infoCards = document.querySelectorAll('[data-inspect-card]');
    this.explodeDistance = 0.5; // default 50% exploded

    this.init();
  }

  init() {
    this.bindEvents();
    this.updateExplosion(this.explodeDistance);
  }

  bindEvents() {
    if (this.slider) {
      this.slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100;
        this.explodeDistance = val;
        this.updateExplosion(val);
        // Play subtle ratchet sounds
        if (Math.random() > 0.65) {
          haptics.crownClick(0.9 + val * 0.4);
        }
      });
    }

    // 3D Perspective Tilt on Mouse Movement
    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const tiltX = -y * 24; // degrees
      const tiltY = x * 28; // degrees

      const stage = this.container.querySelector('.exploded-stage-inner');
      if (stage) {
        stage.style.transform = `rotateX(${55 + tiltX}deg) rotateZ(${-30 + tiltY}deg)`;
      }
    });

    this.container.addEventListener('mouseleave', () => {
      const stage = this.container.querySelector('.exploded-stage-inner');
      if (stage) {
        stage.style.transform = `rotateX(55deg) rotateZ(-30deg)`;
      }
    });

    // Layer Hover / Inspect Cards
    this.infoCards.forEach(card => {
      const targetLayerIndex = card.dataset.inspectCard;
      card.addEventListener('mouseenter', () => {
        this.highlightLayer(targetLayerIndex);
        haptics.crownClick(1.5);
      });
      card.addEventListener('mouseleave', () => {
        this.clearHighlight();
      });
    });
  }

  updateExplosion(factor) {
    const maxSpacing = 85; // px per layer tier
    const baseGap = 12;

    this.layers.forEach((layer) => {
      const index = parseInt(layer.dataset.explodedLayer, 10); // 1 to 6
      const zOffset = (6 - index) * (baseGap + factor * maxSpacing);
      const opacity = 0.85 + (1 - factor * 0.15);
      layer.style.transform = `translateZ(${zOffset}px)`;
      layer.style.opacity = opacity;
    });

    if (this.separationDisplay) {
      const mm = (factor * 42.5).toFixed(1);
      this.separationDisplay.textContent = `${mm} mm`;
    }
  }

  highlightLayer(index) {
    this.layers.forEach(layer => {
      if (layer.dataset.explodedLayer === index) {
        layer.classList.add('layer-active');
        layer.style.filter = 'drop-shadow(0 0 24px rgba(212, 175, 55, 0.8)) brightness(1.2)';
      } else {
        layer.classList.remove('layer-active');
        layer.style.filter = 'brightness(0.55) opacity(0.5)';
      }
    });
  }

  clearHighlight() {
    this.layers.forEach(layer => {
      layer.classList.remove('layer-active');
      layer.style.filter = '';
    });
  }
}
