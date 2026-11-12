const Product = require('../models/Product');

const getProducts = async (req, res) => {
  const queryParams = { ...req.query };
  const { q, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = queryParams;

  const filter = { isActive: true };

  // Tìm kiếm từ khóa
  if (q && q.trim()) {
    const searchRegex = new RegExp(q.trim(), 'i');
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { sku: searchRegex }
    ];
  }

  // Lọc theo danh mục
  if (category && category !== 'all' && category !== 'Tất cả') {
    filter.category = category;
  }

  // Lọc theo khoảng giá
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Sắp xếp
  let sortOption = { createdAt: -1 };
  if (sort === 'price-asc') sortOption = { price: 1 };
  else if (sort === 'price-desc') sortOption = { price: -1 };
  else if (sort === 'rating') sortOption = { ratingAvg: -1, ratingCount: -1 };
  else if (sort === 'piece-desc') sortOption = { pieceCount: -1 };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    }
  });
};

const getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  const product = await Product.findOne({ slug, isActive: true });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy sản phẩm yêu cầu'
    });
  }

  res.json({
    success: true,
    data: product
  });
};

const getProductByQr = async (req, res) => {
  const { code } = req.params;
  const cleanCode = (code || '').trim();

  // Tìm theo qrCode hoặc sku
  const product = await Product.findOne({
    $or: [
      { qrCode: cleanCode },
      { sku: cleanCode }
    ],
    isActive: true
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: `Không tìm thấy sản phẩm với mã QR/SKU: ${cleanCode}`
    });
  }

  res.json({
    success: true,
    data: product
  });
};

module.exports = {
  getProducts,
  getProductBySlug,
  getProductByQr
};
