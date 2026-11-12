const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Brick = require('../models/Brick');
const { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE, ORDER_STATUS } = require('../config/constants');

// Sinh mã đơn hàng ngẫu nhiên ORD-xxxxxx
const generateOrderCode = () => {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let random = '';
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ORD-${random}`;
};

const createOrder = async (req, res) => {
  const { shipping, paymentMethod = 'cod', items: directItems } = req.body;

  if (!shipping || !shipping.fullName || !shipping.phone || !shipping.address) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp đầy đủ thông tin giao hàng (họ tên, số điện thoại, địa chỉ)'
    });
  }

  // Lấy các mặt hàng cần đặt: từ directItems (nếu có mua ngay) hoặc từ giỏ hàng trong DB
  let orderItemsToProcess = [];

  if (Array.isArray(directItems) && directItems.length > 0) {
    orderItemsToProcess = directItems;
  } else {
    const userCart = await Cart.findOne({ user: req.user._id });
    if (!userCart || !userCart.items || userCart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng của bạn đang trống'
      });
    }
    orderItemsToProcess = userCart.items;
  }

  // Danh sách ghi lại để rollback nếu có mặt hàng thiếu tồn kho
  const deductedItems = [];
  const snapshotItems = [];
  let calculatedSubtotal = 0;

  try {
    for (const item of orderItemsToProcess) {
      const qty = Math.max(1, parseInt(item.qty, 10) || 1);
      const refId = item.ref || item.id;
      const kind = item.kind;

      if (!['product', 'brick'].includes(kind)) {
        throw new Error('Loại sản phẩm không hợp lệ trong đơn hàng');
      }

      // TRỪ TỒN KHO NGUYÊN TỬ: findOneAndUpdate với điều kiện stock >= qty
      let updatedDoc = null;
      if (kind === 'product') {
        updatedDoc = await Product.findOneAndUpdate(
          { _id: refId, isActive: true, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { new: true }
        );
      } else {
        updatedDoc = await Brick.findOneAndUpdate(
          { _id: refId, isActive: true, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { new: true }
        );
      }

      if (!updatedDoc) {
        // Tìm lại xem mặt hàng có tồn tại hay do hết tồn kho
        const checkDoc = kind === 'product'
          ? await Product.findById(refId)
          : await Brick.findById(refId);

        const itemName = checkDoc ? checkDoc.name : 'Sản phẩm';
        const currentStock = checkDoc ? checkDoc.stock : 0;

        throw new Error(`Mặt hàng "${itemName}" chỉ còn ${currentStock} trong kho (yêu cầu: ${qty}). Đơn hàng không thể thực hiện!`);
      }

      // Ghi nhận đã trừ thành công để sẵn sàng rollback nếu vòng sau lỗi
      deductedItems.push({
        kind,
        refId,
        qty
      });

      // TÍNH GIÁ TỪ SERVER (Không tin giá từ client)
      const price = kind === 'product' && updatedDoc.salePrice && updatedDoc.salePrice < updatedDoc.price
        ? updatedDoc.salePrice
        : updatedDoc.price;

      calculatedSubtotal += price * qty;

      snapshotItems.push({
        kind,
        ref: updatedDoc._id,
        name: updatedDoc.name,
        code: updatedDoc.code || updatedDoc.sku || '',
        price,
        qty,
        image: kind === 'product' ? (updatedDoc.images && updatedDoc.images[0]) || '' : '',
        color: updatedDoc.color || '',
        colorHex: updatedDoc.colorHex || ''
      });
    }

    // Tính phí vận chuyển theo hằng số hệ thống
    const shippingFee = calculatedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    const total = calculatedSubtotal + shippingFee;

    // Tạo mã đơn không trùng lặp
    let code = generateOrderCode();
    let exists = await Order.findOne({ code });
    while (exists) {
      code = generateOrderCode();
      exists = await Order.findOne({ code });
    }

    const order = await Order.create({
      code,
      user: req.user._id,
      items: snapshotItems,
      shipping: {
        fullName: shipping.fullName.trim(),
        phone: shipping.phone.trim(),
        address: shipping.address.trim(),
        note: (shipping.note || '').trim()
      },
      paymentMethod: paymentMethod === 'bank' ? 'bank' : 'cod',
      subtotal: calculatedSubtotal,
      shippingFee,
      total,
      status: ORDER_STATUS.PENDING,
      statusHistory: [{
        status: ORDER_STATUS.PENDING,
        at: new Date(),
        note: 'Đơn hàng được khởi tạo thành công'
      }]
    });

    // Dọn sạch giỏ hàng nếu đặt từ giỏ hàng
    if (!directItems) {
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    }

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      data: order
    });

  } catch (error) {
    // ROLLBACK TỒN KHO nếu có bất kỳ mặt hàng nào thất bại
    for (const item of deductedItems) {
      try {
        if (item.kind === 'product') {
          await Product.findByIdAndUpdate(item.refId, { $inc: { stock: item.qty } });
        } else {
          await Brick.findByIdAndUpdate(item.refId, { $inc: { stock: item.qty } });
        }
      } catch (rbErr) {
        console.error('[Rollback Error] Không thể hoàn tồn kho:', rbErr.message);
      }
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Không thể tạo đơn hàng do lỗi tồn kho hoặc hệ thống'
    });
  }
};

const getOrders = async (req, res) => {
  const queryParams = { ...req.query };
  const { page = 1, limit = 10, status } = queryParams;

  const filter = { user: req.user._id };
  if (status && status !== 'all') {
    filter.status = status;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Order.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    }
  });
};

const getOrderById = async (req, res) => {
  const { id } = req.params;

  let order = null;
  // Tìm theo _id hoặc code
  if (id.startsWith('ORD-')) {
    order = await Order.findOne({ code: id });
  } else {
    order = await Order.findById(id);
  }

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy đơn hàng'
    });
  }

  // Khách chỉ được xem đơn của chính mình, Admin xem được tất cả
  if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền xem thông tin đơn hàng này'
    });
  }

  res.json({
    success: true,
    data: order
  });
};

const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const { reason = 'Khách hàng yêu cầu hủy đơn' } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy đơn hàng'
    });
  }

  // Khách chỉ được hủy đơn của mình, Admin có thể hủy
  if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền thao tác trên đơn hàng này'
    });
  }

  // Chỉ cho phép hủy khi đang ở trạng thái 'Chờ xác nhận'
  if (order.status !== ORDER_STATUS.PENDING) {
    return res.status(400).json({
      success: false,
      message: `Đơn hàng ở trạng thái "${order.status}" không thể tự hủy. Vui lòng liên hệ hỗ trợ!`
    });
  }

  // HOÀN LẠI TỒN KHO CHO MỌI ITEM TRONG ĐƠN
  for (const item of order.items) {
    try {
      if (item.kind === 'product') {
        await Product.findByIdAndUpdate(item.ref, { $inc: { stock: item.qty } });
      } else {
        await Brick.findByIdAndUpdate(item.ref, { $inc: { stock: item.qty } });
      }
    } catch (err) {
      console.error('[Cancel Order Restock Error]', err.message);
    }
  }

  order.status = ORDER_STATUS.CANCELLED;
  order.statusHistory.push({
    status: ORDER_STATUS.CANCELLED,
    at: new Date(),
    note: `Đã hủy: ${reason}`
  });

  await order.save();

  res.json({
    success: true,
    message: 'Hủy đơn hàng thành công và đã hoàn lại tồn kho',
    data: order
  });
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder
};
