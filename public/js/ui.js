/**
 * ToyBrick UI Utilities
 * Toast thông báo, Modal, Escape HTML, Format VND/Ngày tháng, Skeleton Loading
 */
const UI = (() => {
  // Thoát ký tự HTML chống XSS
  const escapeHTML = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // Định dạng tiền tệ VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Định dạng ngày giờ chuẩn Việt Nam
  const formatDate = (dateString, includeTime = true) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...(includeTime && { hour: '2-digit', minute: '2-digit' })
    };
    return new Intl.DateTimeFormat('vi-VN', options).format(date);
  };

  // Toast Notification
  const toast = (type = 'info', message = '') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toastEl = document.createElement('div');
    toastEl.className = 'pointer-events-auto flex items-center p-4 rounded-2xl glass-panel shadow-2xl transition-all duration-300 transform translate-y-3 opacity-0 border';

    let iconClass = 'fa-info-circle text-sky-400';
    let borderColor = 'border-sky-500/30';

    if (type === 'success') {
      iconClass = 'fa-circle-check text-emerald-400';
      borderColor = 'border-emerald-500/40';
    } else if (type === 'error') {
      iconClass = 'fa-triangle-exclamation text-rose-400';
      borderColor = 'border-rose-500/40';
    } else if (type === 'warning') {
      iconClass = 'fa-circle-exclamation text-amber-400';
      borderColor = 'border-amber-500/40';
    }

    toastEl.classList.add(borderColor);
    toastEl.innerHTML = `
      <div class="flex-shrink-0 mr-3">
        <i class="fa-solid ${iconClass} text-xl"></i>
      </div>
      <div class="flex-1 text-xs sm:text-sm font-medium text-slate-100 leading-snug">
        ${escapeHTML(message)}
      </div>
      <button class="ml-3 text-slate-400 hover:text-slate-100 transition focus:outline-none" onclick="this.parentElement.remove()">
        <i class="fa-solid fa-xmark text-sm"></i>
      </button>
    `;

    container.appendChild(toastEl);

    // Trigger animation vào
    requestAnimationFrame(() => {
      toastEl.classList.remove('translate-y-3', 'opacity-0');
      toastEl.classList.add('translate-y-0', 'opacity-100');
    });

    // Tự biến mất sau 3.8s
    setTimeout(() => {
      toastEl.classList.remove('translate-y-0', 'opacity-100');
      toastEl.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => {
        if (toastEl.parentNode) toastEl.remove();
      }, 300);
    }, 3800);
  };

  // Cập nhật giao diện User trên Header
  const updateNavbarUser = () => {
    const container = document.getElementById('user-nav-container');
    if (!container) return;

    if (Store.isLoggedIn()) {
      const user = Store.getUser() || { name: 'Thành viên', username: 'user', role: 'customer' };
      const isAdmin = user.role === 'admin';

      container.innerHTML = `
        <div class="relative" id="user-menu-wrapper">
          <button id="user-menu-btn" type="button" class="flex items-center space-x-2.5 py-1.5 px-3 rounded-xl bg-slate-800/80 border border-amber-500/25 hover:border-amber-400 text-slate-200 transition focus:outline-none">
            <div class="w-7 h-7 rounded-lg ${isAdmin ? 'bg-gradient-to-tr from-amber-500 to-rose-500' : 'bg-gradient-to-tr from-amber-600 to-yellow-400'} text-slate-950 font-bold flex items-center justify-center text-xs shadow-sm">
              ${escapeHTML(user.name.charAt(0).toUpperCase())}
            </div>
            <span class="text-xs font-semibold max-w-[110px] truncate hidden sm:inline">${escapeHTML(user.name)}</span>
            <i id="user-menu-chevron" class="fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform"></i>
          </button>

          <!-- Dropdown menu với click-toggle vững chắc và vùng đệm chống trượt chuột -->
          <div id="user-dropdown-menu" class="hidden absolute right-0 top-full pt-2 w-56 z-50 transition-all duration-200">
            <div class="glass-panel rounded-2xl py-2 border border-amber-500/30 shadow-2xl backdrop-blur-xl bg-slate-950/95">
              <div class="px-4 py-2 border-b border-slate-700/60 mb-1">
                <p class="text-[11px] text-slate-400 font-medium">Đã đăng nhập với tư cách</p>
                <p class="text-xs font-bold text-amber-300 truncate">${escapeHTML(user.email || user.username)}</p>
                ${isAdmin ? '<span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">QUẢN TRỊ VIÊN</span>' : ''}
              </div>

              ${isAdmin ? `
                <a href="#/admin" class="user-dropdown-item flex items-center px-4 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/15 transition">
                  <i class="fa-solid fa-gauge-high w-5 text-amber-400"></i>Quản trị Studio
                </a>
              ` : ''}

              <a href="#/orders" class="user-dropdown-item flex items-center px-4 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 transition">
                <i class="fa-solid fa-receipt w-5 text-amber-400/80"></i>Đơn hàng của tôi
              </a>

              <a href="#/account" class="user-dropdown-item flex items-center px-4 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 transition">
                <i class="fa-solid fa-user-gear w-5 text-amber-400/80"></i>Tài khoản cá nhân
              </a>

              <div class="border-t border-slate-700/60 my-1"></div>

              <button id="logout-btn" class="w-full text-left flex items-center px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/15 transition">
                <i class="fa-solid fa-arrow-right-from-bracket w-5 text-rose-400"></i>Đăng xuất
              </button>
            </div>
          </div>
        </div>
      `;

      // Xử lý bật/tắt menu bằng Click
      const menuBtn = document.getElementById('user-menu-btn');
      const dropdown = document.getElementById('user-dropdown-menu');
      const chevron = document.getElementById('user-menu-chevron');

      if (menuBtn && dropdown) {
        menuBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isHidden = dropdown.classList.contains('hidden');
          if (isHidden) {
            dropdown.classList.remove('hidden');
            if (chevron) chevron.classList.add('rotate-180');
          } else {
            dropdown.classList.add('hidden');
            if (chevron) chevron.classList.remove('rotate-180');
          }
        });

        // Bấm ngoài menu tự động đóng
        const closeMenuOnOutside = (e) => {
          const wrapper = document.getElementById('user-menu-wrapper');
          if (wrapper && !wrapper.contains(e.target)) {
            dropdown.classList.add('hidden');
            if (chevron) chevron.classList.remove('rotate-180');
          }
        };
        document.removeEventListener('click', closeMenuOnOutside);
        document.addEventListener('click', closeMenuOnOutside);

        // Đóng khi click bất kỳ link nào trong dropdown
        dropdown.querySelectorAll('.user-dropdown-item').forEach(link => {
          link.addEventListener('click', () => {
            dropdown.classList.add('hidden');
            if (chevron) chevron.classList.remove('rotate-180');
          });
        });
      }

      // Gắn sự kiện đăng xuất
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          if (dropdown) dropdown.classList.add('hidden');
          Store.clearAuth();
          UI.toast('info', 'Bạn đã đăng xuất thành công');
          UI.updateNavbarUser();
          Store.updateCartBadge();
          if (window.location.hash.startsWith('#/account') || window.location.hash.startsWith('#/orders') || window.location.hash.startsWith('#/admin')) {
            window.location.hash = '#/';
          }
        });
      }
    } else {
      container.innerHTML = `
        <button id="open-auth-btn" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 btn-gold transition flex items-center space-x-1.5 shadow-md">
          <i class="fa-solid fa-arrow-right-to-bracket text-xs"></i>
          <span>Đăng nhập</span>
        </button>
      `;

      const openAuthBtn = document.getElementById('open-auth-btn');
      if (openAuthBtn) {
        openAuthBtn.addEventListener('click', () => {
          UI.openAuthModal('login');
        });
      }
    }
  };

  // Quản lý Modal Đăng nhập / Đăng ký
  const openAuthModal = (tab = 'login') => {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    switchAuthTab(tab);
  };

  const closeAuthModal = () => {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('hidden');
  };

  const switchAuthTab = (tab) => {
    const loginTab = document.getElementById('auth-tab-login');
    const regTab = document.getElementById('auth-tab-register');
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');

    if (tab === 'login') {
      loginTab.classList.add('border-amber-400', 'text-amber-400');
      loginTab.classList.remove('border-transparent', 'text-slate-400');
      regTab.classList.add('border-transparent', 'text-slate-400');
      regTab.classList.remove('border-amber-400', 'text-amber-400');

      loginForm.classList.remove('hidden');
      regForm.classList.add('hidden');
    } else {
      regTab.classList.add('border-amber-400', 'text-amber-400');
      regTab.classList.remove('border-transparent', 'text-slate-400');
      loginTab.classList.add('border-transparent', 'text-slate-400');
      loginTab.classList.remove('border-amber-400', 'text-amber-400');

      regForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    }
  };

  // Trạng thái trống (Empty State)
  const renderEmptyState = (icon = 'fa-box-open', title = 'Không có dữ liệu', desc = '', actionLink = '', actionText = '') => {
    return `
      <div class="py-16 px-4 text-center glass-panel rounded-3xl max-w-md mx-auto my-8 border border-amber-500/20">
        <div class="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400 text-2xl">
          <i class="fa-solid ${icon}"></i>
        </div>
        <h3 class="font-heading font-bold text-lg text-slate-100 mb-2">${escapeHTML(title)}</h3>
        <p class="text-xs text-slate-400 font-lora mb-6 max-w-xs mx-auto leading-relaxed">${escapeHTML(desc)}</p>
        ${actionLink ? `
          <a href="${actionLink}" class="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl btn-gold text-slate-950 font-bold text-xs">
            <span>${escapeHTML(actionText)}</span>
            <i class="fa-solid fa-arrow-right text-[10px]"></i>
          </a>
        ` : ''}
      </div>
    `;
  };

  // Skeleton Loading Generator
  const renderProductSkeleton = (count = 4) => {
    let html = '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="glass-panel rounded-2xl p-4 border border-slate-800 space-y-4">
          <div class="h-48 w-full skeleton rounded-xl"></div>
          <div class="h-5 w-3/4 skeleton rounded"></div>
          <div class="h-4 w-1/2 skeleton rounded"></div>
          <div class="flex justify-between items-center pt-2">
            <div class="h-6 w-1/3 skeleton rounded"></div>
            <div class="h-8 w-24 skeleton rounded-xl"></div>
          </div>
        </div>
      `;
    }
    html += '</div>';
    return html;
  };

  return {
    escapeHTML,
    formatCurrency,
    formatDate,
    toast,
    updateNavbarUser,
    openAuthModal,
    closeAuthModal,
    switchAuthTab,
    renderEmptyState,
    renderProductSkeleton
  };
})();

window.UI = UI;
