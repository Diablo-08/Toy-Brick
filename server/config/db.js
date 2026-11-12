const mongoose = require('mongoose');

let isConnecting = false;
let reconnectTimer = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || 'cultivation_db';

  if (!mongoUri) {
    console.error('====================================================');
    console.error('[Database Lỗi]: MONGO_URI không được cấu hình trong .env');
    console.error('====================================================');
    return null;
  }

  if (isConnecting) return;
  isConnecting = true;

  try {
    const conn = await mongoose.connect(mongoUri, {
      dbName: dbName,
      serverSelectionTimeoutMS: 8000
    });

    console.log('====================================================');
    console.log(`[Database] ĐÃ KẾT NỐI THÀNH CÔNG MONGODB ATLAS!`);
    console.log(`[Database] Tên cơ sở dữ liệu: ${conn.connection.name}`);
    console.log('====================================================');

    if (reconnectTimer) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    }

    isConnecting = false;
    return conn;
  } catch (error) {
    isConnecting = false;
    console.error('====================================================');
    console.error(' [DATABASE LỖI KẾT NỐI]:', error.message);
    console.error('----------------------------------------------------');
    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.error(' NGUYÊN NHÂN: Sai Tên người dùng hoặc Mật khẩu trên MongoDB Atlas.');
      console.error(' CÁCH KHẮC PHỤC:');
      console.error(' 1. Mở trang https://cloud.mongodb.com -> Đăng nhập.');
      console.error(' 2. Vào menu bên trái: Security -> Database Access.');
      console.error(' 3. Kiểm tra mục Database Users:');
      console.error('    - Đã có user trùng với tên trong MONGO_URI chưa?');
      console.error('    - Bấm "Edit" -> "Edit Password" -> Đặt lại mật khẩu mới.');
      console.error('    - Đảm bảo quyền Built-in Role là "Read and write to any database" hoặc "Atlas admin".');
      console.error(' 4. Vào Security -> Network Access -> Đảm bảo đã có IP "0.0.0.0/0" (Allow from Anywhere).');
      console.error(' 5. Cập nhật lại mật khẩu mới vào file .env.');
    } else {
      console.error(' Vui lòng kiểm tra kết nối mạng hoặc cấu hình Network Access (IP Whitelist 0.0.0.0/0) trên Atlas.');
    }
    console.error('----------------------------------------------------');
    console.error(' [LƯU Ý]: Máy chủ Web vẫn đang hoạt động tại cổng http://localhost:' + (process.env.PORT || 3000));
    console.error(' Hệ thống sẽ tự động thử kết nối lại với Database mỗi 10 giây...');
    console.error('====================================================');

    // Tự động thử kết nối lại định kỳ nếu chưa kết nối được
    if (!reconnectTimer) {
      reconnectTimer = setInterval(() => {
        if (mongoose.connection.readyState !== 1) {
          connectDB();
        }
      }, 10000);
    }

    return null;
  }
};

module.exports = connectDB;
