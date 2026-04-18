/* ============================================
   NEXMART - Main Application JS
   ============================================ */

// ---- State ----
let cart = JSON.parse(localStorage.getItem('nexmart_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('nexmart_wishlist')) || [];
let currentPage = 'home';
let currentProduct = null;
let currentFilters = { category: [], brand: [], rating: 0, maxPrice: 2000, sort: 'featured' };
let currentPaginationPage = 1;
let currentView = 'grid'; 
const ITEMS_PER_PAGE = 8;
let checkoutStep = 1;

// ---- Routing ----
let pageHistory = [];

function navigate(page, data = null) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(`page-${page}`);
  if (el) { el.classList.add('active'); el.classList.add('fade-in'); setTimeout(() => el.classList.remove('fade-in'), 600); }
  
  if (currentPage !== page || (page === 'detail' && currentProduct?.id !== data)) {
    pageHistory.push({ page: currentPage, data: currentProduct?.id });
  }
  
  currentPage = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  updateNavActive();
  if (page === 'home') renderHome();
  if (page === 'products') { currentPaginationPage = 1; renderProducts(); }
  if (page === 'detail' && data) renderDetail(data);
  if (page === 'cart') renderCart();
  if (page === 'checkout') renderCheckout();
  if (page === 'login') renderAuthPage('login');
  if (page === 'static' && data) renderStaticPage(data);
}

function goBack() {
  if (pageHistory.length > 0) {
    const prev = pageHistory.pop();
    // Temporarily disable history push for the back navigation
    const tempHistory = [...pageHistory];
    navigate(prev.page, prev.data);
    pageHistory = tempHistory; // Restore history without the forward navigation we just created
  } else {
    navigate('products');
  }
}

function updateNavActive() {
  document.querySelectorAll('.nav-btn[data-page]').forEach(b => {
    b.classList.toggle('active', b.dataset.page === currentPage);
  });
}

// ---- Cart ----
function saveCart() { localStorage.setItem('nexmart_cart', JSON.stringify(cart)); }
function saveWishlist() { localStorage.setItem('nexmart_wishlist', JSON.stringify(wishlist)); }

function addToCart(productId, qty = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product || !product.inStock) { showToast('error', '❌ Out of Stock', 'This product is currently unavailable.'); return; }
  const existing = cart.find(c => c.id === productId);
  if (existing) { existing.qty = Math.min(existing.qty + qty, 10); }
  else { cart.push({ id: productId, qty }); }
  saveCart();
  updateCartBadge();
  showToast('success', '🛍️ Added to Cart', `${product.name.substring(0, 35)}...`);
  if (currentPage === 'cart') renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(c => c.id !== productId);
  saveCart();
  updateCartBadge();
  if (currentPage === 'cart') renderCart();
  showToast('info', '🗑️ Removed', 'Item removed from cart.');
}

function updateCartQty(productId, delta) {
  const item = cart.find(c => c.id === productId);
  if (!item) return;
  item.qty = Math.max(1, Math.min(item.qty + delta, 10));
  saveCart();
  if (currentPage === 'cart') renderCart();
}

function updateCartBadge() {
  const total = cart.reduce((s, c) => s + c.qty, 0);
  const badge = document.querySelector('.cart-badge');
  if (badge) { badge.textContent = total; badge.classList.toggle('show', total > 0); }
}

function getCartTotal() {
  return cart.reduce((sum, c) => {
    const p = PRODUCTS.find(pr => pr.id === c.id);
    return sum + (p ? p.price * c.qty : 0);
  }, 0);
}

// ---- Wishlist ----
function toggleWishlist(productId) {
  const idx = wishlist.indexOf(productId);
  const product = PRODUCTS.find(p => p.id === productId);
  if (idx > -1) { wishlist.splice(idx, 1); showToast('info', '💔 Removed', 'Removed from wishlist.'); }
  else { wishlist.push(productId); showToast('success', '❤️ Saved', `${product?.name?.substring(0, 30)}... added to wishlist.`); }
  saveWishlist();
  updateWishBadge();
  document.querySelectorAll(`[data-wish="${productId}"]`).forEach(b => b.classList.toggle('active', wishlist.includes(productId)));
  if (currentProduct?.id === productId) {
    const btn = document.querySelector('.detail-wishlist');
    if (btn) btn.classList.toggle('active', wishlist.includes(productId));
  }
}

