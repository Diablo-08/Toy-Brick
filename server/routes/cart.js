const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const cartController = require('../controllers/cartController');

router.use(verifyToken);

// Xem giỏ hàng
router.get('/', cartController.getCart);

// Thêm vào giỏ hàng
router.post(
  '/',
  validate([
    body('kind').isIn(['product', 'brick']).withMessage('Loại mặt hàng phải là product hoặc brick'),
    body('id').isMongoId().withMessage('ID mặt hàng không hợp lệ'),
    body('qty').optional().isInt({ min: 1 }).withMessage('Số lượng tối thiểu là 1')
  ]),
  cartController.addToCart
);

// Đồng bộ giỏ hàng từ localStorage sau khi login
router.post('/merge', cartController.mergeCart);

// Cập nhật số lượng
router.patch(
  '/items/:itemId',
  validate([
    body('qty').isInt({ min: 1 }).withMessage('Số lượng tối thiểu là 1')
  ]),
  cartController.updateCartItem
);

// Xóa mặt hàng khỏi giỏ
router.delete('/items/:itemId', cartController.removeCartItem);

// Dọn sạch giỏ
router.delete('/', cartController.clearCart);

module.exports = router;
