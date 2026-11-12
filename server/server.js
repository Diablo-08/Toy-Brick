require('dotenv').config();
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
  console.error('====================================================');
  console.error('LỖI CẤU HÌNH BIẾN MÔI TRƯỜNG (.env):');
  console.error(`Thiếu các biến môi trường bắt buộc: ${missingEnvs.join(', ')}`);
  console.error('Vui lòng kiểm tra file .env (tham khảo file .env.example) và điền đầy đủ.');
  console.error('====================================================');
  process.exit(1);
}

// Cảnh báo nếu JWT_SECRET ngắn hơn 32 ký tự
if (process.env.JWT_SECRET.length < 32) {
  console.warn('====================================================');
  console.warn('[Cảnh báo bảo mật]: JWT_SECRET quá ngắn, chỉ dùng cho môi trường phát triển.');
  console.warn('====================================================');
}

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, '..', 'public');

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
      console.log('====================================================');
      console.log(` ToyBrick Studio Server đang chạy tại: http://localhost:${PORT}`);
      console.log(` Môi trường: ${process.env.NODE_ENV || 'development'}`);
      console.log('====================================================');
    });

    // Kết nối Database trong nền
    connectDB();
  } catch (error) {
    console.error('Lỗi khởi động máy chủ:', error.message);
    process.exit(1);
  }
};

startServer();
