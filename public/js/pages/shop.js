/**
 * Trang Cửa Hàng (Shop)
 * Bộ lọc danh mục, khoảng giá, sắp xếp, tìm kiếm từ khóa, phân trang
 */
const ShopPage = {
  currentParams: {
    page: 1,
    limit: 12,
    q: '',
    category: 'all',
    minPrice: '',
    maxPrice: '',
    sort: 'newest'
  },

  render: async (container) => {
    container.innerHTML = `
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold font-heading text-slate-100">Bộ Sưu Tập <span class="text-amber-400">Mô Hình Set</span></h1>
        <p class="text-sm text-slate-400 font-lora mt-1">Lắp ráp thế giới huyền ảo qua từng mảnh ghép chuẩn tinh xảo</p>
      </div>

      <!-- THANH LỌC VÀ TÌM KIẾM -->
      <div class="glass-panel rounded-2xl p-4 sm:p-6 mb-8 border border-amber-500/20 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <!-- Ô tìm kiếm -->
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <i class="fa-solid fa-magnifying-glass text-xs"></i>
            </span>
            <input type="text" id="shop-search" class="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition" placeholder="Tìm theo tên hoặc SKU...">
          </div>

          <!-- Lọc danh mục -->
          <div>
            <select id="shop-category" class="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition">
              <option value="all">Tất cả danh mục</option>
              <option value="Technic & Cơ khí">Technic & Cơ khí</option>
              <option value="Kiến trúc & Di sản">Kiến trúc & Di sản</option>
              <option value="Phương tiện siêu xe">Phương tiện siêu xe</option>
              <option value="Vũ trụ & Viễn tưởng">Vũ trụ & Viễn tưởng</option>
              <option value="Robot & Mecha">Robot & Mecha</option>
              <option value="Bộ lắp ráp Mini">Bộ lắp ráp Mini</option>
            </select>
          </div>

          <!-- Sắp xếp -->
          <div>
            <select id="shop-sort" class="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition">
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
              <option value="rating">Được yêu thích nhất</option>
              <option value="piece-desc">Số mảnh ghép nhiều nhất</option>
            </select>
          </div>

          <!-- Nút áp dụng bộ lọc -->
          <div class="flex space-x-2">
            <button id="shop-filter-btn" class="flex-1 py-2 rounded-xl btn-gold text-slate-950 font-bold text-xs transition flex items-center justify-center space-x-1.5">
              <i class="fa-solid fa-filter text-xs"></i>
              <span>Lọc kết quả</span>
            </button>
            <button id="shop-reset-btn" class="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs transition" title="Đặt lại bộ lọc">
              <i class="fa-solid fa-arrows-rotate"></i>
            </button>
          </div>

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
    const sortSelect = document.getElementById('shop-sort');
    const filterBtn = document.getElementById('shop-filter-btn');
    const resetBtn = document.getElementById('shop-reset-btn');

    if (filterBtn) {
      filterBtn.addEventListener('click', () => {
        ShopPage.currentParams.q = searchInput.value.trim();
        ShopPage.currentParams.category = categorySelect.value;
        ShopPage.currentParams.sort = sortSelect.value;
        ShopPage.currentParams.page = 1;
        ShopPage.loadProducts();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          if (filterBtn) filterBtn.click();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        categorySelect.value = 'all';
        sortSelect.value = 'newest';
        ShopPage.currentParams = {
          page: 1,
          limit: 12,
          q: '',
          category: 'all',
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

      if (products.length === 0) {
        container.innerHTML = UI.renderEmptyState(
          'fa-box-open',
          'Không tìm thấy sản phẩm phù hợp',
          'Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc danh mục.',
          'javascript:document.getElementById("shop-reset-btn").click()',
          'Xóa bộ lọc'
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
          <div class="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col justify-between group border border-amber-500/20">
            <div class="relative overflow-hidden bg-slate-950 h-52">
              <img src="${UI.escapeHTML(mainImg)}" alt="${UI.escapeHTML(p.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
              ${isOutOfStock
                ? '<span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/90 text-rose-400 border border-rose-500/40 text-[11px] font-bold shadow-md">HẾT HÀNG</span>'
                : (isSale ? '<span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-500/90 text-white text-[11px] font-bold shadow-md">GIẢM GIÁ</span>' : '')}
              <span class="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-900/80 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                ${UI.escapeHTML(p.pieceCount)} mảnh
              </span>
            </div>

            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between text-[11px] text-amber-400 mb-1">
                  <span class="font-semibold uppercase tracking-wider">${UI.escapeHTML(p.category)}</span>
                  <span><i class="fa-solid fa-star text-amber-400 mr-1"></i>${UI.escapeHTML(p.ratingAvg || 5.0)}</span>
                </div>
                <a href="#/product/${UI.escapeHTML(p.slug)}" class="font-heading font-bold text-base text-slate-100 hover:text-amber-400 transition line-clamp-1">
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
                <a href="#/product/${UI.escapeHTML(p.slug)}" class="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 transition text-xs font-semibold flex items-center space-x-1.5" title="Xem 3D & Mua">
                  <span>Xem 3D</span>
                  <i class="fa-solid fa-arrow-right text-[10px]"></i>
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

  destroy: () => {}
};

window.ShopPage = ShopPage;
