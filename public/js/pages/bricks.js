/**
 * Kho Gạch Lẻ Pick-a-Brick
 * Lưới thẻ, lọc theo màu, loại gạch, tìm theo mã/tên,
 * hiển thị tồn kho hiện tại, chọn số lượng, tự động polling refresh mỗi 30s.
 */
const BricksPage = {
  pollingTimer: null,
  searchDebounceTimer: null,
  cachedColors: [],
  cachedCategories: [],

  currentParams: {
    page: 1,
    limit: 24,
    q: '',
    color: 'all',
    category: 'all',
    inStock: false
  },

  render: async (container) => {
    container.innerHTML = `
      <div class="mb-8">
        <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
          <i class="fa-solid fa-layer-group"></i>
          <span>KHO CHI TIẾT TỰ DO (MOC)</span>
        </div>
        <h1 class="text-3xl font-extrabold font-heading text-slate-100">Kho Gạch Lẻ <span class="text-amber-400">Pick-a-Brick</span></h1>
        <p class="text-sm text-slate-400 font-lora mt-1">
          Hàng ngàn mã gạch tiêu chuẩn #3001, bánh răng Technic, chốt pin ma sát... Tự động cập nhật tồn kho theo thời gian thực.
        </p>
      </div>

      <!-- BỘ LỌC GẠCH LẺ -->
      <div class="glass-panel rounded-2xl p-4 sm:p-6 mb-8 border border-amber-500/20 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-center">

          <!-- 1. Tìm theo mã hoặc tên (4 cột) -->
          <div class="lg:col-span-4 relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <i class="fa-solid fa-magnifying-glass text-xs"></i>
            </span>
            <input type="text" id="brick-search" value="${UI.escapeHTML(BricksPage.currentParams.q || '')}" class="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition" placeholder="Nhập mã #3001 hoặc tên chi tiết...">
          </div>

          <!-- 2. Lọc loại gạch (3 cột) -->
          <div class="lg:col-span-3">
            <select id="brick-category" class="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition">
              <option value="all">Tất cả loại gạch</option>
              <option value="Gạch cơ bản (Standard)">Gạch cơ bản (Standard)</option>
              <option value="Tấm phẳng (Plates & Tiles)">Tấm phẳng (Plates & Tiles)</option>
              <option value="Kỹ thuật & Bánh răng (Technic)">Kỹ thuật & Bánh răng (Technic)</option>
              <option value="Khớp nối & Trục (Pins & Axles)">Khớp nối & Trục (Pins & Axles)</option>
              <option value="Trong suốt & Pha lê (Trans-Clear)">Trong suốt & Pha lê (Trans-Clear)</option>
              <option value="Đặc biệt & Chi tiết nhỏ">Đặc biệt & Chi tiết nhỏ</option>
            </select>
          </div>

          <!-- 3. Lọc màu sắc (2 cột) -->
          <div class="lg:col-span-2">
            <select id="brick-color" class="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition">
              <option value="all">Tất cả màu sắc</option>
            </select>
          </div>

          <!-- 4. Checkbox còn hàng & Nút đặt lại (3 cột) -->
          <div class="lg:col-span-3 flex items-center justify-between space-x-2">
            <label class="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer select-none">
              <input type="checkbox" id="brick-instock" ${BricksPage.currentParams.inStock ? 'checked' : ''} class="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-400">
              <span>Còn hàng</span>
            </label>

            <div class="flex items-center space-x-2">
              <button id="brick-reset-btn" onclick="BricksPage.resetFilters()" class="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 text-xs font-semibold transition flex items-center space-x-1" title="Đặt lại bộ lọc">
                <i class="fa-solid fa-rotate-right text-[11px]"></i>
                <span>Đặt lại</span>
              </button>

              <button id="brick-filter-btn" class="py-2 px-3.5 rounded-xl btn-gold text-slate-950 font-bold text-xs transition flex items-center space-x-1 shadow-md">
                <i class="fa-solid fa-filter text-[11px]"></i>
                <span>Lọc</span>
              </button>
            </div>
          </div>

        </div>

        <!-- Bảng Swatch Màu Nhanh & Trạng thái lọc -->
        <div class="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div id="color-swatches-container" class="flex items-center flex-wrap gap-1.5">
            <span class="text-slate-400 mr-1 text-[11px]">Bảng màu nhanh:</span>
            <!-- Render swatches qua JS -->
          </div>

          <div id="brick-filter-status" class="text-[11px] text-slate-400 whitespace-nowrap">
            Đang tải dữ liệu...
          </div>
        </div>
      </div>

      <!-- LƯỚI THẺ GẠCH LẺ -->
      <div id="bricks-grid-container" class="min-h-[400px]">
        ${UI.renderProductSkeleton(8)}
      </div>

      <!-- PHÂN TRANG -->
      <div id="bricks-pagination" class="mt-12 flex justify-center items-center space-x-2"></div>
    `;

    BricksPage.bindEvents();
    await BricksPage.loadBricks();

    // TỰ ĐỘNG LÀM MỚI TỒN KHO MỖI 30 GIÂY
    BricksPage.pollingTimer = setInterval(() => {
      BricksPage.loadBricks(true); // silent refresh
    }, 30000);
  },

  bindEvents: () => {
    const searchInput = document.getElementById('brick-search');
    const categorySelect = document.getElementById('brick-category');
    const colorSelect = document.getElementById('brick-color');
    const inStockCheck = document.getElementById('brick-instock');
    const filterBtn = document.getElementById('brick-filter-btn');

    // Đồng bộ giá trị từ currentParams
    if (categorySelect && BricksPage.currentParams.category) {
      categorySelect.value = BricksPage.currentParams.category;
    }
    if (colorSelect && BricksPage.currentParams.color) {
      colorSelect.value = BricksPage.currentParams.color;
    }

    const triggerFilter = () => {
      BricksPage.currentParams.q = searchInput ? searchInput.value.trim() : '';
      BricksPage.currentParams.category = categorySelect ? categorySelect.value : 'all';
      BricksPage.currentParams.color = colorSelect ? colorSelect.value : 'all';
      BricksPage.currentParams.inStock = inStockCheck ? inStockCheck.checked : false;
      BricksPage.currentParams.page = 1;
      BricksPage.loadBricks();
    };

    if (filterBtn) {
      filterBtn.addEventListener('click', triggerFilter);
    }

    // 1. Tự động tìm kiếm khi gõ (debounce 300ms)
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(BricksPage.searchDebounceTimer);
        BricksPage.searchDebounceTimer = setTimeout(triggerFilter, 300);
      });
      searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          clearTimeout(BricksPage.searchDebounceTimer);
          triggerFilter();
        }
      });
    }

    // 2. Tự động lọc khi đổi loại gạch
    if (categorySelect) {
      categorySelect.addEventListener('change', triggerFilter);
    }

    // 3. Tự động lọc khi đổi màu sắc
    if (colorSelect) {
      colorSelect.addEventListener('change', triggerFilter);
    }

    // 4. Tự động lọc khi tick checkbox còn hàng
    if (inStockCheck) {
      inStockCheck.addEventListener('change', triggerFilter);
    }
  },

  resetFilters: () => {
    BricksPage.currentParams = {
      page: 1,
      limit: 24,
      q: '',
      color: 'all',
      category: 'all',
      inStock: false
    };

    const searchInput = document.getElementById('brick-search');
    const categorySelect = document.getElementById('brick-category');
    const colorSelect = document.getElementById('brick-color');
    const inStockCheck = document.getElementById('brick-instock');

    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = 'all';
    if (colorSelect) colorSelect.value = 'all';
    if (inStockCheck) inStockCheck.checked = false;

    BricksPage.updateSwatchesUI();
    BricksPage.loadBricks();
  },

  loadBricks: async (isSilent = false) => {
    const container = document.getElementById('bricks-grid-container');
    const pagContainer = document.getElementById('bricks-pagination');
    const categorySelect = document.getElementById('brick-category');
    const colorSelect = document.getElementById('brick-color');
    const statusEl = document.getElementById('brick-filter-status');

    if (!container) return;

    if (!isSilent) {
      container.innerHTML = UI.renderProductSkeleton(8);
    }

    try {
      const res = await API.bricks.getAll(BricksPage.currentParams);
      if (!res.success || !res.data) {
        container.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi tải dữ liệu', 'Không thể kết nối kho gạch lẻ');
        return;
      }

      const { bricks = [], filters = {}, pagination = {} } = res.data;

      // Lưu cache colors & categories
      if (filters.colors && filters.colors.length > 0) {
        BricksPage.cachedColors = filters.colors;
      }
      if (filters.categories && filters.categories.length > 0) {
        BricksPage.cachedCategories = filters.categories;
      }

      // Nạp động dropdown category nếu chưa đủ
      if (categorySelect && BricksPage.cachedCategories.length > 0) {
        const currentVal = categorySelect.value || BricksPage.currentParams.category || 'all';
        const existingVals = Array.from(categorySelect.options).map(o => o.value);
        BricksPage.cachedCategories.forEach(cat => {
          if (!existingVals.includes(cat)) {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            categorySelect.appendChild(opt);
          }
        });
        categorySelect.value = currentVal;
      }

      // Nạp dropdown màu nếu chỉ có option "Tất cả"
      if (colorSelect && BricksPage.cachedColors.length > 0 && colorSelect.options.length <= 1) {
        BricksPage.cachedColors.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.name;
          opt.textContent = c.name;
          colorSelect.appendChild(opt);
        });
        colorSelect.value = BricksPage.currentParams.color || 'all';
      }

      // Render các swatch màu sắc
      BricksPage.updateSwatchesUI();

      // Cập nhật dòng trạng thái kết quả
      if (statusEl) {
        const total = pagination.total !== undefined ? pagination.total : bricks.length;
        statusEl.innerHTML = `Tìm thấy <strong class="text-amber-400 font-mono">${total}</strong> chi tiết gạch phù hợp`;
      }

      if (bricks.length === 0) {
        container.innerHTML = `
          <div class="glass-panel rounded-3xl p-10 text-center max-w-lg mx-auto border border-amber-500/20 my-8">
            <div class="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400 text-2xl">
              <i class="fa-solid fa-puzzle-piece"></i>
            </div>
            <h3 class="text-lg font-bold font-heading text-slate-100 mb-2">Không tìm thấy chi tiết gạch phù hợp</h3>
            <p class="text-xs text-slate-400 mb-6">
              Không có mã gạch nào khớp với bộ lọc hiện tại. Hãy thử tìm từ khóa khác hoặc xóa bộ lọc để xem toàn bộ kho.
            </p>
            <button onclick="BricksPage.resetFilters()" class="px-5 py-2.5 rounded-xl btn-gold text-slate-950 font-bold text-xs transition inline-flex items-center space-x-2">
              <i class="fa-solid fa-rotate-right"></i>
              <span>Xem Tất Cả Chi Tiết Gạch</span>
            </button>
          </div>
        `;
        if (pagContainer) pagContainer.innerHTML = '';
        return;
      }

      let html = '<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">';
      for (const b of bricks) {
        const isOutOfStock = b.stock <= 0;

        html += `
          <div class="glass-panel glass-panel-hover rounded-2xl p-5 border border-amber-500/20 flex flex-col justify-between group">
            <div>
              <!-- Header thẻ: Mã gạch & Màu sắc -->
              <div class="flex items-center justify-between mb-3">
                <span class="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
                  ${UI.escapeHTML(b.code)}
                </span>
                <button onclick="BricksPage.filterByColor('${UI.escapeHTML(b.color)}')" class="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-amber-400 transition" title="Lọc theo màu ${UI.escapeHTML(b.color)}">
                  <span class="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm" style="background-color: ${UI.escapeHTML(b.colorHex)}"></span>
                  <span class="text-[11px] truncate max-w-[100px]">${UI.escapeHTML(b.color)}</span>
                </button>
              </div>

              <!-- Tên gạch -->
              <h3 class="font-heading font-bold text-sm text-slate-100 group-hover:text-amber-400 transition line-clamp-2 leading-snug">
                ${UI.escapeHTML(b.name)}
              </h3>
              <button onclick="BricksPage.filterByCategory('${UI.escapeHTML(b.category)}')" class="text-[10px] text-slate-400 hover:text-amber-400 block mt-1 transition text-left" title="Lọc theo loại ${UI.escapeHTML(b.category)}">
                <i class="fa-solid fa-tag text-[9px] mr-1"></i>${UI.escapeHTML(b.category)}
              </button>
            </div>

            <div class="pt-4 mt-4 border-t border-slate-800/80 space-y-3">
              <!-- Giá và Trạng thái Tồn kho -->
              <div class="flex items-center justify-between">
                <span class="text-base font-extrabold text-amber-300 font-sans">
                  ${UI.formatCurrency(b.price)}<span class="text-[10px] text-slate-400 font-normal"> /viên</span>
                </span>
                <span class="text-xs font-medium ${isOutOfStock ? 'text-rose-400 font-bold' : (b.stock < 30 ? 'text-amber-400' : 'text-emerald-400')}">
                  ${isOutOfStock ? 'Hết hàng' : `Còn lại: <strong class="font-sans">${b.stock}</strong>`}
                </span>
              </div>

              <!-- Thêm vào giỏ -->
              <div class="flex items-center space-x-2">
                <input type="number" id="brick-qty-${b._id}" min="1" max="${b.stock || 1}" value="1" class="w-16 px-2 py-2 bg-slate-900 border border-slate-700 rounded-xl text-center text-xs font-bold text-slate-100 focus:outline-none focus:border-amber-400 font-mono" ${isOutOfStock ? 'disabled' : ''}>
                <button onclick="BricksPage.addToCart('${b._id}', '${UI.escapeHTML(b.name)}', ${b.price}, '${UI.escapeHTML(b.code)}', '${UI.escapeHTML(b.color)}', '${UI.escapeHTML(b.colorHex)}', ${b.stock})" class="flex-1 py-2 px-3 rounded-xl btn-gold text-slate-950 font-bold text-xs transition flex items-center justify-center space-x-1.5 ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : ''}" ${isOutOfStock ? 'disabled' : ''}>
                  <i class="fa-solid fa-cart-plus text-xs"></i>
                  <span>Thêm giỏ</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }
      html += '</div>';
      container.innerHTML = html;

      // Phân trang
      BricksPage.renderPagination(pagination);

    } catch (err) {
      if (!isSilent) {
        container.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi', err.message);
      }
    }
  },

  updateSwatchesUI: () => {
    const swatchesContainer = document.getElementById('color-swatches-container');
    if (!swatchesContainer) return;

    const currentColor = BricksPage.currentParams.color || 'all';
    const isAll = currentColor === 'all' || !currentColor;

    let swatchHtml = '<span class="text-slate-400 mr-1 text-[11px]">Bảng màu nhanh:</span>';
    swatchHtml += `
      <button class="px-2 py-0.5 rounded text-[10px] font-semibold transition ${isAll ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'}" onclick="BricksPage.filterByColor('all')">
        Tất cả
      </button>
    `;

    const colors = BricksPage.cachedColors || [];
    colors.slice(0, 10).forEach(c => {
      const isSelected = currentColor === c.name;
      swatchHtml += `
        <button class="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] transition ${isSelected ? 'bg-amber-500/25 border border-amber-400 text-amber-300 font-bold' : 'bg-slate-900 border border-slate-700 hover:border-amber-400/50 text-slate-300'}" onclick="BricksPage.filterByColor('${UI.escapeHTML(c.name)}')">
          <span class="w-2.5 h-2.5 rounded-full border border-white/20" style="background-color: ${UI.escapeHTML(c.hex)}"></span>
          <span>${UI.escapeHTML(c.name)}</span>
        </button>
      `;
    });

    swatchesContainer.innerHTML = swatchHtml;
  },

  filterByColor: (colorName) => {
    const colorSelect = document.getElementById('brick-color');
    if (colorSelect) colorSelect.value = colorName;
    BricksPage.currentParams.color = colorName;
    BricksPage.currentParams.page = 1;
    BricksPage.updateSwatchesUI();
    BricksPage.loadBricks();
  },

  filterByCategory: (categoryName) => {
    const categorySelect = document.getElementById('brick-category');
    if (categorySelect) categorySelect.value = categoryName;
    BricksPage.currentParams.category = categoryName;
    BricksPage.currentParams.page = 1;
    BricksPage.loadBricks();
  },

  renderPagination: (pagination) => {
    const pagContainer = document.getElementById('bricks-pagination');
    if (!pagContainer || pagination.totalPages <= 1) {
      if (pagContainer) pagContainer.innerHTML = '';
      return;
    }

    let html = '';
    const currentPage = pagination.page;
    const totalPages = pagination.totalPages;

    if (currentPage > 1) {
      html += `
        <button class="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:border-amber-400 transition" onclick="BricksPage.changePage(${currentPage - 1})">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
      `;
    }

    for (let i = 1; i <= Math.min(totalPages, 7); i++) {
      const isActive = i === currentPage;
      html += `
        <button class="px-3.5 py-2 rounded-xl text-xs font-bold transition ${isActive ? 'btn-gold text-slate-950' : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-amber-400'}" onclick="BricksPage.changePage(${i})">
          ${i}
        </button>
      `;
    }

    if (currentPage < totalPages) {
      html += `
        <button class="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:border-amber-400 transition" onclick="BricksPage.changePage(${currentPage + 1})">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      `;
    }

    pagContainer.innerHTML = html;
  },

  changePage: (newPage) => {
    BricksPage.currentParams.page = newPage;
    BricksPage.loadBricks();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  addToCart: async (brickId, name, price, code, color, colorHex, currentStock) => {
    const qtyInput = document.getElementById(`brick-qty-${brickId}`);
    const qty = parseInt(qtyInput ? qtyInput.value : 1, 10) || 1;

    if (qty > currentStock) {
      UI.toast('warning', `Chỉ còn ${currentStock} viên gạch ${name} trong kho`);
      return;
    }

    if (Store.isLoggedIn()) {
      try {
        const res = await API.cart.add('brick', brickId, qty);
        if (res.success) {
          UI.toast('success', `Đã thêm ${qty}x gạch "${code} - ${name}" vào giỏ hàng`);
          Store.setCartCount(res.data.itemCount);
        }
      } catch (err) {
        UI.toast('error', err.message);
      }
    } else {
      Store.addToLocalCart('brick', brickId, qty, {
        name,
        price,
        code,
        color,
        colorHex
      });
      UI.toast('success', `Đã lưu ${qty}x gạch "${code} - ${name}" vào giỏ hàng tạm`);
    }
  },

  destroy: () => {
    if (BricksPage.pollingTimer) {
      clearInterval(BricksPage.pollingTimer);
      BricksPage.pollingTimer = null;
    }
    clearTimeout(BricksPage.searchDebounceTimer);
  }
};

window.BricksPage = BricksPage;