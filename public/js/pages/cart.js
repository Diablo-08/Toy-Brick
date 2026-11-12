/**
 * Trang Giỏ Hàng (Cart)
 * Xem chi tiết giỏ hàng, tăng/giảm số lượng, xóa sản phẩm, tính phí ship và tổng tiền
 */
const CartPage = {
  currentCartData: null,

  render: async (container) => {
    container.innerHTML = `
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold font-heading text-slate-100">Giỏ Hàng <span class="text-amber-400">Của Bạn</span></h1>
        <p class="text-sm text-slate-400 font-lora mt-1">Kiểm tra lại các mô hình và mã gạch lẻ trước khi tiến hành thanh toán</p>
      </div>

      <div id="cart-content-wrapper">
        <div class="py-12 flex justify-center items-center">
          <div class="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    `;

    await CartPage.loadCart();
  },

  loadCart: async () => {
    const wrapper = document.getElementById('cart-content-wrapper');
    if (!wrapper) return;

    let cartData = { items: [], subtotal: 0, shippingFee: 0, total: 0, itemCount: 0 };

    if (Store.isLoggedIn()) {
      try {
        const res = await API.cart.get();
        if (res.success && res.data) {
          cartData = res.data;
        }
      } catch (err) {
        wrapper.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi tải giỏ hàng', err.message);
        return;
      }
    } else {
      // Giỏ hàng offline từ LocalStorage
      const local = Store.getLocalCart();
      const items = local.map((item, idx) => {
        const itemTotal = (item.price || 0) * (item.qty || 1);
        return {
          _id: `local_${idx}`,
          kind: item.kind,
          ref: item.ref,
          name: item.name,
          code: item.code,
          price: item.price,
          qty: item.qty,
          image: item.image,
          color: item.color,
          colorHex: item.colorHex,
          total: itemTotal
        };
      });

      const subtotal = items.reduce((sum, i) => sum + i.total, 0);
      const shippingFee = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
      cartData = {
        items,
        subtotal,
        shippingFee,
        total: subtotal + shippingFee,
        itemCount: items.reduce((sum, i) => sum + i.qty, 0)
      };
    }

    CartPage.currentCartData = cartData;
    Store.setCartCount(cartData.itemCount);

    if (!cartData.items || cartData.items.length === 0) {
      wrapper.innerHTML = UI.renderEmptyState(
        'fa-cart-shopping',
        'Giỏ hàng của bạn đang trống',
        'Hãy khám phá ngay các bộ mô hình đặc sắc hoặc bổ sung gạch lẻ cho dự án MOC của bạn!',
        '#/shop',
        'Khám phá mua sắm'
      );
      return;
    }

    const freeShipProgress = Math.min(100, (cartData.subtotal / 500000) * 100);
    const needMoreForFreeShip = Math.max(0, 500000 - cartData.subtotal);

    wrapper.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <!-- DANH SÁCH MẶT HÀNG (8 CỘT) -->
        <div class="lg:col-span-8 space-y-4">

          <!-- Thanh tiến độ Free Shipping -->
          <div class="glass-panel rounded-2xl p-4 border border-amber-500/20">
            <div class="flex items-center justify-between text-xs font-semibold mb-2">
              <span class="text-slate-300">
                ${needMoreForFreeShip === 0
                  ? '<strong class="text-emerald-400"><i class="fa-solid fa-truck-fast mr-1"></i>Chúc mừng! Đơn hàng của bạn được MIỄN PHÍ VẬN CHUYỂN!</strong>'
                  : `Mua thêm <strong class="text-amber-400 font-sans">${UI.formatCurrency(needMoreForFreeShip)}</strong> để được Miễn Phí Vận Chuyển`}
              </span>
              <span class="text-amber-400 font-mono text-[11px]">${Math.round(freeShipProgress)}%</span>
            </div>
            <div class="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
              <div class="bg-gradient-to-r from-amber-500 to-yellow-300 h-2 rounded-full transition-all duration-500" style="width: ${freeShipProgress}%"></div>
            </div>
          </div>

          <!-- Lưới các món hàng trong giỏ -->
          <div class="glass-panel rounded-3xl p-4 sm:p-6 border border-amber-500/20 divide-y divide-slate-800">
            ${cartData.items.map(item => `
              <div class="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-center sm:items-stretch justify-between gap-4">

                <!-- Ảnh hoặc Swatch màu gạch -->
                <div class="flex items-center space-x-4 flex-1">
                  ${item.kind === 'product' ? `
                    <div class="w-20 h-20 rounded-xl bg-slate-950 overflow-hidden flex-shrink-0 border border-slate-700">
                      <img src="${UI.escapeHTML(item.image || 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=200&q=80')}" alt="${UI.escapeHTML(item.name)}" class="w-full h-full object-cover">
                    </div>
                  ` : `
                    <div class="w-20 h-20 rounded-xl bg-slate-900 flex-shrink-0 border border-slate-700 flex flex-col items-center justify-center p-2">
                      <span class="w-7 h-7 rounded-full border border-white/20 shadow-md mb-1" style="background-color: ${UI.escapeHTML(item.colorHex || '#f59e0b')}"></span>
                      <span class="text-[9px] font-mono text-amber-300 font-bold">${UI.escapeHTML(item.code || '#BRICK')}</span>
                    </div>
                  `}

                  <div class="space-y-1">
                    <span class="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      ${item.kind === 'product' ? 'Mô hình Set' : 'Gạch lẻ MOC'}
                    </span>
                    <h3 class="text-sm font-bold text-slate-100 font-heading">
                      ${UI.escapeHTML(item.name)}
                    </h3>
                    <p class="text-xs text-slate-400 font-sans">
                      Đơn giá: <strong class="text-amber-300">${UI.formatCurrency(item.price)}</strong>
                    </p>
                  </div>
                </div>

                <!-- Điều khiển số lượng & Xóa -->
                <div class="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto">
                  <div class="flex items-center border border-slate-700 rounded-xl overflow-hidden bg-slate-900">
                    <button class="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition" onclick="CartPage.updateQty('${item._id}', ${item.qty - 1}, '${item.kind}', '${item.ref}')">
                      <i class="fa-solid fa-minus text-xs"></i>
                    </button>
                    <span class="px-3 py-1.5 text-xs font-bold text-slate-100 font-mono min-w-[32px] text-center">${item.qty}</span>
                    <button class="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition" onclick="CartPage.updateQty('${item._id}', ${item.qty + 1}, '${item.kind}', '${item.ref}')">
                      <i class="fa-solid fa-plus text-xs"></i>
                    </button>
                  </div>

                  <div class="text-right min-w-[100px]">
                    <span class="text-sm font-bold text-amber-300 font-sans block">
                      ${UI.formatCurrency(item.total)}
                    </span>
                  </div>

                  <button class="text-slate-500 hover:text-rose-400 transition p-1.5" onclick="CartPage.removeItem('${item._id}', '${item.kind}', '${item.ref}')" title="Xóa mặt hàng này">
                    <i class="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </div>

              </div>
            `).join('')}
          </div>

          <div class="flex items-center justify-between text-xs text-slate-400 px-2">
            <a href="#/shop" class="hover:text-amber-400 transition flex items-center space-x-1.5">
              <i class="fa-solid fa-arrow-left text-[10px]"></i>
              <span>Tiếp tục chọn thêm mô hình</span>
            </a>
            <button onclick="CartPage.clearAll()" class="text-rose-400 hover:text-rose-300 transition">
              <i class="fa-solid fa-xmark mr-1"></i>Xóa sạch giỏ hàng
            </button>
          </div>
        </div>

        <!-- CỘT TỔNG KẾT ĐƠN HÀNG (4 CỘT) -->
        <div class="lg:col-span-4 glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/25 space-y-6">
          <h2 class="text-lg font-bold font-heading text-slate-100 border-b border-slate-800 pb-3">
            Tóm Tắt Đơn Hàng
          </h2>

          <div class="space-y-3 text-xs sm:text-sm">
            <div class="flex justify-between text-slate-300">
              <span>Tạm tính hàng hóa:</span>
              <span class="font-bold font-sans text-slate-100">${UI.formatCurrency(cartData.subtotal)}</span>
            </div>

            <div class="flex justify-between text-slate-300">
              <span>Phí vận chuyển tiêu chuẩn:</span>
              <span class="font-bold font-sans ${cartData.shippingFee === 0 ? 'text-emerald-400' : 'text-slate-100'}">
                ${cartData.shippingFee === 0 ? 'MIỄN PHÍ' : UI.formatCurrency(cartData.shippingFee)}
              </span>
            </div>

            <div class="pt-4 border-t border-slate-800 flex justify-between items-baseline">
              <span class="text-sm font-bold text-slate-100">Tổng cộng:</span>
              <span class="text-2xl font-extrabold text-amber-300 font-sans">
                ${UI.formatCurrency(cartData.total)}
              </span>
            </div>
            <p class="text-[11px] text-slate-400 italic">Đã bao gồm thuế GTGT nếu có</p>
          </div>

          <button id="checkout-proceed-btn" class="w-full py-4 rounded-xl btn-gold text-slate-950 font-bold text-sm tracking-wide shadow-xl shadow-amber-500/25 transition flex items-center justify-center space-x-2">
            <span>Tiến hành Đặt hàng</span>
            <i class="fa-solid fa-arrow-right text-xs"></i>
          </button>

          <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-[11px] text-slate-400">
            <div class="flex items-center space-x-2">
              <i class="fa-solid fa-shield-halved text-emerald-400"></i>
              <span>Thanh toán an toàn bảo mật</span>
            </div>
            <div class="flex items-center space-x-2">
              <i class="fa-solid fa-boxes-packing text-amber-400"></i>
              <span>Đóng gói chống sốc chuẩn Studio</span>
            </div>
          </div>
        </div>

      </div>
    `;

    // Sự kiện nút Tiến hành thanh toán
    const checkoutBtn = document.getElementById('checkout-proceed-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (!Store.isLoggedIn()) {
          UI.toast('info', 'Vui lòng đăng nhập để lưu đơn hàng và áp dụng địa chỉ giao');
          UI.openAuthModal('login');
        } else {
          window.location.hash = '#/checkout';
        }
      });
    }
  },

  updateQty: async (itemId, newQty, kind, refId) => {
    if (newQty < 1) {
      CartPage.removeItem(itemId, kind, refId);
      return;
    }

    if (Store.isLoggedIn()) {
      try {
        await API.cart.update(itemId, newQty);
        await CartPage.loadCart();
      } catch (err) {
        UI.toast('error', err.message);
      }
    } else {
      const local = Store.getLocalCart();
      const item = local.find(i => i.kind === kind && i.ref === refId);
      if (item) {
        item.qty = newQty;
        Store.saveLocalCart(local);
        await CartPage.loadCart();
      }
    }
  },

  removeItem: async (itemId, kind, refId) => {
    if (Store.isLoggedIn()) {
      try {
        await API.cart.remove(itemId);
        UI.toast('info', 'Đã xóa mặt hàng khỏi giỏ');
        await CartPage.loadCart();
      } catch (err) {
        UI.toast('error', err.message);
      }
    } else {
      let local = Store.getLocalCart();
      local = local.filter(i => !(i.kind === kind && i.ref === refId));
      Store.saveLocalCart(local);
      UI.toast('info', 'Đã xóa mặt hàng khỏi giỏ');
      await CartPage.loadCart();
    }
  },

  clearAll: async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi giỏ hàng?')) return;

    if (Store.isLoggedIn()) {
      try {
        await API.cart.clear();
        await CartPage.loadCart();
      } catch (err) {
        UI.toast('error', err.message);
      }
    } else {
      Store.clearLocalCart();
      await CartPage.loadCart();
    }
  },

  destroy: () => {}
};

window.CartPage = CartPage;
