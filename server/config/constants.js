module.exports = {
  FREE_SHIPPING_THRESHOLD: 500000,
  STANDARD_SHIPPING_FEE: 30000,
  ORDER_STATUS: {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    SHIPPING: 'Đang giao',
    COMPLETED: 'Hoàn tất',
    CANCELLED: 'Đã hủy'
  },
  ORDER_STATUS_LIST: ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao', 'Hoàn tất', 'Đã hủy'],
  USER_ROLES: ['customer', 'admin'],
  ITEM_KINDS: ['product', 'brick'],
  PAYMENT_METHODS: ['cod', 'bank'],
  PRODUCT_CATEGORIES: [
    'Technic & Cơ khí',
    'Kiến trúc & Di sản',
    'Phương tiện siêu xe',
    'Vũ trụ & Viễn tưởng',
    'Robot & Mecha',
    'Bộ lắp ráp Mini'
  ],
  BRICK_CATEGORIES: [
    'Gạch cơ bản (Standard)',
    'Tấm phẳng (Plates & Tiles)',
    'Kỹ thuật & Bánh răng (Technic)',
    'Khớp nối & Trục (Pins & Axles)',
    'Trong suốt & Pha lê (Trans-Clear)',
    'Đặc biệt & Chi tiết nhỏ'
  ]
};
