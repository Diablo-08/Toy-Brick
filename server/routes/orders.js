const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

router.use(verifyToken);

// Đặt hàng
router.post(
  '/',
  validate([
    body('shipping.fullName').trim().notEmpty().withMessage('Họ và tên người nhận không được để trống'),
    body('shipping.phone').trim().notEmpty().withMessage('Số điện thoại không được để trống'),
    body('shipping.address').trim().notEmpty().withMessage('Địa chỉ giao hàng không được để trống'),
    body('paymentMethod').optional().isIn(['cod', 'bank']).withMessage('Phương thức thanh toán không hợp lệ')
  ]),
  orderController.createOrder
);

// Danh sách đơn hàng cá nhân
router.get('/', orderController.getOrders);

// Chi tiết đơn hàng
router.get('/:id', orderController.getOrderById);

// Hủy đơn hàng
router.patch('/:id/cancel', orderController.cancelOrder);

module.exports = router;
