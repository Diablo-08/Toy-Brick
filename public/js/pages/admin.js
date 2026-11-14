/**
 * Trang Quản Trị Studio (Admin Dashboard & Management)
 * Biểu đồ SVG/Canvas thuần + Quản lý Sản phẩm + Sửa tồn kho gạch inline + Quản lý Đơn + Người dùng
 * Tích hợp bộ lọc và tìm kiếm toàn diện cho mọi danh mục.
 */
const AdminPage = {
  currentTab: 'dashboard',
  cachedProducts: [],
  cachedCategories: [],
  cachedBrickCategories: [],
  cachedBrickColors: [],

  // Bộ lọc cho từng tab
  productsParams: {
    q: '',
    category: 'all',
    status: 'all',
    stockStatus: 'all',
    page: 1,
    limit: 100
  },

  bricksParams: {
    q: '',
    category: 'all',
    color: 'all',
    stockStatus: 'all',
    page: 1,
    limit: 100
  },

  ordersParams: {
    q: '',
    status: 'all',
    page: 1,
    limit: 50
  },

  usersParams: {
    q: '',
    role: 'all',
    page: 1,
    limit: 50
  },

  searchDebounceTimer: null,

  render: async (container) => {
    // Client Guard: Kiểm tra quyền Admin
    if (!Store.isLoggedIn() || !Store.isAdmin()) {
      UI.toast('error', 'Khu vực quản trị chỉ dành cho tài khoản Admin!');
      window.location.hash = '#/';
      return;
    }

    container.innerHTML = `
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <i class="fa-solid fa-shield-halved"></i>
            <span>HỆ THỐNG ĐIỀU HÀNH TOYBRICK</span>
          </div>
          <h1 class="text-3xl font-extrabold font-heading text-slate-100">Bảng Điều Khiển <span class="text-amber-400">Quản Trị</span></h1>
        </div>

        <!-- Tab chuyển đổi chức năng -->
        <div class="flex items-center space-x-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-700 overflow-x-auto text-xs">
          <button data-tab="dashboard" class="admin-tab-btn px-4 py-2 rounded-xl font-bold transition ${AdminPage.currentTab === 'dashboard' ? 'btn-gold text-slate-950' : 'text-slate-300 hover:text-white'}">
            <i class="fa-solid fa-chart-line mr-1"></i>Thống kê
          </button>
          <button data-tab="products" class="admin-tab-btn px-4 py-2 rounded-xl font-bold transition ${AdminPage.currentTab === 'products' ? 'btn-gold text-slate-950' : 'text-slate-300 hover:text-white'}">
            <i class="fa-solid fa-box-open mr-1"></i>Sản phẩm
          </button>
          <button data-tab="bricks" class="admin-tab-btn px-4 py-2 rounded-xl font-bold transition ${AdminPage.currentTab === 'bricks' ? 'btn-gold text-slate-950' : 'text-slate-300 hover:text-white'}">
            <i class="fa-solid fa-puzzle-piece mr-1"></i>Kho Gạch Lẻ
          </button>
          <button data-tab="orders" class="admin-tab-btn px-4 py-2 rounded-xl font-bold transition ${AdminPage.currentTab === 'orders' ? 'btn-gold text-slate-950' : 'text-slate-300 hover:text-white'}">
            <i class="fa-solid fa-receipt mr-1"></i>Đơn hàng
          </button>
          <button data-tab="users" class="admin-tab-btn px-4 py-2 rounded-xl font-bold transition ${AdminPage.currentTab === 'users' ? 'btn-gold text-slate-950' : 'text-slate-300 hover:text-white'}">
            <i class="fa-solid fa-users mr-1"></i>Khách hàng
          </button>
        </div>
      </div>

      <div id="admin-subpage-container" class="min-h-[500px]">
        <div class="py-12 flex justify-center items-center">
          <div class="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    `;

    // Gắn trực tiếp addEventListener cho tất cả các nút tab
    const tabBtns = container.querySelectorAll('.admin-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = btn.getAttribute('data-tab');
        if (tab) {
          AdminPage.switchTab(tab);
        }
      });
    });

    await AdminPage.loadSubpage();
  },

  switchTab: async (tab) => {
    AdminPage.currentTab = tab;
    const btns = document.querySelectorAll('.admin-tab-btn');
    btns.forEach(btn => {
      const isMatch = btn.getAttribute('data-tab') === tab;
      btn.className = `admin-tab-btn px-4 py-2 rounded-xl font-bold transition ${isMatch ? 'btn-gold text-slate-950' : 'text-slate-300 hover:text-white'}`;
    });

    await AdminPage.loadSubpage();
  },

  loadSubpage: async () => {
    const container = document.getElementById('admin-subpage-container');
    if (!container) return;

    if (AdminPage.currentTab === 'dashboard') {
      await AdminPage.renderDashboard(container);
    } else if (AdminPage.currentTab === 'products') {
      await AdminPage.renderProducts(container);
    } else if (AdminPage.currentTab === 'bricks') {
      await AdminPage.renderBricks(container);
    } else if (AdminPage.currentTab === 'orders') {
      await AdminPage.renderOrders(container);
    } else if (AdminPage.currentTab === 'users') {
      await AdminPage.renderUsers(container);
    }
  },

  // ==========================================
  // 1. DASHBOARD THỐNG KÊ
  // ==========================================
  renderDashboard: async (container) => {
    try {
      const res = await API.admin.getStats();
      if (!res.success || !res.data) {
        container.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi', 'Không thể nạp dữ liệu thống kê');
        return;
      }

      const d = res.data;

      container.innerHTML = `
        <!-- CÁC THẺ METRIC CHÍNH -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="glass-panel rounded-3xl p-6 border border-amber-500/25 space-y-2">
            <div class="flex items-center justify-between text-slate-400 text-xs">
              <span>Tổng doanh thu thực</span>
              <i class="fa-solid fa-coins text-amber-400 text-base"></i>
            </div>
            <div class="text-2xl font-extrabold text-amber-300 font-sans">
              ${UI.formatCurrency(d.totalRevenue)}
            </div>
            <p class="text-[11px] text-slate-400">Từ ${d.totalOrders} đơn hàng</p>
          </div>

          <div class="glass-panel rounded-3xl p-6 border border-sky-500/25 space-y-2">
            <div class="flex items-center justify-between text-slate-400 text-xs">
              <span>Tổng đơn đặt hàng</span>
              <i class="fa-solid fa-receipt text-sky-400 text-base"></i>
            </div>
            <div class="text-2xl font-extrabold text-sky-300 font-sans">
              ${d.totalOrders}
            </div>
            <p class="text-[11px] text-slate-400">Đơn hàng trong hệ thống</p>
          </div>

          <div class="glass-panel rounded-3xl p-6 border border-indigo-500/25 space-y-2">
            <div class="flex items-center justify-between text-slate-400 text-xs">
              <span>Mã gạch Pick-a-Brick</span>
              <i class="fa-solid fa-puzzle-piece text-indigo-400 text-base"></i>
            </div>
            <div class="text-2xl font-extrabold text-indigo-300 font-sans">
              ${d.totalBricks}
            </div>
            <p class="text-[11px] text-slate-400">Đang hoạt động</p>
          </div>

          <div class="glass-panel rounded-3xl p-6 border border-emerald-500/25 space-y-2">
            <div class="flex items-center justify-between text-slate-400 text-xs">
              <span>Tổng khách hàng</span>
              <i class="fa-solid fa-users text-emerald-400 text-base"></i>
            </div>
            <div class="text-2xl font-extrabold text-emerald-300 font-sans">
              ${d.totalCustomers}
            </div>
            <p class="text-[11px] text-slate-400">Đã đăng ký tài khoản</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <!-- BIỂU ĐỒ DOANH THU CANVAS/SVG THUẦN (8 CỘT) -->
          <div class="lg:col-span-8 glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 class="text-sm font-bold font-heading text-slate-100 flex items-center space-x-2">
                <i class="fa-solid fa-chart-column text-amber-400"></i>
                <span>Doanh Thu 7 Ngày Gần Nhất (VND)</span>
              </h3>
            </div>
            <div class="h-64 w-full flex items-end justify-between pt-6 px-2">
              ${AdminPage.renderRevenueChart(d.dailyRevenue || [])}
            </div>
          </div>

          <!-- TOP SẢN PHẨM BÁN CHẠY (4 CỘT) -->
          <div class="lg:col-span-4 glass-panel rounded-3xl p-6 border border-amber-500/20 space-y-4">
            <h3 class="text-sm font-bold font-heading text-slate-100 border-b border-slate-800 pb-3 flex items-center space-x-2">
              <i class="fa-solid fa-crown text-amber-400"></i>
              <span>Top Bán Chạy</span>
            </h3>
            <div class="space-y-3">
              ${(d.topProducts && d.topProducts.length > 0) ? d.topProducts.map((p, i) => `
                <div class="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div class="flex items-center space-x-2 truncate pr-2">
                    <span class="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                      ${i + 1}
                    </span>
                    <span class="text-slate-200 truncate font-medium">${UI.escapeHTML(p._id)}</span>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <span class="text-amber-400 font-bold font-mono">${p.totalSold}</span> <span class="text-[10px] text-slate-500">bộ</span>
                  </div>
                </div>
              `).join('') : '<p class="text-xs text-slate-500 italic text-center py-6">Chưa có dữ liệu bán</p>'}
            </div>
          </div>
        </div>

        <!-- CẢNH BÁO TỒN KHO -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Gạch sắp hết hàng -->
          <div class="glass-panel rounded-3xl p-6 border border-amber-500/20 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>Gạch Lẻ Sắp Hết Hàng (&le; 30 viên)</span>
              </h3>
              <button onclick="AdminPage.switchTab('bricks')" class="text-xs text-slate-400 hover:text-amber-400 transition">
                Xem tất cả &rarr;
              </button>
            </div>
            <div class="space-y-2">
              ${(d.lowStockBricks && d.lowStockBricks.length > 0) ? d.lowStockBricks.map(b => `
                <div class="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div class="flex items-center space-x-2">
                    <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">${UI.escapeHTML(b.code)}</span>
                    <span class="text-slate-200 font-medium">${UI.escapeHTML(b.name)}</span>
                  </div>
                  <span class="px-2 py-0.5 rounded font-mono font-bold text-[11px] ${b.stock === 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-300'}">
                    ${b.stock === 0 ? 'Hết hàng' : `Còn ${b.stock}`}
                  </span>
                </div>
              `).join('') : '<p class="text-xs text-emerald-400 italic text-center py-4">Tất cả chi tiết gạch đều đủ tồn kho</p>'}
            </div>
          </div>

          <!-- Mô hình sắp hết hàng -->
          <div class="glass-panel rounded-3xl p-6 border border-amber-500/20 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 class="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-2">
                <i class="fa-solid fa-boxes-stacked"></i>
                <span>Mô Hình Set Sắp Hết (&le; 5 bộ)</span>
              </h3>
              <button onclick="AdminPage.switchTab('products')" class="text-xs text-slate-400 hover:text-amber-400 transition">
                Xem tất cả &rarr;
              </button>
            </div>
            <div class="space-y-2">
              ${(d.lowStockProducts && d.lowStockProducts.length > 0) ? d.lowStockProducts.map(p => `
                <div class="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span class="text-slate-200 font-medium truncate pr-2">${UI.escapeHTML(p.name)}</span>
                  <span class="px-2 py-0.5 rounded font-mono font-bold text-[11px] ${p.stock === 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-500/10 text-rose-300'}">
                    ${p.stock === 0 ? 'Hết hàng' : `Còn ${p.stock} bộ`}
                  </span>
                </div>
              `).join('') : '<p class="text-xs text-emerald-400 italic text-center py-4">Tất cả sản phẩm đều trên 5 bộ</p>'}
            </div>
          </div>
        </div>
      `;

    } catch (err) {
      container.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi', err.message);
    }
  },

  renderRevenueChart: (dailyData) => {
    if (!dailyData || dailyData.length === 0) {
      return '<div class="w-full text-center text-xs text-slate-500 py-12">Chưa có giao dịch phát sinh trong 7 ngày qua</div>';
    }

    const maxRevenue = Math.max(...dailyData.map(d => d.revenue), 1000000);
    const chartHeight = 160;
    const chartWidth = 560;
    const barWidth = 32;
    const gap = (chartWidth - (dailyData.length * barWidth)) / (dailyData.length + 1);

    let barsSvg = '';
    dailyData.forEach((item, idx) => {
      const height = Math.max(8, (item.revenue / maxRevenue) * chartHeight);
      const x = gap + idx * (barWidth + gap);
      const y = chartHeight - height + 20;

      barsSvg += `
        <g class="group">
          <!-- Cột biểu đồ -->
          <rect x="${x}" y="${y}" width="${barWidth}" height="${height}" rx="6" fill="url(#goldGradient)" class="transition-all duration-300 hover:brightness-125 cursor-pointer"/>
          <!-- Tooltip tiền -->
          <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" font-size="10" fill="#f59e0b" font-weight="bold" font-family="'Be Vietnam Pro', sans-serif">
            ${Math.round(item.revenue / 1000)}k
          </text>
          <!-- Ngày bên dưới -->
          <text x="${x + barWidth / 2}" y="${chartHeight + 38}" text-anchor="middle" font-size="10" fill="#94a3b8" font-family="'Be Vietnam Pro', sans-serif">
            ${item._id.slice(5)}
          </text>
        </g>
      `;
    });

    return `
      <svg viewBox="0 0 ${chartWidth} 230" class="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fbbf24"/>
            <stop offset="100%" stop-color="#d97706"/>
          </linearGradient>
        </defs>
        <!-- Đường baseline ngang -->
        <line x1="10" y1="${chartHeight + 20}" x2="${chartWidth - 10}" y2="${chartHeight + 20}" stroke="#334155" stroke-dasharray="3 3"/>
        ${barsSvg}
      </svg>
    `;
  },

  // ==========================================
  // 2. QUẢN LÝ SẢN PHẨM (VỚI BỘ LỌC TOÀN DIỆN)
  // ==========================================
  renderProducts: async (container) => {
    try {
      const res = await API.admin.getProducts(AdminPage.productsParams);
      const products = (res.success && res.data) ? res.data.products : [];
      const total = (res.success && res.data && res.data.total !== undefined) ? res.data.total : products.length;
      const categories = (res.success && res.data && res.data.categories) ? res.data.categories : [
        'Technic & Cơ khí',
        'Kiến trúc & Di sản',
        'Phương tiện siêu xe',
        'Vũ trụ & Viễn tưởng',
        'Robot & Mecha',
        'Bộ lắp ráp Mini'
      ];

      AdminPage.cachedProducts = products;
      AdminPage.cachedCategories = categories;

      container.innerHTML = `
        <div class="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-6">
          <!-- Header tab & Nút thêm -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 class="text-base font-bold font-heading text-slate-100 flex items-center space-x-2">
                <span>Danh Sách Mô Hình Set</span>
                <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">${total}</span>
              </h2>
              <p class="text-xs text-slate-400">Xem thông tin, chỉnh sửa giá bán, khuyến mãi, tồn kho và mô tả sản phẩm</p>
            </div>
            <button onclick="AdminPage.openProductModal()" class="px-4 py-2.5 rounded-xl btn-gold text-slate-950 font-bold text-xs transition flex items-center space-x-2 shadow-md">
              <i class="fa-solid fa-plus text-xs"></i>
              <span>Thêm Sản Phẩm Mới</span>
            </button>
          </div>

          <!-- BỘ LỌC SẢN PHẨM DÀNH CHO ADMIN -->
          <div class="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              
              <!-- 1. Tìm theo tên / SKU / QR (5 cột) -->
              <div class="lg:col-span-5 relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <i class="fa-solid fa-magnifying-glass text-xs"></i>
                </span>
                <input type="text" id="adm-prod-search" value="${UI.escapeHTML(AdminPage.productsParams.q || '')}" class="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition" placeholder="Tìm theo tên mô hình, mã SKU hoặc mã QR...">
              </div>

              <!-- 2. Lọc danh mục (3 cột) -->
              <div class="lg:col-span-3">
                <select id="adm-prod-category" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition">
                  <option value="all">Tất cả danh mục</option>
                  ${categories.map(c => `
                    <option value="${UI.escapeHTML(c)}" ${AdminPage.productsParams.category === c ? 'selected' : ''}>${UI.escapeHTML(c)}</option>
                  `).join('')}
                </select>
              </div>

              <!-- 3. Lọc trạng thái hiển thị (2 cột) -->
              <div class="lg:col-span-2">
                <select id="adm-prod-status" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition">
                  <option value="all" ${AdminPage.productsParams.status === 'all' ? 'selected' : ''}>Tất cả trạng thái</option>
                  <option value="active" ${AdminPage.productsParams.status === 'active' ? 'selected' : ''}>Đang mở bán</option>
                  <option value="inactive" ${AdminPage.productsParams.status === 'inactive' ? 'selected' : ''}>Tạm ẩn</option>
                </select>
              </div>

              <!-- 4. Lọc tồn kho & Nút Reset (2 cột) -->
              <div class="lg:col-span-2 flex items-center space-x-2">
                <select id="adm-prod-stock" class="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition">
                  <option value="all" ${AdminPage.productsParams.stockStatus === 'all' ? 'selected' : ''}>Tất cả tồn kho</option>
                  <option value="inStock" ${AdminPage.productsParams.stockStatus === 'inStock' ? 'selected' : ''}>Còn hàng</option>
                  <option value="lowStock" ${AdminPage.productsParams.stockStatus === 'lowStock' ? 'selected' : ''}>Sắp hết (&le;5)</option>
                  <option value="outOfStock" ${AdminPage.productsParams.stockStatus === 'outOfStock' ? 'selected' : ''}>Hết hàng (0)</option>
                </select>

                <button onclick="AdminPage.resetProductFilter()" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition" title="Đặt lại bộ lọc">
                  <i class="fa-solid fa-rotate-right text-xs"></i>
                </button>
              </div>

            </div>

            <!-- Dòng thông tin kết quả -->
            <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Hiển thị <strong class="text-amber-400 font-mono">${products.length}</strong> trên tổng số <strong class="text-slate-200 font-mono">${total}</strong> sản phẩm</span>
              ${(AdminPage.productsParams.q || AdminPage.productsParams.category !== 'all' || AdminPage.productsParams.status !== 'all' || AdminPage.productsParams.stockStatus !== 'all') ? `
                <button onclick="AdminPage.resetProductFilter()" class="text-amber-400 hover:underline">
                  <i class="fa-solid fa-xmark mr-1"></i>Xóa bộ lọc
                </button>
              ` : ''}
            </div>
          </div>

          <!-- BẢNG DANH SÁCH SẢN PHẨM -->
          ${products.length === 0 ? `
            <div class="py-12 text-center">
              <i class="fa-solid fa-box-open text-3xl text-slate-600 mb-2"></i>
              <p class="text-xs text-slate-400 mb-4">Không tìm thấy sản phẩm nào khớp với tiêu chí lọc</p>
              <button onclick="AdminPage.resetProductFilter()" class="px-4 py-2 rounded-xl btn-gold text-slate-950 font-bold text-xs">
                Xem Tất Cả Sản Phẩm
              </button>
            </div>
          ` : `
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-300">
                <thead class="text-[11px] uppercase bg-slate-900/80 text-amber-400 border-b border-slate-800">
                  <tr>
                    <th class="py-3 px-4">Sản phẩm</th>
                    <th class="py-3 px-4">Danh mục</th>
                    <th class="py-3 px-4">Giá bán</th>
                    <th class="py-3 px-4">Tồn kho</th>
                    <th class="py-3 px-4">SKU / QR</th>
                    <th class="py-3 px-4 text-center">Trạng thái</th>
                    <th class="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800">
                  ${products.map(p => `
                    <tr class="hover:bg-slate-900/40 transition">
                      <td class="py-3 px-4 font-bold text-slate-100 flex items-center space-x-3">
                        <div class="w-11 h-11 rounded-lg bg-slate-950 overflow-hidden flex-shrink-0 border border-slate-800">
                          <img src="${UI.escapeHTML((p.images && p.images[0]) || 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=150&q=80')}" class="w-full h-full object-cover">
                        </div>
                        <div>
                          <a href="#/product/${UI.escapeHTML(p.slug)}" class="hover:text-amber-400 transition" target="_blank" title="Xem trang sản phẩm">
                            ${UI.escapeHTML(p.name)}
                            <i class="fa-solid fa-arrow-up-right-from-square text-[10px] text-slate-500 ml-1"></i>
                          </a>
                          <span class="text-[10px] text-slate-400 block font-normal">${p.pieceCount} mảnh • ${UI.escapeHTML(p.ageRange || '8+')}</span>
                        </div>
                      </td>
                      <td class="py-3 px-4">${UI.escapeHTML(p.category)}</td>
                      <td class="py-3 px-4 font-mono font-bold text-amber-300">
                        <div>${UI.formatCurrency(p.salePrice || p.price)}</div>
                        ${p.salePrice ? `<div class="text-[10px] text-slate-500 line-through">${UI.formatCurrency(p.price)}</div>` : ''}
                      </td>
                      <td class="py-3 px-4">
                        <span class="px-2 py-0.5 rounded text-[11px] font-bold ${p.stock <= 0 ? 'bg-rose-500/20 text-rose-400' : (p.stock <= 5 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-400')}">
                          ${p.stock}
                        </span>
                      </td>
                      <td class="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        <div>${UI.escapeHTML(p.sku || 'N/A')}</div>
                        <div class="text-[10px] text-amber-400/80">${UI.escapeHTML(p.qrCode || '')}</div>
                      </td>
                      <td class="py-3 px-4 text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.isActive !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}">
                          ${p.isActive !== false ? 'Đang bán' : 'Tạm ẩn'}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button onclick="AdminPage.openProductModal('${p._id}')" class="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold transition inline-flex items-center space-x-1" title="Chỉnh sửa sản phẩm">
                          <i class="fa-solid fa-pen-to-square text-xs"></i>
                          <span>Sửa</span>
                        </button>
                        <button onclick="AdminPage.deleteProduct('${p._id}', '${UI.escapeHTML(p.name)}')" class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition" title="Xóa sản phẩm">
                          <i class="fa-solid fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      `;

      // Gắn sự kiện cho bộ lọc sản phẩm
      AdminPage.bindProductFilterEvents();

    } catch (err) {
      container.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi', err.message);
    }
  },

  bindProductFilterEvents: () => {
    const searchInput = document.getElementById('adm-prod-search');
    const catSelect = document.getElementById('adm-prod-category');
    const statusSelect = document.getElementById('adm-prod-status');
    const stockSelect = document.getElementById('adm-prod-stock');

    const trigger = () => {
      AdminPage.productsParams.q = searchInput ? searchInput.value.trim() : '';
      AdminPage.productsParams.category = catSelect ? catSelect.value : 'all';
      AdminPage.productsParams.status = statusSelect ? statusSelect.value : 'all';
      AdminPage.productsParams.stockStatus = stockSelect ? stockSelect.value : 'all';
      AdminPage.renderProducts(document.getElementById('admin-subpage-container'));
    };

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(AdminPage.searchDebounceTimer);
        AdminPage.searchDebounceTimer = setTimeout(trigger, 300);
      });
      searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          clearTimeout(AdminPage.searchDebounceTimer);
          trigger();
        }
      });
    }

    if (catSelect) catSelect.addEventListener('change', trigger);
    if (statusSelect) statusSelect.addEventListener('change', trigger);
    if (stockSelect) stockSelect.addEventListener('change', trigger);
  },

  resetProductFilter: () => {
    AdminPage.productsParams = {
      q: '',
      category: 'all',
      status: 'all',
      stockStatus: 'all',
      page: 1,
      limit: 100
    };
    AdminPage.renderProducts(document.getElementById('admin-subpage-container'));
  },

  // ==========================================
  // 3. QUẢN LÝ GẠCH LẺ (PICK-A-BRICK) VỚI BỘ LỌC
  // ==========================================
  renderBricks: async (container) => {
    try {
      const res = await API.admin.getBricks(AdminPage.bricksParams);
      const bricks = (res.success && res.data) ? res.data.bricks : [];
      const total = (res.success && res.data && res.data.total !== undefined) ? res.data.total : bricks.length;
      const categories = (res.success && res.data && res.data.categories) ? res.data.categories : [
        'Gạch cơ bản (Standard)',
        'Tấm phẳng (Plates & Tiles)',
        'Kỹ thuật & Bánh răng (Technic)',
        'Khớp nối & Trục (Pins & Axles)',
        'Trong suốt & Pha lê (Trans-Clear)',
        'Đặc biệt & Chi tiết nhỏ'
      ];
      const colors = (res.success && res.data && res.data.colors) ? res.data.colors : [];

      AdminPage.cachedBrickCategories = categories;
      AdminPage.cachedBrickColors = colors;

      container.innerHTML = `
        <div class="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-6">
          <!-- Header tab & Nút thao tác -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 class="text-base font-bold font-heading text-slate-100 flex items-center space-x-2">
                <span>Kho Gạch Lẻ Pick-a-Brick</span>
                <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">${total}</span>
              </h2>
              <p class="text-xs text-slate-400">Chỉnh sửa tồn kho và đơn giá trực tiếp trên từng dòng (Inline Update)</p>
            </div>
            <div class="flex items-center space-x-2">
              <button onclick="AdminPage.openImportCSVModal()" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center space-x-1.5">
                <i class="fa-solid fa-file-csv text-amber-400"></i>
                <span>Nhập CSV</span>
              </button>
              <button onclick="AdminPage.openBrickModal()" class="px-4 py-2 rounded-xl btn-gold text-slate-950 font-bold text-xs transition flex items-center space-x-1.5 shadow-md">
                <i class="fa-solid fa-plus text-xs"></i>
                <span>Thêm Gạch Mới</span>
              </button>
            </div>
          </div>

          <!-- BỘ LỌC GẠCH LẺ DÀNH CHO ADMIN -->
          <div class="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              
              <!-- 1. Tìm theo mã #3001 hoặc tên gạch (4 cột) -->
              <div class="lg:col-span-4 relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <i class="fa-solid fa-magnifying-glass text-xs"></i>
                </span>
                <input type="text" id="adm-brick-search" value="${UI.escapeHTML(AdminPage.bricksParams.q || '')}" class="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition" placeholder="Nhập mã #3001 hoặc tên chi tiết...">
              </div>

              <!-- 2. Lọc loại gạch (3 cột) -->
              <div class="lg:col-span-3">
                <select id="adm-brick-category" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition">
                  <option value="all">Tất cả loại gạch</option>
                  ${categories.map(c => `
                    <option value="${UI.escapeHTML(c)}" ${AdminPage.bricksParams.category === c ? 'selected' : ''}>${UI.escapeHTML(c)}</option>
                  `).join('')}
                </select>
              </div>

              <!-- 3. Lọc màu sắc (3 cột) -->
              <div class="lg:col-span-3">
                <select id="adm-brick-color" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition">
                  <option value="all">Tất cả màu sắc</option>
                  ${colors.map(col => `
                    <option value="${UI.escapeHTML(col)}" ${AdminPage.bricksParams.color === col ? 'selected' : ''}>${UI.escapeHTML(col)}</option>
                  `).join('')}
                </select>
              </div>

              <!-- 4. Lọc tồn kho & Nút Reset (2 cột) -->
              <div class="lg:col-span-2 flex items-center space-x-2">
                <select id="adm-brick-stock" class="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition">
                  <option value="all" ${AdminPage.bricksParams.stockStatus === 'all' ? 'selected' : ''}>Tất cả tồn kho</option>
                  <option value="inStock" ${AdminPage.bricksParams.stockStatus === 'inStock' ? 'selected' : ''}>Còn hàng</option>
                  <option value="lowStock" ${AdminPage.bricksParams.stockStatus === 'lowStock' ? 'selected' : ''}>Sắp hết (&le;30)</option>
                  <option value="outOfStock" ${AdminPage.bricksParams.stockStatus === 'outOfStock' ? 'selected' : ''}>Hết hàng (0)</option>
                </select>

                <button onclick="AdminPage.resetBrickFilter()" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition" title="Đặt lại bộ lọc">
                  <i class="fa-solid fa-rotate-right text-xs"></i>
                </button>
              </div>

            </div>

            <!-- Dòng thông tin kết quả -->
            <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Hiển thị <strong class="text-amber-400 font-mono">${bricks.length}</strong> trên tổng số <strong class="text-slate-200 font-mono">${total}</strong> mã gạch</span>
              ${(AdminPage.bricksParams.q || AdminPage.bricksParams.category !== 'all' || AdminPage.bricksParams.color !== 'all' || AdminPage.bricksParams.stockStatus !== 'all') ? `
                <button onclick="AdminPage.resetBrickFilter()" class="text-amber-400 hover:underline">
                  <i class="fa-solid fa-xmark mr-1"></i>Xóa bộ lọc
                </button>
              ` : ''}
            </div>
          </div>

          <!-- BẢNG GẠCH LẺ -->
          ${bricks.length === 0 ? `
            <div class="py-12 text-center">
              <i class="fa-solid fa-puzzle-piece text-3xl text-slate-600 mb-2"></i>
              <p class="text-xs text-slate-400 mb-4">Không tìm thấy mã gạch nào khớp với tiêu chí tìm kiếm</p>
              <button onclick="AdminPage.resetBrickFilter()" class="px-4 py-2 rounded-xl btn-gold text-slate-950 font-bold text-xs">
                Xem Tất Cả Gạch Lẻ
              </button>
            </div>
          ` : `
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-300">
                <thead class="text-[11px] uppercase bg-slate-900/80 text-amber-400 border-b border-slate-800">
                  <tr>
                    <th class="py-3 px-4">Mã gạch</th>
                    <th class="py-3 px-4">Tên chi tiết</th>
                    <th class="py-3 px-4">Màu sắc</th>
                    <th class="py-3 px-4">Loại gạch</th>
                    <th class="py-3 px-4 w-32">Đơn giá (đ)</th>
                    <th class="py-3 px-4 w-28">Tồn kho</th>
                    <th class="py-3 px-4 text-right">Lưu nhanh</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800">
                  ${bricks.map(b => `
                    <tr class="hover:bg-slate-900/40 transition">
                      <td class="py-3 px-4 font-mono font-bold text-amber-300">${UI.escapeHTML(b.code)}</td>
                      <td class="py-3 px-4 font-medium text-slate-100 max-w-xs truncate">${UI.escapeHTML(b.name)}</td>
                      <td class="py-3 px-4">
                        <div class="flex items-center space-x-1.5">
                          <span class="w-3.5 h-3.5 rounded-full border border-white/20" style="background-color: ${b.colorHex}"></span>
                          <span class="text-[11px]">${UI.escapeHTML(b.color)}</span>
                        </div>
                      </td>
                      <td class="py-3 px-4 text-[11px] text-slate-400">${UI.escapeHTML(b.category)}</td>

                      <!-- SỬA GIÁ INLINE -->
                      <td class="py-3 px-4">
                        <input type="number" id="inline-price-${b._id}" value="${b.price}" step="100" class="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-400">
                      </td>

                      <!-- SỬA TỒN KHO INLINE -->
                      <td class="py-3 px-4">
                        <input type="number" id="inline-stock-${b._id}" value="${b.stock}" min="0" class="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-400">
                      </td>

                      <!-- NÚT LƯU NHANH -->
                      <td class="py-3 px-4 text-right">
                        <button onclick="AdminPage.saveInlineBrick('${b._id}')" class="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 text-[11px] font-bold transition flex items-center space-x-1 ml-auto">
                          <i class="fa-solid fa-check"></i>
                          <span>Lưu</span>
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      `;

      // Gắn sự kiện cho bộ lọc gạch lẻ
      AdminPage.bindBrickFilterEvents();

    } catch (err) {
      container.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi', err.message);
    }
  },

  bindBrickFilterEvents: () => {
    const searchInput = document.getElementById('adm-brick-search');
    const catSelect = document.getElementById('adm-brick-category');
    const colorSelect = document.getElementById('adm-brick-color');
    const stockSelect = document.getElementById('adm-brick-stock');

    const trigger = () => {
      AdminPage.bricksParams.q = searchInput ? searchInput.value.trim() : '';
      AdminPage.bricksParams.category = catSelect ? catSelect.value : 'all';
      AdminPage.bricksParams.color = colorSelect ? colorSelect.value : 'all';
      AdminPage.bricksParams.stockStatus = stockSelect ? stockSelect.value : 'all';
      AdminPage.renderBricks(document.getElementById('admin-subpage-container'));
    };

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(AdminPage.searchDebounceTimer);
        AdminPage.searchDebounceTimer = setTimeout(trigger, 300);
      });
      searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          clearTimeout(AdminPage.searchDebounceTimer);
          trigger();
        }
      });
    }

    if (catSelect) catSelect.addEventListener('change', trigger);
    if (colorSelect) colorSelect.addEventListener('change', trigger);
    if (stockSelect) stockSelect.addEventListener('change', trigger);
  },

  resetBrickFilter: () => {
    AdminPage.bricksParams = {
      q: '',
      category: 'all',
      color: 'all',
      stockStatus: 'all',
      page: 1,
      limit: 100
    };
    AdminPage.renderBricks(document.getElementById('admin-subpage-container'));
  },

  saveInlineBrick: async (brickId) => {
    const priceInput = document.getElementById(`inline-price-${brickId}`);
    const stockInput = document.getElementById(`inline-stock-${brickId}`);

    const price = Number(priceInput.value);
    const stock = Number(stockInput.value);

    try {
      const res = await API.admin.updateBrick(brickId, { price, stock });
      if (res.success) {
        UI.toast('success', `Đã cập nhật gạch ${res.data.code}: Giá ${UI.formatCurrency(price)}, Tồn ${stock}`);
      }
    } catch (err) {
      UI.toast('error', err.message);
    }
  },

  // ==========================================
  // 4. QUẢN LÝ ĐƠN HÀNG (VỚI BỘ LỌC TRẠNG THÁI & TÌM KIẾM)
  // ==========================================
  renderOrders: async (container) => {
    try {
      const res = await API.admin.getOrders(AdminPage.ordersParams);
      const orders = (res.success && res.data) ? res.data.orders : [];
      const total = (res.success && res.data && res.data.total !== undefined) ? res.data.total : orders.length;

      container.innerHTML = `
        <div class="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-6">
          <!-- Header tab -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 class="text-base font-bold font-heading text-slate-100 flex items-center space-x-2">
                <span>Quản Lý Đơn Hàng</span>
                <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">${total}</span>
              </h2>
              <p class="text-xs text-slate-400">Cập nhật trạng thái đơn: Chờ xác nhận &rarr; Đã xác nhận &rarr; Đang giao &rarr; Hoàn tất / Đã hủy</p>
            </div>
          </div>

          <!-- BỘ LỌC ĐƠN HÀNG -->
          <div class="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              
              <!-- 1. Tìm theo mã đơn / Tên / SĐT (7 cột) -->
              <div class="lg:col-span-7 relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <i class="fa-solid fa-magnifying-glass text-xs"></i>
                </span>
                <input type="text" id="adm-order-search" value="${UI.escapeHTML(AdminPage.ordersParams.q || '')}" class="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition" placeholder="Tìm theo mã đơn (ORD-xxxxxx), tên người nhận, số điện thoại...">
              </div>

              <!-- 2. Lọc trạng thái đơn (4 cột) -->
              <div class="lg:col-span-4">
                <select id="adm-order-status" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition">
                  <option value="all" ${AdminPage.ordersParams.status === 'all' ? 'selected' : ''}>Tất cả trạng thái đơn</option>
                  <option value="Chờ xác nhận" ${AdminPage.ordersParams.status === 'Chờ xác nhận' ? 'selected' : ''}>Chờ xác nhận</option>
                  <option value="Đã xác nhận" ${AdminPage.ordersParams.status === 'Đã xác nhận' ? 'selected' : ''}>Đã xác nhận</option>
                  <option value="Đang giao" ${AdminPage.ordersParams.status === 'Đang giao' ? 'selected' : ''}>Đang giao</option>
                  <option value="Hoàn tất" ${AdminPage.ordersParams.status === 'Hoàn tất' ? 'selected' : ''}>Hoàn tất</option>
                  <option value="Đã hủy" ${AdminPage.ordersParams.status === 'Đã hủy' ? 'selected' : ''}>Đã hủy</option>
                </select>
              </div>

              <!-- 3. Nút Reset (1 cột) -->
              <div class="lg:col-span-1 flex justify-end">
                <button onclick="AdminPage.resetOrderFilter()" class="w-full p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center justify-center" title="Đặt lại bộ lọc">
                  <i class="fa-solid fa-rotate-right text-xs"></i>
                </button>
              </div>

            </div>

            <!-- Dòng thông tin kết quả -->
            <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Hiển thị <strong class="text-amber-400 font-mono">${orders.length}</strong> trên tổng số <strong class="text-slate-200 font-mono">${total}</strong> đơn hàng</span>
              ${(AdminPage.ordersParams.q || AdminPage.ordersParams.status !== 'all') ? `
                <button onclick="AdminPage.resetOrderFilter()" class="text-amber-400 hover:underline">
                  <i class="fa-solid fa-xmark mr-1"></i>Xóa bộ lọc
                </button>
              ` : ''}
            </div>
          </div>

          <!-- BẢNG ĐƠN HÀNG -->
          ${orders.length === 0 ? `
            <div class="py-12 text-center">
              <i class="fa-solid fa-receipt text-3xl text-slate-600 mb-2"></i>
              <p class="text-xs text-slate-400 mb-4">Không tìm thấy đơn hàng nào khớp với tìm kiếm</p>
              <button onclick="AdminPage.resetOrderFilter()" class="px-4 py-2 rounded-xl btn-gold text-slate-950 font-bold text-xs">
                Xem Tất Cả Đơn Hàng
              </button>
            </div>
          ` : `
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-300">
                <thead class="text-[11px] uppercase bg-slate-900/80 text-amber-400 border-b border-slate-800">
                  <tr>
                    <th class="py-3 px-4">Mã đơn</th>
                    <th class="py-3 px-4">Khách hàng</th>
                    <th class="py-3 px-4">Ngày đặt</th>
                    <th class="py-3 px-4">Tổng tiền</th>
                    <th class="py-3 px-4">Trạng thái hiện tại</th>
                    <th class="py-3 px-4 text-right">Cập nhật trạng thái</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800">
                  ${orders.map(ord => `
                    <tr class="hover:bg-slate-900/40 transition">
                      <td class="py-3 px-4 font-mono font-bold text-amber-300">
                        <a href="#/orders/${ord._id}" class="hover:underline flex items-center space-x-1">
                          <span>${UI.escapeHTML(ord.code)}</span>
                          <i class="fa-solid fa-arrow-up-right-from-square text-[9px] text-slate-500"></i>
                        </a>
                      </td>
                      <td class="py-3 px-4">
                        <span class="font-bold text-slate-200 block">${UI.escapeHTML(ord.shipping.fullName)}</span>
                        <span class="text-[11px] text-slate-400 font-mono">${UI.escapeHTML(ord.shipping.phone)}</span>
                      </td>
                      <td class="py-3 px-4">${UI.formatDate(ord.createdAt)}</td>
                      <td class="py-3 px-4 font-mono font-bold text-amber-300">${UI.formatCurrency(ord.total)}</td>
                      <td class="py-3 px-4">${OrdersPage.getStatusBadge(ord.status)}</td>
                      <td class="py-3 px-4 text-right">
                        <select onchange="AdminPage.changeOrderStatus('${ord._id}', this.value)" class="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-400">
                          <option value="Chờ xác nhận" ${ord.status === 'Chờ xác nhận' ? 'selected' : ''}>Chờ xác nhận</option>
                          <option value="Đã xác nhận" ${ord.status === 'Đã xác nhận' ? 'selected' : ''}>Đã xác nhận</option>
                          <option value="Đang giao" ${ord.status === 'Đang giao' ? 'selected' : ''}>Đang giao</option>
                          <option value="Hoàn tất" ${ord.status === 'Hoàn tất' ? 'selected' : ''}>Hoàn tất</option>
                          <option value="Đã hủy" ${ord.status === 'Đã hủy' ? 'selected' : ''}>Đã hủy (Hoàn tồn)</option>
                        </select>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      `;

      // Gắn sự kiện bộ lọc đơn hàng
      AdminPage.bindOrderFilterEvents();

    } catch (err) {
      container.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi', err.message);
    }
  },

  bindOrderFilterEvents: () => {
    const searchInput = document.getElementById('adm-order-search');
    const statusSelect = document.getElementById('adm-order-status');

    const trigger = () => {
      AdminPage.ordersParams.q = searchInput ? searchInput.value.trim() : '';
      AdminPage.ordersParams.status = statusSelect ? statusSelect.value : 'all';
      AdminPage.renderOrders(document.getElementById('admin-subpage-container'));
    };

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(AdminPage.searchDebounceTimer);
        AdminPage.searchDebounceTimer = setTimeout(trigger, 300);
      });
      searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          clearTimeout(AdminPage.searchDebounceTimer);
          trigger();
        }
      });
    }

    if (statusSelect) statusSelect.addEventListener('change', trigger);
  },

  resetOrderFilter: () => {
    AdminPage.ordersParams = {
      q: '',
      status: 'all',
      page: 1,
      limit: 50
    };
    AdminPage.renderOrders(document.getElementById('admin-subpage-container'));
  },

  changeOrderStatus: async (orderId, newStatus) => {
    const note = prompt(`Nhập ghi chú cập nhật trạng thái đơn sang "${newStatus}":`, `Admin cập nhật sang ${newStatus}`);
    if (note === null) return;

    try {
      const res = await API.admin.updateOrderStatus(orderId, newStatus, note);
      if (res.success) {
        UI.toast('success', `Đã cập nhật trạng thái đơn sang "${newStatus}"`);
        await AdminPage.loadSubpage();
      }
    } catch (err) {
      UI.toast('error', err.message);
    }
  },

  // ==========================================
  // 5. QUẢN LÝ NGƯỜI DÙNG (VỚI BỘ LỌC TÌM KIẾM)
  // ==========================================
  renderUsers: async (container) => {
    try {
      const res = await API.admin.getUsers(AdminPage.usersParams);
      const users = (res.success && res.data) ? res.data.users : [];
      const total = (res.success && res.data && res.data.total !== undefined) ? res.data.total : users.length;

      container.innerHTML = `
        <div class="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-6">
          <!-- Header tab -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 class="text-base font-bold font-heading text-slate-100 flex items-center space-x-2">
                <span>Danh Sách Tài Khoản</span>
                <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">${total}</span>
              </h2>
              <p class="text-xs text-slate-400">Danh sách khách hàng và quản trị viên hệ thống</p>
            </div>
          </div>

          <!-- BỘ LỌC NGƯỜI DÙNG -->
          <div class="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              
              <!-- 1. Tìm theo tên / username / email / phone (7 cột) -->
              <div class="lg:col-span-7 relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <i class="fa-solid fa-magnifying-glass text-xs"></i>
                </span>
                <input type="text" id="adm-user-search" value="${UI.escapeHTML(AdminPage.usersParams.q || '')}" class="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition" placeholder="Tìm theo họ tên, username, email hoặc SĐT...">
              </div>

              <!-- 2. Lọc vai trò (4 cột) -->
              <div class="lg:col-span-4">
                <select id="adm-user-role" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition">
                  <option value="all" ${AdminPage.usersParams.role === 'all' ? 'selected' : ''}>Tất cả vai trò</option>
                  <option value="customer" ${AdminPage.usersParams.role === 'customer' ? 'selected' : ''}>Khách hàng</option>
                  <option value="admin" ${AdminPage.usersParams.role === 'admin' ? 'selected' : ''}>Quản trị viên (Admin)</option>
                </select>
              </div>

              <!-- 3. Nút Reset (1 cột) -->
              <div class="lg:col-span-1 flex justify-end">
                <button onclick="AdminPage.resetUserFilter()" class="w-full p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center justify-center" title="Đặt lại bộ lọc">
                  <i class="fa-solid fa-rotate-right text-xs"></i>
                </button>
              </div>

            </div>

            <!-- Dòng thông tin kết quả -->
            <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Hiển thị <strong class="text-amber-400 font-mono">${users.length}</strong> trên tổng số <strong class="text-slate-200 font-mono">${total}</strong> tài khoản</span>
              ${(AdminPage.usersParams.q || AdminPage.usersParams.role !== 'all') ? `
                <button onclick="AdminPage.resetUserFilter()" class="text-amber-400 hover:underline">
                  <i class="fa-solid fa-xmark mr-1"></i>Xóa bộ lọc
                </button>
              ` : ''}
            </div>
          </div>

          <!-- BẢNG TÀI KHOẢN -->
          ${users.length === 0 ? `
            <div class="py-12 text-center">
              <i class="fa-solid fa-users text-3xl text-slate-600 mb-2"></i>
              <p class="text-xs text-slate-400 mb-4">Không tìm thấy tài khoản nào khớp với tiêu chí tìm kiếm</p>
              <button onclick="AdminPage.resetUserFilter()" class="px-4 py-2 rounded-xl btn-gold text-slate-950 font-bold text-xs">
                Xem Tất Cả Tài Khoản
              </button>
            </div>
          ` : `
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-300">
                <thead class="text-[11px] uppercase bg-slate-900/80 text-amber-400 border-b border-slate-800">
                  <tr>
                    <th class="py-3 px-4">Họ và tên</th>
                    <th class="py-3 px-4">Tên đăng nhập</th>
                    <th class="py-3 px-4">Email</th>
                    <th class="py-3 px-4">Số điện thoại</th>
                    <th class="py-3 px-4">Vai trò</th>
                    <th class="py-3 px-4">Ngày tham gia</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800">
                  ${users.map(u => `
                    <tr class="hover:bg-slate-900/40 transition">
                      <td class="py-3 px-4 font-bold text-slate-100">${UI.escapeHTML(u.name)}</td>
                      <td class="py-3 px-4 font-mono text-amber-300">${UI.escapeHTML(u.username)}</td>
                      <td class="py-3 px-4 font-mono text-slate-300">${UI.escapeHTML(u.email)}</td>
                      <td class="py-3 px-4 font-mono">${UI.escapeHTML(u.phone || 'Chưa cập nhật')}</td>
                      <td class="py-3 px-4">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300'}">
                          ${u.role === 'admin' ? 'QUẢN TRỊ VIÊN' : 'KHÁCH HÀNG'}
                        </span>
                      </td>
                      <td class="py-3 px-4">${UI.formatDate(u.createdAt, false)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      `;

      // Gắn sự kiện bộ lọc người dùng
      AdminPage.bindUserFilterEvents();

    } catch (err) {
      container.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi', err.message);
    }
  },

  bindUserFilterEvents: () => {
    const searchInput = document.getElementById('adm-user-search');
    const roleSelect = document.getElementById('adm-user-role');

    const trigger = () => {
      AdminPage.usersParams.q = searchInput ? searchInput.value.trim() : '';
      AdminPage.usersParams.role = roleSelect ? roleSelect.value : 'all';
      AdminPage.renderUsers(document.getElementById('admin-subpage-container'));
    };

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(AdminPage.searchDebounceTimer);
        AdminPage.searchDebounceTimer = setTimeout(trigger, 300);
      });
      searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          clearTimeout(AdminPage.searchDebounceTimer);
          trigger();
        }
      });
    }

    if (roleSelect) roleSelect.addEventListener('change', trigger);
  },

  resetUserFilter: () => {
    AdminPage.usersParams = {
      q: '',
      role: 'all',
      page: 1,
      limit: 50
    };
    AdminPage.renderUsers(document.getElementById('admin-subpage-container'));
  },

  // ==========================================
  // MODAL NHẬP CSV GẠCH LẺ
  // ==========================================
  openImportCSVModal: () => {
    const csvContent = prompt(
      'Dán nội dung CSV gạch lẻ theo định dạng:\nMã gạch, Tên, Màu sắc, Mã Hex, Danh mục, Đơn giá, Tồn kho\n\nVí dụ:\n#3001,Brick 2x4 Đỏ,Đỏ,#dc2626,Gạch cơ bản (Standard),3000,100\n#3002,Brick 2x3 Xanh,Xanh,#2563eb,Gạch cơ bản (Standard),2500,50'
    );

    if (!csvContent || !csvContent.trim()) return;

    const lines = csvContent.trim().split('\n');
    const bricksToImport = [];

    lines.forEach(line => {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length >= 4) {
        bricksToImport.push({
          code: parts[0],
          name: parts[1],
          color: parts[2],
          colorHex: parts[3] || '#f59e0b',
          category: parts[4] || 'Gạch cơ bản (Standard)',
          price: Number(parts[5]) || 2000,
          stock: Number(parts[6]) || 0
        });
      }
    });

    if (bricksToImport.length === 0) {
      UI.toast('warning', 'Không phân tích được dòng nào từ dữ liệu CSV');
      return;
    }

    API.admin.importBricksCSV(bricksToImport)
      .then(res => {
        UI.toast('success', res.message);
        AdminPage.renderBricks(document.getElementById('admin-subpage-container'));
      })
      .catch(err => UI.toast('error', err.message));
  },

  // ==========================================
  // MODAL THÊM / SỬA SẢN PHẨM HOÀN CHỈNH
  // ==========================================
  openProductModal: (prodId = null) => {
    const prod = prodId ? AdminPage.cachedProducts.find(p => p._id === prodId) : null;
    const isEdit = !!prod;

    const oldModal = document.getElementById('admin-product-modal');
    if (oldModal) oldModal.remove();

    const categories = AdminPage.cachedCategories && AdminPage.cachedCategories.length > 0
      ? AdminPage.cachedCategories
      : [
        'Technic & Cơ khí',
        'Kiến trúc & Di sản',
        'Phương tiện siêu xe',
        'Vũ trụ & Viễn tưởng',
        'Robot & Mecha',
        'Bộ lắp ráp Mini'
      ];

    const currentImg = (prod && prod.images && prod.images[0]) || '';

    const modalHtml = `
      <div id="admin-product-modal" class="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <div class="glass-panel w-full max-w-2xl p-6 sm:p-8 rounded-3xl relative border border-amber-500/30 shadow-2xl my-8 animate-celestial">
          
          <!-- Nút đóng -->
          <button type="button" onclick="document.getElementById('admin-product-modal').remove()" class="absolute top-5 right-5 text-slate-400 hover:text-slate-100 transition p-1">
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>

          <!-- Tiêu đề Modal -->
          <div class="border-b border-slate-800 pb-4 mb-6">
            <span class="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
              ${isEdit ? 'CẬP NHẬT THÔNG TIN MÔ HÌNH' : 'KHỞI TẠO MÔ HÌNH MỚI'}
            </span>
            <h2 class="text-xl font-extrabold font-heading text-slate-100">
              ${isEdit ? `Chỉnh Sửa: ${UI.escapeHTML(prod.name)}` : 'Thêm Mới Mô Hình Lắp Ráp'}
            </h2>
          </div>

          <!-- Form chỉnh sửa sản phẩm -->
          <form id="admin-product-form" class="space-y-4 text-xs">
            
            <!-- Tên sản phẩm -->
            <div>
              <label class="block font-semibold text-slate-200 mb-1">Tên sản phẩm *</label>
              <input type="text" id="adm-p-name" required value="${UI.escapeHTML((prod && prod.name) || '')}" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition" placeholder="Ví dụ: Siêu xe F1 Technic Vô Địch 2026">
            </div>

            <!-- Danh mục & Trạng thái kinh doanh -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-200 mb-1">Danh mục *</label>
                <select id="adm-p-category" required class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition">
                  ${categories.map(c => `
                    <option value="${UI.escapeHTML(c)}" ${(prod && prod.category === c) ? 'selected' : ''}>${UI.escapeHTML(c)}</option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label class="block font-semibold text-slate-200 mb-1">Trạng thái kinh doanh</label>
                <select id="adm-p-active" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition">
                  <option value="true" ${(!prod || prod.isActive !== false) ? 'selected' : ''}>Đang mở bán (Hiển thị)</option>
                  <option value="false" ${(prod && prod.isActive === false) ? 'selected' : ''}>Tạm ẩn khỏi cửa hàng</option>
                </select>
              </div>
            </div>

            <!-- Giá niêm yết & Giá khuyến mãi -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-200 mb-1">Giá bán niêm yết (VND) *</label>
                <input type="number" id="adm-p-price" required min="0" step="1000" value="${(prod && prod.price) || 1000000}" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-400 transition">
              </div>

              <div>
                <label class="block font-semibold text-slate-200 mb-1">Giá khuyến mãi (để trống nếu không giảm)</label>
                <input type="number" id="adm-p-saleprice" min="0" step="1000" value="${(prod && prod.salePrice) || ''}" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-400 transition" placeholder="Ví dụ: 890000">
              </div>
            </div>

            <!-- Tồn kho, Số mảnh ghép, Độ tuổi -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block font-semibold text-slate-200 mb-1">Số lượng tồn kho *</label>
                <input type="number" id="adm-p-stock" required min="0" value="${(prod && prod.stock !== undefined) ? prod.stock : 20}" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-400 transition">
              </div>

              <div>
                <label class="block font-semibold text-slate-200 mb-1">Số mảnh ghép</label>
                <input type="number" id="adm-p-pieces" min="0" value="${(prod && prod.pieceCount) || 500}" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-400 transition">
              </div>

              <div>
                <label class="block font-semibold text-slate-200 mb-1">Độ tuổi</label>
                <input type="text" id="adm-p-age" value="${UI.escapeHTML((prod && prod.ageRange) || '8+')}" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition" placeholder="8+, 14+, 18+">
              </div>
            </div>

            <!-- Mã SKU & Mã QR -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-200 mb-1">Mã SKU</label>
                <input type="text" id="adm-p-sku" value="${UI.escapeHTML((prod && prod.sku) || '')}" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-400 transition" placeholder="Ví dụ: TECH-F1-1639">
              </div>

              <div>
                <label class="block font-semibold text-slate-200 mb-1">Mã QR (tra cứu O2O tại showroom)</label>
                <input type="text" id="adm-p-qr" value="${UI.escapeHTML((prod && prod.qrCode) || '')}" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-400 transition" placeholder="Ví dụ: TOYBRICK-F1-2026">
              </div>
            </div>

            <!-- Link hình ảnh -->
            <div>
              <label class="block font-semibold text-slate-200 mb-1">URL Hình ảnh đại diện</label>
              <input type="url" id="adm-p-image" value="${UI.escapeHTML(currentImg)}" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition" placeholder="https://images.unsplash.com/...">
            </div>

            <!-- Mô tả chi tiết -->
            <div>
              <label class="block font-semibold text-slate-200 mb-1">Mô tả sản phẩm</label>
              <textarea id="adm-p-desc" rows="3" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition resize-none" placeholder="Nhập câu chuyện và mô tả chi tiết mô hình...">${UI.escapeHTML((prod && prod.description) || '')}</textarea>
            </div>

            <!-- Nút hành động -->
            <div class="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
              <button type="button" onclick="document.getElementById('admin-product-modal').remove()" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold transition">
                Hủy bỏ
              </button>
              <button type="submit" id="adm-p-submit-btn" class="px-6 py-2.5 rounded-xl btn-gold text-slate-950 font-bold transition flex items-center space-x-2 shadow-lg">
                <i class="fa-solid fa-floppy-disk text-xs"></i>
                <span>${isEdit ? 'Lưu Cập Nhật' : 'Tạo Sản Phẩm Mới'}</span>
              </button>
            </div>

          </form>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Gắn sự kiện submit form
    const form = document.getElementById('admin-product-form');
    const submitBtn = document.getElementById('adm-p-submit-btn');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('adm-p-name').value.trim();
        const category = document.getElementById('adm-p-category').value;
        const isActive = document.getElementById('adm-p-active').value === 'true';
        const price = Number(document.getElementById('adm-p-price').value);
        const salePriceRaw = document.getElementById('adm-p-saleprice').value.trim();
        const salePrice = salePriceRaw ? Number(salePriceRaw) : null;
        const stock = Number(document.getElementById('adm-p-stock').value);
        const pieceCount = Number(document.getElementById('adm-p-pieces').value) || 0;
        const ageRange = document.getElementById('adm-p-age').value.trim() || '8+';
        const sku = document.getElementById('adm-p-sku').value.trim();
        const qrCode = document.getElementById('adm-p-qr').value.trim();
        const image = document.getElementById('adm-p-image').value.trim();
        const description = document.getElementById('adm-p-desc').value.trim();

        if (!name || isNaN(price)) {
          UI.toast('warning', 'Vui lòng điền đầy đủ tên và giá sản phẩm');
          return;
        }

        const payload = {
          name,
          category,
          isActive,
          price,
          salePrice,
          stock,
          pieceCount,
          ageRange,
          sku: sku || undefined,
          qrCode: qrCode || undefined,
          images: image ? [image] : (prod && prod.images ? prod.images : []),
          description
        };

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `
            <div class="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mr-1.5"></div>
            <span>Đang lưu...</span>
          `;
        }

        try {
          if (isEdit) {
            const res = await API.admin.updateProduct(prodId, payload);
            if (res.success) {
              UI.toast('success', `Đã cập nhật sản phẩm "${name}" thành công!`);
            }
          } else {
            const res = await API.admin.createProduct(payload);
            if (res.success) {
              UI.toast('success', `Đã thêm mới sản phẩm "${name}" thành công!`);
            }
          }

          const modalEl = document.getElementById('admin-product-modal');
          if (modalEl) modalEl.remove();

          // Tải lại danh sách sản phẩm
          await AdminPage.renderProducts(document.getElementById('admin-subpage-container'));

        } catch (err) {
          UI.toast('error', err.message || 'Lỗi khi lưu sản phẩm');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
              <i class="fa-solid fa-floppy-disk text-xs mr-1.5"></i>
              <span>${isEdit ? 'Lưu Cập Nhật' : 'Tạo Sản Phẩm Mới'}</span>
            `;
          }
        }
      });
    }
  },

  deleteProduct: async (prodId, name) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) return;

    try {
      const res = await API.admin.deleteProduct(prodId);
      if (res.success) {
        UI.toast('info', 'Đã xóa sản phẩm');
        await AdminPage.renderProducts(document.getElementById('admin-subpage-container'));
      }
    } catch (err) {
      UI.toast('error', err.message);
    }
  },

  // ==========================================
  // THÊM GẠCH MỚI
  // ==========================================
  openBrickModal: () => {
    const code = prompt('Nhập mã gạch (Ví dụ #3001):');
    if (!code) return;
    const name = prompt('Nhập tên gạch:');
    if (!name) return;
    const color = prompt('Tên màu sắc (Ví dụ: Đỏ Cổ Điển):', 'Đỏ Cổ Điển');
    const colorHex = prompt('Mã màu Hex (Ví dụ #dc2626):', '#dc2626');
    const price = prompt('Đơn giá (VND):', '3000');
    const stock = prompt('Tồn kho:', '100');

    API.admin.createBrick({
      code,
      name,
      color: color || 'Vàng Hoàng Kim',
      colorHex: colorHex || '#f59e0b',
      category: 'Gạch cơ bản (Standard)',
      price: Number(price) || 2000,
      stock: Number(stock) || 0
    })
      .then(() => {
        UI.toast('success', 'Đã thêm mã gạch mới thành công');
        AdminPage.renderBricks(document.getElementById('admin-subpage-container'));
      })
      .catch(err => UI.toast('error', err.message));
  },

  destroy: () => {
    clearTimeout(AdminPage.searchDebounceTimer);
  }
};

window.AdminPage = AdminPage;