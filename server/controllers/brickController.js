const Brick = require('../models/Brick');

const getBricks = async (req, res) => {
  const queryParams = { ...req.query };
  const { q, color, category, inStock, page = 1, limit = 24 } = queryParams;

  const filter = { isActive: true };

  // Tìm theo từ khóa (mã hoặc tên)
  if (q && q.trim()) {
    const searchRegex = new RegExp(q.trim(), 'i');
    filter.$or = [
      { code: searchRegex },
      { name: searchRegex }
    ];
  }

  // Lọc theo màu
  if (color && color !== 'all' && color !== 'Tất cả') {
    filter.color = color;
  }

  // Lọc theo danh mục
  if (category && category !== 'all' && category !== 'Tất cả') {
    filter.category = category;
  }

  // Lọc chỉ lấy còn hàng
  if (inStock === 'true' || inStock === true) {
    filter.stock = { $gt: 0 };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 24));
  const skip = (pageNum - 1) * limitNum;

  const [bricks, total, distinctColors, distinctCategories] = await Promise.all([
    Brick.find(filter)
      .sort({ code: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Brick.countDocuments(filter),
    Brick.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$color', colorHex: { $first: '$colorHex' } } },
      { $sort: { _id: 1 } }
    ]),
    Brick.distinct('category', { isActive: true })
  ]);

  res.json({
    success: true,
    data: {
      bricks,
      filters: {
        colors: distinctColors.map(c => ({ name: c._id, hex: c.colorHex })),
        categories: distinctCategories
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    }
  });
};

const getBrickByCode = async (req, res) => {
  const { code } = req.params;
  const brick = await Brick.findOne({ code: code.toUpperCase().trim(), isActive: true });

  if (!brick) {
    return res.status(404).json({
      success: false,
      message: `Không tìm thấy gạch với mã ${code}`
    });
  }

  res.json({
    success: true,
    data: brick
  });
};

module.exports = {
  getBricks,
  getBrickByCode
};
