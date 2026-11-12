const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Đã có lỗi hệ thống xảy ra';
  let errors = null;

  // Lỗi Mongoose duplicate key (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'Dữ liệu';
    message = `${field} '${err.keyValue[field]}' đã tồn tại trong hệ thống.`;
  }

  // Lỗi Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errors = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
    message = errors[0] ? errors[0].message : 'Dữ liệu không hợp lệ';
  }

  // Lỗi CastError (ID không đúng chuẩn ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Định dạng ID '${err.value}' không hợp lệ`;
  }

  // Lỗi JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token xác thực không hợp lệ';
  }

  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  };

  if (statusCode === 500) {
    console.error('[Error]', err);
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
