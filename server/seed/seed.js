require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Brick = require('../models/Brick');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

// KIỂM TRA ENV TRƯỚC KHI SEED
const requiredEnvVars = [
  'MONGO_URI',
  'DB_NAME',
  'ADMIN_USERNAME',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`[Seed Error] Thiếu biến môi trường: ${envVar}`);
    process.exit(1);
  }
}

const seedDatabase = async () => {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.error('====================================================');
      console.error('[Seed Thất Bại]: Chưa thể kết nối với MongoDB Atlas để nạp dữ liệu.');
      console.error('Vui lòng kiểm tra lại Username/Password trong file .env theo hướng dẫn ở trên.');
      console.error('====================================================');
      process.exit(1);
    }
    console.log('[Seed] Đang dọn dẹp dữ liệu cũ...');

    // Dọn dẹp collection
    await Promise.all([
      Product.deleteMany({}),
      Brick.deleteMany({}),
      Cart.deleteMany({}),
      Order.deleteMany({})
    ]);

    // --- 1. TẠO HOẶC CẬP NHẬT TÀI KHOẢN ADMIN ---
    const adminUsername = process.env.ADMIN_USERNAME.toLowerCase().trim();
    const adminEmail = process.env.ADMIN_EMAIL.toLowerCase().trim();
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

    let adminUser = await User.findOne({
      $or: [{ username: adminUsername }, { email: adminEmail }]
    });

    if (adminUser) {
      adminUser.name = 'ToyBrick Master Admin';
      adminUser.username = adminUsername;
      adminUser.email = adminEmail;
      adminUser.password = hashedAdminPassword;
      adminUser.role = 'admin';
      await adminUser.save();
    } else {
      adminUser = await User.create({
        name: 'ToyBrick Master Admin',
        username: adminUsername,
        email: adminEmail,
        password: hashedAdminPassword,
        role: 'admin',
        phone: '0901234567',
        addresses: [
          {
            label: 'Trụ sở chính',
            fullName: 'ToyBrick Studio Admin',
            phone: '0901234567',
            line: 'Số 88 Phố Thiên Hà, Phường Bến Nghé',
            ward: 'Phường Bến Nghé',
            district: 'Quận 1',
            city: 'TP. Hồ Chí Minh',
            isDefault: true
          }
        ]
      });
    }

    // --- 2. TẠO TÀI KHOẢN KHÁCH DEMO ---
    const customerUsername = 'demo_customer';
    const customerEmail = 'khachhang@toybrick.vn';
    const customerPasswordHash = await bcrypt.hash('KhachHang@123', salt);

    await User.deleteMany({
      $or: [{ username: customerUsername }, { email: customerEmail }]
    });

    const demoCustomer = await User.create({
      name: 'Nguyễn Văn An',
      username: customerUsername,
      email: customerEmail,
      password: customerPasswordHash,
      role: 'customer',
      phone: '0988776655',
      addresses: [
        {
          label: 'Nhà riêng',
          fullName: 'Nguyễn Văn An',
          phone: '0988776655',
          line: 'Số 123 Đường Sáng Tạo',
          ward: 'Phường Dịch Vọng Hậu',
          district: 'Quận Cầu Giấy',
          city: 'Hà Nội',
          isDefault: true
        }
      ]
    });

    // --- 3. TẠO SẢN PHẨM MẪU (>= 6 sản phẩm, có model3d.parts) ---
    console.log('[Seed] Đang nạp sản phẩm mẫu...');
    const productsData = [
      {
        name: 'Siêu xe F1 Technic Vô Địch 2026',
        slug: 'sieu-xe-f1-technic-vo-dich-2026',
        description: 'Mô hình siêu xe đua Công thức 1 đỉnh cao dòng Technic. Tỉ lệ chuẩn 1:8 với hệ thống treo độc lập, vi sai cầu sau, động cơ V6 pít-tông chuyển động và cánh gió khí động học bung tách linh hoạt.',
        price: 2490000,
        salePrice: 2190000,
        pieceCount: 1639,
        ageRange: '18+',
        category: 'Technic & Cơ khí',
        images: [
          'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80'
        ],
        stock: 25,
        sku: 'TECH-F1-1639',
        qrCode: 'TOYBRICK-F1-2026',
        ratingAvg: 5.0,
        ratingCount: 42,
        model3d: {
          parts: [
            // Thân gầm chính (Chassis)
            { name: 'Khung gầm chính', shape: 'box', size: [1.4, 0.25, 4.2], position: [0, 0.2, 0], explodeOffset: [0, -0.6, 0], color: '#111827' },
            // Buồng lái (Cockpit)
            { name: 'Khoang lái Aero', shape: 'box', size: [1.1, 0.45, 1.8], position: [0, 0.5, -0.2], explodeOffset: [0, 0.8, 0], color: '#f59e0b' },
            // Vành bảo vệ Halo
            { name: 'Vòng bảo vệ Halo', shape: 'cylinder', size: [0.12, 0.12, 1.0], position: [0, 0.85, 0.2], explodeOffset: [0, 1.2, 0], color: '#e2e8f0' },
            // Mũi xe (Nosecone)
            { name: 'Mũi xe khí động', shape: 'box', size: [0.9, 0.25, 1.5], position: [0, 0.28, 2.3], explodeOffset: [0, 0, 1.2], color: '#f59e0b' },
            // Cánh gió trước (Front Wing)
            { name: 'Cánh gió trước đa tầng', shape: 'box', size: [2.6, 0.1, 0.7], position: [0, 0.15, 3.0], explodeOffset: [0, -0.2, 1.6], color: '#0284c7' },
            // Cánh gió sau (Rear Wing DRS)
            { name: 'Cánh gió DRS sau', shape: 'box', size: [2.2, 0.5, 0.6], position: [0, 1.0, -2.1], explodeOffset: [0, 1.4, -1.2], color: '#f59e0b' },
            // Trục cánh sau
            { name: 'Giá đỡ cánh sau', shape: 'box', size: [0.3, 0.7, 0.2], position: [0, 0.6, -2.0], explodeOffset: [0, 0.5, -0.8], color: '#334155' },
            // Bánh trước trái
            { name: 'Bánh trước (Trái)', shape: 'cylinder', size: [0.55, 0.55, 0.45], position: [-1.3, 0.35, 1.8], explodeOffset: [-1.2, 0, 0.2], color: '#1e293b' },
            // Bánh trước phải
            { name: 'Bánh trước (Phải)', shape: 'cylinder', size: [0.55, 0.55, 0.45], position: [1.3, 0.35, 1.8], explodeOffset: [1.2, 0, 0.2], color: '#1e293b' },
            // Bánh sau trái
            { name: 'Bánh sau bám đường (Trái)', shape: 'cylinder', size: [0.65, 0.65, 0.6], position: [-1.4, 0.4, -1.6], explodeOffset: [-1.3, 0, -0.3], color: '#1e293b' },
            // Bánh sau phải
            { name: 'Bánh sau bám đường (Phải)', shape: 'cylinder', size: [0.65, 0.65, 0.6], position: [1.4, 0.4, -1.6], explodeOffset: [1.3, 0, -0.3], color: '#1e293b' },
            // Động cơ Hybrid V6
            { name: 'Khối động cơ V6 Turbo', shape: 'box', size: [0.9, 0.6, 1.1], position: [0, 0.55, -1.1], explodeOffset: [0, 1.0, -0.4], color: '#ef4444' }
          ]
        }
      },
      {
        name: 'Trạm Vũ Trụ Không Gian Orbital-X',
        slug: 'tram-vu-tru-khong-gian-orbital-x',
        description: 'Tái hiện chân thực trạm nghiên cứu quỹ đạo với 4 module khoang khoa học, tấm pin năng lượng mặt trời xoay 360 độ và đài quan sát kính vòm thiên văn.',
        price: 1850000,
        salePrice: null,
        pieceCount: 1250,
        ageRange: '14+',
        category: 'Vũ trụ & Viễn tưởng',
        images: [
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'
        ],
        stock: 14,
        sku: 'SPACE-ORB-1250',
        qrCode: 'TOYBRICK-SPACE-ORB',
        ratingAvg: 4.9,
        ratingCount: 28,
        model3d: {
          parts: [
            { name: 'Khoang lõi trung tâm', shape: 'cylinder', size: [0.8, 0.8, 2.5], position: [0, 0, 0], explodeOffset: [0, 0, 0], color: '#e2e8f0' },
            { name: 'Module sinh hoạt Alpha', shape: 'box', size: [1.0, 1.0, 1.2], position: [-1.5, 0, 0], explodeOffset: [-1.2, 0, 0], color: '#38bdf8' },
            { name: 'Module nghiên cứu Beta', shape: 'box', size: [1.0, 1.0, 1.2], position: [1.5, 0, 0], explodeOffset: [1.2, 0, 0], color: '#38bdf8' },
            { name: 'Tấm pin mặt trời Cánh Trái', shape: 'box', size: [3.0, 0.08, 1.0], position: [0, 1.6, 0], explodeOffset: [0, 1.2, 0], color: '#0284c7' },
            { name: 'Tấm pin mặt trời Cánh Phải', shape: 'box', size: [3.0, 0.08, 1.0], position: [0, -1.6, 0], explodeOffset: [0, -1.2, 0], color: '#0284c7' },
            { name: 'Đài quan sát Kính Vòm', shape: 'cylinder', size: [0.6, 0.6, 0.6], position: [0, 0, 1.5], explodeOffset: [0, 0, 1.0], color: '#f59e0b' }
          ]
        }
      },
      {
        name: 'Tháp Đồng Hồ Di Sản Cổ Điển',
        slug: 'thap-dong-ho-di-san-co-dien',
        description: 'Tác phẩm kiến trúc Gothic tinh xảo với hơn 2.100 mảnh ghép. Mặt đồng hồ 4 hướng phát quang trong đêm, mái vòm bằng đồng cổ kính và nội thất cơ cấu bánh răng chuyển động.',
        price: 2790000,
        salePrice: 2450000,
        pieceCount: 2160,
        ageRange: '16+',
        category: 'Kiến trúc & Di sản',
        images: [
          'https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&w=800&q=80'
        ],
        stock: 8,
        sku: 'ARCH-CLOCK-2160',
        qrCode: 'TOYBRICK-CLOCK-TOWER',
        ratingAvg: 4.8,
        ratingCount: 19,
        model3d: {
          parts: [
            { name: 'Chân đế móng đá', shape: 'box', size: [2.2, 0.8, 2.2], position: [0, -1.6, 0], explodeOffset: [0, -0.6, 0], color: '#64748b' },
            { name: 'Thân tháp tầng 1', shape: 'box', size: [1.8, 1.6, 1.8], position: [0, -0.4, 0], explodeOffset: [0, -0.2, 0], color: '#d97706' },
            { name: 'Thân tháp tầng 2 hoa văn', shape: 'box', size: [1.6, 1.4, 1.6], position: [0, 1.1, 0], explodeOffset: [0, 0.4, 0], color: '#b45309' },
            { name: 'Hộp mặt đồng hồ 4 hướng', shape: 'box', size: [1.7, 1.0, 1.7], position: [0, 2.3, 0], explodeOffset: [0, 0.9, 0], color: '#fef08a' },
            { name: 'Mái chóp Gothic vươn cao', shape: 'cylinder', size: [1.2, 0.1, 1.8], position: [0, 3.6, 0], explodeOffset: [0, 1.6, 0], color: '#0f766e' }
          ]
        }
      },
      {
        name: 'Robot Chiến Đấu Cyber Titan Mecha-01',
        slug: 'robot-chien-dau-cyber-titan-mecha-01',
        description: 'Chiến giáp Titan tương lai với hơn 40 khớp chuyển động tự do. Trang bị súng plasma liên thanh, kiếm năng lượng photon và khiên chắn từ trường.',
        price: 1590000,
        salePrice: 1390000,
        pieceCount: 980,
        ageRange: '10+',
        category: 'Robot & Mecha',
        images: [
          'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'
        ],
        stock: 32,
        sku: 'MECHA-TITAN-980',
        qrCode: 'TOYBRICK-MECHA-01',
        ratingAvg: 4.9,
        ratingCount: 35,
        model3d: {
          parts: [
            { name: 'Thân giáp năng lượng', shape: 'box', size: [1.4, 1.6, 1.0], position: [0, 0.5, 0], explodeOffset: [0, 0.4, 0], color: '#e11d48' },
            { name: 'Đầu cảm biến chiến thuật', shape: 'box', size: [0.7, 0.6, 0.7], position: [0, 1.6, 0], explodeOffset: [0, 1.0, 0], color: '#fbbf24' },
            { name: 'Cánh tay Phải kèm Khiên', shape: 'box', size: [0.6, 1.8, 0.6], position: [1.2, 0.4, 0], explodeOffset: [1.0, 0, 0], color: '#1e293b' },
            { name: 'Cánh tay Trái kèm Pháo', shape: 'box', size: [0.6, 1.8, 0.6], position: [-1.2, 0.4, 0], explodeOffset: [-1.0, 0, 0], color: '#1e293b' },
            { name: 'Chân cơ giáp Trái', shape: 'box', size: [0.7, 2.0, 0.8], position: [-0.6, -1.3, 0], explodeOffset: [-0.6, -0.8, 0], color: '#334155' },
            { name: 'Chân cơ giáp Phải', shape: 'box', size: [0.7, 2.0, 0.8], position: [0.6, -1.3, 0], explodeOffset: [0.6, -0.8, 0], color: '#334155' },
            { name: 'Balo phản lực Booster', shape: 'cylinder', size: [0.5, 0.5, 1.4], position: [0, 0.6, -0.8], explodeOffset: [0, 0.5, -1.0], color: '#0284c7' }
          ]
        }
      },
      {
        name: 'Siêu Xe Thể Thao Horizon GT Speedster',
        slug: 'sieu-xe-the-thao-horizon-gt-speedster',
        description: 'Đường cong khí động học siêu mượt mà, cửa mở kiểu cánh bướm gull-wing, mui trần thời thượng và nội thất bọc da màu cam thể thao.',
        price: 1350000,
        salePrice: null,
        pieceCount: 840,
        ageRange: '9+',
        category: 'Phương tiện siêu xe',
        images: [
          'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80'
        ],
        stock: 18,
        sku: 'CAR-HORIZON-840',
        qrCode: 'TOYBRICK-HORIZON-GT',
        ratingAvg: 4.7,
        ratingCount: 16,
        model3d: {
          parts: [
            { name: 'Khung gầm thể thao', shape: 'box', size: [1.6, 0.3, 3.6], position: [0, 0.2, 0], explodeOffset: [0, -0.5, 0], color: '#0f172a' },
            { name: 'Thân xe sơn bóng bẩy', shape: 'box', size: [1.7, 0.5, 3.2], position: [0, 0.6, -0.1], explodeOffset: [0, 0.6, 0], color: '#06b6d4' },
            { name: 'Mui kính khí động học', shape: 'box', size: [1.3, 0.45, 1.6], position: [0, 1.05, -0.2], explodeOffset: [0, 1.1, 0], color: '#38bdf8' },
            { name: 'Bánh trước (Trái)', shape: 'cylinder', size: [0.55, 0.55, 0.35], position: [-1.0, 0.3, 1.2], explodeOffset: [-0.9, 0, 0], color: '#1e293b' },
            { name: 'Bánh trước (Phải)', shape: 'cylinder', size: [0.55, 0.55, 0.35], position: [1.0, 0.3, 1.2], explodeOffset: [0.9, 0, 0], color: '#1e293b' },
            { name: 'Bánh sau (Trái)', shape: 'cylinder', size: [0.58, 0.58, 0.4], position: [-1.0, 0.3, -1.2], explodeOffset: [-0.9, 0, 0], color: '#1e293b' },
            { name: 'Bánh sau (Phải)', shape: 'cylinder', size: [0.58, 0.58, 0.4], position: [1.0, 0.3, -1.2], explodeOffset: [0.9, 0, 0], color: '#1e293b' }
          ]
        }
      },
      {
        name: 'Trạm Cứu Hộ Hải Đăng Đảo Xanh',
        slug: 'tram-cuu-ho-hai-dang-dao-xanh',
        description: 'Tổ hợp ngọn hải đăng xoay đèn 360 độ và bến đỗ ca-nô cứu hộ tốc độ cao. Đi kèm 4 minifigures nhân viên hải đăng và thợ lặn chuyên nghiệp.',
        price: 990000,
        salePrice: 850000,
        pieceCount: 650,
        ageRange: '8+',
        category: 'Kiến trúc & Di sản',
        images: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
        ],
        stock: 3, // Sắp hết hàng
        sku: 'ARCH-LIGHTHOUSE-650',
        qrCode: 'TOYBRICK-LIGHTHOUSE',
        ratingAvg: 4.6,
        ratingCount: 12,
        model3d: {
          parts: [
            { name: 'Đảo đá san hô', shape: 'box', size: [2.5, 0.5, 2.5], position: [0, -1.2, 0], explodeOffset: [0, -0.6, 0], color: '#475569' },
            { name: 'Tháp đèn sọc đỏ trắng', shape: 'cylinder', size: [1.1, 0.8, 2.6], position: [0, 0.3, 0], explodeOffset: [0, 0.5, 0], color: '#ef4444' },
            { name: 'Phòng đèn lăng kính', shape: 'box', size: [1.0, 0.8, 1.0], position: [0, 1.8, 0], explodeOffset: [0, 1.2, 0], color: '#fef08a' },
            { name: 'Mái chóp hải đăng', shape: 'cylinder', size: [0.8, 0.1, 0.6], position: [0, 2.4, 0], explodeOffset: [0, 1.6, 0], color: '#1e293b' }
          ]
        }
      },
      {
        name: 'Bộ Lắp Ráp Bonsai Cây Phong Đỏ',
        slug: 'bo-lap-rap-bonsai-cay-phong-do',
        description: 'Thư giãn tâm hồn cùng bộ Bonsai nghệ thuật Nhật Bản. Tùy biến giữa tán lá xanh mùa xuân và lá đỏ mùa thu rực rỡ.',
        price: 790000,
        salePrice: null,
        pieceCount: 520,
        ageRange: '12+',
        category: 'Bộ lắp ráp Mini',
        images: [
          'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=800&q=80'
        ],
        stock: 0, // Hết hàng
        sku: 'MINI-BONSAI-520',
        qrCode: 'TOYBRICK-BONSAI-RED',
        ratingAvg: 4.9,
        ratingCount: 31,
        model3d: {
          parts: [
            { name: 'Chậu gốm hình chữ nhật', shape: 'box', size: [2.0, 0.6, 1.4], position: [0, -1.0, 0], explodeOffset: [0, -0.5, 0], color: '#1e1b4b' },
            { name: 'Thân cây uốn lượn Bonsai', shape: 'cylinder', size: [0.35, 0.35, 1.6], position: [0, -0.1, 0], explodeOffset: [0, 0.3, 0], color: '#78350f' },
            { name: 'Tán lá Phong Đỏ rực', shape: 'box', size: [2.2, 1.0, 1.8], position: [0, 0.9, 0], explodeOffset: [0, 0.9, 0], color: '#dc2626' }
          ]
        }
      }
    ];

    await Product.insertMany(productsData);

    // --- 4. TẠO GẠCH LẺ (>= 40 gạch lẻ Pick-a-Brick) ---
    console.log('[Seed] Đang nạp danh mục gạch lẻ Pick-a-Brick...');
    const bricksData = [
      // 1. Gạch cơ bản (Standard Bricks)
      { code: '#3001', name: 'Brick 2x4 Đỏ Tiêu Chuẩn', color: 'Đỏ Cổ Điển', colorHex: '#dc2626', category: 'Gạch cơ bản (Standard)', price: 3000, stock: 250 },
      { code: '#3002', name: 'Brick 2x3 Xanh Dương Đại Dương', color: 'Xanh Dương', colorHex: '#2563eb', category: 'Gạch cơ bản (Standard)', price: 2500, stock: 180 },
      { code: '#3003', name: 'Brick 2x2 Vàng Ánh Kim', color: 'Vàng Hoàng Kim', colorHex: '#f59e0b', category: 'Gạch cơ bản (Standard)', price: 2000, stock: 320 },
      { code: '#3004', name: 'Brick 1x2 Đen Tuyền Titan', color: 'Đen Tuyền', colorHex: '#0f172a', category: 'Gạch cơ bản (Standard)', price: 1500, stock: 450 },
      { code: '#3005', name: 'Brick 1x1 Trắng Ngọc Trai', color: 'Trắng Sứ', colorHex: '#f8fafc', category: 'Gạch cơ bản (Standard)', price: 1000, stock: 600 },
      { code: '#3006', name: 'Brick 2x10 Cam Sunset', color: 'Cam Hoàng Hôn', colorHex: '#ea580c', category: 'Gạch cơ bản (Standard)', price: 6000, stock: 95 },
      { code: '#3007', name: 'Brick 2x8 Xanh Ngọc Emerald', color: 'Xanh Ngọc', colorHex: '#059669', category: 'Gạch cơ bản (Standard)', price: 5000, stock: 110 },
      { code: '#3008', name: 'Brick 1x8 Xám Tro Bê Tông', color: 'Xám Xi Măng', colorHex: '#64748b', category: 'Gạch cơ bản (Standard)', price: 4000, stock: 0 }, // Hết hàng
      { code: '#3009', name: 'Brick 1x6 Tím Huyền Bí', color: 'Tím Thạch Anh', colorHex: '#7c3aed', category: 'Gạch cơ bản (Standard)', price: 3500, stock: 85 },
      { code: '#3010', name: 'Brick 1x4 Xanh Da Trời', color: 'Xanh Da Trời', colorHex: '#38bdf8', category: 'Gạch cơ bản (Standard)', price: 2500, stock: 210 },

      // 2. Tấm phẳng (Plates & Tiles)
      { code: '#3020', name: 'Plate 2x4 Xanh Lá Rừng', color: 'Xanh Rêu', colorHex: '#16a34a', category: 'Tấm phẳng (Plates & Tiles)', price: 2000, stock: 340 },
      { code: '#3021', name: 'Plate 2x3 Đỏ San Hô', color: 'Đỏ San Hô', colorHex: '#e11d48', category: 'Tấm phẳng (Plates & Tiles)', price: 1800, stock: 290 },
      { code: '#3022', name: 'Plate 2x2 Đen Phẳng Mịn', color: 'Đen Tuyền', colorHex: '#18181b', category: 'Tấm phẳng (Plates & Tiles)', price: 1500, stock: 500 },
      { code: '#3023', name: 'Plate 1x2 Trắng Tuyết', color: 'Trắng Sứ', colorHex: '#ffffff', category: 'Tấm phẳng (Plates & Tiles)', price: 1000, stock: 400 },
      { code: '#3024', name: 'Plate 1x1 Vàng Mật Ong', color: 'Vàng Hoàng Kim', colorHex: '#d97706', category: 'Tấm phẳng (Plates & Tiles)', price: 800, stock: 350 },
      { code: '#3031', name: 'Plate 4x4 Nâu Gỗ Tự Nhiên', color: 'Nâu Cổ Điển', colorHex: '#78350f', category: 'Tấm phẳng (Plates & Tiles)', price: 4500, stock: 120 },
      { code: '#3032', name: 'Plate 4x6 Xám Đậm Titan', color: 'Xám Titan', colorHex: '#334155', category: 'Tấm phẳng (Plates & Tiles)', price: 5500, stock: 75 },
      { code: '#3034', name: 'Plate 2x8 Vàng Tươi', color: 'Vàng Hoàng Kim', colorHex: '#facc15', category: 'Tấm phẳng (Plates & Tiles)', price: 3500, stock: 140 },
      { code: '#3035', name: 'Tile 1x1 Mịn Tròn Bạc Metal', color: 'Bạc Kim Loại', colorHex: '#94a3b8', category: 'Tấm phẳng (Plates & Tiles)', price: 1200, stock: 18 }, // Sắp hết
      { code: '#3036', name: 'Tile 2x2 Mịn Không Chấu Đỏ', color: 'Đỏ Cổ Điển', colorHex: '#b91c1c', category: 'Tấm phẳng (Plates & Tiles)', price: 2200, stock: 160 },

      // 3. Kỹ thuật & Bánh răng (Technic)
      { code: '#3648', name: 'Bánh răng 16 răng cơ khí Technic', color: 'Xám Nhạt', colorHex: '#cbd5e1', category: 'Kỹ thuật & Bánh răng (Technic)', price: 4500, stock: 150 },
      { code: '#3649', name: 'Bánh răng lớn 40 răng truyền lực', color: 'Xám Titan', colorHex: '#475569', category: 'Kỹ thuật & Bánh răng (Technic)', price: 8000, stock: 45 },
      { code: '#6589', name: 'Bánh răng côn vát 12 răng', color: 'Đen Tuyền', colorHex: '#09090b', category: 'Kỹ thuật & Bánh răng (Technic)', price: 3500, stock: 80 },
      { code: '#32270', name: 'Bánh răng vi sai xe hơi 28 răng', color: 'Xám Nhạt', colorHex: '#94a3b8', category: 'Kỹ thuật & Bánh răng (Technic)', price: 12000, stock: 22 },
      { code: '#32523', name: 'Thanh dầm Technic Lỗ 1x3', color: 'Vàng Hoàng Kim', colorHex: '#f59e0b', category: 'Kỹ thuật & Bánh răng (Technic)', price: 2500, stock: 200 },
      { code: '#32524', name: 'Thanh dầm Technic Lỗ 1x7', color: 'Xanh Dương', colorHex: '#1d4ed8', category: 'Kỹ thuật & Bánh răng (Technic)', price: 4000, stock: 110 },
      { code: '#32525', name: 'Thanh dầm Technic Lỗ 1x11', color: 'Đỏ Cổ Điển', colorHex: '#b91c1c', category: 'Kỹ thuật & Bánh răng (Technic)', price: 6000, stock: 0 }, // Hết hàng
      { code: '#32526', name: 'Thanh dầm Technic Chữ L 3x5', color: 'Đen Tuyền', colorHex: '#18181b', category: 'Kỹ thuật & Bánh răng (Technic)', price: 5000, stock: 90 },

      // 4. Khớp nối & Trục (Pins & Axles)
      { code: '#2780', name: 'Chốt Pin Technic Có Ma Sát Đen', color: 'Đen Tuyền', colorHex: '#000000', category: 'Khớp nối & Trục (Pins & Axles)', price: 800, stock: 800 },
      { code: '#3673', name: 'Chốt Pin Technic Trơn Xám', color: 'Xám Nhạt', colorHex: '#e2e8f0', category: 'Khớp nối & Trục (Pins & Axles)', price: 800, stock: 750 },
      { code: '#3705', name: 'Trục láp chữ thập Axle 4L Đen', color: 'Đen Tuyền', colorHex: '#1c1917', category: 'Khớp nối & Trục (Pins & Axles)', price: 1500, stock: 220 },
      { code: '#3706', name: 'Trục láp chữ thập Axle 6L Đen', color: 'Đen Tuyền', colorHex: '#1c1917', category: 'Khớp nối & Trục (Pins & Axles)', price: 2000, stock: 170 },
      { code: '#3707', name: 'Trục láp chữ thập Axle 8L Đen', color: 'Đen Tuyền', colorHex: '#1c1917', category: 'Khớp nối & Trục (Pins & Axles)', price: 2500, stock: 95 },
      { code: '#6558', name: 'Chốt Pin nối dài 3L Xanh Dương', color: 'Xanh Dương', colorHex: '#2563eb', category: 'Khớp nối & Trục (Pins & Axles)', price: 1200, stock: 320 },
      { code: '#42003', name: 'Khớp nối cầu bi Ball-Joint', color: 'Xám Titan', colorHex: '#475569', category: 'Khớp nối & Trục (Pins & Axles)', price: 3000, stock: 15 }, // Sắp hết

      // 5. Trong suốt & Pha lê (Trans-Clear)
      { code: '#3065', name: 'Brick 1x2 Pha Lê Trong Suốt', color: 'Pha Lê Trong Suốt', colorHex: '#f1f5f9', category: 'Trong suốt & Pha lê (Trans-Clear)', price: 3500, stock: 140 },
      { code: '#3066', name: 'Brick 1x4 Pha Lê Xanh Biển', color: 'Xanh Biển Pha Lê', colorHex: '#38bdf8', category: 'Trong suốt & Pha lê (Trans-Clear)', price: 5000, stock: 80 },
      { code: '#30071', name: 'Kính vòm phi thuyền vũ trụ', color: 'Xanh Pha Lê', colorHex: '#0284c7', category: 'Trong suốt & Pha lê (Trans-Clear)', price: 15000, stock: 12 }, // Sắp hết
      { code: '#4073', name: 'Viên ngọc tròn chấu 1x1 Đỏ Ruby', color: 'Đỏ Ruby', colorHex: '#ef4444', category: 'Trong suốt & Pha lê (Trans-Clear)', price: 1200, stock: 450 },
      { code: '#4074', name: 'Viên ngọc tròn chấu 1x1 Vàng Thạch Anh', color: 'Vàng Thạch Anh', colorHex: '#facc15', category: 'Trong suốt & Pha lê (Trans-Clear)', price: 1200, stock: 400 },
      { code: '#4075', name: 'Viên ngọc tròn chấu 1x1 Xanh Neon', color: 'Xanh Neon', colorHex: '#22c55e', category: 'Trong suốt & Pha lê (Trans-Clear)', price: 1200, stock: 0 }, // Hết hàng

      // 6. Đặc biệt & Chi tiết nhỏ
      { code: '#3069', name: 'Vô lăng điều khiển xe hơi', color: 'Đen Tuyền', colorHex: '#0f172a', category: 'Đặc biệt & Chi tiết nhỏ', price: 4000, stock: 65 },
      { code: '#3829', name: 'Cần gạt số điều khiển cơ khí', color: 'Xám Bạc', colorHex: '#94a3b8', category: 'Đặc biệt & Chi tiết nhỏ', price: 3500, stock: 90 },
      { code: '#4592', name: 'Đèn pha LED ô tô trong suốt', color: 'Pha Lê Trong Suốt', colorHex: '#ffffff', category: 'Đặc biệt & Chi tiết nhỏ', price: 3000, stock: 160 },
      { code: '#4733', name: 'Gạch biến đổi 4 hướng 1x1', color: 'Xanh Dương', colorHex: '#2563eb', category: 'Đặc biệt & Chi tiết nhỏ', price: 2500, stock: 190 },
      { code: '#87087', name: 'Gạch 1x1 có chấu ngang SNOT', color: 'Vàng Hoàng Kim', colorHex: '#f59e0b', category: 'Đặc biệt & Chi tiết nhỏ', price: 2000, stock: 240 }
    ];

    await Brick.insertMany(bricksData);

    // --- 5. TẠO 1 ĐƠN HÀNG MẪU CHO DEMO CUSTOMER ---
    console.log('[Seed] Đang tạo đơn hàng mẫu...');
    const sampleProduct = await Product.findOne({ sku: 'TECH-F1-1639' });
    const sampleBrick1 = await Brick.findOne({ code: '#3001' });
    const sampleBrick2 = await Brick.findOne({ code: '#3648' });

    if (sampleProduct && sampleBrick1 && sampleBrick2) {
      const orderSubtotal = sampleProduct.salePrice + (sampleBrick1.price * 10) + (sampleBrick2.price * 2);
      const shippingFee = orderSubtotal >= 500000 ? 0 : 30000;

      await Order.create({
        code: 'ORD-DEMO01',
        user: demoCustomer._id,
        items: [
          {
            kind: 'product',
            ref: sampleProduct._id,
            name: sampleProduct.name,
            code: sampleProduct.sku,
            price: sampleProduct.salePrice,
            qty: 1,
            image: sampleProduct.images[0]
          },
          {
            kind: 'brick',
            ref: sampleBrick1._id,
            name: sampleBrick1.name,
            code: sampleBrick1.code,
            price: sampleBrick1.price,
            qty: 10,
            color: sampleBrick1.color,
            colorHex: sampleBrick1.colorHex
          },
          {
            kind: 'brick',
            ref: sampleBrick2._id,
            name: sampleBrick2.name,
            code: sampleBrick2.code,
            price: sampleBrick2.price,
            qty: 2,
            color: sampleBrick2.color,
            colorHex: sampleBrick2.colorHex
          }
        ],
        shipping: {
          fullName: 'Nguyễn Văn An',
          phone: '0988776655',
          address: 'Số 123 Đường Sáng Tạo, P. Dịch Vọng Hậu, Q. Cầu Giấy, Hà Nội',
          note: 'Giao giờ hành chính, gọi trước 15 phút'
        },
        paymentMethod: 'cod',
        subtotal: orderSubtotal,
        shippingFee,
        total: orderSubtotal + shippingFee,
        status: 'Chờ xác nhận',
        statusHistory: [
          {
            status: 'Chờ xác nhận',
            at: new Date(),
            note: 'Đơn hàng tạo mẫu từ dữ liệu Seed'
          }
        ]
      });
    }

    console.log('====================================================');
    console.log(' SEED DỮ LIỆU THÀNH CÔNG VÀO DATABASE!');
    console.log('----------------------------------------------------');
    console.log(`- Tài khoản Admin:`);
    console.log(`  + Tên đăng nhập: ${adminUser.username}`);
    console.log(`  + Email:         ${adminUser.email}`);
    console.log(`  (Mật khẩu admin được đọc từ ADMIN_PASSWORD trong file .env)`);
    console.log(`- Tài khoản Khách demo:`);
    console.log(`  + Tên đăng nhập: ${demoCustomer.username}`);
    console.log(`  + Email:         ${demoCustomer.email}`);
    console.log(`  + Mật khẩu:      KhachHang@123`);
    console.log(`- Đã nạp ${productsData.length} sản phẩm (có viewer 3D) và ${bricksData.length} loại gạch Pick-a-Brick.`);
    console.log('====================================================');

    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Thất bại khi nạp dữ liệu:', err.message);
    process.exit(1);
  }
};

seedDatabase();
