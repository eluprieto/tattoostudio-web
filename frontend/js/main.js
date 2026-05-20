/* ================================================================
   TATTOOSTUDIO – MAIN BOOT
   Entry point que inicializa todo lo que no es lazy-loaded.
   ================================================================ */

(function () {
  'use strict';

  /* ── Smooth scroll para links internos ─────────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const navH = document.getElementById('navbar')?.offsetHeight || 70;
        const top  = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ── Actualizar año del copyright ─────────────────────────────── */
  function updateYear() {
    document.querySelectorAll('[data-year]').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ── Lazy-load imágenes fuera de viewport ─────────────────────── */
  function initLazyImages() {
    if (!('IntersectionObserver' in window)) return;
    const imgs = document.querySelectorAll('img[data-src]');
    if (!imgs.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    imgs.forEach(img => observer.observe(img));
  }

  /* ── Fetch shipping config desde backend (si está corriendo) ──── */
  async function fetchShippingConfig() {
    try {
      const data = await Utils.fetchJSON(`${API_BASE}/config/shipping`);
      if (data.shippingCost)   localStorage.setItem('ts_shipping_cost',   data.shippingCost);
      if (data.freeShippingFrom) localStorage.setItem('ts_free_shipping', data.freeShippingFrom);
    } catch {
      // Backend no está levantado – usamos defaults del .env
    }
  }

  /* ── Back to top button ───────────────────────────────────────── */
  function initBackToTop() {
    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.setAttribute('aria-label', 'Volver arriba');
    btn.innerHTML = '↑';
    btn.style.cssText = `
      position:fixed; bottom:5rem; right:1.5rem; z-index:900;
      width:40px; height:40px; border-radius:50%;
      background:var(--bg-card); border:1px solid var(--border);
      color:var(--text-muted); font-size:1.1rem;
      display:none; align-items:center; justify-content:center;
      cursor:pointer; transition:color .3s,border-color .3s,opacity .3s;
    `;
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    btn.addEventListener('mouseenter', () => { btn.style.color = 'var(--gold)'; btn.style.borderColor = 'var(--gold)'; });
    btn.addEventListener('mouseleave', () => { btn.style.color = 'var(--text-muted)'; btn.style.borderColor = 'var(--border)'; });
    document.body.appendChild(btn);

    window.addEventListener('scroll', Utils.debounce(() => {
      btn.style.display = window.scrollY > 400 ? 'flex' : 'none';
    }, 100), { passive: true });
  }

  /* ── Boot ─────────────────────────────────────────────────────── */
  function boot() {
    initSmoothScroll();
    updateYear();
    initLazyImages();
    initBackToTop();
    fetchShippingConfig();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
