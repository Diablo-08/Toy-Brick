/**
 * Trang Đặt Hàng & Thanh Toán (Checkout)
 * Điền thông tin giao hàng, chọn địa chỉ có sẵn, COD hoặc Chuyển khoản, trang cảm ơn
 */
const CheckoutPage = {
  currentAddresses: [],

  render: async (container) => {
    if (!Store.isLoggedIn()) {
      UI.toast('info', 'Vui lòng đăng nhập để tiến hành đặt hàng');
      UI.openAuthModal('login');
      window.location.hash = '#/cart';
      return;
    }

    container.innerHTML = `
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold font-heading text-slate-100">Xác Nhận <span class="text-amber-400">Đặt Hàng</span></h1>
        <p class="text-sm text-slate-400 font-lora mt-1">Hoàn tất thông tin nhận hàng và phương thức thanh toán an toàn</p>
      </div>

      <div id="checkout-content-wrapper">
        <div class="py-12 flex justify-center items-center">
          <div class="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    `;

    await CheckoutPage.loadCheckout();
  },

  loadCheckout: async () => {
    const wrapper = document.getElementById('checkout-content-wrapper');
    if (!wrapper) return;

    try {
      const [cartRes, meRes] = await Promise.all([
        API.cart.get(),
        API.auth.getMe()
      ]);

      if (!cartRes.success || !cartRes.data || !cartRes.data.items || cartRes.data.items.length === 0) {
        wrapper.innerHTML = UI.renderEmptyState(
          'fa-cart-shopping',
          'Giỏ hàng của bạn đang trống',
          'Không thể thanh toán giỏ hàng rỗng. Hãy chọn thêm sản phẩm nhé!',
          '#/shop',
          'Tiếp tục mua sắm'
        );
        return;
      }

      const cart = cartRes.data;
      const user = (meRes.success && meRes.data) ? meRes.data : Store.getUser();
      CheckoutPage.currentAddresses = user.addresses || [];

      // Tìm địa chỉ mặc định nếu có
      const defaultAddr = CheckoutPage.currentAddresses.find(a => a.isDefault) || CheckoutPage.currentAddresses[0] || null;

      wrapper.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <!-- CỘT FORM GIAO HÀNG & PHƯƠNG THỨC THANH TOÁN (7 CỘT) -->
          <div class="lg:col-span-7 space-y-6">

            <!-- THÔNG TIN NGƯỜI NHẬN -->
            <div class="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-5">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 class="text-base font-bold font-heading text-slate-100 flex items-center space-x-2">
                  <i class="fa-solid fa-location-dot text-amber-400"></i>
                  <span>Thông Tin Giao Hàng</span>
                </h2>

                ${CheckoutPage.currentAddresses.length > 0 ? `
                  <div class="relative">
                    <select id="checkout-saved-address" class="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400">
                      <option value="custom">-- Nhập địa chỉ mới --</option>
                      ${CheckoutPage.currentAddresses.map((addr, idx) => `
                        <option value="${idx}" ${addr.isDefault ? 'selected' : ''}>
                          ${UI.escapeHTML(addr.label)}: ${UI.escapeHTML(addr.fullName)} (${UI.escapeHTML(addr.phone)})
                        </option>
                      `).join('')}
                    </select>
                  </div>
                ` : ''}
              </div>

              <form id="checkout-form" class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1">Họ và tên người nhận *</label>
                    <input type="text" id="ship-fullname" required value="${UI.escapeHTML((defaultAddr && defaultAddr.fullName) || user.name || '')}" class="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition" placeholder="Nguyễn Văn A">
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1">Số điện thoại liên hệ *</label>
                    <input type="tel" id="ship-phone" required value="${UI.escapeHTML((defaultAddr && defaultAddr.phone) || user.phone || '')}" class="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition" placeholder="0912345678">
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1">Địa chỉ nhận hàng chi tiết *</label>
                  <input type="text" id="ship-address" required value="${UI.escapeHTML(defaultAddr ? `${defaultAddr.line}${defaultAddr.ward ? ', ' + defaultAddr.ward : ''}${defaultAddr.district ? ', ' + defaultAddr.district : ''}, ${defaultAddr.city}` : '')}" class="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition" placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành...">
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1">Ghi chú giao hàng (tùy chọn)</label>
                  <textarea id="ship-note" rows="2" class="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition resize-none" placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..."></textarea>
                </div>
              </form>
            </div>

            <!-- PHƯƠNG THỨC THANH TOÁN -->
            <div class="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-4">
              <h2 class="text-base font-bold font-heading text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
                <i class="fa-solid fa-credit-card text-amber-400"></i>
                <span>Phương Thức Thanh Toán</span>
              </h2>

              <div class="space-y-3">
                <!-- COD -->
                <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-amber-400/60 cursor-pointer transition">
                  <div class="flex items-center space-x-3">
                    <input type="radio" name="payment-method" value="cod" checked class="text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700">
                    <div>
                      <span class="text-xs font-bold text-slate-100 block">Thanh toán khi nhận hàng (COD)</span>
                      <span class="text-[11px] text-slate-400">Kiểm tra hộp đồ chơi nguyên seal trước khi thanh toán cho shipper</span>
                    </div>
                  </div>
                  <i class="fa-solid fa-money-bill-wave text-emerald-400 text-lg"></i>
                </label>

                <!-- CHUYỂN KHOẢN -->
                <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-amber-400/60 cursor-pointer transition">
                  <div class="flex items-center space-x-3">
                    <input type="radio" name="payment-method" value="bank" class="text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700">
                    <div>
                      <span class="text-xs font-bold text-slate-100 block">Chuyển khoản Ngân hàng (QR Pay)</span>
                      <span class="text-[11px] text-slate-400">Chuyển khoản qua mã VietQR tự động khớp đơn</span>
                    </div>
                  </div>
                  <i class="fa-solid fa-building-columns text-sky-400 text-lg"></i>
                </label>
              </div>
            </div>

          </div>

          <!-- CỘT TÓM TẮT ĐƠN HÀNG & NÚT ĐẶT (5 CỘT) -->
          <div class="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/25 space-y-6">
            <h2 class="text-base font-bold font-heading text-slate-100 border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Đơn Hàng (${cart.itemCount} món)</span>
              <a href="#/cart" class="text-xs font-semibold text-amber-400 hover:underline">Sửa giỏ</a>
            </h2>

            <div class="max-h-60 overflow-y-auto space-y-3 pr-1">
              ${cart.items.map(item => `
                <div class="flex items-center justify-between text-xs py-1">
                  <div class="flex items-center space-x-2.5 truncate max-w-[220px]">
                    <span class="font-bold text-amber-400 font-mono">${item.qty}x</span>
                    <span class="text-slate-200 truncate">${UI.escapeHTML(item.name)}</span>
                  </div>
                  <span class="font-bold font-sans text-slate-300 whitespace-nowrap">
                    ${UI.formatCurrency(item.total)}
                  </span>
                </div>
              `).join('')}
            </div>

            <div class="pt-4 border-t border-slate-800 space-y-2.5 text-xs">
              <div class="flex justify-between text-slate-300">
                <span>Tạm tính tiền hàng:</span>
                <span class="font-bold font-sans text-slate-100">${UI.formatCurrency(cart.subtotal)}</span>
              </div>
              <div class="flex justify-between text-slate-300">
                <span>Phí vận chuyển:</span>
                <span class="font-bold font-sans ${cart.shippingFee === 0 ? 'text-emerald-400' : 'text-slate-100'}">
                  ${cart.shippingFee === 0 ? 'MIỄN PHÍ' : UI.formatCurrency(cart.shippingFee)}
                </span>
              </div>
              <div class="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span class="text-sm font-bold text-slate-100">Tổng thanh toán:</span>
                <span class="text-2xl font-extrabold text-amber-300 font-sans">
                  ${UI.formatCurrency(cart.total)}
                </span>
              </div>
            </div>

            <button id="submit-order-btn" class="w-full py-4 rounded-xl btn-gold text-slate-950 font-bold text-sm tracking-wide shadow-xl shadow-amber-500/25 transition flex items-center justify-center space-x-2">
              <i class="fa-solid fa-lock text-xs"></i>
              <span>Xác Nhận Đặt Hàng Ngay</span>
            </button>

            <p class="text-[11px] text-center text-slate-400">
              Bằng cách nhấn nút Đặt Hàng, bạn đồng ý với Điều khoản dịch vụ và chính sách kiểm hàng của ToyBrick Studio.
            </p>
          </div>

        </div>
      `;

      CheckoutPage.bindCheckoutEvents();

    } catch (err) {
      wrapper.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi', err.message);
    }
  },

  bindCheckoutEvents: () => {
    const savedAddrSelect = document.getElementById('checkout-saved-address');
    const nameInput = document.getElementById('ship-fullname');
    const phoneInput = document.getElementById('ship-phone');
    const addrInput = document.getElementById('ship-address');
    const submitBtn = document.getElementById('submit-order-btn');

    if (savedAddrSelect) {
      savedAddrSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'custom') {
          nameInput.value = '';
          phoneInput.value = '';
          addrInput.value = '';
        } else {
          const addr = CheckoutPage.currentAddresses[parseInt(val, 10)];
          if (addr) {
            nameInput.value = addr.fullName || '';
            phoneInput.value = addr.phone || '';
            addrInput.value = `${addr.line}${addr.ward ? ', ' + addr.ward : ''}${addr.district ? ', ' + addr.district : ''}, ${addr.city}`;
          }
        }
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const fullName = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const address = addrInput.value.trim();
        const note = (document.getElementById('ship-note') ? document.getElementById('ship-note').value : '').trim();

        if (!fullName || !phone || !address) {
          UI.toast('warning', 'Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng');
          return;
        }

        const paymentRadio = document.querySelector('input[name="payment-method"]:checked');
        const paymentMethod = paymentRadio ? paymentRadio.value : 'cod';

        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <div class="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mr-2"></div>
          <span>Đang tạo đơn hàng...</span>
        `;

        try {
          const res = await API.orders.create({
            shipping: { fullName, phone, address, note },
            paymentMethod
          });

          if (res.success && res.data) {
            UI.toast('success', 'Đơn hàng của bạn đã được đặt thành công!');
            Store.setCartCount(0);
            CheckoutPage.renderThankYou(res.data);
          }
        } catch (err) {
          UI.toast('error', err.message);
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <i class="fa-solid fa-lock text-xs mr-2"></i>
            <span>Xác Nhận Đặt Hàng Ngay</span>
          `;
        }
      });
    }
  },

  renderThankYou: (order) => {
    const wrapper = document.getElementById('checkout-content-wrapper');
    if (!wrapper) return;

    const isBank = order.paymentMethod === 'bank';

    wrapper.innerHTML = `
      <div class="max-w-2xl mx-auto glass-panel rounded-3xl p-6 sm:p-10 border-2 border-amber-500/40 shadow-2xl text-center space-y-6 animate-celestial">
        <div class="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 text-3xl flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30">
          <i class="fa-solid fa-check"></i>
        </div>

        <div>
          <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">Cảm Ơn Bạn Đã Đặt Hàng!</h2>
          <p class="text-xs sm:text-sm text-slate-300 font-lora mt-2">
            Mã đơn hàng của bạn: <strong class="text-amber-400 font-mono text-base font-bold">${UI.escapeHTML(order.code)}</strong>
          </p>
        </div>

        <!-- THÔNG TIN CHUYỂN KHOẢN (NẾU CHỌN BANK) -->
        ${isBank ? `
          <div class="p-5 rounded-2xl bg-slate-900/90 border border-sky-500/40 text-left space-y-3">
            <div class="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase">
              <i class="fa-solid fa-qrcode"></i>
              <span>HƯỚNG DẪN THANH TOÁN CHUYỂN KHOẢN</span>
            </div>
            <div class="text-xs space-y-1.5 text-slate-300">
              <p>Ngân hàng: <strong class="text-slate-100">MB BANK (Ngân hàng Quân Đội)</strong></p>
              <p>Số tài khoản: <strong class="text-amber-300 font-mono text-sm">8888 6666 9999</strong></p>
              <p>Chủ tài khoản: <strong class="text-slate-100">TOYBRICK STUDIO VIETNAM</strong></p>
              <p>Số tiền: <strong class="text-amber-400 font-sans text-sm font-bold">${UI.formatCurrency(order.total)}</strong></p>
              <p>Nội dung chuyển khoản: <strong class="text-amber-400 font-mono font-bold">${UI.escapeHTML(order.code)}</strong></p>
            </div>
            <p class="text-[11px] text-slate-400 italic">Đơn hàng sẽ được xác nhận tự động ngay khi hệ thống nhận được khoản chuyển.</p>
          </div>
        ` : ''}

        <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 text-left space-y-1">
          <p>Người nhận: <strong class="text-slate-100">${UI.escapeHTML(order.shipping.fullName)}</strong> (${UI.escapeHTML(order.shipping.phone)})</p>
          <p>Địa chỉ giao: <span class="text-slate-100">${UI.escapeHTML(order.shipping.address)}</span></p>
          <p>Phương thức: <span class="text-amber-400 font-semibold">${isBank ? 'Chuyển khoản Ngân hàng' : 'Thanh toán COD khi nhận'}</span></p>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a href="#/orders/${UI.escapeHTML(order._id)}" class="px-6 py-3 rounded-xl btn-gold text-slate-950 font-bold text-xs transition flex items-center space-x-2">
            <i class="fa-solid fa-receipt"></i>
            <span>Xem Chi Tiết Đơn Hàng</span>
          </a>
          <a href="#/shop" class="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition">
            Tiếp tục khám phá
          </a>
        </div>
      </div>
    `;
  },

  destroy: () => {}
};

window.CheckoutPage = CheckoutPage;
