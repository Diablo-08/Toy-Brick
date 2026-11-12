const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Nhà riêng' },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  line: { type: String, required: true, trim: true },
  ward: { type: String, default: '', trim: true },
  district: { type: String, default: '', trim: true },
  city: { type: String, required: true, trim: true },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Họ và tên là bắt buộc'],
    trim: true,
    maxlength: 100
  },
  username: {
    type: String,
    required: [true, 'Tên đăng nhập là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [3, 'Tên đăng nhập tối thiểu 3 ký tự'],
    maxlength: [30, 'Tên đăng nhập tối đa 30 ký tự'],
    match: [/^[a-z0-9_.]+$/, 'Tên đăng nhập chỉ chứa chữ thường, số, dấu gạch dưới và dấu chấm']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không đúng định dạng']
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  addresses: [addressSchema]
}, {
  timestamps: true
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
