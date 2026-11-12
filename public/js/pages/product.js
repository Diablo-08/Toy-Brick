/**
 * Trang Chi Tiết Sản Phẩm (Product Detail)
 * Khung Viewer 3D tương tác độc lập + Nút Bung tách + Tồn kho thật + Thêm giỏ
 */
const ProductPage = {
  viewerInstance: null,
  currentProduct: null,
  selectedQty: 1,

  render: async (container, params) => {
    const slug = params && params.slug;
    if (!slug) {
      container.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Thiếu thông tin', 'Không tìm thấy mã sản phẩm', '#/shop', 'Về cửa hàng');
      return;
    }

    container.innerHTML = `
      <div class="py-12 flex justify-center items-center">
        <div class="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    `;

    try {
      const res = await API.products.getBySlug(slug);
      if (!res.success || !res.data) {
        container.innerHTML = UI.renderEmptyState('fa-box-open', 'Sản phẩm không tồn tại', 'Mặt hàng này có thể đã bị xóa hoặc ngừng kinh doanh.', '#/shop', 'Xem các mẫu khác');
        return;
      }

      const product = res.data;
      ProductPage.currentProduct = product;
      ProductPage.selectedQty = 1;

      const isSale = product.salePrice && product.salePrice < product.price;
      const displayPrice = isSale ? product.salePrice : product.price;
      const isOutOfStock = product.stock <= 0;

      container.innerHTML = `
        <!-- BREADCRUMB -->
        <nav class="flex items-center space-x-2 text-xs text-slate-400 mb-6">
          <a href="#/" class="hover:text-amber-400 transition">Trang chủ</a>
          <i class="fa-solid fa-chevron-right text-[10px]"></i>
          <a href="#/shop" class="hover:text-amber-400 transition">Mô hình Set</a>
          <i class="fa-solid fa-chevron-right text-[10px]"></i>
          <span class="text-amber-300 font-medium truncate max-w-xs">${UI.escapeHTML(product.name)}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">

          <!-- KHUNG VIEWER 3D SẢN PHẨM (7 CỘT) -->
          <div class="lg:col-span-7 glass-panel rounded-3xl p-4 sm:p-6 border border-amber-500/25 shadow-2xl relative">
            <div class="relative w-full h-[400px] sm:h-[500px] rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800 overflow-hidden shadow-inner flex flex-col justify-between">

              <!-- Badge 3D Header -->
              <div class="p-4 flex items-center justify-between z-10 pointer-events-none">
                <span class="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-[11px] font-semibold text-slate-200 backdrop-blur-md">
                  <i class="fa-solid fa-cube text-amber-400 mr-1.5"></i>Mô hình 3D chuẩn tỉ lệ
                </span>
                <span class="text-[11px] text-slate-400 backdrop-blur-md px-2 py-1 rounded bg-slate-900/60 hidden sm:inline">
                  Xoay 360° • Phóng to / Thu nhỏ
                </span>
              </div>

              <!-- Canvas Three.js -->
              <div id="product-3d-canvas" class="absolute inset-0 w-full h-full"></div>

              <!-- Thanh nút tương tác 3D -->
              <div class="p-4 flex items-center justify-center space-x-3 z-10">
                <button id="prod-explode-btn" class="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-300 font-semibold text-xs transition flex items-center space-x-2 backdrop-blur-md shadow-lg">
                  <i class="fa-solid fa-arrows-split-up-and-left"></i>
                  <span id="prod-explode-text">Bung tách chi tiết</span>
                </button>
                <button id="prod-reset-btn" class="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-300 text-xs transition backdrop-blur-md" title="Đặt lại góc nhìn">
                  <i class="fa-solid fa-rotate-right"></i>
                </button>
              </div>

            </div>

            <div class="mt-4 flex items-center justify-between text-xs text-slate-400 px-2">
              <span>SKU: <strong class="text-slate-200 font-mono">${UI.escapeHTML(product.sku || 'N/A')}</strong></span>
              <span>Mã QR: <strong class="text-amber-400 font-mono">${UI.escapeHTML(product.qrCode || 'N/A')}</strong></span>
            </div>
          </div>

          <!-- THÔNG TIN SẢN PHẨM & MUA HÀNG (5 CỘT) -->
          <div class="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/25 space-y-6">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">${UI.escapeHTML(product.category)}</span>
                <div class="flex items-center space-x-1 text-xs text-amber-400">
                  <i class="fa-solid fa-star"></i>
                  <span class="font-bold">${UI.escapeHTML(product.ratingAvg || 5.0)}</span>
                  <span class="text-slate-400">(${UI.escapeHTML(product.ratingCount || 0)} đánh giá)</span>
                </div>
              </div>

              <h1 class="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100 leading-snug">
                ${UI.escapeHTML(product.name)}
              </h1>
            </div>

            <!-- GIÁ TIỀN -->
            <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-baseline space-x-3">
              <span class="text-2xl sm:text-3xl font-extrabold text-amber-300 font-sans">
                ${UI.formatCurrency(displayPrice)}
              </span>
              ${isSale ? `
                <span class="text-sm text-slate-500 line-through font-sans">
                  ${UI.formatCurrency(product.price)}
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  TIẾT KIỆM ${UI.formatCurrency(product.price - product.salePrice)}
                </span>
              ` : ''}
            </div>

            <!-- THÔNG SỐ KỸ THUẬT -->
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span class="text-slate-400 block mb-0.5">Số mảnh ghép:</span>
                <span class="text-slate-100 font-bold font-sans text-sm">${UI.escapeHTML(product.pieceCount)} chi tiết</span>
              </div>
              <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span class="text-slate-400 block mb-0.5">Độ tuổi phù hợp:</span>
                <span class="text-slate-100 font-bold font-sans text-sm">${UI.escapeHTML(product.ageRange || '8+')}</span>
              </div>
            </div>

            <!-- TÌNH TRẠNG TỒN KHO THẬT -->
            <div class="flex items-center space-x-2 text-xs">
              <span class="w-2.5 h-2.5 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'}"></span>
              <span class="font-medium">
                ${isOutOfStock ? '<span class="text-rose-400 font-bold">Tạm thời hết hàng</span>' : `Tình trạng: <strong class="text-emerald-400">Còn hàng (${product.stock} bộ có sẵn)</strong>`}
              </span>
            </div>

            <!-- CHỌN SỐ LƯỢNG & NÚT THÊM GIỎ -->
            <div class="space-y-4 pt-4 border-t border-slate-800">
              <div class="flex items-center space-x-4">
                <label class="text-xs font-semibold text-slate-300">Số lượng:</label>
                <div class="flex items-center border border-slate-700 rounded-xl overflow-hidden bg-slate-900">
                  <button id="qty-minus-btn" class="px-3.5 py-2 text-slate-400 hover:text-white hover:bg-slate-800 transition" ${isOutOfStock ? 'disabled' : ''}>
                    <i class="fa-solid fa-minus text-xs"></i>
                  </button>
                  <span id="qty-display" class="px-4 py-2 text-xs font-bold text-slate-100 min-w-[40px] text-center font-mono">1</span>
                  <button id="qty-plus-btn" class="px-3.5 py-2 text-slate-400 hover:text-white hover:bg-slate-800 transition" ${isOutOfStock ? 'disabled' : ''}>
                    <i class="fa-solid fa-plus text-xs"></i>
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button id="add-to-cart-btn" class="py-3.5 px-4 rounded-xl btn-gold text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/25 transition flex items-center justify-center space-x-2 ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}" ${isOutOfStock ? 'disabled' : ''}>
                  <i class="fa-solid fa-cart-shopping"></i>
                  <span>Thêm vào giỏ hàng</span>
                </button>
                <button id="buy-now-btn" class="py-3.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-amber-400 border border-amber-500/40 font-bold text-xs transition flex items-center justify-center space-x-2 ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}" ${isOutOfStock ? 'disabled' : ''}>
                  <i class="fa-solid fa-bolt"></i>
                  <span>Mua ngay</span>
                </button>
              </div>
            </div>

            <!-- MÔ TẢ CHI TIẾT -->
            <div class="pt-6 border-t border-slate-800 space-y-2">
              <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Mô tả sản phẩm</h3>
              <p class="text-xs sm:text-sm text-slate-300 font-lora leading-relaxed whitespace-pre-line">
                ${UI.escapeHTML(product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.')}
              </p>
            </div>

          </div>

        </div>
      `;

      // Khởi tạo 3D Viewer
      const canvasContainer = document.getElementById('product-3d-canvas');
      if (canvasContainer && product.model3d) {
        ProductPage.viewerInstance = new ToyBrickViewer3D(canvasContainer, product.model3d, {
          cameraDistance: 7,
          autoRotateSpeed: 0.005
        });

        const explodeBtn = document.getElementById('prod-explode-btn');
        const explodeText = document.getElementById('prod-explode-text');
        const resetBtn = document.getElementById('prod-reset-btn');

        if (explodeBtn) {
          explodeBtn.addEventListener('click', () => {
            const isExploded = ProductPage.viewerInstance.toggleExplode();
            explodeText.textContent = isExploded ? 'Gộp chi tiết lại' : 'Bung tách chi tiết';
          });
        }

        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            ProductPage.viewerInstance.resetView();
          });
        }
      }

      // Xử lý nút tăng giảm số lượng
      const minusBtn = document.getElementById('qty-minus-btn');
      const plusBtn = document.getElementById('qty-plus-btn');
      const qtyDisplay = document.getElementById('qty-display');

      if (minusBtn && plusBtn && qtyDisplay) {
        minusBtn.addEventListener('click', () => {
          if (ProductPage.selectedQty > 1) {
            ProductPage.selectedQty--;
            qtyDisplay.textContent = ProductPage.selectedQty;
          }
        });

        plusBtn.addEventListener('click', () => {
          if (ProductPage.selectedQty < product.stock) {
            ProductPage.selectedQty++;
            qtyDisplay.textContent = ProductPage.selectedQty;
          } else {
            UI.toast('warning', `Chỉ còn ${product.stock} bộ trong kho`);
          }
        });
      }

      // Xử lý Thêm Giỏ Hàng
      const addBtn = document.getElementById('add-to-cart-btn');
      if (addBtn) {
        addBtn.addEventListener('click', async () => {
          if (isOutOfStock) return;

          if (Store.isLoggedIn()) {
            try {
              const resAdd = await API.cart.add('product', product._id, ProductPage.selectedQty);
              if (resAdd.success) {
                UI.toast('success', `Đã thêm ${ProductPage.selectedQty}x "${product.name}" vào giỏ hàng`);
                Store.setCartCount(resAdd.data.itemCount);
              }
            } catch (err) {
              UI.toast('error', err.message);
            }
          } else {
            // Lưu LocalStorage khi chưa login
            Store.addToLocalCart('product', product._id, ProductPage.selectedQty, {
              name: product.name,
              price: displayPrice,
              code: product.sku,
              image: (product.images && product.images[0]) || ''
            });
            UI.toast('success', `Đã lưu ${ProductPage.selectedQty}x "${product.name}" vào giỏ hàng tạm`);
          }
        });
      }

      // Xử lý Mua Ngay
      const buyBtn = document.getElementById('buy-now-btn');
      if (buyBtn) {
        buyBtn.addEventListener('click', async () => {
          if (isOutOfStock) return;
          if (addBtn) addBtn.click();
          window.location.hash = '#/cart';
        });
      }

    } catch (err) {
      container.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi tải trang', err.message);
    }
  },

  destroy: () => {
    if (ProductPage.viewerInstance) {
      ProductPage.viewerInstance.destroy();
      ProductPage.viewerInstance = null;
    }
  }
};

window.ProductPage = ProductPage;
