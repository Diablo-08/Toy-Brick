const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    const dbName = process.env.DB_NAME || 'cultivation_db';

    if (!mongoUri) {
      throw new Error('MONGO_URI không được cấu hình trong .env');
    }

    const conn = await mongoose.connect(mongoUri, {
      dbName: dbName
    });

    console.log(`[Database] Đã kết nối MongoDB thành công tới database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('[Database] Lỗi kết nối MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
