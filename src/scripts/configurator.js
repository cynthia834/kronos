/**
 * KRONOS 360° Studio & Bespoke Atelier Configurator
 * Manages materials, case metallurgy, strap weaves, dial faces, and live pricing.
 */

import { haptics } from './haptics.js';

export const CONFIG_CATALOG = {
  cases: {
    'raw-titanium': {
      id: 'raw-titanium',
      name: 'Natural Brushed Titanium',
      material: 'Aerospace Grade 5 (Ti-6Al-4V)',
      price: 1850,
      accentHex: '#D4AF37',
      caseBorder: 'linear-gradient(135deg, #E6E6ED 0%, #8C8B96 50%, #E6E6ED 100%)',
      caseShadow: '0 25px 60px rgba(0, 0, 0, 0.75), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
      crownColor: '#E6E6ED',
      badge: 'Signature Standard'
    },
    'space-obsidian': {
      id: 'space-obsidian',
      name: 'Space Obsidian DLC',
      material: 'Diamond-Like Carbon PVD Vapor Coating',
      price: 2050,
      accentHex: '#06B6D4',
      caseBorder: 'linear-gradient(135deg, #32323D 0%, #16161C 50%, #383844 100%)',
      caseShadow: '0 25px 60px rgba(0, 0, 0, 0.9), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
      crownColor: '#282832',
      badge: 'Stealth Vapor'
    },
    'california-gold': {
      id: 'california-gold',
      name: 'California Sunset Gold PVD',
      material: '18K Molecular Titanium-Gold Alloy',
      price: 2300,
      accentHex: '#D4AF37',
      caseBorder: 'linear-gradient(135deg, #F3E5AB 0%, #B8860B 50%, #F5DEB3 100%)',
      caseShadow: '0 25px 60px rgba(212, 175, 55, 0.2), inset 0 2px 4px rgba(255, 248, 220, 0.4)',
      crownColor: '#D4AF37',
      badge: 'Haute Atelier'
    }
  },

  straps: {
    'saddle-leather': {
      id: 'saddle-leather',
      name: 'California Saddle Leather',
      material: 'Vegetable-Tanned Napa Hide, Hand-Burnished in Sonoma',
      price: 150,
      colorHex: '#7C4A27',
      texture: 'linear-gradient(180deg, #6B3E1F 0%, #8E542C 50%, #5E361A 100%)',
      stitch: '#C8A165'
    },
    'milanese-mesh': {
      id: 'milanese-mesh',
      name: 'Titanium Milanese Mesh',
      material: 'Laser-Welded 316-strand Titanium Alloy with Magnetic Clasp',
      price: 250,
      colorHex: '#C5C5CE',
      texture: 'repeating-linear-gradient(45deg, #A8A8B2 0px, #C2C2CC 2px, #8F8F99 4px)',
      stitch: 'transparent'
    },
    'ocean-fluoro': {
      id: 'ocean-fluoro',
      name: 'Deep-Sea Fluoroelastomer',
      material: 'High-Performance Elastomer with Molded Tubular Geometry',
      price: 0,
      colorHex: '#141419',
      texture: 'repeating-linear-gradient(0deg, #181820 0px, #181820 6px, #0D0D12 7px, #0D0D12 12px)',
      stitch: 'transparent'
    },
    'alpine-loop': {
      id: 'alpine-loop',
      name: 'Sierra Alpine Webbing',
      material: 'Continuous High-Tenacity Polyester Weave with Titanium G-Hook',
      price: 120,
      colorHex: '#E06D28',
      texture: 'repeating-linear-gradient(90deg, #C25B1D 0px, #E06D28 4px, #A94A13 8px)',
      stitch: 'transparent'
    }
  },

  dials: {
    'california': {
      id: 'california',
      name: 'California Dial',
      description: 'Iconic Roman & Arabic split typography with lumed triangle apex'
    },
    'chronograph': {
      id: 'chronograph',
      name: 'Sierra Chronograph',
      description: 'Triple-ring tachymeter with 1/100s telemetry register'
    },
    'stealth': {
      id: 'stealth',
      name: 'Obsidian Minimalist',
      description: 'Clean markers with dynamic solar tracking & horizon complications'
    }
  }
};

