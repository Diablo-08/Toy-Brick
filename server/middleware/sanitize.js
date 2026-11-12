/**
 * Middleware chống NoSQL Injection:
 * Đệ quy làm sạch object, loại bỏ các key bắt đầu bằng '$' hoặc có chứa '.'
 */
const cleanInput = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanInput(item));
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    // Loại bỏ key bắt đầu bằng $ hoặc chứa .
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    cleaned[key] = cleanInput(value);
  }
  return cleaned;
};

const sanitize = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = cleanInput(req.body);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = cleanInput(req.params);
  }
  // Trong Express 5 req.query là getter chỉ đọc, nên ta tạo sanitizedQuery
  // và nếu cần có thể truy xuất qua req.cleanQuery
  const rawQuery = { ...req.query };
  req.cleanQuery = cleanInput(rawQuery);

  next();
};

module.exports = sanitize;
