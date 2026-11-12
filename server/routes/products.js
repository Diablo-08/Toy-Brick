const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Lấy danh sách sản phẩm (có lọc, phân trang)
router.get('/', productController.getProducts);

// Tra cứu theo mã QR hoặc SKU
router.get('/qr/:code', productController.getProductByQr);

// Lấy chi tiết sản phẩm theo slug
router.get('/:slug', productController.getProductBySlug);

module.exports = router;