function updateWishBadge() {
  const badge = document.querySelector('.wish-badge');
  if (badge) { badge.textContent = wishlist.length; badge.classList.toggle('show', wishlist.length > 0); }
}

// ---- Toast ----
function showToast(type, title, sub = '') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><div class="toast-text"><div class="toast-title">${title}</div>${sub ? `<div class="toast-sub">${sub}</div>` : ''}</div><button class="toast-close" onclick="removeToast(this.parentElement)">✕</button>`;
  container.appendChild(toast);
  setTimeout(() => removeToast(toast), 3500);
}
function removeToast(toast) {
  if (!toast || !toast.parentElement) return;
  toast.classList.add('removing');
  setTimeout(() => toast.remove(), 250);
}

// ---- Stars ----
function renderStars(rating, max = 5) {
  return Array.from({ length: max }, (_, i) => `<span class="star${i + 1 > rating ? ' empty' : ''}">★</span>`).join('');
}

// ---- Product Card ----
function renderProductCard(product, view = 'grid') {
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const badgeClass = { 'Best Seller': 'bestseller', 'New': 'new', 'Sale': 'sale', 'Popular': 'popular' };
  const isWished = wishlist.includes(product.id);
  const cardClass = view === 'list' ? 'product-card list-view' : 'product-card';
  
  return `
    <div class="${cardClass}" onclick="navigate('detail', ${product.id})">
      <div class="product-img-wrap">
        <img class="lazy-img" data-src="${product.images[0]}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" alt="${product.name}" loading="lazy">
        ${product.badge ? `<span class="product-badge badge-${badgeClass[product.badge] || 'new'}">${product.badge}</span>` : ''}
        <div class="product-actions-hover">
          <button class="action-btn-sm ${isWished ? 'active' : ''}" data-wish="${product.id}" onclick="event.stopPropagation(); toggleWishlist(${product.id})" title="Wishlist">♡</button>
          <button class="action-btn-sm" onclick="event.stopPropagation(); navigate('detail', ${product.id})" title="Quick View">👁</button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-brand">${product.brand}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-rating">
          <div class="stars">${renderStars(product.rating)}</div>
          <span class="rating-count">(${product.reviewCount.toLocaleString()})</span>
        </div>
        ${view === 'list' ? `<p class="product-desc-list" style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${product.description}</p>` : ''}
        <div class="product-pricing">
          <span class="product-price">$${product.price.toFixed(2)}</span>
          ${product.originalPrice ? `<span class="product-price-original">$${product.originalPrice.toFixed(2)}</span>` : ''}
          ${discount > 0 ? `<span class="product-discount">-${discount}%</span>` : ''}
        </div>
        <button class="add-to-cart-btn ${!product.inStock ? 'out-of-stock' : ''}" onclick="event.stopPropagation(); addToCart(${product.id})">
          🛒 <span>${product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </div>`;
}

// ---- Lazy Loading ----
function initLazyLoad() {
  const imgs = document.querySelectorAll('.lazy-img');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        img.src = img.dataset.src;
        img.onload = () => img.classList.add('loaded');
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '100px' });
  imgs.forEach(img => obs.observe(img));
}

// ---- HOME PAGE ----
function renderHome() {
  renderHeroCards();
  renderCategoriesSection();
  renderFeaturedProducts();
  renderDealsProducts();
  initLazyLoad();
}

function renderHeroCards() {
  const featured = PRODUCTS.slice(0, 3);
  const main = document.querySelector('.hero-card-main');
  const side1 = document.querySelector('.hero-card-side-1');
  const side2 = document.querySelector('.hero-card-side-2');
  [main, side1, side2].forEach((el, i) => {
    if (!el || !featured[i]) return;
    const p = featured[i];
    el.innerHTML = `<img class="hero-card-img" src="${p.images[0]}" alt="${p.name}"><div class="hero-card-info"><div class="hero-card-name">${p.name}</div><div class="hero-card-price">$${p.price.toFixed(2)}</div></div>`;
  });
}

function renderCategoriesSection() {
  const cats = [
    { icon: '📱', name: 'Electronics', count: '248 items' },
    { icon: '💻', name: 'Computers', count: '189 items' },
    { icon: '👟', name: 'Fashion', count: '562 items' },
    { icon: '📸', name: 'Photography', count: '94 items' },
    { icon: '🏠', name: 'Home', count: '331 items' },
    { icon: '🎮', name: 'Gaming', count: '127 items' },
  ];
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;
  grid.innerHTML = cats.map(c => `
    <div class="cat-card" onclick="filterByCategory('${c.name}')">
      <span class="cat-icon">${c.icon}</span>
      <div class="cat-name">${c.name}</div>
      <div class="cat-count">${c.count}</div>
    </div>`).join('');
}

function filterByCategory(cat) {
  currentFilters.category = [cat];
  navigate('products');
}

function renderFeaturedProducts() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  const items = PRODUCTS.slice(0, 8);
  grid.className = 'products-grid stagger';
  grid.innerHTML = items.map(renderProductCard).join('');
  initLazyLoad();
}

function renderDealsProducts() {
  const grid = document.getElementById('dealsGrid');
  if (!grid) return;
  const deals = PRODUCTS.filter(p => p.originalPrice).slice(0, 4);
  grid.className = 'products-grid stagger';
  grid.innerHTML = deals.map(renderProductCard).join('');
  initLazyLoad();
}

// ---- PRODUCTS PAGE ----
function renderProducts() {
  const page = document.getElementById('page-products');
  if (!page) return;

  let filtered = [...PRODUCTS];

  // Search
  const searchVal = document.getElementById('mainSearch')?.value?.toLowerCase() || '';
  if (searchVal) filtered = filtered.filter(p => p.name.toLowerCase().includes(searchVal) || p.brand.toLowerCase().includes(searchVal) || p.category.toLowerCase().includes(searchVal));

  // Category filter
  if (currentFilters.category.length > 0) filtered = filtered.filter(p => currentFilters.category.includes(p.category));

  // Brand filter
  if (currentFilters.brand.length > 0) filtered = filtered.filter(p => currentFilters.brand.includes(p.brand));

  // Rating filter
  if (currentFilters.rating > 0) filtered = filtered.filter(p => p.rating >= currentFilters.rating);

  // Price
  filtered = filtered.filter(p => p.price <= currentFilters.maxPrice);

  // Sort
  if (currentFilters.sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (currentFilters.sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (currentFilters.sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  else if (currentFilters.sort === 'newest') filtered.sort((a, b) => b.id - a.id);

  // Pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const start = (currentPaginationPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

  // Update count
  const countEl = document.getElementById('productsCount');
  if (countEl) countEl.innerHTML = `Showing <span>${paginated.length}</span> of <span>${total}</span> products`;

  // Active filters display
  const afEl = document.getElementById('activeFilters');
  if (afEl) {
    let tags = [];
    currentFilters.category.forEach(c => tags.push(`<span class="filter-tag" onclick="removeFilter('category', '${c}')">${c} <span>✕</span></span>`));
    currentFilters.brand.forEach(b => tags.push(`<span class="filter-tag" onclick="removeFilter('brand', '${b}')">${b} <span>✕</span></span>`));
    if (currentFilters.rating > 0) tags.push(`<span class="filter-tag" onclick="removeFilter('rating')">${currentFilters.rating}★ & up <span>✕</span></span>`);
    afEl.innerHTML = tags.join('');
  }

  // Render grid
  const grid = document.getElementById('productsGrid');
  if (grid) {
    if (paginated.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-secondary)"><div style="font-size:3rem;margin-bottom:12px">🔍</div><div style="font-size:1.1rem;font-weight:600;margin-bottom:8px">No products found</div><div>Try adjusting your filters or search term.</div></div>`;
    } else {
      grid.className = currentView === 'list' ? 'products-grid list-layout stagger' : 'products-grid stagger';
      grid.innerHTML = paginated.map(p => renderProductCard(p, currentView)).join('');
      initLazyLoad();
    }
  }

  // Sidebar category checkboxes
  renderSidebarFilters();

  // Pagination
  renderPagination(totalPages);
}

