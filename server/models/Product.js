const mongoose = require('mongoose');

const model3dPartSchema = new mongoose.Schema({
  name: { type: String, default: 'Part' },
  shape: {
    type: String,
    enum: ['box', 'cylinder'],
    default: 'box'
  },
  size: {
    type: [Number],
    default: [1, 1, 1],
    validate: [val => val.length === 3, 'Size phải có 3 phần tử [x, y, z]']
  },
  position: {
    type: [Number],
    default: [0, 0, 0],
    validate: [val => val.length === 3, 'Position phải có 3 phần tử [x, y, z]']
  },
  explodeOffset: {
    type: [Number],
    default: [0, 0, 0],
    validate: [val => val.length === 3, 'ExplodeOffset phải có 3 phần tử [x, y, z]']
  },
  color: {
    type: String,
    default: '#f59e0b'
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên sản phẩm là bắt buộc'],
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: [true, 'Slug sản phẩm là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Giá sản phẩm là bắt buộc'],
    min: [0, 'Giá không được âm']
  },
  salePrice: {
    type: Number,
    min: [0, 'Giá khuyến mãi không được âm'],
    default: null
  },
  pieceCount: {
    type: Number,
    default: 0,
    min: 0
  },
  ageRange: {
    type: String,
    default: '8+',
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Danh mục là bắt buộc'],
    trim: true
  },
  images: {
    type: [String],
    default: []
  },
  stock: {
    type: Number,
    required: [true, 'Tồn kho là bắt buộc'],
    min: [0, 'Tồn kho không được âm'],
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  qrCode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  model3d: {
    parts: [model3dPartSchema]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  ratingAvg: {
    type: Number,
    default: 5.0,
    min: 1,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
