/**
 * Trang Quản Trị Studio (Admin Dashboard & Management)
 * Biểu đồ SVG/Canvas thuần + Quản lý Sản phẩm + Sửa tồn kho gạch inline + Quản lý Đơn + Người dùng
 */
const AdminPage = {
  currentTab: 'dashboard',

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
          <button class="admin-tab-btn px-4 py-2 rounded-xl font-bold transition ${AdminPage.currentTab === 'dashboard' ? 'btn-gold text-slate-950' : 'text-slate-300 hover:text-white'}" onclick="AdminPage.switchTab('dashboard')">
            <i class="fa-solid fa-chart-line mr-1"></i>Thống kê
          </button>
          <button class="admin-tab-btn px-4 py-2 rounded-xl font-bold transition ${AdminPage.currentTab === 'products' ? 'btn-gold text-slate-950' : 'text-slate-300 hover:text-white'}" onclick="AdminPage.switchTab('products')">
            <i class="fa-solid fa-box-open mr-1"></i>Sản phẩm
          </button>
          <button class="admin-tab-btn px-4 py-2 rounded-xl font-bold transition ${AdminPage.currentTab === 'bricks' ? 'btn-gold text-slate-950' : 'text-slate-300 hover:text-white'}" onclick="AdminPage.switchTab('bricks')">
            <i class="fa-solid fa-puzzle-piece mr-1"></i>Kho Gạch Lẻ
          </button>
          <button class="admin-tab-btn px-4 py-2 rounded-xl font-bold transition ${AdminPage.currentTab === 'orders' ? 'btn-gold text-slate-950' : 'text-slate-300 hover:text-white'}" onclick="AdminPage.switchTab('orders')">
            <i class="fa-solid fa-receipt mr-1"></i>Đơn hàng
          </button>
          <button class="admin-tab-btn px-4 py-2 rounded-xl font-bold transition ${AdminPage.currentTab === 'users' ? 'btn-gold text-slate-950' : 'text-slate-300 hover:text-white'}" onclick="AdminPage.switchTab('users')">
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

    await AdminPage.loadSubpage();
  },

  switchTab: async (tab) => {
    AdminPage.currentTab = tab;
    const btns = document.querySelectorAll('.admin-tab-btn');
    btns.forEach(btn => {
      btn.className = 'admin-tab-btn px-4 py-2 rounded-xl font-bold transition text-slate-300 hover:text-white';
    });
    const clicked = Array.from(btns).find(b => b.textContent.includes(
      tab === 'dashboard' ? 'Thống kê' :
      tab === 'products' ? 'Sản phẩm' :
      tab === 'bricks' ? 'Kho Gạch' :
      tab === 'orders' ? 'Đơn hàng' : 'Khách hàng'
    ));
    if (clicked) {
      clicked.className = 'admin-tab-btn px-4 py-2 rounded-xl font-bold transition btn-gold text-slate-950';
    }

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

  // 1. DASHBOARD THỐNG KÊ
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
            <p class="text-[11px] text-slate-400">Từ ${d.totalOrders} đơn hàng hoàn tất</p>
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
            <div class="w-full h-64 flex items-center justify-center">
              ${AdminPage.renderRevenueChart(d.dailyRevenue || [])}
            </div>
          </div>

          <!-- TRẠNG THÁI ĐƠN HÀNG (4 CỘT) -->
          <div class="lg:col-span-4 glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-4">
            <h3 class="text-sm font-bold font-heading text-slate-100 border-b border-slate-800 pb-3">
              Phân Bổ Đơn Hàng
            </h3>
            <div class="space-y-3">
              ${(d.ordersByStatus || []).map(st => `
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-300">${OrdersPage.getStatusBadge(st._id)}</span>
                  <span class="font-bold font-sans text-slate-100">${st.count} đơn</span>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

        <!-- CẢNH BÁO TỒN KHO THẤP -->
        <div class="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-sm font-bold font-heading text-slate-100 flex items-center space-x-2">
              <i class="fa-solid fa-triangle-exclamation text-amber-400"></i>
              <span>Cảnh Báo Gạch Lẻ Sắp Hết Hàng (Tồn kho &le; 30 viên)</span>
            </h3>
            <button onclick="AdminPage.switchTab('bricks')" class="text-xs font-semibold text-amber-400 hover:underline">
              Sửa tồn kho ngay
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            ${(d.lowStockBricks || []).map(b => `
              <div class="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${b.colorHex}"></span>
                    <span class="text-xs font-bold text-slate-100 font-mono">${UI.escapeHTML(b.code)}</span>
                  </div>
                  <span class="text-[11px] text-slate-400 truncate block max-w-[140px] mt-0.5">${UI.escapeHTML(b.name)}</span>
                </div>
                <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${b.stock === 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-amber-500/20 text-amber-400'}">
                  ${b.stock} viên
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    } catch (err) {
      container.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi', err.message);
    }
  },

  // Vẽ biểu đồ SVG thuần cực kỳ sắc nét
  renderRevenueChart: (dailyData) => {
    if (!dailyData || dailyData.length === 0) {
      return '<p class="text-xs text-slate-400 italic">Chưa có dữ liệu giao dịch trong 7 ngày qua</p>';
    }

    const maxRevenue = Math.max(...dailyData.map(d => d.revenue), 1000000);
    const chartHeight = 180;
    const chartWidth = 550;
    const barWidth = 40;
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

  // 2. QUẢN LÝ SẢN PHẨM
  renderProducts: async (container) => {
    try {
      const res = await API.admin.getProducts({ limit: 50 });
      const products = (res.success && res.data) ? res.data.products : [];

      container.innerHTML = `
        <div class="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 class="text-base font-bold font-heading text-slate-100">Danh Sách Mô Hình Set (${products.length})</h2>
              <p class="text-xs text-slate-400">Quản lý giá, khuyến mãi, tồn kho và chi tiết mô hình 3D</p>
            </div>
            <button onclick="AdminPage.openProductModal()" class="px-4 py-2.5 rounded-xl btn-gold text-slate-950 font-bold text-xs transition flex items-center space-x-2">
              <i class="fa-solid fa-plus text-xs"></i>
              <span>Thêm Sản Phẩm Mới</span>
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="text-[11px] uppercase bg-slate-900/80 text-amber-400 border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">Sản phẩm</th>
                  <th class="py-3 px-4">Danh mục</th>
                  <th class="py-3 px-4">Giá bán</th>
                  <th class="py-3 px-4">Tồn kho</th>
                  <th class="py-3 px-4">SKU / QR</th>
                  <th class="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                ${products.map(p => `
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="py-3 px-4 font-bold text-slate-100 flex items-center space-x-3">
                      <div class="w-10 h-10 rounded-lg bg-slate-950 overflow-hidden flex-shrink-0">
                        <img src="${UI.escapeHTML((p.images && p.images[0]) || '')}" class="w-full h-full object-cover">
                      </div>
                      <div>
                        <span>${UI.escapeHTML(p.name)}</span>
                        <span class="text-[10px] text-slate-500 block font-normal">${p.pieceCount} mảnh</span>
                      </div>
                    </td>
                    <td class="py-3 px-4">${UI.escapeHTML(p.category)}</td>
                    <td class="py-3 px-4 font-mono font-bold text-amber-300">
                      ${UI.formatCurrency(p.salePrice || p.price)}
                    </td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded text-[11px] font-bold ${p.stock <= 5 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}">
                        ${p.stock}
                      </span>
                    </td>
                    <td class="py-3 px-4 font-mono text-slate-400 text-[11px]">${UI.escapeHTML(p.sku || '')}</td>
                    <td class="py-3 px-4 text-right space-x-2">
                      <button onclick="AdminPage.openProductModal('${p._id}')" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition" title="Sửa sản phẩm">
                        <i class="fa-solid fa-pen-to-square"></i>
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
        </div>
      `;

    } catch (err) {
      container.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi', err.message);
    }
  },

  // 3. QUẢN LÝ GẠCH LẺ (PICK-A-BRICK) VỚI SỬA TỒN KHO INLINE
  renderBricks: async (container) => {
    try {
      const res = await API.admin.getBricks({ limit: 100 });
      const bricks = (res.success && res.data) ? res.data.bricks : [];

      container.innerHTML = `
        <div class="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 class="text-base font-bold font-heading text-slate-100">Kho Gạch Lẻ Pick-a-Brick (${bricks.length} loại)</h2>
              <p class="text-xs text-slate-400">Chỉnh sửa tồn kho và đơn giá trực tiếp trên từng dòng (Inline Update)</p>
            </div>
            <div class="flex items-center space-x-2">
              <button onclick="AdminPage.openImportCSVModal()" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center space-x-1.5">
                <i class="fa-solid fa-file-csv text-amber-400"></i>
                <span>Nhập CSV</span>
              </button>
              <button onclick="AdminPage.openBrickModal()" class="px-4 py-2 rounded-xl btn-gold text-slate-950 font-bold text-xs transition flex items-center space-x-1.5">
                <i class="fa-solid fa-plus text-xs"></i>
                <span>Thêm Gạch Mới</span>
              </button>
            </div>
          </div>

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
        </div>
      `;

    } catch (err) {
      container.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi', err.message);
    }
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

  // 4. QUẢN LÝ ĐƠN HÀNG
  renderOrders: async (container) => {
    try {
      const res = await API.admin.getOrders({ limit: 50 });
      const orders = (res.success && res.data) ? res.data.orders : [];

      container.innerHTML = `
        <div class="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-6">
          <div class="border-b border-slate-800 pb-4">
            <h2 class="text-base font-bold font-heading text-slate-100">Quản Lý Đơn Hàng (${orders.length})</h2>
            <p class="text-xs text-slate-400">Cập nhật trạng thái đơn: Chờ xác nhận &rarr; Đã xác nhận &rarr; Đang giao &rarr; Hoàn tất / Đã hủy</p>
          </div>

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
                      <a href="#/orders/${ord._id}" class="hover:underline">${UI.escapeHTML(ord.code)}</a>
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
        </div>
      `;

    } catch (err) {
      container.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi', err.message);
    }
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

  // 5. QUẢN LÝ NGƯỜI DÙNG
  renderUsers: async (container) => {
    try {
      const res = await API.admin.getUsers({ limit: 50 });
      const users = (res.success && res.data) ? res.data.users : [];

      container.innerHTML = `
        <div class="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-6">
          <div class="border-b border-slate-800 pb-4">
            <h2 class="text-base font-bold font-heading text-slate-100">Danh Sách Tài Khoản (${users.length})</h2>
            <p class="text-xs text-slate-400">Danh sách khách hàng và quản trị viên hệ thống</p>
          </div>

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
        </div>
      `;

    } catch (err) {
      container.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi', err.message);
    }
  },

  // MODAL NHẬP CSV GẠCH LẺ
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

  // MODAL THÊM / SỬA SẢN PHẨM
  openProductModal: (prodId = null) => {
    const name = prompt('Nhập tên sản phẩm:');
    if (!name) return;
    const price = prompt('Nhập giá bán (VND):', '1500000');
    if (!price) return;
    const pieceCount = prompt('Số mảnh ghép:', '850');
    const category = prompt('Danh mục (Technic & Cơ khí / Kiến trúc & Di sản / Phương tiện siêu xe / Vũ trụ & Viễn tưởng):', 'Technic & Cơ khí');
    const stock = prompt('Số lượng tồn kho ban đầu:', '20');

    const data = {
      name,
      price: Number(price),
      pieceCount: Number(pieceCount) || 0,
      category: category || 'Technic & Cơ khí',
      stock: Number(stock) || 10,
      description: `Mô hình ${name} tinh xảo, phụ kiện đầy đủ và hỗ trợ xem 3D đa chiều.`
    };

    if (prodId) {
      API.admin.updateProduct(prodId, data)
        .then(() => {
          UI.toast('success', 'Đã cập nhật sản phẩm');
          AdminPage.renderProducts(document.getElementById('admin-subpage-container'));
        })
        .catch(err => UI.toast('error', err.message));
    } else {
      API.admin.createProduct(data)
        .then(() => {
          UI.toast('success', 'Đã tạo sản phẩm mới thành công');
          AdminPage.renderProducts(document.getElementById('admin-subpage-container'));
        })
        .catch(err => UI.toast('error', err.message));
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

  // THÊM GẠCH MỚI
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

  destroy: () => {}
};

window.AdminPage = AdminPage;
