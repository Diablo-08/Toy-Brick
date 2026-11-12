/**
 * ToyBrick State Store
 * Quản lý trạng thái người dùng, token và giỏ hàng localStorage/server
 */
const Store = (() => {
  const TOKEN_KEY = 'tb_token';
  const USER_KEY = 'tb_user';
  const LOCAL_CART_KEY = 'tb_local_cart';

  let currentUser = null;
  let cartCount = 0;

  // Khởi tạo user từ localStorage nếu có
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
    }
  } catch (e) {
    localStorage.removeItem(USER_KEY);
  }

  return {
    getToken: () => localStorage.getItem(TOKEN_KEY),

    setAuth: (token, user) => {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      currentUser = user;
    },

    clearAuth: () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      currentUser = null;
    },

    getUser: () => currentUser,

    setUser: (user) => {
      currentUser = user;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),

    isAdmin: () => {
      return currentUser && currentUser.role === 'admin';
    },

    // Quản lý giỏ hàng cục bộ (khi chưa đăng nhập)
    getLocalCart: () => {
      try {
        const stored = localStorage.getItem(LOCAL_CART_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    },

    saveLocalCart: (items) => {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
    },

    clearLocalCart: () => {
      localStorage.removeItem(LOCAL_CART_KEY);
    },

    // Thêm vào giỏ offline
    addToLocalCart: (kind, id, qty = 1, itemData = {}) => {
      const cart = Store.getLocalCart();
      const existing = cart.find(i => i.kind === kind && i.ref === id);
      if (existing) {
        existing.qty += qty;
      } else {
        cart.push({
          kind,
          ref: id,
          qty,
          name: itemData.name || '',
          price: itemData.price || 0,
          code: itemData.code || itemData.sku || '',
          image: itemData.image || '',
          color: itemData.color || '',
          colorHex: itemData.colorHex || ''
        });
      }
      Store.saveLocalCart(cart);
      Store.updateCartBadge();
    },

    // Cập nhật số lượng hiển thị trên Badge Navbar
    getCartCount: () => cartCount,

    setCartCount: (count) => {
      cartCount = Math.max(0, count);
      const badge = document.getElementById('cart-count-badge');
      if (badge) {
        badge.textContent = cartCount;
        if (cartCount > 0) {
          badge.classList.remove('scale-0');
          badge.classList.add('scale-100');
        } else {
          badge.classList.remove('scale-100');
          badge.classList.add('scale-0');
        }
      }
    },

    // Đồng bộ số lượng giỏ hàng
    updateCartBadge: async () => {
      if (Store.isLoggedIn()) {
        try {
          const res = await API.cart.get();
          if (res.success && res.data) {
            Store.setCartCount(res.data.itemCount || 0);
          }
        } catch (e) {
          // Bỏ qua nếu lỗi mạng tạm thời
        }
      } else {
        const local = Store.getLocalCart();
        const count = local.reduce((sum, i) => sum + (i.qty || 1), 0);
        Store.setCartCount(count);
      }
    },

    // Merge giỏ hàng sau khi login
    mergeCartAfterLogin: async () => {
      const localItems = Store.getLocalCart();
      if (localItems.length > 0) {
        try {
          await API.cart.merge(localItems);
          Store.clearLocalCart();
        } catch (e) {
          console.error('[Cart Merge Error]', e.message);
        }
      }
      await Store.updateCartBadge();
    }
  };
})();

window.Store = Store;
