const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Tất cả các route /admin đều cần đăng nhập và có role admin
router.use(verifyToken, requireRole('admin'));

// Thống kê Dashboard
router.get('/stats', adminController.getStats);

// Quản lý Sản phẩm
router.get('/products', adminController.getAdminProducts);
router.post(
  '/products',
  validate([
    body('name').trim().notEmpty().withMessage('Tên sản phẩm không được để trống'),
    body('price').isNumeric().withMessage('Giá phải là số'),
    body('category').trim().notEmpty().withMessage('Danh mục không được để trống')
  ]),
  adminController.createProduct
);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Quản lý Gạch lẻ
router.get('/bricks', adminController.getAdminBricks);
router.post(
  '/bricks',
  validate([
    body('code').trim().notEmpty().withMessage('Mã gạch không được để trống'),
    body('name').trim().notEmpty().withMessage('Tên gạch không được để trống'),
    body('color').trim().notEmpty().withMessage('Màu sắc không được để trống'),
    body('colorHex').trim().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Mã màu Hex không hợp lệ'),
    body('price').isNumeric().withMessage('Giá phải là số')
  ]),
  adminController.createBrick
);
router.put('/bricks/:id', adminController.updateBrick);
router.delete('/bricks/:id', adminController.deleteBrick);
router.post('/bricks/import-csv', adminController.importBricksCSV);

// Quản lý Đơn hàng
router.get('/orders', adminController.getAdminOrders);
router.patch(
  '/orders/:id/status',
  validate([
    body('status').notEmpty().withMessage('Trạng thái không được để trống')
  ]),
  adminController.updateOrderStatus
);

// Quản lý Người dùng
router.get('/users', adminController.getAdminUsers);

module.exports = router;
