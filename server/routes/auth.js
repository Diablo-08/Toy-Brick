const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const authController = require('../controllers/authController');

// Đăng ký tài khoản
router.post(
  '/register',
  validate([
    body('name').trim().notEmpty().withMessage('Họ và tên không được để trống'),
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Tên đăng nhập từ 3 đến 30 ký tự')
      .matches(/^[a-z0-9_.]+$/i)
      .withMessage('Tên đăng nhập chỉ chứa chữ cái, số, dấu gạch dưới và dấu chấm'),
    body('email').trim().isEmail().withMessage('Email không đúng định dạng'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự')
  ]),
  authController.register
);

// Đăng nhập
router.post(
  '/login',
  validate([
    body('identifier').trim().notEmpty().withMessage('Vui lòng nhập email hoặc tên đăng nhập'),
    body('password').notEmpty().withMessage('Vui lòng nhập mật khẩu')
  ]),
  authController.login
);

// Thông tin tài khoản hiện tại
router.get('/me', verifyToken, authController.getMe);
router.put('/me', verifyToken, authController.updateMe);
router.put('/password', verifyToken, authController.updatePassword);

module.exports = router;
