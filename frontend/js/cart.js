/* ================================================================
   TATTOOSTUDIO – CART
   Persiste en localStorage. Emite evento 'cart:updated' al cambiar.
   ================================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'ts_cart';

  /* ── State ────────────────────────────────────────────────────── */
  let items = loadCart();

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: { items } }));
  }

  /* ── Public API ───────────────────────────────────────────────── */
  const Cart = {
    getItems() { return [...items]; },

    getCount() { return items.reduce((acc, i) => acc + i.qty, 0); },

    getTotal() { return items.reduce((acc, i) => acc + i.price * i.qty, 0); },

    add(product, qty = 1) {
      const existing = items.find(i => i.id === product.id);
      if (existing) {
        existing.qty = Math.min(existing.qty + qty, product.stock || 99);
      } else {
        items.push({ ...product, qty: Math.min(qty, product.stock || 99) });
      }
      saveCart();
      Utils.toast(`${product.name} agregado al carrito`, 'success');
    },

    remove(productId) {
      items = items.filter(i => i.id !== productId);
      saveCart();
    },

    updateQty(productId, qty) {
      const item = items.find(i => i.id === productId);
      if (!item) return;
      if (qty <= 0) { this.remove(productId); return; }
      item.qty = Math.min(qty, item.stock || 99);
      saveCart();
    },

    clear() { items = []; saveCart(); },

    isEmpty() { return items.length === 0; }
  };

  window.Cart = Cart;

  /* ── Cart sidebar UI ──────────────────────────────────────────── */
  function buildSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'cart-sidebar';
    sidebar.className = 'cart-sidebar';
    sidebar.setAttribute('role', 'dialog');
    sidebar.setAttribute('aria-label', 'Carrito de compras');
    sidebar.innerHTML = `
      <div class="cart-header">
        <h3>Tu carrito</h3>
        <button class="cart-close" id="cart-close-btn" aria-label="Cerrar carrito">&times;</button>
      </div>
      <div class="cart-items" id="cart-items-list"></div>
      <div class="cart-footer" id="cart-footer"></div>
    `;

    const backdrop = document.createElement('div');
    backdrop.id = 'cart-backdrop';
    backdrop.className = 'cart-backdrop';

    document.body.appendChild(backdrop);
    document.body.appendChild(sidebar);

    // Open/close bindings
    document.getElementById('cart-close-btn')?.addEventListener('click', closeCart);
    backdrop.addEventListener('click', closeCart);
    document.querySelectorAll('#cart-icon-btn').forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    }));

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) closeCart();
    });
  }

  function openCart() {
    document.getElementById('cart-sidebar')?.classList.add('open');
    document.getElementById('cart-backdrop')?.classList.add('visible');
    document.body.style.overflow = 'hidden';
    renderSidebar();
  }

  function closeCart() {
    document.getElementById('cart-sidebar')?.classList.remove('open');
    document.getElementById('cart-backdrop')?.classList.remove('visible');
    document.body.style.overflow = '';
  }

  function renderSidebar() {
    const listEl   = document.getElementById('cart-items-list');
    const footerEl = document.getElementById('cart-footer');
    if (!listEl || !footerEl) return;

    if (Cart.isEmpty()) {
      listEl.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <p>Tu carrito está vacío.<br/>Explorá la tienda.</p>
          <a href="shop.html" class="btn-outline-gold btn-sm" style="margin-top:.5rem">Ver tienda</a>
        </div>
      `;
      footerEl.innerHTML = '';
      return;
    }

    listEl.innerHTML = Cart.getItems().map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img class="cart-item-img"
          src="${Utils.sanitize(item.image || '')}"
          alt="${Utils.sanitize(item.name)}"
          onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'70\\' height=\\'70\\'%3E%3Crect fill=\\'%23111\\' width=\\'70\\' height=\\'70\\'/%3E%3C/svg%3E'"
        />
        <div class="cart-item-info">
          <p class="cart-item-name">${Utils.sanitize(item.name)}</p>
          <p class="cart-item-price">${Utils.formatPrice(item.price)}</p>
          <div class="cart-item-controls">
            <button class="cart-item-qty-btn" data-action="dec" data-id="${item.id}" aria-label="Disminuir">−</button>
            <span class="cart-item-qty">${item.qty}</span>
            <button class="cart-item-qty-btn" data-action="inc" data-id="${item.id}" aria-label="Aumentar">+</button>
          </div>
        </div>
        <button class="cart-item-remove" data-id="${item.id}" aria-label="Eliminar ${Utils.sanitize(item.name)}">✕</button>
      </div>
    `).join('');

    // Qty / remove event delegation
    listEl.querySelectorAll('.cart-item-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id  = parseInt(btn.dataset.id, 10);
        const cur = Cart.getItems().find(i => i.id === id)?.qty || 0;
        Cart.updateQty(id, btn.dataset.action === 'inc' ? cur + 1 : cur - 1);
        renderSidebar();
        updateBadge();
      });
    });
    listEl.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        Cart.remove(parseInt(btn.dataset.id, 10));
        renderSidebar();
        updateBadge();
      });
    });

    const shipping = parseInt(localStorage.getItem('ts_shipping_cost') || '1500', 10);
    const subtotal = Cart.getTotal();
    const freeFrom = parseInt(localStorage.getItem('ts_free_shipping') || '15000', 10);
    const shippingCost = subtotal >= freeFrom ? 0 : shipping;

    footerEl.innerHTML = `
      <div class="cart-summary">
        <div class="cart-summary-row"><span>Subtotal</span><span>${Utils.formatPrice(subtotal)}</span></div>
        <div class="cart-summary-row">
          <span>Envío</span>
          <span>${shippingCost === 0 ? '<span style="color:#4ade80">Gratis</span>' : Utils.formatPrice(shippingCost)}</span>
        </div>
        <div class="cart-summary-row total"><span>Total</span><span>${Utils.formatPrice(subtotal + shippingCost)}</span></div>
      </div>
      <a href="${window.location.pathname.includes('/pages/') ? '' : 'pages/'}checkout.html" class="btn-gold btn-full" style="margin-top:.5rem">Finalizar compra</a>
      <button id="cart-clear-btn" class="filter-clear" style="margin-top:.5rem">Vaciar carrito</button>
    `;

    document.getElementById('cart-clear-btn')?.addEventListener('click', () => {
      if (confirm('¿Vaciar el carrito?')) { Cart.clear(); renderSidebar(); updateBadge(); }
    });
  }

  /* ── Badge counter ────────────────────────────────────────────── */
  function updateBadge() {
    const count = Cart.getCount();
    document.querySelectorAll('#cart-count, .cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  /* ── Boot ─────────────────────────────────────────────────────── */
  function boot() {
    buildSidebar();
    updateBadge();
    document.addEventListener('cart:updated', () => { updateBadge(); renderSidebar(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
