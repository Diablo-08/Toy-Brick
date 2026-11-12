const express = require('express');
const router = express.Router();
const brickController = require('../controllers/brickController');

// Lấy danh sách gạch lẻ (Pick-a-Brick)
router.get('/', brickController.getBricks);

// Chi tiết 1 loại gạch theo code
router.get('/:code', brickController.getBrickByCode);

module.exports = router;
