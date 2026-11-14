/**
 * Kho Gạch Lẻ Pick-a-Brick
 * Lưới thẻ, lọc theo màu, loại gạch, tìm theo mã/tên,
 * hiển thị tồn kho hiện tại, chọn số lượng, tự động polling refresh mỗi 30s.
 */
const BricksPage = {
  pollingTimer: null,
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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <!-- Tìm theo mã hoặc tên -->
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <i class="fa-solid fa-magnifying-glass text-xs"></i>
            </span>
            <input type="text" id="brick-search" class="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition" placeholder="Nhập mã #3001 hoặc tên gạch...">
          </div>

          <!-- Lọc loại gạch -->
          <div>
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

          <!-- Lọc màu sắc -->
          <div>
            <select id="brick-color" class="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition">
              <option value="all">Tất cả màu sắc</option>
              <!-- Nạp động qua API -->
            </select>
          </div>

          <!-- Nút lọc & Checkbox còn hàng -->
          <div class="flex items-center space-x-3">
            <label class="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer select-none">
              <input type="checkbox" id="brick-instock" class="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-400">
              <span>Chỉ còn hàng</span>
            </label>

            <button id="brick-filter-btn" class="flex-1 py-2 rounded-xl btn-gold text-slate-950 font-bold text-xs transition flex items-center justify-center space-x-1.5">
              <i class="fa-solid fa-filter text-xs"></i>
              <span>Lọc</span>
            </button>
          </div>

        </div>

        <!-- Bảng Swatch Màu Nhanh -->
        <div id="color-swatches-container" class="pt-3 border-t border-slate-800 flex items-center flex-wrap gap-2 text-xs">
          <span class="text-slate-400 mr-2 text-[11px]">Bảng màu nhanh:</span>
          <!-- Render các nút chấm tròn swatch màu sắc -->
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

  loadBricks: async (isSilent = false) => {
    const container = document.getElementById('bricks-grid-container');
    const pagContainer = document.getElementById('bricks-pagination');
    const colorSelect = document.getElementById('brick-color');
    const swatchesContainer = document.getElementById('color-swatches-container');

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

      // Nạp dropdown màu và swatch màu nếu có
      if (filters.colors && colorSelect && colorSelect.options.length <= 1) {
        filters.colors.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.name;
          opt.textContent = c.name;
          colorSelect.appendChild(opt);
        });

        if (swatchesContainer) {
          let swatchHtml = '<span class="text-slate-400 mr-2 text-[11px]">Bảng màu nhanh:</span>';
          swatchHtml += `
            <button class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700" onclick="BricksPage.filterByColor('all')">
              Tất cả
            </button>
          `;
          filters.colors.slice(0, 8).forEach(c => {
            swatchHtml += `
              <button class="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 transition" onclick="BricksPage.filterByColor('${UI.escapeHTML(c.name)}')">
                <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${UI.escapeHTML(c.hex)}"></span>
                <span>${UI.escapeHTML(c.name)}</span>
              </button>
            `;
          });
          swatchesContainer.innerHTML = swatchHtml;
        }
      }

      if (bricks.length === 0) {
        container.innerHTML = UI.renderEmptyState(
          'fa-puzzle-piece',
          'Không tìm thấy chi tiết gạch',
          'Hãy thử thay đổi mã hoặc màu sắc đang tìm kiếm.'
        );
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
                <div class="flex items-center space-x-1.5 text-xs text-slate-300">
                  <span class="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm" style="background-color: ${UI.escapeHTML(b.colorHex)}"></span>
                  <span class="text-[11px] truncate max-w-[100px]">${UI.escapeHTML(b.color)}</span>
                </div>
              </div>

              <!-- Tên gạch -->
              <h3 class="font-heading font-bold text-sm text-slate-100 group-hover:text-amber-400 transition line-clamp-2 leading-snug">
                ${UI.escapeHTML(b.name)}
              </h3>
              <span class="text-[10px] text-slate-400 block mt-1">${UI.escapeHTML(b.category)}</span>
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

  filterByColor: (colorName) => {
    const colorSelect = document.getElementById('brick-color');
    if (colorSelect) colorSelect.value = colorName;
    BricksPage.currentParams.color = colorName;
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
