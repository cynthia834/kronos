/**
 * KRONOS VIP Concierge & Atelier Pre-Order Modal
 * Handles custom caseback monogram engraving preview, reservation submission, and order confirmation.
 */

import { haptics } from './haptics.js';

export class ConciergeModal {
  constructor(configuratorInstance) {
    this.configurator = configuratorInstance;
    this.modal = document.getElementById('concierge-modal');
    this.openBtns = document.querySelectorAll('[data-open-concierge]');
    this.closeBtns = document.querySelectorAll('[data-close-concierge]');
    this.engraveInput = document.getElementById('engrave-monogram-input');
    this.casebackEngravePreview = document.getElementById('caseback-monogram-text');
    this.form = document.getElementById('concierge-order-form');
    this.orderStateView = document.getElementById('concierge-order-state');
    this.successStateView = document.getElementById('concierge-success-state');

    this.init();
  }

  init() {
    this.bindEvents();
    this.generateSerial();
  }

  generateSerial() {
    const serialEl = document.getElementById('caseback-serial-number');
    if (serialEl) {
      const num = String(Math.floor(Math.random() * 850) + 1).padStart(4, '0');
      serialEl.textContent = `NO. ${num} / 1000`;
    }
  }

  bindEvents() {
    this.openBtns.forEach(btn => {
      btn.addEventListener('click', () => this.open());
    });

    this.closeBtns.forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    // Close on backdrop click
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.close();
      });
    }

    // Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
        this.close();
      }
    });

    // Real-time Monogram Engraving Preview
    if (this.engraveInput && this.casebackEngravePreview) {
      this.engraveInput.addEventListener('input', (e) => {
        const text = e.target.value.toUpperCase().slice(0, 3);
        e.target.value = text;
        this.casebackEngravePreview.textContent = text || 'CAL';
        haptics.crownClick(1.8);
      });
    }

    // Reservation Form Submit
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmission();
      });
    }
  }

  open() {
    if (!this.modal) return;
    haptics.titaniumActuate();
    
    // Sync current configuration into summary
    if (this.configurator) {
      const cfg = this.configurator.getCurrentConfiguration();
      const caseEl = document.getElementById('drawer-summary-case');
      const strapEl = document.getElementById('drawer-summary-strap');
      const dialEl = document.getElementById('drawer-summary-dial');
      const totalEl = document.getElementById('drawer-summary-total');

      if (caseEl) caseEl.textContent = cfg.case.name;
      if (strapEl) strapEl.textContent = cfg.strap.name;
      if (dialEl) dialEl.textContent = cfg.dial.name;
      if (totalEl) totalEl.textContent = `$${cfg.total.toLocaleString()} USD`;
    }

    // Reset view states
    if (this.orderStateView) this.orderStateView.style.display = 'block';
    if (this.successStateView) this.successStateView.style.display = 'none';

    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.modal) return;
    haptics.crownClick(0.8);
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  handleSubmission() {
    haptics.titaniumActuate();
    const submitBtn = this.form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = 'ALLOCATING TIMEPIECE...';
      submitBtn.disabled = true;
    }

    setTimeout(() => {
      if (this.orderStateView) this.orderStateView.style.display = 'none';
      if (this.successStateView) {
        this.successStateView.style.display = 'block';
        haptics.modeShift();
      }
      if (submitBtn) {
        submitBtn.textContent = 'CONFIRM ATELIER RESERVATION';
        submitBtn.disabled = false;
      }
    }, 1200);
  }
}
