/* ================================================================
   TATTOOSTUDIO – HERO
   • Intro animation (GSAP)
   • Hero content entrance (GSAP)
   • Iconos flotantes: parallax mouse + física de empuje (solo desktop)
   ================================================================ */

(function () {
  'use strict';

  /* ── Detección desktop ────────────────────────────────────────── */
  // Verdadero "tiene mouse de precisión" — tablets y touch quedan fuera
  function isDesktop() {
    return window.innerWidth >= 768 &&
           window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }

  /* ── Intro animation ──────────────────────────────────────────── */
  function runIntro(onComplete) {
    const overlay  = document.getElementById('intro-overlay');
    const logoWrap = overlay?.querySelector('.intro-logo-wrap');
    const ring     = overlay?.querySelector('.intro-ring');
    const divider  = overlay?.querySelector('.intro-divider');

    if (!overlay || !logoWrap) { onComplete?.(); return; }
    if (!window.gsap) { overlay.classList.add('hidden'); onComplete?.(); return; }

    gsap.timeline({
      onComplete: () => { overlay.classList.add('hidden'); onComplete?.(); }
    })
      .to(logoWrap, { opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out' })
      .to(ring,     { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, '-=0.4')
      .to(divider,  { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out'  }, '-=0.4')
      .to(overlay,  { opacity: 0, duration: 0.5, ease: 'power2.in' }, '+=0.5');
  }

  /* ── Hero content entrance ────────────────────────────────────── */
  function animateHeroContent() {
    if (!window.gsap || Utils.prefersReducedMotion()) return;

    gsap.set(
      ['.hero-eyebrow', '.hero-title', '.hero-subtitle', '.hero-ctas', '.scroll-indicator'],
      { opacity: 0, y: 24 }
    );

    gsap.timeline({ delay: 0.15 })
      .to('.hero-eyebrow',     { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
      .to('.hero-title',       { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3')
      .to('.hero-subtitle',    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .to('.hero-ctas',        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
      .to('.scroll-indicator', { opacity: 0.6, y: 0, duration: 0.5 }, '-=0.1');
  }

    /* ================================================================
     ICONOS FLOTANTES — parallax mouse + física de empuje
     El wrapper recibe translate3d combinado:
       parallax (mouse suave) + push (resorte al pasar cerca) + scroll
     En mobile: solo translateY de scroll.
     ================================================================ */
  function initFloatingImages() {
    const wraps = document.querySelectorAll('.hfi-wrap');
    if (!wraps.length || Utils.prefersReducedMotion()) return;

    const hero    = document.querySelector('.hero');
    const desktop = isDesktop();

    /* Config parallax */
    const MOUSE_RANGE = 72; // px máximo de desplazamiento parallax a depth=1

    /* Config push */
    const PUSH_R    = 150;  // px — radio de activación del empuje
    const PUSH_F    = 7;    // fuerza inicial del empuje
    const PUSH_DRAG = 0.88; // amortiguación del spring
    const PUSH_EASE = 0.07; // rigidez de retorno a origen
    const PUSH_RSQ  = PUSH_R * PUSH_R;

    /* Pre-cachear datos de cada icono */
    const items = Array.from(wraps).map(w => ({
      el:      w,
      depth:   parseFloat(w.dataset.depth    || '0.4'),
      scrollS: parseFloat(w.dataset.parallax || '0.12'),
      xPct:    parseFloat(w.style.getPropertyValue('--x'))    || 0,
      yPct:    parseFloat(w.style.getPropertyValue('--y'))    || 0,
      sizePx:  parseFloat(w.style.getPropertyValue('--size')) || 155,
      // Estado del spring de empuje
      pushX: 0, pushY: 0,
      pvx:   0, pvy:   0
    }));

    /* Estado del mouse */
    let tgtNX = 0, tgtNY = 0; // target normalizado (–0.5 … +0.5) para parallax
    let curNX = 0, curNY = 0; // valor interpolado actual
    let mX = -9999, mY = -9999; // posición raw del cursor en px del hero

    if (desktop) {
      hero?.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        mX    = e.clientX - r.left;
        mY    = e.clientY - r.top;
        tgtNX = mX / r.width  - 0.5;
        tgtNY = mY / r.height - 0.5;
      }, { passive: true });

      hero?.addEventListener('mouseleave', () => {
        mX = -9999; mY = -9999;
        tgtNX = 0;  tgtNY = 0;
      });
    }

    let rafId;

    function loop() {
      rafId = requestAnimationFrame(loop);

      const scrollY = window.scrollY;
      const heroW   = hero ? hero.offsetWidth  : window.innerWidth;
      const heroH   = hero ? hero.offsetHeight : window.innerHeight;

      if (desktop) {
        // Lerp suave: 6 % de acercamiento por frame ≈ 1 segundo para llegar al target
        curNX += (tgtNX - curNX) * 0.06;
        curNY += (tgtNY - curNY) * 0.06;
      }

      for (const item of items) {
        const sy = scrollY * item.scrollS;

        if (!desktop) {
          // Mobile: solo scroll
          item.el.style.transform = `translateY(${sy.toFixed(1)}px)`;
          continue;
        }

        /* Parallax con mouse (movimiento opuesto al cursor) */
        const pDX = curNX * item.depth * -MOUSE_RANGE;
        const pDY = curNY * item.depth * -(MOUSE_RANGE * 0.55);

        /* Empuje: calcular distancia del cursor al centro del icono */
        if (mX !== -9999) {
          // Centro del icono en coordenadas del hero, incluyendo el push actual
          const cx  = (item.xPct / 100) * heroW + item.sizePx * 0.5 + item.pushX;
          const cy  = (item.yPct / 100) * heroH + item.sizePx * 0.5 + item.pushY;
          const dx  = cx - mX;
          const dy  = cy - mY;
          const dSq = dx * dx + dy * dy;

          if (dSq < PUSH_RSQ && dSq > 0.01) {
            const d = Math.sqrt(dSq);
            const f = (PUSH_R - d) / PUSH_R * PUSH_F;
            item.pvx += (dx / d) * f;
            item.pvy += (dy / d) * f;
          }
        }

        /* Spring: volver al origen (0, 0) */
        item.pvx += -item.pushX * PUSH_EASE;
        item.pvy += -item.pushY * PUSH_EASE;
        item.pvx *= PUSH_DRAG;
        item.pvy *= PUSH_DRAG;
        item.pushX += item.pvx;
        item.pushY += item.pvy;

        /* Transform final = parallax + empuje + scroll */
        const fX = (pDX + item.pushX).toFixed(1);
        const fY = (pDY + item.pushY + sy).toFixed(1);
        item.el.style.transform = `translate3d(${fX}px, ${fY}px, 0)`;
      }
    }

    rafId = requestAnimationFrame(loop);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(rafId);
      else rafId = requestAnimationFrame(loop);
    });
  }

  /* ── Boot ─────────────────────────────────────────────────────── */
  function boot() {
    initFloatingImages();

    const alreadySeen = sessionStorage.getItem('ts_intro_seen');
    if (alreadySeen) {
      document.getElementById('intro-overlay')?.classList.add('hidden');
      animateHeroContent();
    } else {
      runIntro(() => {
        sessionStorage.setItem('ts_intro_seen', '1');
        animateHeroContent();
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
