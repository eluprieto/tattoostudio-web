/* ================================================================
   TATTOOSTUDIO – SHOP
   Carga productos desde backend o datos de demo si no hay conexión.
   ================================================================ */

(function () {
  'use strict';

  /* ── Demo products (fallback sin backend) ─────────────────────── */
  const DEMO_PRODUCTS = [
    { id: 1,  name: 'Aro Helix Titanio Gold',  category: 'aritos',      bodyPart: 'oreja',   material: 'titanio',    price: 4500,  stock: 12, popular: true,  image: 'https://images.unsplash.com/photo-1658750247169-93e5d71427cb?w=400&h=400&fit=crop&auto=format&q=80', desc: 'Aro de titanio grado implante, color gold PVD. Diámetro 8mm, grosor 1.2mm. Apto para pieles sensibles.' },
    { id: 2,  name: 'Septum Acero Quirúrgico', category: 'piercings',   bodyPart: 'nariz',   material: 'acero',      price: 3800,  stock: 8,  popular: false, image: 'https://images.unsplash.com/photo-1633883270565-29475aae0884?w=400&h=400&fit=crop&auto=format&q=80', desc: 'Clicker de acero quirúrgico 316L. Cierre seguro tipo click. Diámetro interior 8mm.' },
    { id: 3,  name: 'Expansor Negro 10mm',      category: 'expansores',  bodyPart: 'oreja',   material: 'negro',      price: 2900,  stock: 20, popular: false, image: 'https://images.unsplash.com/photo-1677913812488-b7530cfdd7b7?w=400&h=400&fit=crop&auto=format&q=80', desc: 'Par de expansores en acrílico negro. Talla 10mm (00G). Superficie lisa y pulida.' },
    { id: 4,  name: 'Labret Oro 14k',           category: 'piercings',   bodyPart: 'labio',   material: 'oro',        price: 12000, stock: 3,  popular: true,  image: 'https://images.unsplash.com/photo-1680968921717-4abbbe793bb3?w=400&h=400&fit=crop&auto=format&q=80', desc: 'Labret de oro sólido 14 kilates. Rosca interna. Con bola plana de 3mm. Hipoalergénico.' },
    { id: 5,  name: 'Aro Lóbulo Plata',         category: 'aritos',      bodyPart: 'oreja',   material: 'plata',      price: 3200,  stock: 15, popular: false, image: 'https://images.unsplash.com/photo-1677913842001-3941986ca979?w=400&h=400&fit=crop&auto=format&q=80', desc: 'Aro circular en plata 925. Cierre a presión. Diámetro 10mm, grosor 1mm.' },
    { id: 6,  name: 'Ombligo Titanio Rosa',     category: 'piercings',   bodyPart: 'ombligo', material: 'titanio',    price: 5200,  stock: 0,  popular: false, image: 'https://images.unsplash.com/photo-1690992460654-6554121ea730?w=400&h=400&fit=crop&auto=format&q=80', desc: 'Banana bar para ombligo en titanio anodizado rosa. Con cristal Swarovski. Longitud 10mm.' },
    { id: 7,  name: 'Helix Aro Negro',          category: 'aritos',      bodyPart: 'oreja',   material: 'negro',      price: 3600,  stock: 7,  popular: false, image: 'https://images.unsplash.com/photo-1708389828173-5a48bedeb62f?w=400&h=400&fit=crop&auto=format&q=80', desc: 'Aro de acero quirúrgico con PVD negro mate. Diámetro 8mm.' },
    { id: 8,  name: 'Tragus Diamante',          category: 'piercings',   bodyPart: 'oreja',   material: 'titanio',    price: 6800,  stock: 5,  popular: true,  image: 'https://images.unsplash.com/photo-1677913808716-2ad6065e69ee?w=400&h=400&fit=crop&auto=format&q=80', desc: 'Flat back de titanio con piedra CZ brillante para tragus o flat. Longitud 6mm.' },
    { id: 9,  name: 'Retención Nariz',          category: 'retenciones', bodyPart: 'nariz',   material: 'acero',      price: 2200,  stock: 25, popular: false, image: 'https://images.unsplash.com/photo-1482848961846-c15622fd5db2?w=400&h=400&fit=crop&auto=format&q=80', desc: 'Retención de acero quirúrgico para nariz. Ideal para trabajos o espacios formales.' },
    { id: 10, name: 'Aro Ceja Titanio',         category: 'aritos',      bodyPart: 'ceja',    material: 'titanio',    price: 4200,  stock: 6,  popular: false, image: 'https://images.unsplash.com/photo-1677913810512-105327d894d1?w=400&h=400&fit=crop&auto=format&q=80', desc: 'Curved barbell de titanio para ceja. Longitud 10mm, bolas de 3mm.' },
    { id: 11, name: 'Lengua Bola Multicolor',   category: 'piercings',   bodyPart: 'lengua',  material: 'multicolor', price: 2800,  stock: 18, popular: false, image: 'https://images.unsplash.com/photo-1677913808716-2ad6065e69ee?w=400&h=400&fit=crop&auto=format&q=80', desc: 'Barbell para lengua con bolas de colores intercambiables. 14G, longitud 16mm.' },
    { id: 12, name: 'Aro Industrial Acero',     category: 'aritos',      bodyPart: 'oreja',   material: 'acero',      price: 5500,  stock: 4,  popular: true,  image: 'https://images.unsplash.com/photo-1759247943688-5d47a84dd615?w=400&h=400&fit=crop&auto=format&q=80', desc: 'Industrial barbell de acero quirúrgico. Longitud 38mm, diámetro 1.6mm.' },
  ];

  /* ── State ────────────────────────────────────────────────────── */
  let allProducts = [];
  let filters = { search: '', category: '', bodyPart: '', material: '', onlyAvailable: false, sort: 'popular' };

  /* ── Fetch products ───────────────────────────────────────────── */
  async function loadProducts() {
    try {
      const data = await Utils.fetchJSON(`${API_BASE}/products?limit=100`);
      allProducts = data.products || data;
    } catch {
      // Backend not running – use demo data
      allProducts = DEMO_PRODUCTS;
    }
    renderProducts();
  }

  /* ── Apply filters + sort ─────────────────────────────────────── */
  function getFiltered() {
    let list = [...allProducts];

    if (filters.search)       list = list.filter(p => p.name.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.category)     list = list.filter(p => p.category === filters.category);
    if (filters.bodyPart)     list = list.filter(p => p.bodyPart === filters.bodyPart);
    if (filters.material)     list = list.filter(p => p.material === filters.material);
    if (filters.onlyAvailable) list = list.filter(p => p.stock > 0);

    switch (filters.sort) {
      case 'price-asc':  list.sort((a,b) => a.price - b.price); break;
      case 'price-desc': list.sort((a,b) => b.price - a.price); break;
      case 'newest':     list.sort((a,b) => b.id - a.id); break;
      case 'popular':
      default:           list.sort((a,b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }
    return list;
  }

  /* ── Render product grid ──────────────────────────────────────── */
  function renderProducts() {
    const grid  = document.getElementById('products-grid');
    const count = document.getElementById('products-count');
    if (!grid) return;

    const list = getFiltered();
    if (count) count.textContent = `${list.length} producto${list.length !== 1 ? 's' : ''}`;

    if (!list.length) {
      grid.innerHTML = '<p style="color:var(--text-dim);grid-column:1/-1;text-align:center;padding:3rem">No se encontraron productos con esos filtros.</p>';
      return;
    }

    grid.innerHTML = list.map(p => {
      let badgeStock = '';
      if (p.stock === 0)       badgeStock = '<span class="badge badge-out">Sin stock</span>';
      else if (p.stock <= 5)   badgeStock = '<span class="badge badge-low">Últimas unidades</span>';
      else                     badgeStock = '<span class="badge badge-available">Disponible</span>';

      return `
        <article class="product-card" data-id="${p.id}">
          <div class="product-img-wrap">
            <img class="product-img" src="${Utils.sanitize(p.image || '')}" alt="${Utils.sanitize(p.name)}" loading="lazy"
              onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'300\\'%3E%3Crect fill=\\'%23111\\' width=\\'300\\' height=\\'300\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' fill=\\'%233a2f1e\\' font-size=\\'13\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\' font-family=\\'Inter\\'%3EProducto%3C/text%3E%3C/svg%3E'"
            />
            <div class="product-badges">
              ${badgeStock}
              ${p.popular ? '<span class="badge badge-popular">⭐ Top</span>' : ''}
            </div>
          </div>
          <div class="product-body">
            <span class="product-category">${Utils.sanitize(p.category)}</span>
            <h3 class="product-name">${Utils.sanitize(p.name)}</h3>
            <p class="product-material">${Utils.sanitize(p.material || '')}</p>
            <p class="product-price">${Utils.formatPrice(p.price)}</p>
          </div>
          <div class="product-actions">
            <button class="btn-add-cart" data-id="${p.id}" ${p.stock === 0 ? 'disabled' : ''}>
              ${p.stock === 0 ? 'Sin stock' : 'Agregar'}
            </button>
            <button class="btn-view-detail" data-id="${p.id}" aria-label="Ver detalle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </article>
      `;
    }).join('');

    // Add to cart
    grid.querySelectorAll('.btn-add-cart:not(:disabled)').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const product = allProducts.find(p => p.id === parseInt(btn.dataset.id, 10));
        if (product) Cart.add(product);
      });
    });

    // View detail
    grid.querySelectorAll('.btn-view-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openProductModal(parseInt(btn.dataset.id, 10));
      });
    });

    // Card click
    grid.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => openProductModal(parseInt(card.dataset.id, 10)));
    });
  }

  /* ── Product detail modal ─────────────────────────────────────── */
  function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    let modal = document.getElementById('product-modal-backdrop');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'product-modal-backdrop';
      modal.className = 'product-modal-backdrop';
      document.body.appendChild(modal);
    }

    let stockBadge = '';
    if (product.stock === 0)     stockBadge = '<span class="badge badge-out">Sin stock</span>';
    else if (product.stock <= 5) stockBadge = `<span class="badge badge-low">Últimas ${product.stock} unidades</span>`;
    else                         stockBadge = '<span class="badge badge-available">En stock</span>';

    modal.innerHTML = `
      <div class="product-modal" role="document">
        <div class="product-modal-img-wrap">
          <img class="product-modal-img"
            src="${Utils.sanitize(product.image || '')}"
            alt="${Utils.sanitize(product.name)}"
            onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'400\\' height=\\'400\\'%3E%3Crect fill=\\'%23111\\' width=\\'400\\' height=\\'400\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' fill=\\'%233a2f1e\\' font-size=\\'14\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3EProducto%3C/text%3E%3C/svg%3E'"
          />
        </div>
        <div class="product-modal-body">
          <button class="product-modal-close" id="modal-close-btn" aria-label="Cerrar">&times;</button>
          <span class="product-modal-category">${Utils.sanitize(product.category)}</span>
          <h2 class="product-modal-name">${Utils.sanitize(product.name)}</h2>
          <p class="product-modal-price">${Utils.formatPrice(product.price)}</p>
          ${stockBadge}
          <p class="product-modal-desc">${Utils.sanitize(product.desc || '')}</p>
          <div class="product-modal-meta">
            <div><span>Material: </span>${Utils.sanitize(product.material || '–')}</div>
            <div><span>Zona: </span>${Utils.sanitize(product.bodyPart || '–')}</div>
          </div>
          <div class="qty-control" id="modal-qty-control">
            <button class="qty-btn" id="qty-dec" aria-label="Disminuir cantidad">−</button>
            <span class="qty-value" id="qty-val">1</span>
            <button class="qty-btn" id="qty-inc" aria-label="Aumentar cantidad">+</button>
          </div>
          <button class="btn-add-cart btn-full" id="modal-add-btn" style="padding:.85rem" ${product.stock === 0 ? 'disabled' : ''}>
            ${product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    `;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Qty control
    let qty = 1;
    const qtyVal = modal.querySelector('#qty-val');
    modal.querySelector('#qty-dec')?.addEventListener('click', () => { qty = Math.max(1, qty - 1); qtyVal.textContent = qty; });
    modal.querySelector('#qty-inc')?.addEventListener('click', () => { qty = Math.min(product.stock || 99, qty + 1); qtyVal.textContent = qty; });

    modal.querySelector('#modal-add-btn')?.addEventListener('click', () => {
      Cart.add(product, qty);
      closeModal(modal);
    });

    modal.querySelector('#modal-close-btn')?.addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
  }

  function closeModal(modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Filter bindings (shop.html sidebar) ─────────────────────── */
  function initFilters() {
    const searchInput = document.getElementById('filter-search');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce(() => {
        filters.search = searchInput.value;
        renderProducts();
      }, 250));
    }

    const sortSelect = document.getElementById('filter-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        filters.sort = sortSelect.value;
        renderProducts();
      });
    }

    document.querySelectorAll('[data-filter-type]').forEach(cb => {
      cb.addEventListener('change', () => {
        filters[cb.dataset.filterType] = cb.checked ? cb.value : '';
        if (cb.dataset.filterType === 'onlyAvailable') filters.onlyAvailable = cb.checked;
        renderProducts();
      });
    });

    document.getElementById('filter-clear-btn')?.addEventListener('click', () => {
      filters = { search: '', category: '', bodyPart: '', material: '', onlyAvailable: false, sort: 'popular' };
      if (searchInput) searchInput.value = '';
      if (sortSelect)  sortSelect.value = 'popular';
      document.querySelectorAll('[data-filter-type]').forEach(cb => cb.checked = false);
      renderProducts();
    });

    const toggleBtn = document.getElementById('shop-filter-toggle');
    const filterPanel = document.getElementById('shop-filters-panel');
    if (toggleBtn && filterPanel) {
      toggleBtn.addEventListener('click', () => {
        filterPanel.classList.toggle('mobile-open');
        toggleBtn.textContent = filterPanel.classList.contains('mobile-open') ? '✕ Ocultar filtros' : '☰ Filtros';
      });
    }
  }

  /* ── Escape closes any open modal ────────────────────────────── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const m = document.getElementById('product-modal-backdrop');
      if (m?.classList.contains('open')) closeModal(m);
    }
  });

  /* ── Boot ─────────────────────────────────────────────────────── */
  function boot() {
    if (!document.getElementById('products-grid')) return;
    loadProducts();
    initFilters();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
