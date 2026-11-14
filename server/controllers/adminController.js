const Product = require('../models/Product');
const Brick = require('../models/Brick');
const Order = require('../models/Order');
const User = require('../models/User');
const { ORDER_STATUS } = require('../config/constants');

// --- THỐNG KÊ DASHBOARD ---
const getStats = async (req, res) => {
  // 1. Doanh thu tổng từ các đơn không hủy
  const revenueAgg = await Order.aggregate([
    { $match: { status: { $ne: ORDER_STATUS.CANCELLED } } },
    { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 } } }
  ]);
  const totalRevenue = revenueAgg[0] ? revenueAgg[0].totalRevenue : 0;
  const totalOrders = revenueAgg[0] ? revenueAgg[0].totalOrders : 0;

  // 2. Thống kê theo trạng thái đơn
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 }, sumTotal: { $sum: '$total' } } }
  ]);

  // 3. Tổng số sản phẩm, gạch, người dùng
  const [totalProducts, totalBricks, totalCustomers] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Brick.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'customer' })
  ]);

  // 4. Gạch sắp hết (tồn kho < 30)
  const lowStockBricks = await Brick.find({ stock: { $lte: 30 }, isActive: true })
    .sort({ stock: 1 })
    .limit(10)
    .lean();

  // 5. Sản phẩm sắp hết hàng (stock < 5)
  const lowStockProducts = await Product.find({ stock: { $lte: 5 }, isActive: true })
    .sort({ stock: 1 })
    .limit(5)
    .lean();

  // 6. Doanh thu theo 7 ngày gần nhất (để vẽ biểu đồ canvas/SVG)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const dailyRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo },
        status: { $ne: ORDER_STATUS.CANCELLED }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        ordersCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 7. Top sản phẩm bán chạy (tính từ snapshot order)
  const topProducts = await Order.aggregate([
    { $match: { status: { $ne: ORDER_STATUS.CANCELLED } } },
    { $unwind: '$items' },
    { $match: { 'items.kind': 'product' } },
    {
      $group: {
        _id: '$items.name',
        totalSold: { $sum: '$items.qty' },
        totalAmount: { $sum: { $multiply: ['$items.price', '$items.qty'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 }
  ]);

  res.json({
    success: true,
    data: {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalBricks,
      totalCustomers,
      ordersByStatus,
      lowStockBricks,
      lowStockProducts,
      dailyRevenue,
      topProducts
    }
  });
};

// --- QUẢN LÝ SẢN PHẨM ---
const getAdminProducts = async (req, res) => {
  const queryParams = { ...req.query };
  const { page = 1, limit = 50, q, category, status, stockStatus } = queryParams;

  const filter = {};
  if (q && q.trim()) {
    const reg = new RegExp(q.trim(), 'i');
    filter.$or = [{ name: reg }, { sku: reg }, { qrCode: reg }, { category: reg }];
  }

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (status && status !== 'all') {
    filter.isActive = (status === 'active' || status === 'true');
  }

  if (stockStatus === 'inStock') {
    filter.stock = { $gt: 0 };
  } else if (stockStatus === 'outOfStock') {
    filter.stock = 0;
  } else if (stockStatus === 'lowStock') {
    filter.stock = { $gt: 0, $lte: 5 };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 50);

  const [products, total, categories] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
    Product.countDocuments(filter),
    Product.distinct('category')
  ]);

  res.json({
    success: true,
    data: {
      products,
      total,
      totalPages: Math.ceil(total / limitNum),
      page: pageNum,
      categories
    }
  });
};

const createProduct = async (req, res) => {
  const { name, slug, description, price, salePrice, pieceCount, ageRange, category, images, stock, sku, qrCode, model3d, isActive } = req.body;

  let generatedSlug = (slug || name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  let uniqueSlug = generatedSlug;
  let counter = 1;
  while (await Product.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${generatedSlug}-${counter++}`;
  }

  const product = await Product.create({
    name,
    slug: uniqueSlug,
    description: description || '',
    price: Number(price),
    salePrice: salePrice ? Number(salePrice) : null,
    pieceCount: Number(pieceCount) || 0,
    ageRange: ageRange || '8+',
    category,
    images: Array.isArray(images) ? images : [],
    stock: Number(stock) || 0,
    sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
    qrCode: qrCode || sku || `QR-${Date.now().toString().slice(-6)}`,
    model3d: model3d || { parts: [] },
    isActive: isActive !== undefined ? isActive : true
  });

  res.status(201).json({
    success: true,
    message: 'Tạo sản phẩm thành công',
    data: product
  });
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  if (updateData.price !== undefined) updateData.price = Number(updateData.price);
  if (updateData.salePrice !== undefined) updateData.salePrice = updateData.salePrice ? Number(updateData.salePrice) : null;
  if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

  const product = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!product) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
  }

  res.json({
    success: true,
    message: 'Cập nhật sản phẩm thành công',
    data: product
  });
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
  }

  res.json({
    success: true,
    message: 'Đã xóa sản phẩm thành công'
  });
};

// --- QUẢN LÝ GẠCH LẺ (PICK-A-BRICK) ---
const getAdminBricks = async (req, res) => {
  const queryParams = { ...req.query };
  const { page = 1, limit = 100, q, category, color, stockStatus } = queryParams;

  const filter = {};
  if (q && q.trim()) {
    const reg = new RegExp(q.trim(), 'i');
    filter.$or = [{ code: reg }, { name: reg }, { color: reg }];
  }
  if (category && category !== 'all') {
    filter.category = category;
  }
  if (color && color !== 'all') {
    filter.color = color;
  }
  if (stockStatus === 'inStock') {
    filter.stock = { $gt: 0 };
  } else if (stockStatus === 'outOfStock') {
    filter.stock = 0;
  } else if (stockStatus === 'lowStock') {
    filter.stock = { $gt: 0, $lte: 30 };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 100);

  const [bricks, total, categories, colors] = await Promise.all([
    Brick.find(filter).sort({ code: 1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
    Brick.countDocuments(filter),
    Brick.distinct('category'),
    Brick.distinct('color')
  ]);

  res.json({
    success: true,
    data: {
      bricks,
      total,
      totalPages: Math.ceil(total / limitNum),
      page: pageNum,
      categories,
      colors
    }
  });
};

const createBrick = async (req, res) => {
  const { code, name, color, colorHex, category, price, stock, isActive } = req.body;

  const brick = await Brick.create({
    code: code.toUpperCase().trim(),
    name: name.trim(),
    color: color.trim(),
    colorHex: colorHex.trim(),
    category: category.trim(),
    price: Number(price),
    stock: Number(stock) || 0,
    isActive: isActive !== undefined ? isActive : true
  });

  res.status(201).json({
    success: true,
    message: 'Thêm gạch lẻ thành công',
    data: brick
  });
};

const updateBrick = async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  if (updateData.price !== undefined) updateData.price = Number(updateData.price);
  if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

  const brick = await Brick.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!brick) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy gạch lẻ' });
  }

  res.json({
    success: true,
    message: 'Cập nhật gạch lẻ thành công',
    data: brick
  });
};

const deleteBrick = async (req, res) => {
  const { id } = req.params;
  const brick = await Brick.findByIdAndDelete(id);
  if (!brick) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy gạch lẻ' });
  }

  res.json({
    success: true,
    message: 'Đã xóa gạch lẻ thành công'
  });
};

const importBricksCSV = async (req, res) => {
  const { bricks = [] } = req.body;

  if (!Array.isArray(bricks) || bricks.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu gạch nhập không hợp lệ hoặc rỗng'
    });
  }

  let importedCount = 0;
  let updatedCount = 0;

  for (const b of bricks) {
    if (!b.code || !b.name || !b.color || !b.price) continue;
    const cleanCode = b.code.toString().toUpperCase().trim();

    const existing = await Brick.findOne({ code: cleanCode });
    if (existing) {
      existing.name = b.name.trim();
      existing.color = b.color.trim();
      existing.colorHex = b.colorHex || existing.colorHex;
      existing.category = b.category || existing.category;
      existing.price = Number(b.price) || existing.price;
      existing.stock = Number(b.stock) !== undefined ? Number(b.stock) : existing.stock;
      await existing.save();
      updatedCount++;
    } else {
      await Brick.create({
        code: cleanCode,
        name: b.name.trim(),
        color: b.color.trim(),
        colorHex: b.colorHex || '#f59e0b',
        category: b.category || 'Gạch cơ bản (Standard)',
        price: Number(b.price) || 2000,
        stock: Number(b.stock) || 0,
        isActive: true
      });
      importedCount++;
    }
  }

  res.json({
    success: true,
    message: `Nhập thành công: Thêm mới ${importedCount} mã gạch, cập nhật ${updatedCount} mã gạch.`
  });
};

// --- QUẢN LÝ ĐƠN HÀNG ---
const getAdminOrders = async (req, res) => {
  const queryParams = { ...req.query };
  const { page = 1, limit = 20, status, q } = queryParams;

  const filter = {};
  if (status && status !== 'all') {
    filter.status = status;
  }
  if (q && q.trim()) {
    const reg = new RegExp(q.trim(), 'i');
    filter.$or = [
      { code: reg },
      { 'shipping.fullName': reg },
      { 'shipping.phone': reg }
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email username phone')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Order.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      orders,
      total,
      totalPages: Math.ceil(total / limitNum),
      page: pageNum
    }
  });
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
  }

  const oldStatus = order.status;

  // Nếu chuyển sang hủy và đơn chưa từng bị hủy -> hoàn tồn kho
  if (status === ORDER_STATUS.CANCELLED && oldStatus !== ORDER_STATUS.CANCELLED) {
    for (const item of order.items) {
      try {
        if (item.kind === 'product') {
          await Product.findByIdAndUpdate(item.ref, { $inc: { stock: item.qty } });
        } else {
          await Brick.findByIdAndUpdate(item.ref, { $inc: { stock: item.qty } });
        }
      } catch (err) {
        console.error('[Admin Cancel Restock Error]', err.message);
      }
    }
  }

  order.status = status;
  order.statusHistory.push({
    status,
    at: new Date(),
    note: note || `Admin cập nhật trạng thái từ "${oldStatus}" sang "${status}"`
  });

  await order.save();

  res.json({
    success: true,
    message: `Đã cập nhật trạng thái đơn hàng thành "${status}"`,
    data: order
  });
};

// --- QUẢN LÝ NGƯỜI DÙNG ---
const getAdminUsers = async (req, res) => {
  const queryParams = { ...req.query };
  const { page = 1, limit = 50, q, role } = queryParams;

  const filter = {};
  if (q && q.trim()) {
    const reg = new RegExp(q.trim(), 'i');
    filter.$or = [{ name: reg }, { username: reg }, { email: reg }, { phone: reg }];
  }
  if (role && role !== 'all') {
    filter.role = role;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 50);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    User.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      users,
      total,
      totalPages: Math.ceil(total / limitNum),
      page: pageNum
    }
  });
};

module.exports = {
  getStats,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminBricks,
  createBrick,
  updateBrick,
  deleteBrick,
  importBricksCSV,
  getAdminOrders,
  updateOrderStatus,
  getAdminUsers
};