export class KronosConfigurator {
  constructor(watchDialInstance) {
    this.dial = watchDialInstance;
    this.selectedCase = 'raw-titanium';
    this.selectedStrap = 'ocean-fluoro';
    this.selectedDial = 'california';

    this.dom = {
      priceDisplay: document.getElementById('config-price-display'),
      caseName: document.getElementById('config-case-name'),
      strapName: document.getElementById('config-strap-name'),
      dialName: document.getElementById('config-dial-name'),
      watchChassis: document.getElementById('watch-hardware-chassis'),
      strapTop: document.getElementById('watch-strap-top'),
      strapBottom: document.getElementById('watch-strap-bottom'),
      watchCrown: document.getElementById('watch-crown-hardware'),
      caseOptionBtns: document.querySelectorAll('[data-case-option]'),
      strapOptionBtns: document.querySelectorAll('[data-strap-option]'),
      dialOptionBtns: document.querySelectorAll('[data-dial-option]'),
      orderSummaryCase: document.getElementById('summary-case'),
      orderSummaryStrap: document.getElementById('summary-strap'),
      orderSummaryTotal: document.getElementById('summary-total-price')
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.update();
  }

  bindEvents() {
    // Case Finish Buttons
    this.dom.caseOptionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = btn.dataset.caseOption;
        if (this.selectedCase !== val) {
          this.selectedCase = val;
          haptics.titaniumActuate();
          this.update();
        }
      });
    });

    // Strap Option Buttons
    this.dom.strapOptionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = btn.dataset.strapOption;
        if (this.selectedStrap !== val) {
          this.selectedStrap = val;
          haptics.modeShift();
          this.update();
        }
      });
    });

    // Dial Theme Option Buttons
    this.dom.dialOptionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = btn.dataset.dialOption;
        if (this.selectedDial !== val) {
          this.selectedDial = val;
          haptics.crownClick(1.2);
          this.update();
        }
      });
    });
  }

  calculateTotal() {
    const casePrice = CONFIG_CATALOG.cases[this.selectedCase].price;
    const strapPrice = CONFIG_CATALOG.straps[this.selectedStrap].price;
    return casePrice + strapPrice;
  }

  update() {
    const caseData = CONFIG_CATALOG.cases[this.selectedCase];
    const strapData = CONFIG_CATALOG.straps[this.selectedStrap];
    const dialData = CONFIG_CATALOG.dials[this.selectedDial];
    const total = this.calculateTotal();

    // 1. Update UI Active Classes
    this.dom.caseOptionBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.caseOption === this.selectedCase);
    });
    this.dom.strapOptionBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.strapOption === this.selectedStrap);
    });
    this.dom.dialOptionBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.dialOption === this.selectedDial);
    });

    // 2. Animate Price Counter
    if (this.dom.priceDisplay) {
      this.dom.priceDisplay.textContent = `$${total.toLocaleString()}`;
    }
    if (this.dom.orderSummaryTotal) {
      this.dom.orderSummaryTotal.textContent = `$${total.toLocaleString()}`;
    }

    // 3. Update Text Descriptions
    if (this.dom.caseName) this.dom.caseName.textContent = caseData.name;
    if (this.dom.strapName) this.dom.strapName.textContent = strapData.name;
    if (this.dom.dialName) this.dom.dialName.textContent = dialData.name;

    if (this.dom.orderSummaryCase) this.dom.orderSummaryCase.textContent = `${caseData.name} (${caseData.material})`;
    if (this.dom.orderSummaryStrap) this.dom.orderSummaryStrap.textContent = `${strapData.name} ($${strapData.price})`;

    // 4. Update Physical Watch Frame Elements
    if (this.dom.watchChassis) {
      this.dom.watchChassis.style.background = caseData.caseBorder;
      this.dom.watchChassis.style.boxShadow = caseData.caseShadow;
    }
    if (this.dom.watchCrown) {
      this.dom.watchCrown.style.background = caseData.crownColor;
    }

    if (this.dom.strapTop && this.dom.strapBottom) {
      this.dom.strapTop.style.background = strapData.texture;
      this.dom.strapBottom.style.background = strapData.texture;
    }

    // 5. Update Canvas Watch Dial Theme
    if (this.dial) {
      this.dial.setTheme(this.selectedDial);
      this.dial.setAccentColor(caseData.accentHex);
    }
  }

  getCurrentConfiguration() {
    return {
      case: CONFIG_CATALOG.cases[this.selectedCase],
      strap: CONFIG_CATALOG.straps[this.selectedStrap],
      dial: CONFIG_CATALOG.dials[this.selectedDial],
      total: this.calculateTotal()
    };
  }
}
