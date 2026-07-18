/* ============================================
   AK Medicine Corner - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Loading Screen ---- */
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    window.addEventListener('load', () => {
      setTimeout(() => loadingScreen.classList.add('hidden'), 600);
    });
    setTimeout(() => loadingScreen.classList.add('hidden'), 3000);
  }

  /* ---- Header Scroll ---- */
  const header = document.querySelector('.header');
  const backToTop = document.querySelector('.back-to-top');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (header) header.classList.toggle('scrolled', scrollY > 20);
    if (backToTop) backToTop.classList.toggle('visible', scrollY > 400);
  });

  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---- Mobile Menu ---- */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileOverlay = document.querySelector('.mobile-menu-overlay');
  const mobileClose = document.querySelector('.mobile-menu-close');

  function openMobileMenu() {
    hamburger && hamburger.classList.add('active');
    mobileMenu && mobileMenu.classList.add('active');
    mobileOverlay && mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    hamburger && hamburger.classList.remove('active');
    mobileMenu && mobileMenu.classList.remove('active');
    mobileOverlay && mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openMobileMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);
  document.querySelectorAll('.mobile-nav a').forEach(l => l.addEventListener('click', closeMobileMenu));

  /* ---- Cart System ---- */
  const cartBtns = document.querySelectorAll('[data-cart-toggle]');
  const cartSidebar = document.querySelector('.cart-sidebar');
  const cartOverlay = document.querySelector('.cart-overlay');
  const cartClose = document.querySelector('.cart-close');
  const cartCountEl = document.querySelector('.cart-count');
  const cartItemsEl = document.querySelector('.cart-items');
  const cartTotalEl = document.querySelector('.cart-total-amount');

  let cart = JSON.parse(localStorage.getItem('ak_cart') || '[]');

  function openCart() {
    cartSidebar && cartSidebar.classList.add('active');
    cartOverlay && cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCart();
  }

  function closeCart() {
    cartSidebar && cartSidebar.classList.remove('active');
    cartOverlay && cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  cartBtns.forEach(btn => btn.addEventListener('click', openCart));
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  function renderCart() {
    if (cartCountEl) cartCountEl.textContent = cart.reduce((s, i) => s + i.qty, 0);

    if (cartItemsEl) {
      if (cart.length === 0) {
        cartItemsEl.innerHTML = '<div class="cart-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.836-7.993H6.486m-.773 8.007L5.106 3.75M17.25 14.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3m18.75 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3"/></svg><h4>Your cart is empty</h4><p>Add some products to get started</p></div>';
      } else {
        cartItemsEl.innerHTML = cart.map(item => '<div class="cart-item"><div class="cart-item-image">' + item.icon + '</div><div class="cart-item-info"><div class="cart-item-name">' + item.name + '</div><div class="cart-item-price">\u09F3' + item.price + '</div><div class="cart-item-qty"><button onclick="changeQty(\'' + item.id + '\', -1)">&minus;</button><span>' + item.qty + '</span><button onclick="changeQty(\'' + item.id + '\', 1)">+</button></div></div><button class="cart-item-remove" onclick="removeFromCart(\'' + item.id + '\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg></button></div>').join('');
      }
    }

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    if (cartTotalEl) cartTotalEl.textContent = '\u09F3' + total.toLocaleString();
    localStorage.setItem('ak_cart', JSON.stringify(cart));
  }

  window.addToCart = function(id, name, price, icon) {
    const existing = cart.find(i => i.id === id);
    if (existing) { existing.qty++; } else { cart.push({ id: id, name: name, price: parseInt(price), icon: icon, qty: 1 }); }
    renderCart();
    showToast(name + ' added to cart');
  };

  window.changeQty = function(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) { item.qty += delta; if (item.qty <= 0) cart = cart.filter(i => i.id !== id); }
    renderCart();
  };

  window.removeFromCart = function(id) {
    cart = cart.filter(i => i.id !== id);
    renderCart();
  };

  /* ---- Wishlist ---- */
  let wishlist = JSON.parse(localStorage.getItem('ak_wishlist') || '[]');

  window.toggleWishlist = function(id, name) {
    if (wishlist.includes(id)) {
      wishlist = wishlist.filter(i => i !== id);
      showToast(name + ' removed from wishlist');
    } else {
      wishlist.push(id);
      showToast(name + ' added to wishlist');
    }
    localStorage.setItem('ak_wishlist', JSON.stringify(wishlist));
    document.querySelectorAll('[data-wishlist="' + id + '"]').forEach(btn => {
      btn.classList.toggle('active');
    });
  };

  /* ---- Quick View Modal ---- */
  const modalOverlay = document.querySelector('.modal-overlay');

  window.openQuickView = function(name, category, price, icon, desc) {
    const modalName = document.querySelector('.modal-product-name');
    const modalCat = document.querySelector('.modal-product-cat');
    const modalPrice = document.querySelector('.modal-product-price');
    const modalIcon = document.querySelector('.modal-product-image');
    const modalDesc = document.querySelector('.modal-product-desc');
    if (modalName) modalName.textContent = name;
    if (modalCat) modalCat.textContent = category;
    if (modalPrice) modalPrice.textContent = '\u09F3' + price;
    if (modalIcon) modalIcon.innerHTML = icon;
    if (modalDesc) modalDesc.textContent = desc || 'Premium quality healthcare product from AK Medicine Corner.';
    if (modalOverlay) { modalOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
  };

  window.closeModal = function() {
    if (modalOverlay) { modalOverlay.classList.remove('active'); document.body.style.overflow = ''; }
  };

  if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) { if (e.target === modalOverlay) closeModal(); });
  }

  /* ---- Scroll Animations ---- */
  const animateEls = document.querySelectorAll('.animate-on-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  animateEls.forEach(el => observer.observe(el));

  /* ---- Counter Animation ---- */
  const counters = document.querySelectorAll('.stat-number');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target') || '0');
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * eased);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  /* ---- Toast Notifications ---- */
  function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;bottom:90px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:8px;';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.style.cssText = 'background:#1E293B;color:white;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:500;box-shadow:0 10px 25px rgba(0,0,0,0.15);animation:fadeInUp 0.3s ease;display:flex;align-items:center;gap:8px;max-width:320px;';
    toast.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' + message;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(10px)'; setTimeout(() => toast.remove(), 300); }, 2500);
  }

  /* ---- Product Search ---- */
  const searchInput = document.querySelector('.product-search');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const q = this.value.toLowerCase();
      document.querySelectorAll('.product-card').forEach(card => {
        const name = (card.querySelector('.product-name') || {}).textContent || '';
        const cat = (card.querySelector('.product-category') || {}).textContent || '';
        card.style.display = (name.toLowerCase().includes(q) || cat.toLowerCase().includes(q)) ? '' : 'none';
      });
    });
  }

  /* ---- Contact Form ---- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      showToast('Message sent successfully! We will get back to you soon.');
      this.reset();
    });
  }

  /* ---- Flat Rate Page ---- */
  const searchMedicine = document.getElementById('searchMedicine');
  const categoryFilter = document.getElementById('categoryFilter');
  const sortFilter = document.getElementById('sortFilter');
  const medicineTableBody = document.getElementById('medicineTableBody');

  if (searchMedicine && medicineTableBody) {
    const rows = Array.from(medicineTableBody.querySelectorAll('tr'));

    function filterMedicines() {
      const q = searchMedicine.value.toLowerCase();
      const cat = categoryFilter ? categoryFilter.value : '';
      let filtered = rows.filter(row => {
        const name = (row.querySelector('.medicine-name') || row.cells[0]).textContent.toLowerCase();
        const rowCat = row.getAttribute('data-category') || '';
        return name.includes(q) && (!cat || rowCat === cat);
      });

      if (sortFilter) {
        const sort = sortFilter.value;
        if (sort === 'price-low') filtered.sort((a, b) => getFlatPrice(a) - getFlatPrice(b));
        else if (sort === 'price-high') filtered.sort((a, b) => getFlatPrice(b) - getFlatPrice(a));
        else if (sort === 'savings') filtered.sort((a, b) => getSavings(b) - getSavings(a));
        else if (sort === 'name') filtered.sort((a, b) => (a.querySelector('.medicine-name') || a.cells[0]).textContent.localeCompare((b.querySelector('.medicine-name') || b.cells[0]).textContent));
      }

      rows.forEach(r => r.style.display = 'none');
      filtered.forEach(r => r.style.display = '');
    }

    function getFlatPrice(row) {
      const priceText = (row.querySelector('.flat-price') || row.cells[4]).textContent;
      return parseInt(priceText.replace(/[^\d]/g, '')) || 0;
    }

    function getSavings(row) {
      const sText = (row.querySelector('.savings') || row.cells[6]).textContent;
      return parseInt(sText.replace(/[^\d]/g, '')) || 0;
    }

    if (searchMedicine) searchMedicine.addEventListener('input', filterMedicines);
    if (categoryFilter) categoryFilter.addEventListener('change', filterMedicines);
    if (sortFilter) sortFilter.addEventListener('change', filterMedicines);
  }

  /* ---- Smooth Scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  /* ---- Active Nav Link ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-desktop a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  renderCart();
});
