/* ================================================================
   TATTOOSTUDIO – UTILS
   ================================================================ */

const API_BASE = (['localhost', '127.0.0.1'].includes(location.hostname))
  ? 'http://localhost:3000/api'
  : 'https://tattoostudio-web.onrender.com/api';

const Utils = {
  /* Format price in ARS */
  formatPrice(n) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', maximumFractionDigits: 0
    }).format(n);
  },

  /* Simple debounce */
  debounce(fn, ms = 300) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  },

  /* Clamp */
  clamp(val, min, max) { return Math.max(min, Math.min(max, val)); },

  /* Sanitize HTML to prevent XSS */
  sanitize(str) {
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  },

  /* Toast notifications */
  toast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.className = `toast-item toast-${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.remove(), duration);
  },

  /* Fetch wrapper with error handling */
  async fetchJSON(url, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const token = localStorage.getItem('ts_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
    return data;
  },

  /* Validate email format */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /* Validate required fields on a form */
  validateForm(form) {
    let valid = true;
    form.querySelectorAll('[required]').forEach(el => {
      if (!el.value.trim()) {
        el.classList.add('error');
        valid = false;
      } else {
        el.classList.remove('error');
      }
    });
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput && emailInput.value && !Utils.isValidEmail(emailInput.value)) {
      emailInput.classList.add('error');
      valid = false;
    }
    return valid;
  },

  /* Animate a counter element */
  animateCounter(el, target, duration = 1800) {
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target).toLocaleString('es-AR');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  /* Check if reduced motion is preferred */
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
};

window.Utils = Utils;
window.API_BASE = API_BASE;