function renderSidebarFilters() {
  const cats = [...new Set(PRODUCTS.map(p => p.category))];
  const sidebar = document.getElementById('sidebarCategories');
  if (sidebar) {
    sidebar.innerHTML = cats.map(c => `
      <label class="filter-option">
        <input type="checkbox" ${currentFilters.category.includes(c) ? 'checked' : ''} onchange="toggleFilter('category', '${c}')">
        ${c} <span class="filter-count">${PRODUCTS.filter(p => p.category === c).length}</span>
      </label>`).join('');
  }

  const brandEl = document.getElementById('sidebarBrands');
  if (brandEl) {
    const brands = [...new Set(PRODUCTS.map(p => p.brand))];
    brandEl.innerHTML = brands.map(b => `
      <label class="filter-option">
        <input type="checkbox" ${currentFilters.brand.includes(b) ? 'checked' : ''} onchange="toggleFilter('brand', '${b}')">
        ${b} <span class="filter-count">${PRODUCTS.filter(p => p.brand === b).length}</span>
      </label>`).join('');
  }

  const ratingEl = document.getElementById('sidebarRatings');
  if (ratingEl) {
    const ratings = [4, 3];
    ratingEl.innerHTML = ratings.map(r => `
      <label class="filter-option">
        <input type="radio" name="ratingFilter" ${currentFilters.rating === r ? 'checked' : ''} onchange="setRatingFilter(${r})">
        ${r}★ & above <span class="filter-count">${PRODUCTS.filter(p => p.rating >= r).length}</span>
      </label>`).join('');
  }
}

