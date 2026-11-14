/**
 * Trang Đơn Hàng Cá Nhân (Orders History & Detail)
 * Danh sách đơn hàng + Chi tiết đơn + Timeline trạng thái + Nút hủy đơn hoàn tồn kho
 */
const OrdersPage = {
  render: async (container, params) => {
    if (!Store.isLoggedIn()) {
      UI.toast('info', 'Vui lòng đăng nhập để xem lịch sử đơn hàng');
      UI.openAuthModal('login');
      window.location.hash = '#/';
      return;
    }

    const orderId = params && params.id;
    if (orderId) {
      await OrdersPage.renderOrderDetail(container, orderId);
    } else {
      await OrdersPage.renderOrderList(container);
    }
  },

  // DANH SÁCH ĐƠN HÀNG
  renderOrderList: async (container) => {
    container.innerHTML = `
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold font-heading text-slate-100">Đơn Hàng <span class="text-amber-400">Của Tôi</span></h1>
        <p class="text-sm text-slate-400 font-lora mt-1">Theo dõi hành trình lắp ráp từ Studio tới tận tay bạn</p>
      </div>

      <div id="orders-list-container">
        <div class="py-12 flex justify-center items-center">
          <div class="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    `;

    const listContainer = document.getElementById('orders-list-container');
    if (!listContainer) return;

    try {
      const res = await API.orders.getAll({ limit: 20 });
      if (!res.success || !res.data) {
        listContainer.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi tải đơn hàng', 'Không thể kết nối máy chủ');
        return;
      }

      const orders = res.data.orders || [];
      if (orders.length === 0) {
        listContainer.innerHTML = UI.renderEmptyState(
          'fa-receipt',
          'Bạn chưa có đơn hàng nào',
          'Hãy chọn cho mình một bộ mô hình tuyệt đẹp hoặc sáng tạo cùng kho gạch lẻ!',
          '#/shop',
          'Khám phá mua sắm'
        );
        return;
      }

      let html = '<div class="space-y-4">';
      for (const ord of orders) {
        const statusBadge = OrdersPage.getStatusBadge(ord.status);
        const canCancel = ord.status === 'Chờ xác nhận';

        html += `
          <div class="glass-panel glass-panel-hover rounded-2xl p-5 sm:p-6 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="space-y-1.5 flex-1">
              <div class="flex items-center space-x-3">
                <span class="font-mono font-bold text-base text-amber-300">${UI.escapeHTML(ord.code)}</span>
                ${statusBadge}
              </div>
              <p class="text-xs text-slate-400">
                Đặt ngày: <strong class="text-slate-200">${UI.formatDate(ord.createdAt)}</strong> • ${ord.items.length} món
              </p>
              <p class="text-xs text-slate-300 truncate max-w-md">
                ${ord.items.map(i => `${i.qty}x ${UI.escapeHTML(i.name)}`).join(', ')}
              </p>
            </div>

            <div class="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              <div class="text-left sm:text-right">
                <span class="text-xs text-slate-400 block">Tổng thanh toán</span>
                <span class="text-base font-extrabold text-amber-300 font-sans">${UI.formatCurrency(ord.total)}</span>
              </div>
              <a href="#/orders/${ord._id}" class="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 text-xs font-semibold transition flex items-center space-x-1">
                <span>Chi tiết</span>
                <i class="fa-solid fa-chevron-right text-[10px]"></i>
              </a>
            </div>
          </div>
        `;
      }
      html += '</div>';
      listContainer.innerHTML = html;

    } catch (err) {
      listContainer.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi', err.message);
    }
  },

  // CHI TIẾT ĐƠN HÀNG
  renderOrderDetail: async (container, orderId) => {
    container.innerHTML = `
      <div class="py-12 flex justify-center items-center">
        <div class="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    `;

    try {
      const res = await API.orders.getById(orderId);
      if (!res.success || !res.data) {
        container.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Không tìm thấy đơn hàng', 'Đơn hàng không tồn tại hoặc bạn không có quyền xem.', '#/orders', 'Về danh sách');
        return;
      }

      const ord = res.data;
      const canCancel = ord.status === 'Chờ xác nhận';
      const statusBadge = OrdersPage.getStatusBadge(ord.status);

      container.innerHTML = `
        <!-- BREADCRUMB -->
        <nav class="flex items-center space-x-2 text-xs text-slate-400 mb-6">
          <a href="#/" class="hover:text-amber-400 transition">Trang chủ</a>
          <i class="fa-solid fa-chevron-right text-[10px]"></i>
          <a href="#/orders" class="hover:text-amber-400 transition">Đơn hàng</a>
          <i class="fa-solid fa-chevron-right text-[10px]"></i>
          <span class="text-amber-300 font-mono font-bold">${UI.escapeHTML(ord.code)}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">

          <!-- THÔNG TIN CHÍNH (8 CỘT) -->
          <div class="lg:col-span-8 space-y-6">

            <!-- Header Mã Đơn & Trạng Thái -->
            <div class="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span class="text-xs text-slate-400 block mb-1">Mã tra cứu đơn hàng</span>
                  <h1 class="text-2xl font-extrabold font-mono text-amber-300">${UI.escapeHTML(ord.code)}</h1>
                  <p class="text-xs text-slate-400 mt-1">Khởi tạo lúc: ${UI.formatDate(ord.createdAt)}</p>
                </div>
                <div>${statusBadge}</div>
              </div>

              <!-- TIMELINE TRẠNG THÁI TIẾN TRÌNH -->
              <div class="py-4">
                <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Hành trình đơn hàng</h3>
                ${OrdersPage.renderTimeline(ord)}
              </div>
            </div>

            <!-- DANH SÁCH CHI TIẾT SẢN PHẨM SNAPSHOT -->
            <div class="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-4">
              <h2 class="text-base font-bold font-heading text-slate-100 border-b border-slate-800 pb-3">
                Các Mặt Hàng Đã Đặt (${ord.items.length} món)
              </h2>

              <div class="divide-y divide-slate-800">
                ${ord.items.map(item => `
                  <div class="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div class="flex items-center space-x-3.5 truncate">
                      ${item.kind === 'product' ? `
                        <div class="w-14 h-14 rounded-xl bg-slate-950 overflow-hidden flex-shrink-0 border border-slate-800">
                          <img src="${UI.escapeHTML(item.image || 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=150&q=80')}" alt="${UI.escapeHTML(item.name)}" class="w-full h-full object-cover">
                        </div>
                      ` : `
                        <div class="w-14 h-14 rounded-xl bg-slate-900 flex-shrink-0 border border-slate-800 flex items-center justify-center">
                          <span class="w-6 h-6 rounded-full border border-white/20" style="background-color: ${UI.escapeHTML(item.colorHex || '#f59e0b')}"></span>
                        </div>
                      `}

                      <div class="space-y-0.5 truncate">
                        <h4 class="text-xs sm:text-sm font-bold text-slate-100 truncate">${UI.escapeHTML(item.name)}</h4>
                        <p class="text-[11px] text-slate-400 font-sans">
                          Mã: <span class="font-mono text-amber-300">${UI.escapeHTML(item.code || 'N/A')}</span> • SL: <strong class="text-slate-200">${item.qty}</strong>
                        </p>
                      </div>
                    </div>

                    <div class="text-right whitespace-nowrap">
                      <span class="text-xs sm:text-sm font-bold text-amber-300 font-sans">
                        ${UI.formatCurrency(item.price * item.qty)}
                      </span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>

          <!-- CỘT THÔNG TIN GIAO HÀNG & HÀNH ĐỘNG HỦY (4 CỘT) -->
          <div class="lg:col-span-4 space-y-6">

            <!-- THÔNG TIN VẬN CHUYỂN -->
            <div class="glass-panel rounded-3xl p-6 border border-amber-500/20 space-y-3.5 text-xs text-slate-300">
              <h3 class="text-sm font-bold font-heading text-slate-100 border-b border-slate-800 pb-2">
                Địa Chỉ Giao Hàng
              </h3>
              <p>Người nhận: <strong class="text-slate-100">${UI.escapeHTML(ord.shipping.fullName)}</strong></p>
              <p>Số điện thoại: <strong class="text-slate-100">${UI.escapeHTML(ord.shipping.phone)}</strong></p>
              <p>Địa chỉ: <span class="text-slate-100">${UI.escapeHTML(ord.shipping.address)}</span></p>
              ${ord.shipping.note ? `<p>Ghi chú: <em class="text-slate-400">${UI.escapeHTML(ord.shipping.note)}</em></p>` : ''}
              <p class="pt-2 border-t border-slate-800">
                Phương thức: <strong class="text-amber-300">${ord.paymentMethod === 'bank' ? 'Chuyển khoản Ngân hàng' : 'COD (Tiền mặt khi nhận)'}</strong>
              </p>
            </div>

            <!-- TỔNG KẾT TIỀN -->
            <div class="glass-panel rounded-3xl p-6 border border-amber-500/20 space-y-3 text-xs">
              <div class="flex justify-between text-slate-300">
                <span>Tạm tính tiền hàng:</span>
                <span class="font-bold font-sans text-slate-100">${UI.formatCurrency(ord.subtotal)}</span>
              </div>
              <div class="flex justify-between text-slate-300">
                <span>Phí giao hàng:</span>
                <span class="font-bold font-sans ${ord.shippingFee === 0 ? 'text-emerald-400' : 'text-slate-100'}">
                  ${ord.shippingFee === 0 ? 'MIỄN PHÍ' : UI.formatCurrency(ord.shippingFee)}
                </span>
              </div>
              <div class="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span class="text-sm font-bold text-slate-100">Tổng thanh toán:</span>
                <span class="text-xl font-extrabold text-amber-300 font-sans">${UI.formatCurrency(ord.total)}</span>
              </div>
            </div>

            <!-- NÚT HỦY ĐƠN HÀNG (NẾU ĐỦ ĐIỀU KIỆN) -->
            ${canCancel ? `
              <div class="glass-panel rounded-3xl p-6 border border-rose-500/30 text-center space-y-3">
                <p class="text-xs text-slate-400">Đơn hàng đang ở trạng thái Chờ xác nhận, bạn có thể tự hủy để hoàn lại tồn kho.</p>
                <button data-action="cancel-order" data-order-id="${ord._id}" class="w-full py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition flex items-center justify-center space-x-2">
                  <i class="fa-solid fa-ban"></i>
                  <span>Hủy Đơn Hàng Này</span>
                </button>
              </div>
            ` : ''}

          </div>

        </div>
      `;

      // Event delegation cho nút hủy đơn hàng
      container.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="cancel-order"]');
        if (btn) {
          OrdersPage.cancelOrder(btn.dataset.orderId);
        }
      });

    } catch (err) {
      container.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi', err.message);
    }
  },

  getStatusBadge: (status) => {
    switch (status) {
      case 'Chờ xác nhận':
        return '<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30"><i class="fa-solid fa-hourglass-half mr-1"></i>Chờ xác nhận</span>';
      case 'Đã xác nhận':
        return '<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30"><i class="fa-solid fa-check mr-1"></i>Đã xác nhận</span>';
      case 'Đang giao':
        return '<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"><i class="fa-solid fa-truck-fast mr-1"></i>Đang giao hàng</span>';
      case 'Hoàn tất':
        return '<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><i class="fa-solid fa-circle-check mr-1"></i>Hoàn tất</span>';
      case 'Đã hủy':
        return '<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30"><i class="fa-solid fa-ban mr-1"></i>Đã hủy</span>';
      default:
        return `<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300">${UI.escapeHTML(status)}</span>`;
    }
  },

  renderTimeline: (ord) => {
    const history = ord.statusHistory || [];
    if (history.length === 0) {
      return '<p class="text-xs text-slate-400">Chưa có lịch sử trạng thái</p>';
    }

    let html = '<div class="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">';
    for (const h of history) {
      const isCancelled = h.status === 'Đã hủy';
      html += `
        <div class="relative">
          <span class="absolute -left-6 top-1 w-4 h-4 rounded-full ${isCancelled ? 'bg-rose-500' : 'bg-amber-400'} border-4 border-slate-900 shadow"></span>
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-xs font-bold ${isCancelled ? 'text-rose-400' : 'text-amber-300'}">${UI.escapeHTML(h.status)}</span>
              <span class="text-[10px] text-slate-500">${UI.formatDate(h.at)}</span>
            </div>
            ${h.note ? `<p class="text-xs text-slate-400 mt-0.5">${UI.escapeHTML(h.note)}</p>` : ''}
          </div>
        </div>
      `;
    }
    html += '</div>';
    return html;
  },

  cancelOrder: async (orderId) => {
    const reason = prompt('Vui lòng nhập lý do hủy đơn hàng:');
    if (reason === null) return; // Khách bấm cancel prompt

    try {
      const res = await API.orders.cancel(orderId, reason || 'Khách hàng hủy đơn');
      if (res.success) {
        UI.toast('success', 'Hủy đơn hàng thành công, hệ thống đã hoàn trả tồn kho!');
        const container = document.getElementById('page-content');
        if (container) OrdersPage.renderOrderDetail(container, orderId);
      }
    } catch (err) {
      UI.toast('error', err.message);
    }
  },

  destroy: () => {}
};

window.OrdersPage = OrdersPage;
