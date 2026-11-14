/**
 * Trang chủ ToyBrick Studio
 * Hero 3D Viewer tương tác + Sản phẩm nổi bật + Khối O2O Quét QR + Kho gạch lẻ
 */
const HomePage = {
  viewerInstance: null,

  render: async (container) => {
    container.innerHTML = `
      <!-- HERO SECTION VỚI VIEWER 3D -->
      <section class="relative mb-16 rounded-3xl overflow-hidden glass-panel border border-amber-500/25 p-6 sm:p-10 shadow-2xl">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          <!-- Cột thông tin giới thiệu -->
          <div class="lg:col-span-5 space-y-6 z-10">
            <div class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>ĐỘC QUYỀN MÙA GIẢI 2026</span>
            </div>

            <h1 class="text-3xl sm:text-5xl font-extrabold font-heading text-slate-100 tracking-tight leading-tight">
              Siêu Xe F1 Technic <br>
              <span class="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                Vô Địch Tốc Độ
              </span>
            </h1>

            <p class="text-sm sm:text-base text-slate-300 font-lora leading-relaxed">
              Mô hình 1.639 mảnh ghép chuẩn Technic. Khám phá từng cơ cấu truyền động và khí động học ngay trong không gian 3D tương tác đa chiều.
            </p>

            <div class="flex flex-wrap items-center gap-4 pt-2">
              <a href="#/shop" class="px-6 py-3.5 rounded-xl btn-gold text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/25 transition flex items-center space-x-2">
                <span>Khám phá bộ sưu tập</span>
                <i class="fa-solid fa-arrow-right text-xs"></i>
              </a>
              <a href="#/bricks" class="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-amber-400 font-semibold text-sm border border-amber-500/30 transition flex items-center space-x-2">
                <i class="fa-solid fa-puzzle-piece text-xs"></i>
                <span>Mua gạch lẻ MOC</span>
              </a>
            </div>

            <!-- Cam kết chất lượng -->
            <div class="grid grid-cols-3 gap-4 pt-6 border-t border-slate-700/60 text-xs text-slate-400">
              <div>
                <p class="text-slate-100 font-bold text-base font-sans">1.639</p>
                <p>Mảnh ghép</p>
              </div>
              <div>
                <p class="text-slate-100 font-bold text-base font-sans">1:8</p>
                <p>Tỉ lệ chuẩn F1</p>
              </div>
              <div>
                <p class="text-slate-100 font-bold text-base font-sans">360°</p>
                <p>Tương tác 3D</p>
              </div>
            </div>
          </div>

          <!-- Cột Khung Viewer 3D tương tác -->
          <div class="lg:col-span-7 relative">
            <div class="relative w-full h-[380px] sm:h-[460px] rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-amber-500/20 overflow-hidden shadow-inner flex flex-col justify-between">

              <!-- Badge trạng thái 3D -->
              <div class="p-4 flex items-center justify-between z-10 pointer-events-none">
                <span class="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-[11px] font-semibold text-slate-300">
                  <i class="fa-solid fa-cube text-amber-400 mr-1.5"></i>3D Interactive WebGL
                </span>
                <span class="text-[11px] text-slate-400 hidden sm:inline">
                  Kéo chuột xoay • Cuộn zoom
                </span>
              </div>

              <!-- Canvas Container Three.js -->
              <div id="hero-3d-container" class="absolute inset-0 w-full h-full"></div>

              <!-- Thanh công cụ điều khiển 3D -->
              <div class="p-4 flex items-center justify-center space-x-3 z-10">
                <button id="hero-explode-btn" class="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-300 font-semibold text-xs transition flex items-center space-x-2 backdrop-blur-md shadow-lg">
                  <i class="fa-solid fa-arrows-split-up-and-left"></i>
                  <span id="hero-explode-text">Bung tách chi tiết</span>
                </button>
                <button id="hero-reset-btn" class="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-300 text-xs transition backdrop-blur-md" title="Đặt lại góc nhìn">
                  <i class="fa-solid fa-rotate-right"></i>
                </button>
                <a href="#/product/sieu-xe-f1-technic-vo-dich-2026" class="px-4 py-2 rounded-xl btn-gold text-slate-950 font-bold text-xs transition flex items-center space-x-1.5 shadow-lg">
                  <span>Chi tiết & Đặt mua</span>
                  <i class="fa-solid fa-cart-plus text-[10px]"></i>
                </a>
              </div>

            </div>
          </div>

        </div>
      </section>

      <!-- KHỐI SẢN PHẨM NỔI BẬT -->
      <section class="mb-16">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
              Mô Hình <span class="text-amber-400">Đặc Sắc</span>
            </h2>
            <p class="text-xs sm:text-sm text-slate-400 font-lora mt-1">Những kiệt tác lắp ráp đỉnh cao được săn đón nhất tuần qua</p>
          </div>
          <a href="#/shop" class="mt-4 sm:mt-0 text-xs sm:text-sm font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1 group">
            <span>Xem tất cả sản phẩm</span>
            <i class="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
          </a>
        </div>

        <div id="featured-products-container">
          ${UI.renderProductSkeleton(4)}
        </div>
      </section>

      <!-- KHỐI TRẢI NGHIỆM O2O QUÉT QR TẠI CỬA HÀNG -->
      <section class="mb-16 glass-panel rounded-3xl p-6 sm:p-10 border border-sky-500/25 relative overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div class="md:col-span-8 space-y-4">
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold">
              <i class="fa-solid fa-qrcode"></i>
              <span>TRẢI NGHIỆM O2O TẠI SHOWROOM</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
              Quét QR Tại Quầy — Chiêm Ngưỡng 3D Liền Tay
            </h2>
            <p class="text-sm text-slate-300 font-lora leading-relaxed max-w-2xl">
              Đang đứng trước kệ hàng của ToyBrick Studio? Hãy dùng camera quét mã QR dán trên vỏ hộp sản phẩm để xem trước mô hình 3D, kiểm tra từng mảnh ghép và xem cấu trúc bung tách trước khi quyết định rước về nhà!
            </p>
            <div class="pt-2">
              <a href="#/qr" class="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-cyan-400 transition">
                <i class="fa-solid fa-camera"></i>
                <span>Mở máy quét QR / Tra cứu mã</span>
              </a>
            </div>
          </div>
          <div class="md:col-span-4 flex justify-center">
            <div class="w-44 h-44 rounded-2xl bg-white p-3 shadow-2xl flex flex-col items-center justify-center border-4 border-amber-400">
              <i class="fa-solid fa-qrcode text-8xl text-slate-900"></i>
              <span class="text-[10px] text-slate-600 font-bold mt-1 tracking-wider uppercase">TOYBRICK SCANNER</span>
            </div>
          </div>
        </div>
      </section>

      <!-- KHỐI GIỚI THIỆU KHO GẠCH LẺ PICK-A-BRICK -->
      <section class="rounded-3xl glass-panel p-6 sm:p-10 border border-amber-500/25 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-2 max-w-xl">
            <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">Kho MOC Tự Do</span>
            <h3 class="text-2xl sm:text-3xl font-heading font-extrabold text-slate-100">Pick-a-Brick: Tìm Từng Viên Gạch Riêng Lẻ</h3>
            <p class="text-sm text-slate-300 font-lora">
              Bị thiếu một chốt pin, bánh răng cơ khí hay viên ngọc pha lê trong suốt? Kho gạch lẻ chuẩn mã #3001, #3002 luôn có sẵn số lượng lớn cho bạn.
            </p>
          </div>
          <a href="#/bricks" class="px-6 py-3.5 rounded-xl btn-gold text-slate-950 font-bold text-sm shadow-xl whitespace-nowrap flex items-center space-x-2">
            <span>Truy cập Kho Gạch Lẻ</span>
            <i class="fa-solid fa-arrow-right text-xs"></i>
          </a>
        </div>
      </section>
    `;

    // 1. Tải dữ liệu F1 và khởi động 3D Viewer
    try {
      const f1Res = await API.products.getBySlug('sieu-xe-f1-technic-vo-dich-2026');
      const container3D = document.getElementById('hero-3d-container');
      if (container3D && f1Res.success && f1Res.data) {
        HomePage.viewerInstance = new ToyBrickViewer3D(container3D, f1Res.data.model3d, {
          cameraDistance: 6.8,
          autoRotateSpeed: 0.004
        });

        const explodeBtn = document.getElementById('hero-explode-btn');
        const explodeText = document.getElementById('hero-explode-text');
        const resetBtn = document.getElementById('hero-reset-btn');

        if (explodeBtn) {
          explodeBtn.addEventListener('click', () => {
            const isExploded = HomePage.viewerInstance.toggleExplode();
            explodeText.textContent = isExploded ? 'Gộp chi tiết lại' : 'Bung tách chi tiết';
          });
        }

        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            HomePage.viewerInstance.resetView();
          });
        }
      }
    } catch (e) {
      console.warn('[Home Viewer Error]', e.message);
    }

    // 2. Nạp danh sách sản phẩm nổi bật
    try {
      const prodRes = await API.products.getAll({ limit: 4, sort: 'rating' });
      const prodContainer = document.getElementById('featured-products-container');
      if (prodContainer && prodRes.success && prodRes.data) {
        const products = prodRes.data.products || [];
        if (products.length === 0) {
          prodContainer.innerHTML = UI.renderEmptyState('fa-box-open', 'Chưa có sản phẩm', 'Hệ thống đang cập nhật danh mục mới');
          return;
        }

        let html = '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">';
        for (const p of products) {
          const mainImg = (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80';
          const isSale = p.salePrice && p.salePrice < p.price;
          const displayPrice = isSale ? p.salePrice : p.price;

          html += `
            <div class="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col justify-between group border border-amber-500/20 transition-all duration-300">
              <a href="#/product/${UI.escapeHTML(p.slug)}" class="block relative overflow-hidden bg-slate-950 h-52 group/img cursor-pointer" title="Xem chi tiết & Mô hình 3D">
                <img src="${UI.escapeHTML(mainImg)}" alt="${UI.escapeHTML(p.name)}" class="w-full h-full object-cover group-hover/img:scale-108 transition-transform duration-500" loading="lazy">
                <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <span class="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg flex items-center space-x-1.5 transform translate-y-2 group-hover/img:translate-y-0 transition-transform">
                    <i class="fa-solid fa-cube text-xs"></i>
                    <span>Xem 3D Chi Tiết</span>
                  </span>
                </div>
                ${isSale ? '<span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-500/90 text-white text-[11px] font-bold shadow-md">GIẢM GIÁ</span>' : ''}
                <span class="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-900/80 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  ${UI.escapeHTML(p.pieceCount)} mảnh
                </span>
              </a>

              <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span class="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block mb-1">${UI.escapeHTML(p.category)}</span>
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
        prodContainer.innerHTML = html;
      }
    } catch (e) {
      console.error('[Featured Products Error]', e.message);
    }
  },

  destroy: () => {
    if (HomePage.viewerInstance) {
      HomePage.viewerInstance.destroy();
      HomePage.viewerInstance = null;
    }
  }
};

window.HomePage = HomePage;
