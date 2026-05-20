/* ================================================================
   TATTOOSTUDIO – GALLERY
   ================================================================ */

(function () {
  'use strict';

  /* Placeholder data – replace with real API call when backend is ready */
  const GALLERY_DATA = [
    { id: 1,  title: 'Mandala Blackwork',      category: 'blackwork',   desc: 'Mandala geométrico en blackwork, antebrazo.',         img: 'https://images.unsplash.com/photo-1564671815737-033b93d141e1?w=600&h=450&fit=crop&auto=format&q=80' },
    { id: 2,  title: 'Rosa Tradicional',       category: 'tradicional', desc: 'Rosa americana en técnica tradicional, hombro.',      img: 'https://images.unsplash.com/photo-1613505879804-bc32efd1e76d?w=600&h=450&fit=crop&auto=format&q=80' },
    { id: 3,  title: 'Manga Completa',         category: 'realismo',    desc: 'Manga completa en realismo detallado, brazo.',        img: 'https://images.unsplash.com/photo-1543244128-30d70d41e2a9?w=600&h=450&fit=crop&auto=format&q=80' },
    { id: 4,  title: 'Floral Color',           category: 'color',       desc: 'Flores multicolor en estilo acuarela, antebrazo.',    img: 'https://images.unsplash.com/photo-1571855618158-f2ea615c339a?w=600&h=450&fit=crop&auto=format&q=80' },
    { id: 5,  title: 'Floral Fine Line',       category: 'minimalista', desc: 'Diseño floral en fine line, antebrazo.',              img: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=600&h=450&fit=crop&auto=format&q=80' },
    { id: 6,  title: 'Helix + Tragus',         category: 'piercings',   desc: 'Oreja con múltiples piercings de titanio gold.',      img: 'https://images.unsplash.com/photo-1658750247169-93e5d71427cb?w=600&h=450&fit=crop&auto=format&q=80' },
    { id: 7,  title: 'Tribal Ala Negra',       category: 'blackwork',   desc: 'Tribal en blackwork puro, brazo.',                    img: 'https://images.unsplash.com/photo-1573842322599-5c284a2860ec?w=600&h=450&fit=crop&auto=format&q=80' },
    { id: 8,  title: 'Dragón Neo-Tradicional', category: 'color',       desc: 'Dragón con paleta neo-tradicional, espalda.',         img: 'https://images.unsplash.com/photo-1582852629325-5744d21d5ae8?w=600&h=450&fit=crop&auto=format&q=80' },
    { id: 9,  title: 'Geometría Sagrada',      category: 'blackwork',   desc: 'Mandala y geometría sagrada en blackwork, esternón.', img: 'https://images.unsplash.com/photo-1566575954819-fbf7d5197f9b?w=600&h=450&fit=crop&auto=format&q=80' },
    { id: 10, title: 'Flores Minimalistas',    category: 'minimalista', desc: 'Conjunto floral en fine line, antebrazo.',            img: 'https://images.unsplash.com/photo-1595246344716-5c9b563f11fe?w=600&h=450&fit=crop&auto=format&q=80' },
    { id: 11, title: 'Lobo Realista',          category: 'realismo',    desc: 'Lobo en realismo detallado, mano.',                   img: 'https://images.unsplash.com/flagged/photo-1577129460771-37654755ecb5?w=600&h=450&fit=crop&auto=format&q=80' },
    { id: 12, title: 'Espalda Tradicional',    category: 'tradicional', desc: 'Tatuaje de espalda completa en tinta negra.',         img: 'https://images.unsplash.com/photo-1619482715414-96fe3ebc4137?w=600&h=450&fit=crop&auto=format&q=80' },
  ];

  const PAGE_SIZE = 8;
  let currentFilter = 'all';
  let visibleCount  = PAGE_SIZE;
  let currentIndex  = 0; // for lightbox navigation
  let filtered      = [...GALLERY_DATA];

  const grid     = document.getElementById('gallery-grid');
  const loadMore = document.getElementById('load-more-btn');
  const lightbox = document.getElementById('lightbox');

  function getFiltered() {
    return currentFilter === 'all'
      ? GALLERY_DATA
      : GALLERY_DATA.filter(i => i.category === currentFilter);
  }

  /* ── Render gallery items ─────────────────────────────────────── */
  function renderItems() {
    if (!grid) return;
    filtered = getFiltered();
    const slice = filtered.slice(0, visibleCount);

    grid.innerHTML = '';
    if (!slice.length) {
      grid.innerHTML = '<p style="color:var(--text-dim);text-align:center;grid-column:1/-1;padding:2rem">No hay trabajos en esta categoría aún.</p>';
      return;
    }

    slice.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = 'gallery-item';
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', `Ver ${Utils.sanitize(item.title)}`);
      el.dataset.index = index;

      el.innerHTML = `
        <img
          src="${Utils.sanitize(item.img)}"
          alt="${Utils.sanitize(item.title)}"
          loading="lazy"
          onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'400\\' height=\\'300\\' viewBox=\\'0 0 400 300\\'%3E%3Crect fill=\\'%23111\\' width=\\'400\\' height=\\'300\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' fill=\\'%233a2f1e\\' font-size=\\'14\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\' font-family=\\'Inter\\'%3E${encodeURIComponent(item.title)}%3C/text%3E%3C/svg%3E'"
        />
        <div class="gallery-overlay">
          <svg class="gallery-overlay-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <p class="gallery-overlay-title">${Utils.sanitize(item.title)}</p>
        </div>
      `;

      const openLightbox = () => openItem(index);
      el.addEventListener('click', openLightbox);
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(); } });

      grid.appendChild(el);
    });

    // Toggle load more button
    if (loadMore) {
      loadMore.style.display = filtered.length > visibleCount ? 'inline-flex' : 'none';
    }
  }

  /* ── Filter buttons ───────────────────────────────────────────── */
  function initFilters() {
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        visibleCount  = PAGE_SIZE;
        renderItems();
      });
    });
  }

  /* ── Load more ────────────────────────────────────────────────── */
  function initLoadMore() {
    if (!loadMore) return;
    loadMore.addEventListener('click', () => {
      visibleCount += PAGE_SIZE;
      renderItems();
    });
  }

  /* ── Lightbox ─────────────────────────────────────────────────── */
  function openItem(index) {
    currentIndex = index;
    const item = filtered[index];
    if (!item || !lightbox) return;

    const img   = document.getElementById('lightbox-img');
    const title = document.getElementById('lightbox-title');
    const desc  = document.getElementById('lightbox-desc');

    if (img)   { img.src = item.img; img.alt = item.title; }
    if (title) title.textContent = item.title;
    if (desc)  desc.textContent  = item.desc;

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function initLightbox() {
    if (!lightbox) return;

    document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
    document.getElementById('lightbox-overlay')?.addEventListener('click', closeLightbox);

    document.getElementById('lightbox-prev')?.addEventListener('click', (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex - 1 + filtered.length) % filtered.length;
      openItem(currentIndex);
    });

    document.getElementById('lightbox-next')?.addEventListener('click', (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex + 1) % filtered.length;
      openItem(currentIndex);
    });

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  { currentIndex = (currentIndex - 1 + filtered.length) % filtered.length; openItem(currentIndex); }
      if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % filtered.length; openItem(currentIndex); }
    });

    // Touch swipe
    let startX = 0;
    lightbox.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend',   e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) { currentIndex = (currentIndex + 1) % filtered.length; }
        else          { currentIndex = (currentIndex - 1 + filtered.length) % filtered.length; }
        openItem(currentIndex);
      }
    });
  }

  /* ── Boot ─────────────────────────────────────────────────────── */
  function boot() {
    if (!grid) return;
    initFilters();
    initLoadMore();
    initLightbox();
    renderItems();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
