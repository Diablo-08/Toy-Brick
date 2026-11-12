const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Brick = require('../models/Brick');
const { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } = require('../config/constants');

// Helper populate và tính toán giỏ hàng
const populateCartDetails = async (cart) => {
  if (!cart || !cart.items || cart.items.length === 0) {
    return {
      items: [],
      subtotal: 0,
      shippingFee: 0,
      total: 0,
      itemCount: 0
    };
  }

  const populatedItems = [];
  let subtotal = 0;
  let hasChanged = false;

  for (const item of cart.items) {
    let detail = null;
    if (item.kind === 'product') {
      detail = await Product.findById(item.ref).lean();
    } else if (item.kind === 'brick') {
      detail = await Brick.findById(item.ref).lean();
    }

    if (!detail || !detail.isActive) {
      // Mặt hàng đã bị xóa hoặc ngừng kinh doanh -> tự lọc bỏ
      hasChanged = true;
      continue;
    }

    const price = item.kind === 'product' && detail.salePrice && detail.salePrice < detail.price
      ? detail.salePrice
      : detail.price;

    const availableStock = detail.stock;
    const isOutOfStock = availableStock <= 0;
    const requestedQty = Math.min(item.qty, Math.max(1, availableStock));

    if (requestedQty !== item.qty && availableStock > 0) {
      item.qty = requestedQty;
      hasChanged = true;
    }

    const itemTotal = price * item.qty;
    subtotal += isOutOfStock ? 0 : itemTotal;

    populatedItems.push({
      _id: item._id,
      kind: item.kind,
      ref: item.ref,
      name: detail.name,
      code: detail.code || detail.sku || '',
      price,
      originalPrice: detail.price,
      stock: availableStock,
      isOutOfStock,
      image: item.kind === 'product' ? (detail.images && detail.images[0]) || '' : '',
      color: detail.color || '',
      colorHex: detail.colorHex || '',
      category: detail.category || '',
      slug: detail.slug || '',
      qty: item.qty,
      total: itemTotal
    });
  }

  if (hasChanged) {
    // Lưu lại giỏ đã lọc các item lỗi
    cart.items = cart.items.filter(i =>
      populatedItems.some(p => p.ref.toString() === i.ref.toString())
    );
    await cart.save();
  }

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const total = subtotal + shippingFee;
  const itemCount = populatedItems.reduce((sum, item) => sum + item.qty, 0);

  return {
    _id: cart._id,
    items: populatedItems,
    subtotal,
    shippingFee,
    total,
    itemCount
  };
};

const getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const data = await populateCartDetails(cart);
  res.json({
    success: true,
    data
  });
};

