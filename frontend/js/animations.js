/* ================================================================
   TATTOOSTUDIO – SCROLL ANIMATIONS
   Uses IntersectionObserver + GSAP if available
   ================================================================ */

(function () {
  'use strict';

  /* ── Reveal on scroll ─────────────────────────────────────────── */
  function initReveal() {
    const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
  }

  /* ── Counter animation ────────────────────────────────────────── */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.dataset.count, 10);
          if (!Utils.prefersReducedMotion()) {
            Utils.animateCounter(entry.target, target);
          } else {
            entry.target.textContent = target.toLocaleString('es-AR');
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  /* ── Navbar scroll effect ─────────────────────────────────────── */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const onScroll = Utils.debounce(() => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, 50);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }

  /* ── GSAP parallax on hero ────────────────────────────────────── */
  function initParallax() {
    if (!window.gsap || !window.ScrollTrigger || Utils.prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.to('.hero-content', {
      y: 80,
      opacity: 0.3,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  /* ── Gallery items staggered entrance ────────────────────────── */
  function initGalleryEntrance() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('loaded');
          }, i * 60);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    const observe = () => {
      grid.querySelectorAll('.gallery-item:not(.loaded)').forEach(el => observer.observe(el));
    };

    observe();
    // Re-observe when new items are added by gallery.js
    const mutObs = new MutationObserver(observe);
    mutObs.observe(grid, { childList: true });
  }

  /* ── Hamburger / drawer ───────────────────────────────────────── */
  function initDrawer() {
    const hamburger = document.getElementById('hamburger');
    const drawer    = document.getElementById('nav-drawer');
    const overlay   = document.getElementById('drawer-overlay');
    const closeBtn  = document.getElementById('drawer-close');
    if (!hamburger || !drawer) return;

    function open() {
      drawer.classList.add('open');
      overlay.classList.add('visible');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      drawer.classList.remove('open');
      overlay.classList.remove('visible');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', close);

    // Close drawer on link click
    drawer.querySelectorAll('.drawer-link').forEach(a => a.addEventListener('click', close));

    // Close on escape
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ── Active nav link on scroll ────────────────────────────────── */
  function initActiveLinks() {
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.nav-link, .drawer-link');
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(l => {
            const href = l.getAttribute('href');
            l.classList.toggle('active', href === `#${entry.target.id}`);
          });
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(s => observer.observe(s));
  }

  /* ── Contact form ─────────────────────────────────────────────── */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!Utils.validateForm(form)) {
        Utils.toast('Por favor completá todos los campos requeridos.', 'error');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const successEl = document.getElementById('form-success');
      btn.textContent = 'Enviando...';
      btn.disabled = true;
      btn.classList.add('btn-loading');

      const data = Object.fromEntries(new FormData(form));

      try {
        await Utils.fetchJSON(`${API_BASE}/contact`, { method: 'POST', body: JSON.stringify(data) });
        if (successEl) successEl.textContent = '¡Mensaje enviado! Te contactaremos pronto.';
        form.reset();
      } catch {
        // Graceful degradation if backend is down
        if (successEl) successEl.textContent = '';
        Utils.toast('No se pudo enviar. Por favor contactanos por WhatsApp.', 'error');
      } finally {
        btn.textContent = 'Enviar mensaje';
        btn.disabled = false;
        btn.classList.remove('btn-loading');
      }
    });

    // Clear error on input
    form.querySelectorAll('input, textarea, select').forEach(el => {
      el.addEventListener('input', () => el.classList.remove('error'));
    });
  }

  /* ── Boot ─────────────────────────────────────────────────────── */
  function boot() {
    initNavbar();
    initReveal();
    initCounters();
    initParallax();
    initGalleryEntrance();
    initDrawer();
    initActiveLinks();
    initContactForm();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
