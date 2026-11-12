/**
 * ToyBrick API Client
 * Giao tiếp an toàn với Express 5 Backend
 */
const API = (() => {
  const BASE_URL = '/api';

  const request = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = Store.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({
        success: false,
        message: 'Lỗi giải mã phản hồi từ máy chủ'
      }));

      // Nếu 401 Unauthorized và có token -> token đã hết hạn
      if (response.status === 401 && token) {
        Store.clearAuth();
        UI.toast('error', 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        UI.updateNavbarUser();
        if (window.location.hash.startsWith('#/account') || window.location.hash.startsWith('#/orders') || window.location.hash.startsWith('#/admin')) {
          window.location.hash = '#/';
        }
      }

      // Nếu 503 DB offline
      if (response.status === 503 && data.isDbOffline) {
        UI.toast('error', data.message);
      }

      if (!response.ok) {
        throw new Error(data.message || `Lỗi yêu cầu: ${response.status}`);
      }

      return data;
    } catch (err) {
      throw err;
    }
  };

  return {
    get: (endpoint, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;
      return request(url, { method: 'GET' });
    },
    post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
    patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),

    // Auth API
    auth: {
      register: (data) => API.post('/auth/register', data),
      login: (data) => API.post('/auth/login', data),
      getMe: () => API.get('/auth/me'),
      updateMe: (data) => API.put('/auth/me', data),
      updatePassword: (data) => API.put('/auth/password', data)
    },

    // Products API
    products: {
      getAll: (params) => API.get('/products', params),
      getBySlug: (slug) => API.get(`/products/${slug}`),
      getByQr: (code) => API.get(`/products/qr/${encodeURIComponent(code)}`)
    },

    // Bricks API
    bricks: {
      getAll: (params) => API.get('/bricks', params),
      getByCode: (code) => API.get(`/bricks/${encodeURIComponent(code)}`)
    },

    // Cart API
    cart: {
      get: () => API.get('/cart'),
      add: (kind, id, qty) => API.post('/cart', { kind, id, qty }),
      update: (itemId, qty) => API.patch(`/cart/items/${itemId}`, { qty }),
      remove: (itemId) => API.delete(`/cart/items/${itemId}`),
      clear: () => API.delete('/cart'),
      merge: (localItems) => API.post('/cart/merge', { localItems })
    },

    // Orders API
    orders: {
      create: (data) => API.post('/orders', data),
      getAll: (params) => API.get('/orders', params),
      getById: (id) => API.get(`/orders/${id}`),
      cancel: (id, reason) => API.patch(`/orders/${id}/cancel`, { reason })
    },

    // Admin API
    admin: {
      getStats: () => API.get('/admin/stats'),
      getProducts: (params) => API.get('/admin/products', params),
      createProduct: (data) => API.post('/admin/products', data),
      updateProduct: (id, data) => API.put(`/admin/products/${id}`, data),
      deleteProduct: (id) => API.delete(`/admin/products/${id}`),
      getBricks: (params) => API.get('/admin/bricks', params),
      createBrick: (data) => API.post('/admin/bricks', data),
      updateBrick: (id, data) => API.put(`/admin/bricks/${id}`, data),
      deleteBrick: (id) => API.delete(`/admin/bricks/${id}`),
      importBricksCSV: (bricks) => API.post('/admin/bricks/import-csv', { bricks }),
      getOrders: (params) => API.get('/admin/orders', params),
      updateOrderStatus: (id, status, note) => API.patch(`/admin/orders/${id}/status`, { status, note }),
      getUsers: (params) => API.get('/admin/users', params)
    }
  };
})();

window.API = API;
