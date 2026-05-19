// MB Nutrition Theme JS

document.addEventListener('DOMContentLoaded', function () {

  // ── Mobile Menu ──────────────────────────────────────────
  var hamburger = document.getElementById('Hamburger');
  var mobileNav = document.getElementById('MobileNav');
  var mobileClose = document.getElementById('MobileNavClose');
  var overlay = document.getElementById('Overlay');

  function openMenu() {
    if (!mobileNav) return;
    mobileNav.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    if (hamburger) { hamburger.classList.add('is-active'); hamburger.setAttribute('aria-expanded', 'true'); }
    if (overlay) overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (!mobileNav) return;
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    if (hamburger) { hamburger.classList.remove('is-active'); hamburger.setAttribute('aria-expanded', 'false'); }
    if (overlay) overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', function () { closeMenu(); closeCart(); });

  var mobileShopToggle = document.getElementById('MobileShopToggle');
  var mobileShopSub = document.getElementById('MobileShopSub');
  if (mobileShopToggle && mobileShopSub) {
    mobileShopToggle.addEventListener('click', function (e) {
      e.preventDefault();
      mobileShopSub.style.display = mobileShopSub.style.display === 'none' ? 'block' : 'none';
    });
  }

  // ── Search ────────────────────────────────────────────────
  var searchToggle = document.getElementById('SearchToggle');
  var searchOverlay = document.getElementById('SearchOverlay');
  var searchClose = document.getElementById('SearchClose');
  var searchInput = document.getElementById('SearchInput');

  if (searchToggle && searchOverlay) {
    searchToggle.addEventListener('click', function () {
      searchOverlay.style.display = 'flex';
      if (searchInput) searchInput.focus();
    });
  }
  if (searchClose) {
    searchClose.addEventListener('click', function () {
      searchOverlay.style.display = 'none';
    });
  }
  if (searchInput) {
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && this.value.trim()) {
        window.location.href = '/search?q=' + encodeURIComponent(this.value.trim()) + '&type=product';
      }
      if (e.key === 'Escape') { searchOverlay.style.display = 'none'; }
    });
  }

  // ── Cart Drawer ───────────────────────────────────────────
  var cartDrawer = document.getElementById('CartDrawer');
  var cartToggle = document.getElementById('CartToggle');
  var cartClose = document.getElementById('CartDrawerClose');

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('is-open');
    if (overlay) overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
    fetchCart();
  }
  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  if (cartToggle) cartToggle.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);

  // ── Add to cart ───────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-add-to-cart]');
    if (!btn) return;
    var variantId = btn.dataset.productId;
    if (!variantId) return;
    btn.disabled = true;
    btn.textContent = '...';
    fetch(window.routes.cart_add_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ id: variantId, quantity: 1 })
    })
    .then(function (r) { return r.json(); })
    .then(function () {
      btn.textContent = 'Toegevoegd!';
      setTimeout(function () { btn.disabled = false; btn.textContent = 'In winkelwagen'; }, 2000);
      updateCartCount();
      openCart();
    })
    .catch(function () {
      btn.disabled = false;
      btn.textContent = 'Fout — probeer opnieuw';
      setTimeout(function () { btn.textContent = 'In winkelwagen'; }, 3000);
    });
  });

  // ── Cart fetching & rendering ─────────────────────────────
  function fetchCart() {
    fetch('/cart.js')
    .then(function (r) { return r.json(); })
    .then(function (cart) { renderCart(cart); })
    .catch(function () {});
  }

  function updateCartCount() {
    fetch('/cart.js')
    .then(function (r) { return r.json(); })
    .then(function (cart) {
      var el = document.getElementById('CartCount');
      if (el) { el.textContent = cart.item_count; el.style.display = cart.item_count > 0 ? 'flex' : 'none'; }
    });
  }

  function formatMoney(cents) {
    return '€' + (cents / 100).toFixed(2).replace('.', ',');
  }

  function renderCart(cart) {
    var body = document.getElementById('CartDrawerBody');
    var subtotalEl = document.getElementById('CartSubtotal');
    var shippingFill = document.getElementById('ShippingFill');
    var shippingText = document.getElementById('ShippingText');
    if (!body) return;

    if (cart.item_count === 0) {
      body.innerHTML = '<div class="cart-drawer__empty"><p>Je winkelwagen is leeg.</p><a href="/collections/all" class="btn btn--primary btn--sm" style="margin-top:1rem;">Verder winkelen</a></div>';
    } else {
      var html = '';
      cart.items.forEach(function (item) {
        html += '<div class="cart-item" data-key="' + item.key + '">'
          + '<div class="cart-item__image">'
          + (item.image ? '<img src="' + item.image + '" alt="' + item.title + '" loading="lazy">' : '')
          + '</div>'
          + '<div class="cart-item__info">'
          + '<div class="cart-item__title">' + item.product_title.toUpperCase() + '</div>'
          + (item.variant_title ? '<div class="cart-item__variant">' + item.variant_title + '</div>' : '')
          + '<div class="cart-item__price">' + formatMoney(item.final_line_price) + '</div>'
          + '<div class="cart-item__controls">'
          + '<button class="qty-btn" data-cart-change="' + item.key + '" data-delta="-1" aria-label="Minder">&#x2212;</button>'
          + '<input class="qty-input" type="number" value="' + item.quantity + '" min="0" data-cart-qty="' + item.key + '" aria-label="Aantal">'
          + '<button class="qty-btn" data-cart-change="' + item.key + '" data-delta="1" aria-label="Meer">+</button>'
          + '<button class="cart-item__remove" data-cart-remove="' + item.key + '" aria-label="Verwijderen">Verwijderen</button>'
          + '</div>'
          + '</div>'
          + '</div>';
      });
      body.innerHTML = html;
    }

    if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);

    var threshold = 8000;
    var remaining = threshold - cart.total_price;
    if (shippingFill && shippingText) {
      if (remaining <= 0) {
        shippingText.innerHTML = '<strong>&#x2713; Gratis verzending!</strong>';
        shippingFill.style.width = '100%';
      } else {
        shippingText.innerHTML = 'Nog <strong>' + formatMoney(remaining) + '</strong> voor gratis verzending';
        shippingFill.style.width = Math.min(100, (cart.total_price / threshold) * 100) + '%';
      }
    }
  }

  document.addEventListener('click', function (e) {
    var changeBtn = e.target.closest('[data-cart-change]');
    var removeBtn = e.target.closest('[data-cart-remove]');
    if (changeBtn) {
      var key = changeBtn.dataset.cartChange;
      var delta = parseInt(changeBtn.dataset.delta, 10);
      var qtyInput = document.querySelector('[data-cart-qty="' + key + '"]');
      if (qtyInput) { updateCartItem(key, Math.max(0, parseInt(qtyInput.value, 10) + delta)); }
    }
    if (removeBtn) { updateCartItem(removeBtn.dataset.cartRemove, 0); }
  });

  function updateCartItem(key, qty) {
    fetch(window.routes.cart_change_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ id: key, quantity: qty })
    })
    .then(function (r) { return r.json(); })
    .then(function (cart) { renderCart(cart); updateCartCount(); })
    .catch(function () {});
  }

  // ── Product page ──────────────────────────────────────────
  var mainProductForm = document.getElementById('ProductForm');
  if (mainProductForm) {
    mainProductForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = this.querySelector('[type="submit"]');
      var variantInput = this.querySelector('[name="id"]');
      var qtyInput = this.querySelector('[name="quantity"]');
      if (!variantInput || !variantInput.value) return;
      if (btn) { btn.disabled = true; btn.textContent = '...'; }
      fetch(window.routes.cart_add_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ id: variantInput.value, quantity: parseInt(qtyInput ? qtyInput.value : 1, 10) })
      })
      .then(function (r) { return r.json(); })
      .then(function () {
        if (btn) { btn.disabled = false; btn.textContent = 'Toegevoegd!'; setTimeout(function () { btn.textContent = 'In winkelwagen'; }, 2500); }
        updateCartCount();
        openCart();
      })
      .catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = 'Fout — probeer opnieuw'; }
      });
    });
  }

  document.querySelectorAll('.product-qty-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = document.querySelector('.product-qty-input');
      if (!input) return;
      var v = parseInt(input.value, 10);
      if (this.dataset.delta === '-1' && v > 1) input.value = v - 1;
      if (this.dataset.delta === '+1') input.value = v + 1;
    });
  });

  document.querySelectorAll('.product-tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.product-tab-btn').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.product-tab-panel').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = document.getElementById(btn.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  document.querySelectorAll('.variant-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group = this.closest('.variant-options');
      if (group) group.querySelectorAll('.variant-btn').forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      var input = document.querySelector('[name="id"]');
      if (input && this.dataset.variantId) input.value = this.dataset.variantId;
    });
  });

  document.addEventListener('click', function (e) {
    var thumb = e.target.closest('.gallery-thumb');
    if (!thumb) return;
    document.querySelectorAll('.gallery-thumb').forEach(function (t) { t.classList.remove('active'); });
    thumb.classList.add('active');
    var mainImg = document.querySelector('.product-gallery__main img');
    if (mainImg && thumb.dataset.src) mainImg.src = thumb.dataset.src;
  });

  // ── Sticky header shadow ──────────────────────────────────
  var siteHeader = document.getElementById('SiteHeader');
  if (siteHeader) {
    window.addEventListener('scroll', function () {
      siteHeader.style.boxShadow = window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,0.08)' : '';
    }, { passive: true });
  }

  // ── Toast helper ──────────────────────────────────────────
  window.showToast = function (title, text, type) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + (type || 'success');
    toast.innerHTML = '<div class="toast__title">' + title + '</div>' + (text ? '<div class="toast__text">' + text + '</div>' : '');
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('is-visible'); });
    setTimeout(function () { toast.classList.remove('is-visible'); setTimeout(function () { toast.remove(); }, 400); }, 3500);
  };

});
