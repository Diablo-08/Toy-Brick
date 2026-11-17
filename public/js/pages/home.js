/**
 * Trang chủ ToyBrick Studio
 * Hero Carousel 3D với 3 vật phẩm nổi bật + Các nút mũi tên chuyển qua lại
 * Khung Viewer 3D tương tác độc lập + Nút Bung tách chi tiết
 * Khối O2O Quét QR + Kho gạch lẻ Pick-a-Brick
 */
const HomePage = {
  viewerInstance: null,
  currentIndex: 0,
  autoSlideTimer: null,
  isTransitioning: false,

  featuredItems: [
    {
      id: 'f1',
      slug: 'sieu-xe-f1-technic-vo-dich-2026',
      badge: 'ĐỘC QUYỀN MÙA GIẢI 2026',
      badgeClass: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      titleMain: 'Siêu Xe F1 Technic',
      titleHighlight: 'Vô Địch Tốc Độ',
      gradientClass: 'from-amber-400 via-yellow-200 to-amber-500',
      description: 'Mô hình 1.639 mảnh ghép chuẩn Technic. Khám phá từng cơ cấu truyền động và khí động học ngay trong không gian 3D tương tác đa chiều.',
      stats: [
        { value: '1.639', label: 'Mảnh ghép' },
        { value: '1:8', label: 'Tỉ lệ chuẩn F1' },
        { value: '360°', label: 'Tương tác 3D' }
      ],
      cameraDistance: 6.8,
      model3d: {
        parts: [
          { name: 'Khung gầm chính', shape: 'box', size: [1.4, 0.25, 4.2], position: [0, 0.2, 0], explodeOffset: [0, -0.6, 0], color: '#111827' },
          { name: 'Khoang lái Aero', shape: 'box', size: [1.1, 0.45, 1.8], position: [0, 0.5, -0.2], explodeOffset: [0, 0.8, 0], color: '#f59e0b' },
          { name: 'Vòng bảo vệ Halo', shape: 'cylinder', size: [0.12, 0.12, 1.0], position: [0, 0.85, 0.2], explodeOffset: [0, 1.2, 0], color: '#e2e8f0' },
          { name: 'Mũi xe khí động', shape: 'box', size: [0.9, 0.25, 1.5], position: [0, 0.28, 2.3], explodeOffset: [0, 0, 1.2], color: '#f59e0b' },
          { name: 'Cánh gió trước', shape: 'box', size: [2.6, 0.1, 0.7], position: [0, 0.15, 3.0], explodeOffset: [0, -0.2, 1.6], color: '#0284c7' },
          { name: 'Cánh gió DRS sau', shape: 'box', size: [2.2, 0.5, 0.6], position: [0, 1.0, -2.1], explodeOffset: [0, 1.4, -1.2], color: '#f59e0b' },
          { name: 'Giá đỡ cánh sau', shape: 'box', size: [0.3, 0.7, 0.2], position: [0, 0.6, -2.0], explodeOffset: [0, 0.5, -0.8], color: '#334155' },
          { name: 'Bánh trước (Trái)', shape: 'cylinder', size: [0.55, 0.55, 0.45], position: [-1.3, 0.35, 1.8], explodeOffset: [-1.2, 0, 0.2], color: '#1e293b' },
          { name: 'Bánh trước (Phải)', shape: 'cylinder', size: [0.55, 0.55, 0.45], position: [1.3, 0.35, 1.8], explodeOffset: [1.2, 0, 0.2], color: '#1e293b' },
          { name: 'Bánh sau (Trái)', shape: 'cylinder', size: [0.65, 0.65, 0.6], position: [-1.4, 0.4, -1.6], explodeOffset: [-1.3, 0, -0.3], color: '#1e293b' },
          { name: 'Bánh sau (Phải)', shape: 'cylinder', size: [0.65, 0.65, 0.6], position: [1.4, 0.4, -1.6], explodeOffset: [1.3, 0, -0.3], color: '#1e293b' },
          { name: 'Khối động cơ V6 Turbo', shape: 'box', size: [0.9, 0.6, 1.1], position: [0, 0.55, -1.1], explodeOffset: [0, 1.0, -0.4], color: '#ef4444' }
        ]
      }
    },
    {
      id: 'space',
      slug: 'tram-vu-tru-khong-gian-orbital-x',
      badge: 'THÁM HIỂM THIÊN HÀ 2026',
      badgeClass: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
      titleMain: 'Trạm Vũ Trụ Không Gian',
      titleHighlight: 'Orbital-X Tiên Tiến',
      gradientClass: 'from-sky-400 via-cyan-200 to-blue-500',
      description: 'Tái hiện chân thực trạm nghiên cứu quỹ đạo với 4 module khoang khoa học, tấm pin năng lượng mặt trời xoay 360 độ và đài quan sát kính vòm thiên văn.',
      stats: [
        { value: '1.250', label: 'Mảnh ghép' },
        { value: '4 Khoang', label: 'Module vi mô' },
        { value: '360°', label: 'Pin mặt trời' }
      ],
      cameraDistance: 6.5,
      model3d: {
        parts: [
          { name: 'Khoang lõi trung tâm', shape: 'cylinder', size: [0.8, 0.8, 2.5], position: [0, 0, 0], explodeOffset: [0, 0, 0], color: '#e2e8f0' },
          { name: 'Module sinh hoạt Alpha', shape: 'box', size: [1.0, 1.0, 1.2], position: [-1.5, 0, 0], explodeOffset: [-1.2, 0, 0], color: '#38bdf8' },
          { name: 'Module nghiên cứu Beta', shape: 'box', size: [1.0, 1.0, 1.2], position: [1.5, 0, 0], explodeOffset: [1.2, 0, 0], color: '#38bdf8' },
          { name: 'Tấm pin mặt trời Cánh Trái', shape: 'box', size: [3.0, 0.08, 1.0], position: [0, 1.6, 0], explodeOffset: [0, 1.2, 0], color: '#0284c7' },
          { name: 'Tấm pin mặt trời Cánh Phải', shape: 'box', size: [3.0, 0.08, 1.0], position: [0, -1.6, 0], explodeOffset: [0, -1.2, 0], color: '#0284c7' },
          { name: 'Đài quan sát Kính Vòm', shape: 'cylinder', size: [0.6, 0.6, 0.6], position: [0, 0, 1.5], explodeOffset: [0, 0, 1.0], color: '#f59e0b' }
        ]
      }
    },
    {
      id: 'tower',
      slug: 'thap-dong-ho-di-san-co-dien',
      badge: 'KIỆT TÁC KIẾN TRÚC GOTHIC',
      badgeClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      titleMain: 'Tháp Đồng Hồ Di Sản',
      titleHighlight: 'Kỳ Quan Gothic Cổ Điển',
      gradientClass: 'from-amber-300 via-yellow-100 to-emerald-400',
      description: 'Tác phẩm kiến trúc Gothic tinh xảo với hơn 2.100 mảnh ghép. Mặt đồng hồ 4 hướng phát quang trong đêm, mái vòm bằng đồng cổ kính và nội thất cơ cấu bánh răng chuyển động.',
      stats: [
        { value: '2.160', label: 'Mảnh ghép' },
        { value: '4 Hướng', label: 'Mặt đồng hồ' },
        { value: 'Chuẩn', label: 'Tỉ lệ Gothic' }
      ],
      cameraDistance: 8.5,
      model3d: {
        parts: [
          { name: 'Chân đế móng đá', shape: 'box', size: [2.2, 0.8, 2.2], position: [0, -1.6, 0], explodeOffset: [0, -0.6, 0], color: '#64748b' },
          { name: 'Thân tháp tầng 1', shape: 'box', size: [1.8, 1.6, 1.8], position: [0, -0.4, 0], explodeOffset: [0, -0.2, 0], color: '#d97706' },
          { name: 'Thân tháp tầng 2 hoa văn', shape: 'box', size: [1.6, 1.4, 1.6], position: [0, 1.1, 0], explodeOffset: [0, 0.4, 0], color: '#b45309' },
          { name: 'Hộp mặt đồng hồ 4 hướng', shape: 'box', size: [1.7, 1.0, 1.7], position: [0, 2.3, 0], explodeOffset: [0, 0.9, 0], color: '#fef08a' },
          { name: 'Mái chóp Gothic vươn cao', shape: 'cylinder', size: [1.2, 0.1, 1.8], position: [0, 3.6, 0], explodeOffset: [0, 1.6, 0], color: '#0f766e' }
        ]
      }
    }
  ],

  render: async (container) => {
    HomePage.currentIndex = 0;
    const initialItem = HomePage.featuredItems[0];

    container.innerHTML = `
      <!-- HERO SECTION BANNER VỚI CAROUSEL 3 VẬT PHẨM VÀ NÚT CHUYỂN QUA LẠI -->
      <section id="hero-banner-section" class="relative mb-12 sm:mb-16 rounded-3xl overflow-hidden glass-panel border border-amber-500/25 p-4 sm:p-8 lg:p-10 xl:p-12 shadow-2xl group/banner">
        
        <!-- NÚT MŨI TÊN CHUYỂN SANG TRÁI (PREV) TRÊN DESKTOP/TABLET (Ẩn trên mobile để không đè chữ) -->
        <button id="hero-arrow-prev" type="button" aria-label="Vật phẩm trước" class="hidden md:flex absolute left-2 lg:left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-slate-900/90 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-amber-500/30 hover:border-amber-400 shadow-2xl backdrop-blur-md items-center justify-center transition-all duration-300 group/prev focus:outline-none focus:ring-2 focus:ring-amber-400">
          <i class="fa-solid fa-chevron-left text-sm sm:text-base group-hover/prev:-translate-x-0.5 transition-transform"></i>
        </button>

        <!-- NÚT MŨI TÊN CHUYỂN SANG PHẢI (NEXT) TRÊN DESKTOP/TABLET (Ẩn trên mobile để không đè chữ) -->
        <button id="hero-arrow-next" type="button" aria-label="Vật phẩm kế tiếp" class="hidden md:flex absolute right-2 lg:right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-slate-900/90 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-amber-500/30 hover:border-amber-400 shadow-2xl backdrop-blur-md items-center justify-center transition-all duration-300 group/next focus:outline-none focus:ring-2 focus:ring-amber-400">
          <i class="fa-solid fa-chevron-right text-sm sm:text-base group-hover/next:translate-x-0.5 transition-transform"></i>
        </button>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-8 xl:gap-12 items-center px-1 sm:px-4 md:px-6 lg:px-8">

          <!-- Cột thông tin giới thiệu vật phẩm (Linh hoạt, tỷ lệ 6/12, chữ không bị ép tràn khung) -->
          <div id="hero-info-col" class="lg:col-span-6 xl:col-span-6 flex flex-col justify-between space-y-5 sm:space-y-6 z-10 transition-opacity duration-300 min-w-0">
            
            <div id="hero-badge-wrap" class="flex items-center">
              <div class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full ${initialItem.badgeClass} text-[11px] sm:text-xs font-semibold max-w-full truncate shadow-sm">
                <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping flex-shrink-0"></span>
                <span id="hero-badge-text" class="truncate">${initialItem.badge}</span>
              </div>
            </div>

            <h1 id="hero-title" class="text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-extrabold font-heading text-slate-100 tracking-tight leading-tight sm:leading-snug break-words transition-all">
              <span id="hero-title-main" class="block text-slate-100">${initialItem.titleMain}</span>
              <span id="hero-title-sub" class="block bg-gradient-to-r ${initialItem.gradientClass} bg-clip-text text-transparent pb-0.5">
                ${initialItem.titleHighlight}
              </span>
            </h1>

            <p id="hero-desc" class="text-xs sm:text-sm md:text-base text-slate-300 font-lora leading-relaxed break-words">
              ${initialItem.description}
            </p>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
              <a id="hero-shop-link" href="#/product/${initialItem.slug}" class="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl btn-gold text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/25 transition flex items-center justify-center space-x-2 text-center">
                <span>Khám phá bộ sưu tập</span>
                <i class="fa-solid fa-arrow-right text-xs"></i>
              </a>
              <a href="#/bricks" class="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-amber-400 font-semibold text-xs sm:text-sm border border-amber-500/30 transition flex items-center justify-center space-x-2 text-center">
                <i class="fa-solid fa-puzzle-piece text-xs"></i>
                <span>Mua gạch lẻ MOC</span>
              </a>
            </div>

            <!-- Cam kết chất lượng & Thông số vật phẩm (Tự động co giãn theo màn hình) -->
            <div id="hero-stats-wrap" class="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-5 border-t border-slate-700/60 text-slate-400">
              <div class="min-w-0">
                <p id="hero-stat-1-val" class="text-slate-100 font-bold text-sm sm:text-base font-sans truncate">${initialItem.stats[0].value}</p>
                <p id="hero-stat-1-lbl" class="text-[10px] sm:text-xs truncate">${initialItem.stats[0].label}</p>
              </div>
              <div class="min-w-0">
                <p id="hero-stat-2-val" class="text-slate-100 font-bold text-sm sm:text-base font-sans truncate">${initialItem.stats[1].value}</p>
                <p id="hero-stat-2-lbl" class="text-[10px] sm:text-xs truncate">${initialItem.stats[1].label}</p>
              </div>
              <div class="min-w-0">
                <p id="hero-stat-3-val" class="text-slate-100 font-bold text-sm sm:text-base font-sans truncate">${initialItem.stats[2].value}</p>
                <p id="hero-stat-3-lbl" class="text-[10px] sm:text-xs truncate">${initialItem.stats[2].label}</p>
              </div>
            </div>

            <!-- THANH ĐIỀU HƯỚNG SLIDE (DOTS + PREV/NEXT MINI + COUNTER) -->
            <div class="pt-3 sm:pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
              <div class="flex items-center space-x-2 sm:space-x-3">
                <!-- Cặp nút mũi tên mini tiện dụng trên mọi thiết bị, không che chữ -->
                <div class="flex items-center space-x-1.5 mr-1">
                  <button id="hero-nav-prev" type="button" aria-label="Slide trước" class="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-slate-700 hover:border-amber-400 flex items-center justify-center transition text-xs shadow focus:outline-none">
                    <i class="fa-solid fa-chevron-left"></i>
                  </button>
                  <button id="hero-nav-next" type="button" aria-label="Slide tiếp theo" class="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-slate-700 hover:border-amber-400 flex items-center justify-center transition text-xs shadow focus:outline-none">
                    <i class="fa-solid fa-chevron-right"></i>
                  </button>
                </div>

                <!-- Dots Pagination -->
                <div class="flex items-center space-x-1.5 sm:space-x-2">
                  <button type="button" class="hero-dot-btn w-7 sm:w-8 h-2 sm:h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300 shadow-md shadow-amber-500/30" data-index="0" aria-label="Vật phẩm 1: Siêu xe F1 Technic"></button>
                  <button type="button" class="hero-dot-btn w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-slate-700 hover:bg-slate-500 transition-all duration-300" data-index="1" aria-label="Vật phẩm 2: Trạm vũ trụ không gian"></button>
                  <button type="button" class="hero-dot-btn w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-slate-700 hover:bg-slate-500 transition-all duration-300" data-index="2" aria-label="Vật phẩm 3: Tháp đồng hồ di sản"></button>
                </div>
              </div>

              <div class="flex items-center space-x-3 text-xs">
                <span id="hero-slide-counter" class="font-mono font-bold text-amber-400/90 tracking-wider">
                  01 / 03
                </span>
                <span class="text-[11px] text-slate-500 hidden xl:inline">
                  • Phím ← → hoặc vuốt chuyển slide
                </span>
              </div>
            </div>

          </div>

          <!-- Cột Khung Viewer 3D tương tác (Chiều cao linh hoạt từ mobile đến desktop) -->
          <div class="lg:col-span-6 xl:col-span-6 relative w-full">
            <div class="relative w-full h-[280px] sm:h-[360px] md:h-[400px] lg:h-[430px] xl:h-[470px] 2xl:h-[500px] rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-amber-500/20 overflow-hidden shadow-inner flex flex-col justify-between">

              <!-- Badge trạng thái 3D -->
              <div class="p-3 sm:p-4 flex items-center justify-between z-10 pointer-events-none">
                <span class="px-2.5 sm:px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-[10px] sm:text-[11px] font-semibold text-slate-300">
                  <i class="fa-solid fa-cube text-amber-400 mr-1.5"></i>3D Interactive WebGL
                </span>
                <span class="text-[10px] sm:text-[11px] text-slate-400 hidden sm:inline">
                  Kéo xoay 360° • Cuộn zoom
                </span>
              </div>

              <!-- Canvas Container Three.js -->
              <div id="hero-3d-container" class="absolute inset-0 w-full h-full"></div>

              <!-- Thanh công cụ điều khiển 3D (Thiết kế tinh gọn, chống tràn) -->
              <div class="p-3 sm:p-4 flex items-center justify-center gap-2 z-10 flex-wrap">
                <button id="hero-explode-btn" type="button" class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-300 font-semibold text-[11px] sm:text-xs transition flex items-center space-x-1.5 backdrop-blur-md shadow-lg">
                  <i class="fa-solid fa-arrows-split-up-and-left text-[10px]"></i>
                  <span id="hero-explode-text">Bung tách chi tiết</span>
                </button>
                <button id="hero-reset-btn" type="button" class="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-300 text-[11px] sm:text-xs transition backdrop-blur-md" title="Đặt lại góc nhìn">
                  <i class="fa-solid fa-rotate-right"></i>
                </button>
                <a id="hero-view-product-btn" href="#/product/${initialItem.slug}" class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl btn-gold text-slate-950 font-bold text-[11px] sm:text-xs transition flex items-center space-x-1.5 shadow-lg">
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

      <!-- KHỐI CÔNG CỤ NHẬN DIỆN HỘP ĐỒ CHƠI TRỰC TUYẾN AI -->
      <section class="mb-16 glass-panel rounded-3xl p-6 sm:p-10 border border-amber-500/25 relative overflow-hidden bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div class="md:col-span-8 space-y-4">
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <i class="fa-solid fa-cube"></i>
              <span>CÔNG CỤ AI THÔNG MINH</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
              Nhận Diện Hộp Đồ Chơi — Tra Cứu Liền Tay
            </h2>
            <p class="text-sm text-slate-300 font-lora leading-relaxed max-w-2xl">
              Đang có trong tay vỏ hộp hoặc hình ảnh mô hình? Hãy dùng công cụ AI nhận diện trực tuyến để xác định chính xác tên bộ mô hình, chi tiết mảnh ghép và thông số lắp ráp ngay tức thì!
            </p>
            <div class="pt-2">
              <a href="#/qr" class="inline-flex items-center space-x-2 px-5 py-3 rounded-xl btn-gold text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition">
                <i class="fa-solid fa-wand-magic-sparkles"></i>
                <span>Mở công cụ nhận diện hộp</span>
              </a>
            </div>
          </div>
          <div class="md:col-span-4 flex justify-center">
            <div class="w-44 h-44 rounded-2xl bg-slate-900/90 border-2 border-amber-400/60 p-4 shadow-2xl flex flex-col items-center justify-center space-y-2 text-center group">
              <div class="w-20 h-20 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/40 shadow-inner">
                <i class="fa-solid fa-cube text-4xl text-amber-400 group-hover:scale-110 transition-transform"></i>
              </div>
              <span class="text-[11px] text-amber-300 font-mono font-bold tracking-wider uppercase">TOYBOX SEARCHER</span>
            </div>
          </div>
        </div>
      </section>

      <!-- KHỐI GIỚI THIỆU KHO GẠCH LẺ PICK-A-BRICK -->
      <section class="rounded-3xl glass-panel p-6 sm:p-10 border border-amber-500/25 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-2 max-w-xl">
            <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">Kho MOC Tự Do</span>
            <h3 class="text-2xl sm:text-3xl font-heading font-extrabold text-slate-100 md:whitespace-nowrap">
              Pick-a-Brick: Tìm Từng Viên Gạch Riêng Lẻ
            </h3>
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

    // 1. Khởi tạo 3D Viewer ban đầu
    try {
      const container3D = document.getElementById('hero-3d-container');
      if (container3D) {
        HomePage.viewerInstance = new ToyBrickViewer3D(container3D, initialItem.model3d, {
          cameraDistance: initialItem.cameraDistance,
          autoRotateSpeed: 0.004
        });

        const explodeBtn = document.getElementById('hero-explode-btn');
        const explodeText = document.getElementById('hero-explode-text');
        const resetBtn = document.getElementById('hero-reset-btn');

        if (explodeBtn) {
          explodeBtn.addEventListener('click', () => {
            if (HomePage.viewerInstance) {
              const isExploded = HomePage.viewerInstance.toggleExplode();
              explodeText.textContent = isExploded ? 'Gộp chi tiết lại' : 'Bung tách chi tiết';
            }
          });
        }

        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            if (HomePage.viewerInstance) {
              HomePage.viewerInstance.resetView();
            }
          });
        }
      }

      // Thử đồng bộ model 3D mới nhất từ Database nếu có
      HomePage.syncProductsData();
    } catch (e) {
      console.warn('[Home Viewer Error]', e.message);
    }

    // 2. Gắn sự kiện nút Mũi tên và Dots chuyển slide
    HomePage.initCarouselEvents();

    // 3. Nạp danh sách sản phẩm nổi bật
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

  // Đồng bộ model 3D từ cơ sở dữ liệu nếu có chỉnh sửa từ Admin
  syncProductsData: async () => {
    try {
      const promises = HomePage.featuredItems.map(item => API.products.getBySlug(item.slug));
      const results = await Promise.allSettled(promises);
      results.forEach((res, idx) => {
        if (res.status === 'fulfilled' && res.value && res.value.success && res.value.data) {
          const dbProd = res.value.data;
          if (dbProd.model3d && dbProd.model3d.parts && dbProd.model3d.parts.length > 0) {
            HomePage.featuredItems[idx].model3d = dbProd.model3d;
          }
          if (dbProd.pieceCount) {
            HomePage.featuredItems[idx].stats[0].value = Number(dbProd.pieceCount).toLocaleString('vi-VN');
          }
        }
      });
    } catch (err) {
      console.warn('[Sync Products Notice]', err.message);
    }
  },

  // Khởi tạo các sự kiện tương tác và Carousel
  initCarouselEvents: () => {
    const prevBtn = document.getElementById('hero-arrow-prev');
    const nextBtn = document.getElementById('hero-arrow-next');
    const navPrevBtn = document.getElementById('hero-nav-prev');
    const navNextBtn = document.getElementById('hero-nav-next');
    const dotBtns = document.querySelectorAll('.hero-dot-btn');
    const bannerSection = document.getElementById('hero-banner-section');

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        HomePage.prevSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        HomePage.nextSlide();
      });
    }

    if (navPrevBtn) {
      navPrevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        HomePage.prevSlide();
      });
    }

    if (navNextBtn) {
      navNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        HomePage.nextSlide();
      });
    }

    dotBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetIndex = parseInt(btn.dataset.index, 10);
        if (!isNaN(targetIndex) && targetIndex !== HomePage.currentIndex) {
          HomePage.goToSlide(targetIndex);
        }
      });
    });

    // Bắt phím điều hướng bàn phím mũi tên Trái / Phải
    HomePage.keyHandler = (e) => {
      // Chỉ kích hoạt khi đang ở trang chủ và không gõ input/textarea
      if (window.location.hash && window.location.hash !== '#/' && window.location.hash !== '#') return;
      const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'ArrowLeft') {
        HomePage.prevSlide();
      } else if (e.key === 'ArrowRight') {
        HomePage.nextSlide();
      }
    };
    window.addEventListener('keydown', HomePage.keyHandler);

    // Hỗ trợ cảm ứng vuốt (Touch Swipe) linh hoạt cho Mobile / Tablet
    let touchStartX = 0;
    let touchStartY = 0;

    if (bannerSection) {
      bannerSection.addEventListener('mouseenter', () => HomePage.stopAutoSlide());
      bannerSection.addEventListener('mouseleave', () => HomePage.startAutoSlide());

      bannerSection.addEventListener('touchstart', (e) => {
        HomePage.stopAutoSlide();
        if (e.changedTouches && e.changedTouches[0]) {
          touchStartX = e.changedTouches[0].clientX;
          touchStartY = e.changedTouches[0].clientY;
        }
      }, { passive: true });

      bannerSection.addEventListener('touchend', (e) => {
        HomePage.startAutoSlide();
        if (e.changedTouches && e.changedTouches[0]) {
          const touchEndX = e.changedTouches[0].clientX;
          const touchEndY = e.changedTouches[0].clientY;
          const diffX = touchEndX - touchStartX;
          const diffY = touchEndY - touchStartY;
          
          // Vuốt ngang dứt khoát (> 40px) và không phải scroll dọc trang
          if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX < 0) {
              HomePage.nextSlide();
            } else {
              HomePage.prevSlide();
            }
          }
        }
      });
    }

    // Tự động chuyển slide sau mỗi 7.5 giây
    HomePage.startAutoSlide();
  },

  startAutoSlide: () => {
    HomePage.stopAutoSlide();
    HomePage.autoSlideTimer = setInterval(() => {
      HomePage.nextSlide();
    }, 7500);
  },

  stopAutoSlide: () => {
    if (HomePage.autoSlideTimer) {
      clearInterval(HomePage.autoSlideTimer);
      HomePage.autoSlideTimer = null;
    }
  },

  prevSlide: () => {
    const total = HomePage.featuredItems.length;
    const nextIndex = (HomePage.currentIndex - 1 + total) % total;
    HomePage.goToSlide(nextIndex);
  },

  nextSlide: () => {
    const total = HomePage.featuredItems.length;
    const nextIndex = (HomePage.currentIndex + 1) % total;
    HomePage.goToSlide(nextIndex);
  },

  goToSlide: (index) => {
    if (index === HomePage.currentIndex && !HomePage.isTransitioning) return;
    const item = HomePage.featuredItems[index];
    if (!item) return;

    HomePage.currentIndex = index;
    HomePage.isTransitioning = true;

    // Cập nhật giao diện thông tin vật phẩm với hiệu ứng mượt mà
    const infoCol = document.getElementById('hero-info-col');
    if (infoCol) {
      infoCol.style.opacity = '0.4';
    }

    setTimeout(() => {
      // 1. Cập nhật Badge
      const badgeWrap = document.getElementById('hero-badge-wrap');
      if (badgeWrap) {
        badgeWrap.innerHTML = `
          <div class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full ${item.badgeClass} text-[11px] sm:text-xs font-semibold max-w-full truncate shadow-sm">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping flex-shrink-0"></span>
            <span id="hero-badge-text" class="truncate">${item.badge}</span>
          </div>
        `;
      }

      // 2. Cập nhật Tiêu đề & Highlight gradient (Hiển thị khối linh hoạt chống tràn)
      const titleMain = document.getElementById('hero-title-main');
      const titleSub = document.getElementById('hero-title-sub');
      if (titleMain) titleMain.textContent = item.titleMain;
      if (titleSub) {
        titleSub.className = `block bg-gradient-to-r ${item.gradientClass} bg-clip-text text-transparent pb-0.5`;
        titleSub.textContent = item.titleHighlight;
      }

      // 3. Cập nhật Mô tả
      const desc = document.getElementById('hero-desc');
      if (desc) desc.textContent = item.description;

      // 4. Cập nhật Link sản phẩm
      const shopLink = document.getElementById('hero-shop-link');
      const viewProductBtn = document.getElementById('hero-view-product-btn');
      const productHref = `#/product/${item.slug}`;
      if (shopLink) shopLink.href = productHref;
      if (viewProductBtn) viewProductBtn.href = productHref;

      // 5. Cập nhật Thông số (Stats)
      const s1Val = document.getElementById('hero-stat-1-val');
      const s1Lbl = document.getElementById('hero-stat-1-lbl');
      const s2Val = document.getElementById('hero-stat-2-val');
      const s2Lbl = document.getElementById('hero-stat-2-lbl');
      const s3Val = document.getElementById('hero-stat-3-val');
      const s3Lbl = document.getElementById('hero-stat-3-lbl');

      if (s1Val) s1Val.textContent = item.stats[0].value;
      if (s1Lbl) s1Lbl.textContent = item.stats[0].label;
      if (s2Val) s2Val.textContent = item.stats[1].value;
      if (s2Lbl) s2Lbl.textContent = item.stats[1].label;
      if (s3Val) s3Val.textContent = item.stats[2].value;
      if (s3Lbl) s3Lbl.textContent = item.stats[2].label;

      // 6. Cập nhật Slide Counter và Dots Pagination
      const counter = document.getElementById('hero-slide-counter');
      if (counter) {
        counter.textContent = `0${index + 1} / 03`;
      }

      const dotBtns = document.querySelectorAll('.hero-dot-btn');
      dotBtns.forEach((dot, idx) => {
        if (idx === index) {
          dot.className = 'hero-dot-btn w-7 sm:w-8 h-2 sm:h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300 shadow-md shadow-amber-500/30';
        } else {
          dot.className = 'hero-dot-btn w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-slate-700 hover:bg-slate-500 transition-all duration-300';
        }
      });

      // 7. Nạp Model 3D mới vào Viewer
      if (HomePage.viewerInstance && item.model3d) {
        HomePage.viewerInstance.loadModel(item.model3d, {
          cameraDistance: item.cameraDistance
        });

        // Đặt lại chữ nút bung tách
        const explodeText = document.getElementById('hero-explode-text');
        if (explodeText) {
          explodeText.textContent = 'Bung tách chi tiết';
        }
      }

      if (infoCol) {
        infoCol.style.opacity = '1';
      }

      HomePage.isTransitioning = false;
    }, 150);
  },

  destroy: () => {
    HomePage.stopAutoSlide();

    if (HomePage.keyHandler) {
      window.removeEventListener('keydown', HomePage.keyHandler);
      HomePage.keyHandler = null;
    }

    if (HomePage.viewerInstance) {
      HomePage.viewerInstance.destroy();
      HomePage.viewerInstance = null;
    }
  }
};

window.HomePage = HomePage;
