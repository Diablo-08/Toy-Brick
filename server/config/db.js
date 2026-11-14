const mongoose = require('mongoose');

let isConnecting = false;
let reconnectTimer = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || 'cultivation_db';

  if (!mongoUri) {
    console.error('[Database Lỗi]: MONGO_URI không được cấu hình trong .env');
    return null;
  }

  if (isConnecting) return;
  isConnecting = true;

  try {
    const conn = await mongoose.connect(mongoUri, {
      dbName: dbName,
      serverSelectionTimeoutMS: 8000
    });

    console.log(`[Database] Đã kết nối MongoDB Atlas: ${conn.connection.name}`);

    if (reconnectTimer) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    }

    isConnecting = false;
    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`[Database Lỗi kết nối]: ${error.message}`);

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
