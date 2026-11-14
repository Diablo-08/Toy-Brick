/**
 * Trang Cửa Hàng (Shop)
 * Bộ lọc danh mục, khoảng giá, sắp xếp, tìm kiếm tức thì, phân trang
 * và xem chi tiết sản phẩm 3D khi click
 */
const ShopPage = {
  currentParams: {
    page: 1,
    limit: 12,
    q: '',
    category: 'all',
    priceRange: 'all',
    minPrice: '',
    maxPrice: '',
    sort: 'newest'
  },
  searchDebounceTimer: null,

  render: async (container) => {
    container.innerHTML = `
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold font-heading text-slate-100">Bộ Sưu Tập <span class="text-amber-400">Mô Hình Set</span></h1>
        <p class="text-sm text-slate-400 font-lora mt-1">Lắp ráp thế giới huyền ảo qua từng mảnh ghép chuẩn tinh xảo</p>
      </div>

      <!-- THANH LỌC VÀ TÌM KIẾM -->
      <div class="glass-panel rounded-2xl p-4 sm:p-6 mb-8 border border-amber-500/20 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">

          <!-- Ô tìm kiếm tức thì -->
          <div class="relative lg:col-span-2">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <i class="fa-solid fa-magnifying-glass text-xs text-amber-400"></i>
            </span>
            <input type="text" id="shop-search" value="${UI.escapeHTML(ShopPage.currentParams.q)}" class="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition" placeholder="Tìm theo tên mô hình hoặc SKU...">
          </div>

          <!-- Lọc danh mục (tự lọc khi đổi) -->
          <div>
            <select id="shop-category" class="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition cursor-pointer">
              <option value="all">Tất cả danh mục</option>
              <option value="Technic & Cơ khí">Technic & Cơ khí</option>
              <option value="Kiến trúc & Di sản">Kiến trúc & Di sản</option>
              <option value="Phương tiện siêu xe">Phương tiện siêu xe</option>
              <option value="Vũ trụ & Viễn tưởng">Vũ trụ & Viễn tưởng</option>
              <option value="Robot & Mecha">Robot & Mecha</option>
              <option value="Bộ lắp ráp Mini">Bộ lắp ráp Mini</option>
            </select>
          </div>

          <!-- Lọc khoảng giá (tự lọc khi đổi) -->
          <div>
            <select id="shop-price" class="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition cursor-pointer">
              <option value="all">Tất cả mức giá</option>
              <option value="under-1m">Dưới 1.000.000 đ</option>
              <option value="1m-2m">1.000.000 - 2.000.000 đ</option>
              <option value="over-2m">Trên 2.000.000 đ</option>
            </select>
          </div>

          <!-- Sắp xếp (tự lọc khi đổi) -->
          <div>
            <select id="shop-sort" class="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition cursor-pointer">
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
              <option value="rating">Được yêu thích nhất</option>
              <option value="piece-desc">Số mảnh ghép nhiều nhất</option>
            </select>
          </div>

        </div>

        <!-- Nút đặt lại & Thông tin bộ lọc -->
        <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <div id="filter-status-text">Đang hiển thị tất cả mô hình</div>
          <button id="shop-reset-btn" class="text-amber-400 hover:text-amber-300 font-semibold transition flex items-center space-x-1.5">
            <i class="fa-solid fa-arrows-rotate text-[11px]"></i>
            <span>Đặt lại bộ lọc</span>
          </button>
        </div>
      </div>

      <!-- LƯỚI DANH SÁCH SẢN PHẨM -->
      <div id="shop-products-container" class="min-h-[400px]">
        ${UI.renderProductSkeleton(8)}
      </div>

      <!-- PHÂN TRANG -->
      <div id="shop-pagination" class="mt-12 flex justify-center items-center space-x-2"></div>
    `;

    ShopPage.bindFilters();
    await ShopPage.loadProducts();
  },

  bindFilters: () => {
    const searchInput = document.getElementById('shop-search');
    const categorySelect = document.getElementById('shop-category');
    const priceSelect = document.getElementById('shop-price');
    const sortSelect = document.getElementById('shop-sort');
    const resetBtn = document.getElementById('shop-reset-btn');

    // Đồng bộ giá trị đang chọn nếu có
    if (categorySelect) categorySelect.value = ShopPage.currentParams.category || 'all';
    if (priceSelect) priceSelect.value = ShopPage.currentParams.priceRange || 'all';
    if (sortSelect) sortSelect.value = ShopPage.currentParams.sort || 'newest';

    const triggerFilter = () => {
      ShopPage.currentParams.q = searchInput ? searchInput.value.trim() : '';
      ShopPage.currentParams.category = categorySelect ? categorySelect.value : 'all';
      ShopPage.currentParams.sort = sortSelect ? sortSelect.value : 'newest';

      const priceVal = priceSelect ? priceSelect.value : 'all';
      ShopPage.currentParams.priceRange = priceVal;
      ShopPage.currentParams.minPrice = '';
      ShopPage.currentParams.maxPrice = '';

      if (priceVal === 'under-1m') {
        ShopPage.currentParams.maxPrice = 1000000;
      } else if (priceVal === '1m-2m') {
        ShopPage.currentParams.minPrice = 1000000;
        ShopPage.currentParams.maxPrice = 2000000;
      } else if (priceVal === 'over-2m') {
        ShopPage.currentParams.minPrice = 2000000;
      }

      ShopPage.currentParams.page = 1;
      ShopPage.loadProducts();
    };

    // 1. Tự động tìm kiếm khi gõ (debounce 300ms)
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(ShopPage.searchDebounceTimer);
        ShopPage.searchDebounceTimer = setTimeout(triggerFilter, 300);
      });
      searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          clearTimeout(ShopPage.searchDebounceTimer);
          triggerFilter();
        }
      });
    }

    // 2. Tự động lọc khi đổi danh mục
    if (categorySelect) {
      categorySelect.addEventListener('change', triggerFilter);
    }

    // 3. Tự động lọc khi đổi khoảng giá
    if (priceSelect) {
      priceSelect.addEventListener('change', triggerFilter);
    }

    // 4. Tự động lọc khi đổi kiểu sắp xếp
    if (sortSelect) {
      sortSelect.addEventListener('change', triggerFilter);
    }

    // 5. Đặt lại bộ lọc
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (categorySelect) categorySelect.value = 'all';
        if (priceSelect) priceSelect.value = 'all';
        if (sortSelect) sortSelect.value = 'newest';

        ShopPage.currentParams = {
          page: 1,
          limit: 12,
          q: '',
          category: 'all',
          priceRange: 'all',
          minPrice: '',
          maxPrice: '',
          sort: 'newest'
        };
        ShopPage.loadProducts();
      });
    }
  },

  loadProducts: async () => {
    const container = document.getElementById('shop-products-container');
    const pagContainer = document.getElementById('shop-pagination');
    const statusText = document.getElementById('filter-status-text');
    if (!container) return;

    container.innerHTML = UI.renderProductSkeleton(8);

    try {
      const res = await API.products.getAll(ShopPage.currentParams);
      if (!res.success || !res.data) {
        container.innerHTML = UI.renderEmptyState('fa-box-open', 'Lỗi tải dữ liệu', 'Không thể kết nối danh mục sản phẩm');
        return;
      }

      const products = res.data.products || [];
      const pagination = res.data.pagination || { total: 0, totalPages: 1 };

      if (statusText) {
        statusText.innerHTML = `Tìm thấy <strong class="text-amber-400 font-bold">${pagination.total}</strong> mô hình phù hợp`;
      }

      if (products.length === 0) {
        container.innerHTML = UI.renderEmptyState(
          'fa-box-open',
          'Không tìm thấy sản phẩm phù hợp',
          'Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các tiêu chí lọc.',
          'javascript:document.getElementById("shop-reset-btn").click()',
          'Xóa toàn bộ bộ lọc'
        );
        if (pagContainer) pagContainer.innerHTML = '';
        return;
      }

      let html = '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">';
      for (const p of products) {
        const mainImg = (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80';
        const isSale = p.salePrice && p.salePrice < p.price;
        const displayPrice = isSale ? p.salePrice : p.price;
        const isOutOfStock = p.stock <= 0;

        html += `
          <div class="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col justify-between group border border-amber-500/20 transition-all duration-300">
            <!-- Bấm vào ảnh mở trực tiếp trang chi tiết sản phẩm 3D -->
            <a href="#/product/${UI.escapeHTML(p.slug)}" class="block relative overflow-hidden bg-slate-950 h-52 group/img cursor-pointer" title="Xem chi tiết & Mô hình 3D">
              <img src="${UI.escapeHTML(mainImg)}" alt="${UI.escapeHTML(p.name)}" class="w-full h-full object-cover group-hover/img:scale-108 transition-transform duration-500" loading="lazy">

              <!-- Lớp phủ mở nhanh khi hover ảnh -->
              <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                <span class="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg flex items-center space-x-1.5 transform translate-y-2 group-hover/img:translate-y-0 transition-transform">
                  <i class="fa-solid fa-cube text-xs"></i>
                  <span>Xem Chi Tiết 3D</span>
                </span>
              </div>

              ${isOutOfStock
                ? '<span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/90 text-rose-400 border border-rose-500/40 text-[11px] font-bold shadow-md">HẾT HÀNG</span>'
                : (isSale ? '<span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-500/90 text-white text-[11px] font-bold shadow-md">GIẢM GIÁ</span>' : '')}
              <span class="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-900/80 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                ${UI.escapeHTML(p.pieceCount)} mảnh
              </span>
            </a>

            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between text-[11px] text-amber-400 mb-1">
                  <span class="font-semibold uppercase tracking-wider">${UI.escapeHTML(p.category)}</span>
                  <span><i class="fa-solid fa-star text-amber-400 mr-1"></i>${UI.escapeHTML(p.ratingAvg || 5.0)}</span>
                </div>
                <!-- Bấm vào tên mở chi tiết sản phẩm 3D -->
                <a href="#/product/${UI.escapeHTML(p.slug)}" class="font-heading font-bold text-base text-slate-100 hover:text-amber-400 transition line-clamp-1 block cursor-pointer">
                  ${UI.escapeHTML(p.name)}
                </a>
                <p class="text-xs text-slate-400 font-lora line-clamp-2 mt-1 leading-relaxed">
                  ${UI.escapeHTML(p.description)}
                </p>
              </div>

              <div class="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span class="text-sm font-extrabold text-amber-300 font-sans block">
                    ${UI.formatCurrency(displayPrice)}
                  </span>
                  ${isSale ? `<span class="text-[11px] text-slate-500 line-through font-sans">${UI.formatCurrency(p.price)}</span>` : ''}
                </div>
                <a href="#/product/${UI.escapeHTML(p.slug)}" class="px-3.5 py-2 rounded-xl btn-gold text-slate-950 font-bold text-xs transition flex items-center space-x-1.5 shadow-md" title="Xem 3D & Đặt mua">
                  <i class="fa-solid fa-cube text-xs"></i>
                  <span>Xem 3D</span>
                </a>
              </div>
            </div>
          </div>
        `;
      }
      html += '</div>';
      container.innerHTML = html;

      // Render Phân Trang
      ShopPage.renderPagination(pagination);

    } catch (e) {
      container.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi kết nối', e.message);
    }
  },

  renderPagination: (pagination) => {
    const pagContainer = document.getElementById('shop-pagination');
    if (!pagContainer || pagination.totalPages <= 1) {
      if (pagContainer) pagContainer.innerHTML = '';
      return;
    }

    let html = '';
    const currentPage = pagination.page;
    const totalPages = pagination.totalPages;

    if (currentPage > 1) {
      html += `
        <button class="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:border-amber-400 transition" onclick="ShopPage.changePage(${currentPage - 1})">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
      `;
    }

    for (let i = 1; i <= totalPages; i++) {
      const isActive = i === currentPage;
      html += `
        <button class="px-3.5 py-2 rounded-xl text-xs font-bold transition ${isActive ? 'btn-gold text-slate-950' : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-amber-400'}" onclick="ShopPage.changePage(${i})">
          ${i}
        </button>
      `;
    }

    if (currentPage < totalPages) {
      html += `
        <button class="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:border-amber-400 transition" onclick="ShopPage.changePage(${currentPage + 1})">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      `;
    }

    pagContainer.innerHTML = html;
  },

  changePage: (newPage) => {
    ShopPage.currentParams.page = newPage;
    ShopPage.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  destroy: () => {
    clearTimeout(ShopPage.searchDebounceTimer);
  }
};

window.ShopPage = ShopPage;