function toggleFilter(type, val) {
  const arr = currentFilters[type];
  const idx = arr.indexOf(val);
  if (idx > -1) arr.splice(idx, 1);
  else arr.push(val);
  currentPaginationPage = 1;
  renderProducts();
}

function setRatingFilter(val) {
  currentFilters.rating = currentFilters.rating === val ? 0 : val;
  currentPaginationPage = 1;
  renderProducts();
}

function removeFilter(type, val) {
  if (type === 'rating') {
    currentFilters.rating = 0;
    const radios = document.getElementsByName('ratingFilter');
    radios.forEach(r => r.checked = false);
  } else {
    currentFilters[type] = currentFilters[type].filter(item => item !== val);
  }
  currentPaginationPage = 1;
  renderProducts();
}

// Kept for backward compatibility with older calls
function toggleCategoryFilter(cat) { toggleFilter('category', cat); }

function filterByCategory(cat) {
  currentFilters.category = [cat];
  navigate('products');
}


function renderPagination(totalPages) {
  const el = document.getElementById('pagination');
  if (!el || totalPages <= 1) { if (el) el.innerHTML = ''; return; }
  let html = `<button class="page-btn" onclick="changePage(${currentPaginationPage - 1})" ${currentPaginationPage === 1 ? 'disabled' : ''}>‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPaginationPage - 1 && i <= currentPaginationPage + 1)) {
      html += `<button class="page-btn ${i === currentPaginationPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    } else if (i === currentPaginationPage - 2 || i === currentPaginationPage + 2) {
      html += `<span style="color:var(--text-muted);padding:0 4px">…</span>`;
    }
  }
  html += `<button class="page-btn" onclick="changePage(${currentPaginationPage + 1})" ${currentPaginationPage === totalPages ? 'disabled' : ''}>›</button>`;
  el.innerHTML = html;
}

function changePage(page) {
  currentPaginationPage = page;
  renderProducts();
  document.getElementById('page-products')?.scrollIntoView({ behavior: 'smooth' });
}

// ---- SEARCH ----
function handleSearch(e) {
  if (e && e.type === 'keydown' && e.key !== 'Enter') return;
  navigate('products');
}

function setView(view) {
  currentView = view;
  document.querySelectorAll('.view-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === view);
  });
  renderProducts();
}

function syncSearch() {
  const mainVal = document.getElementById('mainSearch')?.value || '';
  const sideVal = document.getElementById('sideSearch')?.value || '';
  const val = mainVal || sideVal;
  document.querySelectorAll('.search-input-all').forEach(el => el.value = val);
}

