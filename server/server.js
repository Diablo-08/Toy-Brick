require('dotenv').config({ quiet: true });
const path = require('path');
const express = require('express');
const connectDB = require('./config/db');
const app = require('./app');
const errorHandler = require('./middleware/errorHandler');

// KIỂM TRA BIẾN MÔI TRƯỜNG BẮT BUỘC
const requiredEnvVars = [
  'MONGO_URI',
  'DB_NAME',
  'JWT_SECRET',
  'ADMIN_USERNAME',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD'
];

const missingEnvs = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvs.length > 0) {
  console.error(`[Lỗi cấu hình .env]: Thiếu các biến bắt buộc: ${missingEnvs.join(', ')}`);
  process.exit(1);
}

// Cảnh báo gọn nếu JWT_SECRET ngắn hơn 32 ký tự theo đúng yêu cầu
if (process.env.JWT_SECRET.length < 32) {
  console.warn('[Cảnh báo]: JWT_SECRET quá ngắn, chỉ dùng cho môi trường phát triển.');
}

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, '..', 'public');

// Route ping kiểm tra tình trạng máy chủ
app.get(['/ping', '/api/ping'], (req, res) => {
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.status(200).json({
      status: 'ok',
      message: 'pong',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  }
  res.status(200).send('pong');
});

// Phục vụ static files từ thư mục public
app.use(express.static(publicDir));

// Route 404 cho API không tồn tại
app.all('/api/*splat', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' không tồn tại trên hệ thống`
  });
});

// SPA fallback cho Express 5: sử dụng /*splat
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Gắn error handler ở cuối cùng
app.use(errorHandler);

// Khởi chạy server
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`ToyBrick Studio đang chạy tại: http://localhost:${PORT}`);
    });

    // Kết nối Database trong nền
    connectDB();
  } catch (error) {
    console.error('Lỗi khởi động máy chủ:', error.message);
    process.exit(1);
  }
};

startServer();
