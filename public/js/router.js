/**
 * ToyBrick SPA Hash Router
 * Định tuyến Single Page Application không cần framework,
 * tự động gọi destroy() giải phóng bộ nhớ khi rời trang.
 */
const Router = (() => {
  let activePageModule = null;

  const routes = [
    { pattern: /^#\/?$/, page: HomePage },
    { pattern: /^#\/shop\/?$/, page: ShopPage },
    { pattern: /^#\/product\/([a-zA-Z0-9_-]+)\/?$/, page: ProductPage, paramNames: ['slug'] },
    { pattern: /^#\/bricks\/?$/, page: BricksPage },
    { pattern: /^#\/qr\/?$/, page: QRPage },
    { pattern: /^#\/cart\/?$/, page: CartPage },
    { pattern: /^#\/checkout\/?$/, page: CheckoutPage },
    { pattern: /^#\/orders\/?$/, page: OrdersPage },
    { pattern: /^#\/orders\/([a-zA-Z0-9_-]+)\/?$/, page: OrdersPage, paramNames: ['id'] },
    { pattern: /^#\/account\/?$/, page: AccountPage },
    { pattern: /^#\/admin\/?$/, page: AdminPage }
  ];

  const handleRouteChange = async () => {
    const hash = window.location.hash || '#/';
    const container = document.getElementById('page-content');
    if (!container) return;

    // 1. Gọi destroy trang cũ để dọn sạch tài nguyên (ThreeJS, Polling, Camera)
    if (activePageModule && typeof activePageModule.destroy === 'function') {
      try {
        activePageModule.destroy();
      } catch (err) {
        console.warn('[Router Destroy Warning]', err.message);
      }
    }

    // Đảm bảo trạng thái hiển thị: ẩn detectorPage khi ở trang khác
    const detectorPage = document.getElementById('box-detector-page');
    if (!hash.startsWith('#/qr')) {
      if (detectorPage) detectorPage.classList.add('hidden');
      container.classList.remove('hidden');
    }

    // 2. Cập nhật active link trên Navbar
    updateActiveNav(hash);

    // 3. Khớp route
    let matched = false;
    for (const r of routes) {
      const match = hash.match(r.pattern);
      if (match) {
        matched = true;
        activePageModule = r.page;

        const params = {};
        if (r.paramNames && match.length > 1) {
          r.paramNames.forEach((name, idx) => {
            params[name] = match[idx + 1];
          });
        }

        window.scrollTo({ top: 0, behavior: 'instant' });
        await r.page.render(container, params);
        break;
      }
    }

    // 4. Nếu không khớp -> Trang 404 Not Found
    if (!matched) {
      activePageModule = null;
      container.innerHTML = UI.renderEmptyState(
        'fa-compass-drafting',
        '404 - Không tìm thấy trang yêu cầu',
        `Đường dẫn "${UI.escapeHTML(hash)}" không tồn tại trên hệ thống ToyBrick Studio.`,
        '#/',
        'Về trang chủ'
      );
    }
  };

  const updateActiveNav = (hash) => {
    const links = document.querySelectorAll('.nav-link, .mobile-nav-link');
    links.forEach(link => {
      const href = link.getAttribute('href');
      const isMatch = (href === '#/' && (hash === '#/' || hash === '')) || (href !== '#/' && hash.startsWith(href));
      if (isMatch) {
        link.classList.add('text-amber-400', 'bg-white/10');
        link.classList.remove('text-slate-300');
      } else {
        link.classList.remove('text-amber-400', 'bg-white/10');
        link.classList.add('text-slate-300');
      }
    });

    // Ẩn menu mobile nếu đang mở
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
    }
  };

  return {
    init: () => {
      window.addEventListener('hashchange', handleRouteChange);
      handleRouteChange();
    },
    navigate: (hash) => {
      window.location.hash = hash;
    }
  };
})();

window.Router = Router;