// ---- DETAIL PAGE ----
function renderDetail(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  currentProduct = product;
  const page = document.getElementById('page-detail');
  if (!page) return;

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const isWished = wishlist.includes(product.id);

  page.innerHTML = `
    <div style="padding-top: var(--nav-h)">
      <div class="container" style="padding-top: 32px">
        <div class="detail-back" onclick="goBack()">← Back to Products</div>
        <div class="detail-grid">
          <!-- Gallery -->
          <div class="detail-gallery">
            <div class="gallery-main">
              <img id="mainGalleryImg" src="${product.images[0]}" alt="${product.name}" style="opacity:1">
            </div>
            <div class="gallery-thumbs">
              ${product.images.map((img, i) => `<div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="changeGalleryImg(this, '${img}')"><img src="${img}" alt=""></div>`).join('')}
            </div>
          </div>
          <!-- Info -->
          <div class="detail-info">
            <div class="detail-brand">${product.brand} · ${product.category}</div>
            <h1 class="detail-name">${product.name}</h1>
            <div class="detail-rating">
              <div class="stars">${renderStars(product.rating)}</div>
              <span class="detail-rating-num">${product.rating}</span>
              <span class="detail-rating-link">${product.reviewCount.toLocaleString()} reviews</span>
              ${product.inStock ? '<span class="in-stock">✓ In Stock</span>' : '<span class="out-of-stock-tag">Out of Stock</span>'}
            </div>
            <div class="detail-pricing">
              <span class="detail-price">$${product.price.toFixed(2)}</span>
              ${product.originalPrice ? `<span class="detail-price-orig">$${product.originalPrice.toFixed(2)}</span>` : ''}
              ${discount > 0 ? `<span class="detail-save">Save ${discount}%</span>` : ''}
            </div>
            <p class="detail-desc">${product.description}</p>
            <div class="detail-features">
              ${product.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
            </div>
            <div class="quantity-row">
              <span class="qty-label">Quantity</span>
              <div class="qty-control">
                <button class="qty-btn" id="qtyMinus" onclick="changeQty(-1)">−</button>
                <span class="qty-num" id="qtyNum">1</span>
                <button class="qty-btn" id="qtyPlus" onclick="changeQty(1)">+</button>
              </div>
            </div>
            <div class="detail-buttons">
              <button class="detail-add-cart" onclick="addDetailToCart(${product.id})" ${!product.inStock ? 'disabled style="opacity:0.5"' : ''}>
                🛒 Add to Cart
              </button>
              <button class="detail-wishlist ${isWished ? 'active' : ''}" onclick="toggleWishlist(${product.id})">♡</button>
            </div>
            <div class="detail-meta">
              <div class="meta-row"><span class="meta-label">SKU</span><span class="meta-val">NX-${String(product.id).padStart(5, '0')}</span></div>
              <div class="meta-row"><span class="meta-label">Category</span><span class="meta-val">${product.category}</span></div>
              <div class="meta-row"><span class="meta-label">Shipping</span><span class="meta-val" style="color:var(--accent-3)">Free delivery on orders over $35</span></div>
              <div class="meta-row"><span class="meta-label">Returns</span><span class="meta-val">30-day free returns</span></div>
            </div>
          </div>
        </div>
        <!-- Related -->
        <div class="section">
          <div class="section-header">
            <div><div class="section-title">You May <span>Also Like</span></div><div class="section-subtitle">Based on this product</div></div>
          </div>
          <div class="products-grid stagger" id="relatedGrid"></div>
        </div>
      </div>
    </div>`;

  // Related products
  const related = PRODUCTS.filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand)).slice(0, 4);
  const relGrid = document.getElementById('relatedGrid');
  if (relGrid) { relGrid.innerHTML = related.map(renderProductCard).join(''); initLazyLoad(); }
}

function changeGalleryImg(thumb, src) {
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
  const img = document.getElementById('mainGalleryImg');
  if (img) { img.style.opacity = 0; setTimeout(() => { img.src = src; img.style.opacity = 1; }, 150); }
}

let detailQty = 1;
function changeQty(delta) {
  detailQty = Math.max(1, Math.min(detailQty + delta, 10));
  const el = document.getElementById('qtyNum');
  if (el) el.textContent = detailQty;
}
function addDetailToCart(id) {
  addToCart(id, detailQty);
  detailQty = 1;
  const el = document.getElementById('qtyNum');
  if (el) el.textContent = 1;
}

