const mongoose = require('mongoose');

const brickSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Mã gạch là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Tên gạch là bắt buộc'],
    trim: true,
    maxlength: 150
  },
  color: {
    type: String,
    required: [true, 'Tên màu sắc là bắt buộc'],
    trim: true
  },
  colorHex: {
    type: String,
    required: [true, 'Mã màu Hex là bắt buộc'],
    trim: true,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Mã màu Hex không hợp lệ']
  },
  category: {
    type: String,
    required: [true, 'Danh mục là bắt buộc'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Đơn giá là bắt buộc'],
    min: [0, 'Đơn giá không được âm']
  },
  stock: {
    type: Number,
    required: [true, 'Số lượng tồn kho là bắt buộc'],
    min: [0, 'Tồn kho không được âm'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

brickSchema.index({ name: 'text', code: 'text' });
brickSchema.index({ category: 1, color: 1, isActive: 1 });

module.exports = mongoose.model('Brick', brickSchema);
