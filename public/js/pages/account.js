/**
 * Trang Tài Khoản Cá Nhân (Account)
 * Hồ sơ cá nhân, đổi mật khẩu, quản lý sổ địa chỉ giao hàng
 */
const AccountPage = {
  currentUser: null,

  render: async (container) => {
    if (!Store.isLoggedIn()) {
      UI.toast('info', 'Vui lòng đăng nhập để truy cập trang cá nhân');
      UI.openAuthModal('login');
      window.location.hash = '#/';
      return;
    }

    container.innerHTML = `
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold font-heading text-slate-100">Hồ Sơ <span class="text-amber-400">Cá Nhân</span></h1>
        <p class="text-sm text-slate-400 font-lora mt-1">Quản lý thông tin tài khoản, mật khẩu và sổ địa chỉ giao hàng</p>
      </div>

      <div id="account-content-wrapper">
        <div class="py-12 flex justify-center items-center">
          <div class="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    `;

    await AccountPage.loadAccount();
  },

  loadAccount: async () => {
    const wrapper = document.getElementById('account-content-wrapper');
    if (!wrapper) return;

    try {
      const res = await API.auth.getMe();
      if (!res.success || !res.data) {
        wrapper.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi', 'Không thể nạp thông tin người dùng');
        return;
      }

      const user = res.data;
      AccountPage.currentUser = user;
      Store.setUser(user);

      wrapper.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">

          <!-- THÔNG TIN HỒ SƠ & ĐỔI MẬT KHẨU (6 CỘT) -->
          <div class="lg:col-span-6 space-y-6">

            <!-- Card Thông tin cá nhân -->
            <div class="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-5">
              <h2 class="text-base font-bold font-heading text-slate-100 border-b border-slate-800 pb-3 flex items-center space-x-2">
                <i class="fa-solid fa-user-pen text-amber-400"></i>
                <span>Cập Nhật Thông Tin</span>
              </h2>

              <form id="profile-form" class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1">Họ và tên *</label>
                  <input type="text" id="acc-name" required value="${UI.escapeHTML(user.name)}" class="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition">
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Tên đăng nhập (cố định)</label>
                    <input type="text" disabled value="${UI.escapeHTML(user.username)}" class="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-400 text-xs font-mono cursor-not-allowed">
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Email đăng ký (cố định)</label>
                    <input type="email" disabled value="${UI.escapeHTML(user.email)}" class="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-400 text-xs font-mono cursor-not-allowed">
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1">Số điện thoại liên hệ</label>
                  <input type="tel" id="acc-phone" value="${UI.escapeHTML(user.phone || '')}" class="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition" placeholder="09xxxxxxxx">
                </div>

                <button type="submit" class="px-5 py-2.5 rounded-xl btn-gold text-slate-950 font-bold text-xs transition flex items-center space-x-1.5 shadow-md">
                  <i class="fa-solid fa-floppy-disk text-xs"></i>
                  <span>Lưu thông tin hồ sơ</span>
                </button>
              </form>
            </div>

            <!-- Card Đổi mật khẩu -->
            <div class="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-5">
              <h2 class="text-base font-bold font-heading text-slate-100 border-b border-slate-800 pb-3 flex items-center space-x-2">
                <i class="fa-solid fa-key text-amber-400"></i>
                <span>Đổi Mật Khẩu</span>
              </h2>

              <form id="password-form" class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1">Mật khẩu hiện tại *</label>
                  <input type="password" id="current-pass" required class="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition" placeholder="••••••••">
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1">Mật khẩu mới (ít nhất 6 ký tự) *</label>
                  <input type="password" id="new-pass" required minlength="6" class="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition" placeholder="••••••••">
                </div>

                <button type="submit" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs transition flex items-center space-x-1.5 shadow-md">
                  <i class="fa-solid fa-shield-halved text-xs"></i>
                  <span>Cập nhật mật khẩu mới</span>
                </button>
              </form>
            </div>

          </div>

          <!-- SỔ ĐỊA CHỈ GIAO HÀNG (6 CỘT) -->
          <div class="lg:col-span-6 glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-5">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 class="text-base font-bold font-heading text-slate-100 flex items-center space-x-2">
                <i class="fa-solid fa-map-location-dot text-amber-400"></i>
                <span>Sổ Địa Chỉ Giao Hàng (${(user.addresses || []).length})</span>
              </h2>

              <button id="toggle-add-addr-btn" class="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center space-x-1">
                <i class="fa-solid fa-plus text-[10px]"></i>
                <span>Thêm địa chỉ</span>
              </button>
            </div>

            <!-- Form thêm địa chỉ mới (ẩn mặc định) -->
            <form id="new-address-form" class="hidden p-4 rounded-2xl bg-slate-900/90 border border-slate-700 space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-semibold text-slate-300 mb-1">Nhãn (Nhà riêng/Cơ quan)</label>
                  <input type="text" id="addr-label" value="Nhà riêng" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs">
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-slate-300 mb-1">Họ tên người nhận *</label>
                  <input type="text" id="addr-fullname" required class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-semibold text-slate-300 mb-1">Số điện thoại *</label>
                  <input type="tel" id="addr-phone" required class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs">
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-slate-300 mb-1">Tỉnh / Thành phố *</label>
                  <input type="text" id="addr-city" required placeholder="Hà Nội, TP.HCM..." class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs">
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-slate-300 mb-1">Địa chỉ chi tiết (số nhà, đường, phường) *</label>
                <input type="text" id="addr-line" required placeholder="Số 102 Ngõ 88..." class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs">
              </div>

              <div class="flex items-center justify-between pt-2">
                <label class="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input type="checkbox" id="addr-is-default" class="rounded bg-slate-950 border-slate-700 text-amber-500">
                  <span>Đặt làm mặc định</span>
                </label>

                <div class="space-x-2">
                  <button type="button" onclick="document.getElementById('new-address-form').classList.add('hidden')" class="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:text-white">Hủy</button>
                  <button type="submit" class="px-4 py-1.5 rounded-lg btn-gold text-slate-950 font-bold text-xs">Lưu địa chỉ</button>
                </div>
              </div>
            </form>

            <!-- Danh sách địa chỉ đã lưu -->
            <div class="space-y-3">
              ${(user.addresses || []).length === 0 ? `
                <p class="text-xs text-slate-400 italic py-4 text-center">Bạn chưa lưu địa chỉ giao hàng nào.</p>
              ` : user.addresses.map((addr, idx) => `
                <div class="p-4 rounded-2xl bg-slate-900/60 border ${addr.isDefault ? 'border-amber-500/40' : 'border-slate-800'} space-y-1.5 relative">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-200">
                      ${UI.escapeHTML(addr.label)}
                      ${addr.isDefault ? '<span class="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">MẶC ĐỊNH</span>' : ''}
                    </span>
                    <button onclick="AccountPage.deleteAddress(${idx})" class="text-slate-500 hover:text-rose-400 text-xs transition" title="Xóa địa chỉ này">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                  <p class="text-xs text-slate-300 font-medium">
                    ${UI.escapeHTML(addr.fullName)} - <span class="font-mono">${UI.escapeHTML(addr.phone)}</span>
                  </p>
                  <p class="text-xs text-slate-400">
                    ${UI.escapeHTML(addr.line)}${addr.ward ? ', ' + UI.escapeHTML(addr.ward) : ''}${addr.district ? ', ' + UI.escapeHTML(addr.district) : ''}, ${UI.escapeHTML(addr.city)}
                  </p>
                </div>
              `).join('')}
            </div>
          </div>

        </div>
      `;

      AccountPage.bindAccountEvents();

    } catch (err) {
      wrapper.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Lỗi', err.message);
    }
  },

  bindAccountEvents: () => {
    // Form cập nhật hồ sơ
    const profForm = document.getElementById('profile-form');
    if (profForm) {
      profForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('acc-name').value.trim();
        const phone = document.getElementById('acc-phone').value.trim();

        try {
          const res = await API.auth.updateMe({ name, phone });
          if (res.success) {
            UI.toast('success', 'Cập nhật hồ sơ thành công');
            UI.updateNavbarUser();
            await AccountPage.loadAccount();
          }
        } catch (err) {
          UI.toast('error', err.message);
        }
      });
    }

    // Form đổi mật khẩu
    const passForm = document.getElementById('password-form');
    if (passForm) {
      passForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('current-pass').value;
        const newPassword = document.getElementById('new-pass').value;

        try {
          const res = await API.auth.updatePassword({ currentPassword, newPassword });
          if (res.success) {
            UI.toast('success', 'Đổi mật khẩu thành công!');
            passForm.reset();
          }
        } catch (err) {
          UI.toast('error', err.message);
        }
      });
    }

    // Toggle thêm địa chỉ
    const toggleAddrBtn = document.getElementById('toggle-add-addr-btn');
    const newAddrForm = document.getElementById('new-address-form');
    if (toggleAddrBtn && newAddrForm) {
      toggleAddrBtn.addEventListener('click', () => {
        newAddrForm.classList.toggle('hidden');
      });
    }

    // Form thêm địa chỉ mới
    if (newAddrForm) {
      newAddrForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const label = document.getElementById('addr-label').value.trim() || 'Nhà riêng';
        const fullName = document.getElementById('addr-fullname').value.trim();
        const phone = document.getElementById('addr-phone').value.trim();
        const city = document.getElementById('addr-city').value.trim();
        const line = document.getElementById('addr-line').value.trim();
        const isDefault = document.getElementById('addr-is-default').checked;

        const addresses = [...(AccountPage.currentUser.addresses || [])];
        if (isDefault) {
          addresses.forEach(a => a.isDefault = false);
        }

        addresses.push({ label, fullName, phone, city, line, isDefault });

        try {
          const res = await API.auth.updateMe({ addresses });
          if (res.success) {
            UI.toast('success', 'Đã thêm địa chỉ giao hàng mới');
            await AccountPage.loadAccount();
          }
        } catch (err) {
          UI.toast('error', err.message);
        }
      });
    }
  },

  deleteAddress: async (index) => {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    const addresses = [...(AccountPage.currentUser.addresses || [])];
    addresses.splice(index, 1);

    try {
      const res = await API.auth.updateMe({ addresses });
      if (res.success) {
        UI.toast('info', 'Đã xóa địa chỉ');
        await AccountPage.loadAccount();
      }
    } catch (err) {
      UI.toast('error', err.message);
    }
  },

  destroy: () => {}
};

window.AccountPage = AccountPage;
