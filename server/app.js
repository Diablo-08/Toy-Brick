const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sanitize = require('./middleware/sanitize');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const brickRoutes = require('./routes/bricks');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const app = express();

// Bảo mật với Helmet và CSP cho phép Tailwind, FontAwesome, ThreeJS, Google Fonts
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://cdn.tailwindcss.com',
          'https://cdnjs.cloudflare.com'
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
          'https://cdnjs.cloudflare.com'
        ],
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',
          'https://cdnjs.cloudflare.com',
          'data:'
        ],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'", 'https:', 'wss:'],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// Cấu hình CORS
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (mobile app, curl, same-origin)
      if (!origin || origin === allowedOrigin || allowedOrigin === '*') {
        return callback(null, true);
      }
      return callback(null, true); // Dev linh hoạt
    },
    credentials: true
  })
);

// Giới hạn kích thước body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Chống NoSQL Injection
app.use(sanitize);

// Middleware kiểm tra kết nối Database trước khi xử lý API
app.use('/api', (req, res, next) => {
  // Ngoại trừ endpoint kiểm tra sức khỏe và ping
  if (req.path === '/health' || req.path === '/ping') return next();

  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      isDbOffline: true,
      message: 'Chưa kết nối được MongoDB Atlas (Lỗi: bad auth hoặc mạng). Vui lòng kiểm tra lại tài khoản trong file .env và mục Database Access trên Atlas.',
      hint: 'Mở MongoDB Atlas -> Database Access -> Đặt lại mật khẩu cho Database User và cập nhật vào .env'
    });
  }
  next();
});

// Rate limiter riêng cho /api/auth (10 lần / 15 phút)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu đăng nhập/đăng ký. Vui lòng thử lại sau 15 phút!'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Mount API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bricks', brickRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Health check & Ping endpoints
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ToyBrick Studio API is running',
    timestamp: new Date().toISOString()
  });
});

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

module.exports = app;
