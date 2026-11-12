/**
 * Khởi Tạo Ứng Dụng ToyBrick Studio SPA
 */
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Cập nhật trạng thái người dùng trên Header Navbar
  UI.updateNavbarUser();

  // 2. Đồng bộ số lượng giỏ hàng
  await Store.updateCartBadge();

  // 3. Khởi tạo Router SPA
  Router.init();

  // 4. Thiết lập sự kiện Menu Mobile
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // 5. Thiết lập sự kiện Modal Xác thực (Login / Register)
  const authModalClose = document.getElementById('auth-modal-close');
  if (authModalClose) {
    authModalClose.addEventListener('click', () => {
      UI.closeAuthModal();
    });
  }

  const authTabLogin = document.getElementById('auth-tab-login');
  const authTabReg = document.getElementById('auth-tab-register');
  if (authTabLogin && authTabReg) {
    authTabLogin.addEventListener('click', () => UI.switchAuthTab('login'));
    authTabReg.addEventListener('click', () => UI.switchAuthTab('register'));
  }

  // Đóng modal khi bấm ra ngoài vùng nội dung
  const authModal = document.getElementById('auth-modal');
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
        UI.closeAuthModal();
      }
    });
  }

  // XỬ LÝ SUBMIT ĐĂNG NHẬP
  const loginForm = document.getElementById('login-form');
  const loginBtn = document.getElementById('login-submit-btn');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const identifier = document.getElementById('login-identifier').value.trim();
      const password = document.getElementById('login-password').value;

      if (!identifier || !password) {
        UI.toast('warning', 'Vui lòng điền đầy đủ email/tên đăng nhập và mật khẩu');
        return;
      }

      if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = `
          <div class="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mr-2"></div>
          <span>Đang xác thực...</span>
        `;
      }

      try {
        const res = await API.auth.login({ identifier, password });
        if (res.success && res.data) {
          Store.setAuth(res.data.token, res.data.user);
          UI.toast('success', `Chào mừng ${res.data.user.name} trở lại ToyBrick Studio!`);
          UI.closeAuthModal();
          loginForm.reset();

          // Merge giỏ hàng tạm từ LocalStorage lên Server
          await Store.mergeCartAfterLogin();

          // Cập nhật Header
          UI.updateNavbarUser();

          // Nếu đang ở giỏ hàng hoặc trang cần auth -> load lại trang
          const currentHash = window.location.hash;
          if (currentHash === '#/cart' || currentHash === '#/checkout') {
            window.location.reload();
          } else if (res.data.user.role === 'admin' && currentHash === '#/admin') {
            window.location.reload();
          }
        }
      } catch (err) {
        UI.toast('error', err.message || 'Đăng nhập không thành công');
      } finally {
        if (loginBtn) {
          loginBtn.disabled = false;
          loginBtn.innerHTML = `
            <span>Đăng nhập</span>
            <i class="fa-solid fa-arrow-right text-xs ml-2"></i>
          `;
        }
      }
    });
  }

  // XỬ LÝ SUBMIT ĐĂNG KÝ
  const regForm = document.getElementById('register-form');
  const regBtn = document.getElementById('reg-submit-btn');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const username = document.getElementById('reg-username').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;

      if (!name || !username || !email || !password) {
        UI.toast('warning', 'Vui lòng điền đầy đủ tất cả các trường');
        return;
      }

      if (regBtn) {
        regBtn.disabled = true;
        regBtn.innerHTML = `
          <div class="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mr-2"></div>
          <span>Đang đăng ký...</span>
        `;
      }

      try {
        const res = await API.auth.register({ name, username, email, password });
        if (res.success && res.data) {
          Store.setAuth(res.data.token, res.data.user);
          UI.toast('success', 'Đăng ký tài khoản thành công!');
          UI.closeAuthModal();
          regForm.reset();

          await Store.mergeCartAfterLogin();
          UI.updateNavbarUser();
        }
      } catch (err) {
        UI.toast('error', err.message || 'Đăng ký không thành công');
      } finally {
        if (regBtn) {
          regBtn.disabled = false;
          regBtn.innerHTML = `
            <span>Tạo tài khoản</span>
            <i class="fa-solid fa-user-plus text-xs ml-2"></i>
          `;
        }
      }
    });
  }
});
