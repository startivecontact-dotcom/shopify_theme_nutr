/* MB Nutrition — Theme JS */
(function () {
  'use strict';

  var T = (window.theme && window.theme.strings) || {};
  var R = window.routes || {};

  // ---------- Money helper ----------
  function formatMoney(cents) {
    var amt = (cents / 100).toFixed(2).replace('.', ',');
    return amt + ' €';
  }

  // ---------- Toast ----------
  function toast(msg, type) {
    var el = document.getElementById('Toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('toast--error', type === 'error');
    el.classList.add('is-visible');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('is-visible'); }, 3000);
  }

  // ---------- Overlay control ----------
  var overlay = document.getElementById('Overlay');
  function showOverlay() {
    if (overlay) overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }
  function hideOverlay() {
    if (overlay) overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  // ---------- Mobile menu ----------
  var hamburger = document.getElementById('Hamburger');
  var mobileNav = document.getElementById('MobileNav');
  var mobileClose = document.getElementById('MobileNavClose');

  function openMenu() {
    if (!mobileNav) return;
    mobileNav.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    if (hamburger) { hamburger.classList.add('is-active'); hamburger.setAttribute('aria-expanded', 'true'); }
    showOverlay();
  }
  function closeMenu() {
    if (!mobileNav) return;
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    if (hamburger) { hamburger.classList.remove('is-active'); hamburger.setAttribute('aria-expanded', 'false'); }
    hideOverlay();
  }
  if (hamburger) hamburger.addEventListener('click', openMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);

  var mobileShopToggle = document.getElementById('MobileShopToggle');
  var mobileShopSub = document.getElementById('MobileShopSub');
  if (mobileShopToggle && mobileShopSub) {
    mobileShopToggle.addEventListener('click', function (e) {
      e.preventDefault();
      mobileShopSub.hidden = !mobileShopSub.hidden;
    });
  }

  // ---------- Keyboard accessibility for mega menu ----------
  document.querySelectorAll('.nav__item').forEach(function (item) {
    var link = item.querySelector('.nav__link');
    var mega = item.querySelector('.nav__mega');
    if (!link || !mega) return;
    link.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        item.querySelector('a, button').focus();
      }
    });
  });

  // ---------- Search overlay ----------
  var searchToggle = document.getElementById('SearchToggle');
  var searchOverlay = document.getElementById('SearchOverlay');
  var searchClose = document.getElementById('SearchClose');
  var searchInput = document.getElementById('SearchInput');
  var searchResults = document.getElementById('SearchResults');

  if (searchToggle && searchOverlay) {
    searchToggle.addEventListener('click', function () {
      searchOverlay.classList.add('is-open');
      searchOverlay.setAttribute('aria-hidden', 'false');
      if (searchInput) setTimeout(function () { searchInput.focus(); }, 50);
    });
  }
  if (searchClose) {
    searchClose.addEventListener('click', function () {
      searchOverlay.classList.remove('is-open');
      searchOverlay.setAttribute('aria-hidden', 'true');
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (searchOverlay) { searchOverlay.classList.remove('is-open'); searchOverlay.setAttribute('aria-hidden', 'true'); }
      closeMenu(); closeCart();
    }
  });

  // Predictive search (live)
  var searchTimeout = null;
  if (searchInput && searchResults && R.predictive_search_url) {
    searchInput.addEventListener('input', function () {
      var q = searchInput.value.trim();
      clearTimeout(searchTimeout);
      if (q.length < 2) { searchResults.hidden = true; searchResults.innerHTML = ''; return; }
      searchTimeout = setTimeout(function () {
        fetch(R.predictive_search_url + '?q=' + encodeURIComponent(q) + '&resources[type]=product&section_id=predictive-search', { headers: { 'Accept': 'text/html' } })
          .then(function (r) { return r.text(); })
          .catch(function () { return ''; })
          .then(function (html) {
            // fallback: simple link
            searchResults.innerHTML = '<a href="/search?q=' + encodeURIComponent(q) + '">Voir tous les résultats pour « ' + q.replace(/</g, '&lt;') + ' »</a>';
            searchResults.hidden = false;
          });
      }, 250);
    });
  }

  // ---------- Cart drawer ----------
  var cartDrawer = document.getElementById('CartDrawer');
  var cartClose = document.getElementById('CartDrawerClose');
  var cartToggle = document.getElementById('CartToggle');

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('is-open');
    showOverlay();
  }
  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('is-open');
    hideOverlay();
  }
  if (cartToggle) cartToggle.addEventListener('click', function (e) { e.preventDefault(); openCart(); });
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (overlay) overlay.addEventListener('click', function () { closeMenu(); closeCart(); });

  // ---------- Cart AJAX ----------
  function fetchCart() {
    return fetch('/cart.js', { headers: { 'Accept': 'application/json' } }).then(function (r) { return r.json(); });
  }

  function updateCartCount(count) {
    var el = document.getElementById('CartCount');
    if (!el) return;
    el.textContent = count;
    el.style.display = count > 0 ? '' : 'none';
  }

  function renderCart(cart) {
    updateCartCount(cart.item_count);
    var body = document.getElementById('CartDrawerBody');
    var subtotal = document.getElementById('CartSubtotal');
    var shippingText = document.getElementById('ShippingText');
    var shippingFill = document.getElementById('ShippingFill');

    if (subtotal) subtotal.textContent = formatMoney(cart.total_price);

    if (body) {
      if (cart.item_count === 0) {
        body.innerHTML = '<div class="cart-drawer__empty"><p>' + T.cartEmpty + '</p><a href="/collections/all" class="btn btn--primary btn--sm" style="margin-top:1rem;">' + T.continueShopping + '</a></div>';
      } else {
        body.innerHTML = cart.items.map(function (item) {
          var img = item.image ? '<img src="' + item.image + '" alt="">' : '';
          var variantTitle = item.variant_title ? '<div class="cart-item__variant">' + item.variant_title + '</div>' : '';
          return '<div class="cart-item" data-key="' + item.key + '">' +
            '<div class="cart-item__image">' + img + '</div>' +
            '<div class="cart-item__info">' +
              '<div class="cart-item__title">' + item.product_title.toUpperCase() + '</div>' +
              variantTitle +
              '<div class="cart-item__price">' + formatMoney(item.final_line_price) + '</div>' +
              '<div class="cart-item__controls">' +
                '<button class="qty-btn" data-cart-change="' + item.key + '" data-delta="-1" aria-label="Moins">−</button>' +
                '<input class="qty-input" type="number" value="' + item.quantity + '" min="0" data-cart-qty="' + item.key + '" aria-label="Quantité">' +
                '<button class="qty-btn" data-cart-change="' + item.key + '" data-delta="1" aria-label="Plus">+</button>' +
                '<button class="cart-item__remove" data-cart-remove="' + item.key + '">' + T.remove + '</button>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');
      }
    }

    var threshold = window.theme.freeShippingThreshold || 8000;
    var remaining = threshold - cart.total_price;
    if (shippingText) {
      shippingText.innerHTML = remaining <= 0
        ? '<strong>✓ ' + T.freeShipping + '</strong>'
        : T.freeShippingRemaining.replace('{amount}', '<strong>' + formatMoney(remaining) + '</strong>');
    }
    if (shippingFill) {
      var pct = Math.min(100, (cart.total_price / threshold) * 100);
      shippingFill.style.width = pct + '%';
    }
  }

  function addToCart(id, qty) {
    return fetch(R.cart_add_url + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ items: [{ id: id, quantity: qty || 1 }] })
    }).then(function (r) {
      if (!r.ok) return r.json().then(function (e) { throw new Error(e.description || T.error); });
      return r.json();
    });
  }

  function changeCart(key, qty) {
    return fetch(R.cart_change_url + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: key, quantity: qty })
    }).then(function (r) { return r.json(); });
  }

  // Add-to-cart buttons (product cards)
  document.addEventListener('click', function (e) {
    var atc = e.target.closest('[data-add-to-cart]');
    if (atc) {
      e.preventDefault();
      var id = atc.getAttribute('data-product-id');
      if (!id) return;
      var orig = atc.textContent;
      atc.disabled = true; atc.textContent = T.adding;
      addToCart(id, 1)
        .then(function () { return fetchCart(); })
        .then(function (cart) {
          renderCart(cart);
          atc.textContent = T.added;
          openCart();
          setTimeout(function () { atc.textContent = orig; atc.disabled = false; }, 1500);
        })
        .catch(function (err) {
          atc.textContent = orig; atc.disabled = false;
          toast(err.message || T.error, 'error');
        });
      return;
    }

    var changeBtn = e.target.closest('[data-cart-change]');
    if (changeBtn) {
      var key = changeBtn.getAttribute('data-cart-change');
      var delta = parseInt(changeBtn.getAttribute('data-delta'), 10);
      var input = document.querySelector('[data-cart-qty="' + key + '"]');
      var newQty = (input ? parseInt(input.value, 10) : 1) + delta;
      if (newQty < 0) newQty = 0;
      changeCart(key, newQty).then(renderCart);
      return;
    }

    var remBtn = e.target.closest('[data-cart-remove]');
    if (remBtn) {
      var rkey = remBtn.getAttribute('data-cart-remove');
      changeCart(rkey, 0).then(renderCart);
      return;
    }
  });

  document.addEventListener('change', function (e) {
    var input = e.target.closest('[data-cart-qty]');
    if (input) {
      var key = input.getAttribute('data-cart-qty');
      changeCart(key, Math.max(0, parseInt(input.value, 10) || 0)).then(renderCart);
    }
  });

  // Product form AJAX
  var productForm = document.getElementById('ProductForm');
  if (productForm) {
    productForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = productForm.querySelector('[type="submit"]');
      var origText = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = T.adding; }
      var fd = new FormData(productForm);
      fetch(R.cart_add_url + '.js', { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } })
        .then(function (r) { if (!r.ok) return r.json().then(function (e) { throw new Error(e.description || T.error); }); return r.json(); })
        .then(function () { return fetchCart(); })
        .then(function (cart) {
          renderCart(cart);
          openCart();
          if (btn) { btn.textContent = T.added; setTimeout(function () { btn.textContent = origText; btn.disabled = false; }, 1500); }
        })
        .catch(function (err) {
          if (btn) { btn.textContent = origText; btn.disabled = false; }
          toast(err.message || T.error, 'error');
        });
    });
  }

  // ---------- Product page interactivity ----------
  // Variant selection
  var variantSelectors = document.querySelectorAll('[data-variant-option]');
  function getProductData() {
    var el = document.getElementById('ProductData');
    if (!el) return null;
    try { return JSON.parse(el.textContent); } catch (e) { return null; }
  }
  var productData = getProductData();
  if (variantSelectors.length && productData) {
    variantSelectors.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-option-index'), 10);
        var val = btn.getAttribute('data-option-value');
        document.querySelectorAll('[data-option-index="' + idx + '"]').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        // collect current selection
        var selected = [];
        for (var i = 0; i < productData.options.length; i++) {
          var active = document.querySelector('[data-option-index="' + i + '"].is-active');
          selected[i] = active ? active.getAttribute('data-option-value') : null;
        }
        var match = productData.variants.find(function (v) {
          return v.options.every(function (o, i) { return o === selected[i]; });
        });
        if (match) {
          var idInput = document.querySelector('input[name="id"]');
          if (idInput) idInput.value = match.id;
          var priceEl = document.getElementById('ProductPrice');
          if (priceEl) priceEl.textContent = formatMoney(match.price);
          var atc = document.getElementById('ProductATC');
          if (atc) {
            atc.disabled = !match.available;
            atc.textContent = match.available ? T.addToCart : T.soldOut;
          }
        }
      });
    });
  }

  // Quantity +/- on product page
  document.querySelectorAll('[data-qty-change]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = document.getElementById('Quantity');
      if (!input) return;
      var d = parseInt(btn.getAttribute('data-qty-change'), 10);
      input.value = Math.max(1, (parseInt(input.value, 10) || 1) + d);
    });
  });

  // Gallery thumbs
  document.querySelectorAll('[data-thumb]').forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      var src = thumb.getAttribute('data-src');
      var main = document.getElementById('ProductMainImage');
      if (main && src) main.src = src;
      document.querySelectorAll('[data-thumb]').forEach(function (t) { t.classList.remove('is-active'); });
      thumb.classList.add('is-active');
    });
  });

  // Tabs
  document.querySelectorAll('[data-tab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var name = btn.getAttribute('data-tab');
      document.querySelectorAll('[data-tab]').forEach(function (b) { b.classList.remove('is-active'); });
      document.querySelectorAll('[data-tab-panel]').forEach(function (p) { p.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var panel = document.querySelector('[data-tab-panel="' + name + '"]');
      if (panel) panel.classList.add('is-active');
    });
  });

  // ---------- Sticky header shadow ----------
  var header = document.getElementById('SiteHeader');
  if (header) {
    var lastY = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 8);
      lastY = y;
    }, { passive: true });
  }

  // ---------- Bestsellers carousel touch / swipe ----------
  document.querySelectorAll('.bestsellers__track').forEach(function (track) {
    var startX = 0, isDown = false;
    track.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; isDown = true; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (!isDown) return;
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        var section = track.closest('section');
        if (!section) return;
        var btn = section.querySelector(diff > 0 ? '[id^="CarouselNext"]' : '[id^="CarouselPrev"]');
        if (btn) btn.click();
      }
      isDown = false;
    });
  });

  // Expose helpers
  window.themeUtils = { formatMoney: formatMoney, toast: toast, openCart: openCart, closeCart: closeCart, fetchCart: fetchCart, renderCart: renderCart };
})();