// ---- CART PAGE ----
function renderCart() {
  const page = document.getElementById('page-cart');
  if (!page) return;

  const headerEl = document.getElementById('cartTitle');
  if (headerEl) headerEl.textContent = `Your Cart (${cart.reduce((s, c) => s + c.qty, 0)} items)`;

  const itemsEl = document.getElementById('cartItems');
  const summaryEl = document.getElementById('cartSummary');
  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty">
      <div class="cart-empty-icon">🛒</div>
      <h3>Your cart is empty</h3>
      <p>Looks like you haven't added anything yet.</p>
      <button class="btn-primary" onclick="navigate('products')">Start Shopping</button>
    </div>`;
    if (summaryEl) summaryEl.style.display = 'none';
    return;
  }

  if (summaryEl) summaryEl.style.display = '';
  const subtotal = getCartTotal();
  const shipping = subtotal > 35 ? 0 : 4.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  itemsEl.innerHTML = cart.map(c => {
    const p = PRODUCTS.find(pr => pr.id === c.id);
    if (!p) return '';
    return `<div class="cart-item">
      <div class="cart-item-img"><img src="${p.images[0]}" alt="${p.name}"></div>
      <div>
        <div class="cart-item-brand">${p.brand}</div>
        <div class="cart-item-name">${p.name}</div>
        <div class="cart-item-qty">
          <button class="cart-qty-btn" onclick="updateCartQty(${p.id}, -1)">−</button>
          <span class="cart-qty-num">${c.qty}</span>
          <button class="cart-qty-btn" onclick="updateCartQty(${p.id}, 1)">+</button>
        </div>
        <div class="cart-item-remove" onclick="removeFromCart(${p.id})">🗑 Remove</div>
      </div>
      <div class="cart-item-price">$${(p.price * c.qty).toFixed(2)}</div>
    </div>`;
  }).join('');

  if (summaryEl) {
    summaryEl.querySelector('.summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    summaryEl.querySelector('.summary-shipping').textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    summaryEl.querySelector('.summary-tax').textContent = `$${tax.toFixed(2)}`;
    summaryEl.querySelector('.total-price').textContent = `$${total.toFixed(2)}`;
  }
}

// ---- CHECKOUT ----
function renderCheckout() {
  checkoutStep = 1;
  updateCheckoutSteps();
  renderCheckoutOrderSummary();
}

function renderCheckoutOrderSummary() {
  const el = document.getElementById('checkoutOrderItems');
  if (!el) return;
  const subtotal = getCartTotal();
  const shipping = subtotal > 35 ? 0 : 4.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  el.innerHTML = cart.map(c => {
    const p = PRODUCTS.find(pr => pr.id === c.id);
    if (!p) return '';
    return `<div class="order-item-mini">
      <div class="order-item-mini-img"><img src="${p.images[0]}" alt="${p.name}"></div>
      <div><div class="order-item-mini-name">${p.name}</div><div class="order-item-mini-qty">Qty: ${c.qty}</div></div>
      <div class="order-item-mini-price" style="margin-left:auto">$${(p.price * c.qty).toFixed(2)}</div>
    </div>`;
  }).join('');

  const totEl = document.getElementById('checkoutTotal');
  if (totEl) totEl.textContent = `$${total.toFixed(2)}`;
  const subEl = document.getElementById('checkoutSubtotal');
  if (subEl) subEl.textContent = `$${subtotal.toFixed(2)}`;
  const shipEl = document.getElementById('checkoutShipping');
  if (shipEl) shipEl.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
  const taxEl = document.getElementById('checkoutTax');
  if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
}

function updateCheckoutSteps() {
  document.querySelectorAll('.step').forEach((s, i) => {
    s.classList.remove('active', 'done');
    if (i + 1 < checkoutStep) s.classList.add('done');
    if (i + 1 === checkoutStep) s.classList.add('active');
  });
}

function nextCheckoutStep() {
  if (checkoutStep >= 3) {
    processPayment(); return;
  }
  checkoutStep++;
  updateCheckoutSteps();
  const sections = document.querySelectorAll('.checkout-section[data-step]');
  sections.forEach(s => {
    const step = parseInt(s.dataset.step);
    s.style.display = step <= checkoutStep ? '' : 'none';
  });
  const stepLabel = document.getElementById('checkoutNextLabel');
  if (stepLabel) {
    if (checkoutStep === 2) stepLabel.textContent = 'Continue to Payment';
    if (checkoutStep === 3) stepLabel.textContent = 'Place Order';
  }
}

function processPayment() {
  const processing = document.getElementById('paymentProcessing');
  if (processing) processing.classList.add('show');
  setTimeout(() => {
    if (processing) processing.classList.remove('show');
    const successOverlay = document.getElementById('paymentSuccess');
    if (successOverlay) {
      successOverlay.classList.add('show');
      const orderNum = document.getElementById('orderNumber');
      if (orderNum) orderNum.textContent = 'NX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    cart = [];
    saveCart();
    updateCartBadge();
  }, 2500);
}

// ---- AUTH PAGE ----
function renderAuthPage(mode) {
  const loginTab = document.querySelector('.form-tab[data-tab="login"]');
  const registerTab = document.querySelector('.form-tab[data-tab="register"]');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  if (!loginForm || !registerForm) return;
  if (mode === 'login') {
    loginTab?.classList.add('active'); registerTab?.classList.remove('active');
    loginForm.style.display = ''; registerForm.style.display = 'none';
  } else {
    registerTab?.classList.add('active'); loginTab?.classList.remove('active');
    registerForm.style.display = ''; loginForm.style.display = 'none';
  }
}

function switchAuthTab(tab) { renderAuthPage(tab); }

// ---- PAYMENT METHOD ----
function selectPayMethod(el) {
  document.querySelectorAll('.pay-method').forEach(m => m.classList.remove('selected'));
  el.classList.add('selected');
  const cardFields = document.getElementById('cardFields');
  if (cardFields) cardFields.style.display = el.dataset.method === 'card' ? '' : 'none';
}

// ---- STATIC PAGES ----
function renderStaticPage(pageKey) {
  const contentMap = {
    'help': {
      title: 'Help Center',
      body: '<p>Welcome to our Help Center. Here you can find answers to frequently asked questions about orders, payments, and product information.</p><h3>Common Questions</h3><ul><li>How to place an order</li><li>Payment methods accepted</li><li>How to cancel an order</li></ul>'
    },
    'track': {
      title: 'Track Order',
      body: '<p>Enter your order number below to track its current status and estimated delivery time.</p><div class="static-form-group" style="flex-direction:row; align-items:center; flex-wrap:wrap; gap:12px;"><input type="text" class="static-input" placeholder="e.g. NX-12345" style="flex:1; min-width:200px; margin:0;"><button class="static-btn" style="margin:0;" onclick="showToast(\'info\', \'Tracking\', \'Tracking functionality will be available soon.\')">Track Order</button></div>'
    },
    'returns': {
      title: 'Returns & Refunds',
      body: '<p>We offer a 30-day hassle-free return policy. If you are not completely satisfied with your purchase, you can return it within 30 days of delivery.</p><h3>Conditions for Return:</h3><ul><li>Items must be in original condition and unused.</li><li>Original packaging and tags must be included.</li><li>Refunds take 3-5 business days to process after we receive the item.</li></ul>'
    },
    'shipping': {
      title: 'Shipping Information',
      body: '<p>We partner with top global carriers to offer fast and reliable shipping worldwide.</p><h3>Standard Shipping</h3><p>Delivery in 3-5 business days. Free for all orders over $35. For orders under $35, a flat rate of $4.99 applies.</p><h3>Express Shipping</h3><p>Delivery in 1-2 business days. Flat rate cost: $14.99.</p>'
    },
    'contact': {
      title: 'Contact Us',
      body: '<p>We would love to hear from you! Please fill out the form below or email us directly at <strong>support@nexmart.com</strong>.</p><div class="static-form-group"><input type="text" class="static-input" placeholder="Your Full Name"><input type="email" class="static-input" placeholder="Your Email Address"><textarea class="static-input" placeholder="How can we help you?" rows="6" style="resize:vertical;"></textarea><button class="static-btn" onclick="showToast(\'success\', \'Message Sent\', \'We will get back to you within 24 hours!\')">Send Message</button></div>'
    },
    'about': {
      title: 'About Us',
      body: '<p>NexMart is your modern shopping destination. Founded in 2025, our mission is to provide premium products at unbeatable prices while offering a seamless and lightning-fast shopping experience.</p><p>We believe in quality, innovation, and putting our customers first. Our platform is built using the latest web technologies to ensure you can shop quickly and securely from any device.</p>'
    },
    'careers': {
      title: 'Careers',
      body: '<p>Join the NexMart team! We are always looking for passionate and talented individuals to help us build the future of e-commerce.</p><h3>Open Positions</h3><p>Currently, there are no open positions, but we are always eager to connect with great talent. Feel free to send your resume to <strong>careers@nexmart.com</strong>.</p>'
    },
    'press': {
      title: 'Press',
      body: '<p>For all press inquiries, media kits, and interview requests, please contact our PR team.</p><div class="static-form-group"><button class="static-btn" onclick="showToast(\'info\', \'Press Kit\', \'Downloading press kit...\')">Download Media Kit</button></div><p>Email us directly at <strong>press@nexmart.com</strong>.</p>'
    },
    'privacy': {
      title: 'Privacy Policy',
      body: '<p>Your privacy is critically important to us. This policy outlines how we collect, use, and protect your personal information.</p><h3>Data Collection</h3><p>We only collect data necessary to process your orders and improve your shopping experience. This includes your name, shipping address, and email.</p><h3>Data Security</h3><p>All your payment and personal data are heavily encrypted and secured using industry-standard SSL certificates. We never store your raw credit card information on our servers.</p>'
    },
    'terms': {
      title: 'Terms of Service',
      body: '<p>By using NexMart, you agree to our Terms of Service. These terms govern your use of our website and services.</p><h3>User Conduct</h3><p>You agree not to use our platform for any unlawful purpose. Any fraudulent activity will result in immediate account termination.</p><h3>Modifications</h3><p>We reserve the right to update these terms at any time. Continued use of the platform implies your acceptance of the updated terms.</p>'
    }
  };

  const content = contentMap[pageKey];
  if (!content) return;

  const titleEl = document.getElementById('staticTitle');
  const bodyEl = document.getElementById('staticBody');
  
  if (titleEl) titleEl.innerHTML = content.title;
  if (bodyEl) bodyEl.innerHTML = content.body;
}

// ---- NAVBAR ----
function initNavbar() {
  window.addEventListener('scroll', () => {
    document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 10);
  });
}

// ---- THEME ----
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', current === 'light' ? 'dark' : 'light');
  localStorage.setItem('nexmart_theme', document.documentElement.getAttribute('data-theme'));
  const btn = document.querySelector('.theme-toggle');
  if (btn) btn.textContent = current === 'light' ? '🌙' : '☀️';
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('nexmart_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  const themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) themeBtn.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

  updateCartBadge();
  updateWishBadge();
  initNavbar();
  navigate('home');

  // Main search
  document.getElementById('mainSearch')?.addEventListener('keydown', handleSearch);
  document.getElementById('navSearchBtn')?.addEventListener('click', handleSearch);

  // Sort
  document.getElementById('sortSelect')?.addEventListener('change', (e) => {
    currentFilters.sort = e.target.value;
    renderProducts();
  });

  // Price slider
  document.getElementById('priceSlider')?.addEventListener('input', (e) => {
    currentFilters.maxPrice = parseInt(e.target.value);
    document.getElementById('priceMax').textContent = '$' + e.target.value;
    const pct = (e.target.value / 2000) * 100;
    e.target.style.background = `linear-gradient(to right, var(--accent) 0%, var(--accent) ${pct}%, var(--border) ${pct}%)`;
    renderProducts();
  });

  // Checkout form step
  document.getElementById('checkoutNextBtn')?.addEventListener('click', nextCheckoutStep);

  // Payment method
  document.querySelectorAll('.pay-method').forEach(m => {
    m.addEventListener('click', () => selectPayMethod(m));
  });
  // Select first by default
  document.querySelector('.pay-method')?.classList.add('selected');

  // Form tabs (auth)
  document.querySelectorAll('.form-tab').forEach(t => {
    t.addEventListener('click', () => switchAuthTab(t.dataset.tab));
  });

  // Auth form submit
  document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('success', '👋 Welcome back!', 'You are now signed in.');
    navigate('home');
  });
  document.getElementById('registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('success', '🎉 Account Created!', 'Welcome to NexMart!');
    navigate('home');
  });

  // Success dismiss
  document.getElementById('successContinue')?.addEventListener('click', () => {
    document.getElementById('paymentSuccess').classList.remove('show');
    navigate('home');
  });
});