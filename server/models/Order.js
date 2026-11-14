const mongoose = require('mongoose');
const { ORDER_STATUS, ORDER_STATUS_LIST, PAYMENT_METHODS } = require('../config/constants');

const orderItemSnapshotSchema = new mongoose.Schema({
  kind: {
    type: String,
    enum: ['product', 'brick'],
    required: true
  },
  ref: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  qty: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: ''
  },
  colorHex: {
    type: String,
    default: ''
  }
}, { _id: true });

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ORDER_STATUS_LIST,
    required: true
  },
  at: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    default: ''
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSnapshotSchema],
  shipping: {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    note: { type: String, default: '', trim: true }
  },
  paymentMethod: {
    type: String,
    enum: PAYMENT_METHODS,
    default: 'cod'
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingFee: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ORDER_STATUS_LIST,
    default: ORDER_STATUS.PENDING
  },
  statusHistory: [statusHistorySchema]
}, {
  timestamps: true
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
