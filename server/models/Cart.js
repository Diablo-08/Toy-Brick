const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  kind: {
    type: String,
    enum: ['product', 'brick'],
    required: true
  },
  ref: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'items.itemModel'
  },
  itemModel: {
    type: String,
    required: true,
    enum: ['Product', 'Brick']
  },
  qty: {
    type: Number,
    required: true,
    min: [1, 'Số lượng tối thiểu là 1'],
    default: 1
  }
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