const addToCart = async (req, res) => {
  const { kind, id, qty = 1 } = req.body;

  if (!kind || !id || !['product', 'brick'].includes(kind)) {
    return res.status(400).json({
      success: false,
      message: 'Thông tin sản phẩm thêm vào giỏ không hợp lệ'
    });
  }

  const quantity = Math.max(1, parseInt(qty, 10) || 1);

  // Kiểm tra sản phẩm / gạch trong DB
  let itemDoc = null;
  const itemModel = kind === 'product' ? 'Product' : 'Brick';

  if (kind === 'product') {
    itemDoc = await Product.findOne({ _id: id, isActive: true });
  } else {
    itemDoc = await Brick.findOne({ _id: id, isActive: true });
  }

  if (!itemDoc) {
    return res.status(404).json({
      success: false,
      message: 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh'
    });
  }

  if (itemDoc.stock <= 0) {
    return res.status(400).json({
      success: false,
      message: `Mặt hàng "${itemDoc.name}" hiện đã hết hàng`
    });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  // Tìm xem item đã có trong giỏ chưa
  const existingIndex = cart.items.findIndex(
    i => i.kind === kind && i.ref.toString() === id.toString()
  );

  if (existingIndex > -1) {
    const newQty = cart.items[existingIndex].qty + quantity;
    if (newQty > itemDoc.stock) {
      return res.status(400).json({
        success: false,
        message: `Số lượng yêu cầu (${newQty}) vượt quá tồn kho hiện có (${itemDoc.stock}) của "${itemDoc.name}"`
      });
    }
    cart.items[existingIndex].qty = newQty;
  } else {
    if (quantity > itemDoc.stock) {
      return res.status(400).json({
        success: false,
        message: `Số lượng yêu cầu (${quantity}) vượt quá tồn kho hiện có (${itemDoc.stock}) của "${itemDoc.name}"`
      });
    }
    cart.items.push({
      kind,
      ref: itemDoc._id,
      itemModel,
      qty: quantity
    });
  }

  await cart.save();
  const data = await populateCartDetails(cart);

  res.json({
    success: true,
    message: `Đã thêm "${itemDoc.name}" vào giỏ hàng`,
    data
  });
};

const updateCartItem = async (req, res) => {
  const { itemId } = req.params;
  const { qty } = req.body;

  const quantity = parseInt(qty, 10);
  if (isNaN(quantity) || quantity < 1) {
    return res.status(400).json({
      success: false,
      message: 'Số lượng phải lớn hơn hoặc bằng 1'
    });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy giỏ hàng'
    });
  }

  const item = cart.items.id(itemId);
  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Mục hàng không tồn tại trong giỏ'
    });
  }

  // Kiểm tra tồn kho
  let itemDoc = null;
  if (item.kind === 'product') {
    itemDoc = await Product.findById(item.ref);
  } else {
    itemDoc = await Brick.findById(item.ref);
  }

  if (!itemDoc || !itemDoc.isActive) {
    cart.items.pull(itemId);
    await cart.save();
    return res.status(400).json({
      success: false,
      message: 'Mặt hàng này không còn tồn tại hoặc đã ngừng bán'
    });
  }

  if (quantity > itemDoc.stock) {
    return res.status(400).json({
      success: false,
      message: `Chỉ còn ${itemDoc.stock} sản phẩm "${itemDoc.name}" trong kho`
    });
  }

  item.qty = quantity;
  await cart.save();
  const data = await populateCartDetails(cart);

  res.json({
    success: true,
    message: 'Cập nhật số lượng thành công',
    data
  });
};

const removeCartItem = async (req, res) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy giỏ hàng'
    });
  }

  cart.items.pull(itemId);
  await cart.save();
  const data = await populateCartDetails(cart);

  res.json({
    success: true,
    message: 'Đã xóa mặt hàng khỏi giỏ',
    data
  });
};

const clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.json({
    success: true,
    message: 'Đã dọn sạch giỏ hàng',
    data: { items: [], subtotal: 0, shippingFee: 0, total: 0, itemCount: 0 }
  });
};

const mergeCart = async (req, res) => {
  const { localItems = [] } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  if (Array.isArray(localItems) && localItems.length > 0) {
    for (const lItem of localItems) {
      if (!lItem.ref || !['product', 'brick'].includes(lItem.kind)) continue;

      let itemDoc = null;
      if (lItem.kind === 'product') {
        itemDoc = await Product.findOne({ _id: lItem.ref, isActive: true });
      } else {
        itemDoc = await Brick.findOne({ _id: lItem.ref, isActive: true });
      }

      if (!itemDoc || itemDoc.stock <= 0) continue;

      const existingIndex = cart.items.findIndex(
        i => i.kind === lItem.kind && i.ref.toString() === lItem.ref.toString()
      );

      const addQty = Math.max(1, parseInt(lItem.qty, 10) || 1);

      if (existingIndex > -1) {
        cart.items[existingIndex].qty = Math.min(
          cart.items[existingIndex].qty + addQty,
          itemDoc.stock
        );
      } else {
        cart.items.push({
          kind: lItem.kind,
          ref: itemDoc._id,
          itemModel: lItem.kind === 'product' ? 'Product' : 'Brick',
          qty: Math.min(addQty, itemDoc.stock)
        });
      }
    }
    await cart.save();
  }

  const data = await populateCartDetails(cart);
  res.json({
    success: true,
    message: 'Đã đồng bộ giỏ hàng',
    data
  });
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeCart
};
