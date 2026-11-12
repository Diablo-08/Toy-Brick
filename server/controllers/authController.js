const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      username: user.username,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

const register = async (req, res) => {
  const { name, username, email, password } = req.body;

  const normalizedUsername = username.toLowerCase().trim();
  const normalizedEmail = email.toLowerCase().trim();

  // Kiểm tra trùng username
  const existingUsername = await User.findOne({ username: normalizedUsername });
  if (existingUsername) {
    return res.status(400).json({
      success: false,
      message: 'Tên đăng nhập này đã được sử dụng, vui lòng chọn tên khác'
    });
  }

  // Kiểm tra trùng email
  const existingEmail = await User.findOne({ email: normalizedEmail });
  if (existingEmail) {
    return res.status(400).json({
      success: false,
      message: 'Địa chỉ email này đã được đăng ký tài khoản'
    });
  }

  const user = await User.create({
    name: name.trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    role: 'customer'
  });

  const token = generateToken(user);
  const userSafe = user.toObject();
  delete userSafe.password;

  res.status(201).json({
    success: true,
    message: 'Đăng ký tài khoản thành công',
    data: {
      token,
      user: userSafe
    }
  });
};

const login = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp đầy đủ thông tin đăng nhập'
    });
  }

  const cleanIdentifier = identifier.toLowerCase().trim();

  // Tìm theo email hoặc username, select kèm password
  const user = await User.findOne({
    $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }]
  }).select('+password');

  // Lỗi chung chung không làm lộ sự tồn tại của tài khoản
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Email, tên đăng nhập hoặc mật khẩu không chính xác'
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Email, tên đăng nhập hoặc mật khẩu không chính xác'
    });
  }

  const token = generateToken(user);
  const userSafe = user.toObject();
  delete userSafe.password;

  res.json({
    success: true,
    message: 'Đăng nhập thành công',
    data: {
      token,
      user: userSafe
    }
  });
};

const getMe = async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
};

const updateMe = async (req, res) => {
  const { name, phone, addresses } = req.body;
  const user = req.user;

  if (name !== undefined) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (addresses !== undefined && Array.isArray(addresses)) {
    user.addresses = addresses;
  }

  await user.save();

  res.json({
    success: true,
    message: 'Cập nhật thông tin thành công',
    data: user
  });
};

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
    });
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu hiện tại không chính xác'
    });
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Đổi mật khẩu thành công'
  });
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  updatePassword
};
