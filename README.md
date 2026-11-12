# ToyBrick Studio — Nền Tảng Thương Mại Điện Tử Đồ Chơi Lắp Ráp & Gạch Lẻ 3D

Chào mừng bạn đến với **ToyBrick Studio**, một giải pháp thương mại điện tử chuyên nghiệp và hoàn chỉnh dành riêng cho các tín đồ đồ chơi lắp ráp, mô hình cơ khí Technic và kho gạch lẻ **Pick-a-Brick**. Dự án được xây dựng với kiến trúc hướng sự kiện hiện đại, bảo mật đa tầng, kết hợp mô hình tương tác 3D WebGL trực quan và trải nghiệm kết nối O2O (Online-to-Offline) tại showroom.

---

## 🌟 Điểm Nhấn Công Nghệ & Trải Nghiệm Người Dùng

1. **Hiển Thị & Tương Tác 3D Siêu Thực (WebGL / Three.js r128)**:
   - Dựng mô hình 3D tỉ lệ chuẩn từ cấu trúc chi tiết `model3d.parts` (BoxGeometry, CylinderGeometry với MeshStandardMaterial).
   - Tự viết hệ thống OrbitControls xoay 360 độ tự do bằng chuột/cảm ứng, zoom phóng to thu nhỏ và chế độ tự xoay chậm khi rảnh (idle auto-rotate).
   - Tính năng **"Bung tách chi tiết" (Exploded View Animation)** mượt mà, cho phép quan sát kết cấu khung gầm, khối động cơ V6 và các tầng khí động học.
   - Cơ chế tự giải phóng bộ nhớ (`dispose` geometry, material, renderer, remove event listeners) triệt để khi rời trang, ngăn chặn hiện tượng memory leak.

2. **Hiệu Ứng Nền Thiên Giới (Celestial Ambient Canvas Particles)**:
   - Nền xanh đen/tím thẫm huyền ảo, điểm nhấn gradient vàng đồng/cam ánh kim và cyan tinh vân.
   - Hệ thống hạt sao nhấp nháy theo hàm sin, tương tác đẩy nhẹ khi lướt chuột qua và thỉnh thoảng có sao băng vụt ngang bầu trời.
   - Xử lý mượt mà trên màn hình HiDPI/Retina (`devicePixelRatio`), tự động ngắt `requestAnimationFrame` khi tab ẩn để tiết kiệm pin và tự tắt khi người dùng bật `prefers-reduced-motion`.

3. **Kho Gạch Lẻ Pick-a-Brick (MOC Creator Hub)**:
   - Hàng nghìn mã gạch chuẩn (#3001, #3002, bánh răng Technic, chốt pin, viên ngọc pha lê...).
   - Lọc trực quan theo màu sắc (bảng chấm màu Swatch nhanh), theo danh mục gạch, tìm kiếm tức thì theo mã số.
   - Hiển thị tồn kho thực tế, tự động làm mới số lượng (polling background) mỗi 30 giây.

4. **Trải Nghiệm O2O Quét Mã QR Tại Showroom**:
   - Khách hàng đứng trước quầy kệ tại cửa hàng có thể bật Camera quét mã QR trên vỏ hộp (tích hợp `BarcodeDetector` API) hoặc nhập mã để mở ngay mô hình 3D và thông số chi tiết trên điện thoại.

5. **Giỏ Hàng Thông Minh & Hợp Nhất LocalStorage (Cart Merging)**:
   - Khách vãng lai chưa đăng nhập có thể chọn hàng lưu vào `localStorage`. Khi đăng nhập, toàn bộ giỏ hàng tạm thời sẽ tự động được kiểm tra tồn kho và hợp nhất (merge) liền mạch vào giỏ hàng trên máy chủ.
   - Tự động tính tiến độ miễn phí vận chuyển (miễn phí từ 500.000 đ, dưới 500.000 đ áp dụng mức phí 30.000 đ).

6. **Đặt Hàng Chuẩn Nghiệp Vụ Tồn Kho Nguyên Tử (Atomic Inventory)**:
   - Khi thanh toán, máy chủ thực hiện trừ tồn kho nguyên tử bằng lệnh `findOneAndUpdate({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } })`.
   - Nếu bất kỳ mặt hàng nào không đủ tồn kho, hệ thống tự động hoàn lại (rollback) toàn bộ các mặt hàng đã trừ trước đó và gửi thông báo rõ ràng cho khách, loại bỏ hoàn toàn nguy cơ âm kho khi nhiều người mua cùng lúc.
   - Không tin tưởng giá gửi lên từ trình duyệt; toàn bộ đơn giá và tổng tiền được tính toán trực tiếp từ cơ sở dữ liệu.
   - Khách có quyền tự hủy đơn khi đơn còn ở trạng thái `Chờ xác nhận`; khi hủy, hệ thống tự động hoàn lại số lượng tồn kho cho từng sản phẩm.

7. **Bảng Điều Khiển Quản Trị Toàn Diện (Admin Studio Dashboard)**:
   - Bảo vệ phân quyền 2 lớp (cả Client Router Guard lẫn Server Middleware `requireRole('admin')`).
   - Thống kê doanh thu thực tế, biểu đồ doanh thu 7 ngày vẽ bằng SVG thuần sắc nét, cảnh báo gạch lẻ sắp hết hàng.
   - Quản lý danh mục mô hình Set (Thêm / Sửa / Xóa / Tồn kho).
   - Quản lý kho gạch lẻ với tính năng **Sửa tồn kho & đơn giá inline** nhanh chóng ngay trên bảng dữ liệu, hỗ trợ nhập khẩu hàng loạt qua định dạng CSV.
   - Quản lý cập nhật trạng thái đơn hàng (tự động hoàn tồn kho nếu admin chuyển trạng thái sang `Đã hủy`).
   - Quản lý danh sách thành viên và khách hàng.

---

## 🛠️ Tech Stack Chi Tiết

- **Backend**:
  - Node.js (>= 18), Express 5 (xử lý async handler tự chuyển tiếp lỗi, wildcard route `/*splat`, `req.query` an toàn).
  - Mongoose ODM kết nối MongoDB Atlas (`dbName: cultivation_db`).
  - Bảo mật: `helmet` với CSP cấu hình riêng cho CDN, `bcryptjs` băm mật khẩu chuẩn cost 10, `jsonwebtoken` xác thực phiên, `express-rate-limit` chống spam endpoint đăng nhập/đăng ký (10 lần / 15 phút), chống NoSQL Injection đệ quy.
- **Frontend**:
  - Vanilla JavaScript Single Page Application (Hash-based router, không phụ thuộc framework).
  - Tailwind CSS CDN, FontAwesome 6 CDN.
  - Three.js r128 từ cdnjs.
  - Google Fonts: Playfair Display (tiêu đề trang trọng), Lora (mô tả tinh tế), Be Vietnam Pro (giao diện, nút bấm, bảng biểu).
  - Toàn bộ giao diện hỗ trợ chuẩn Unicode tiếng Việt UTF-8.

---

## 📁 Cấu Trúc Dự Án

```
toybrick-studio/
├─ server/
│  ├─ server.js            # Khởi động, xác thực env, kết nối DB, SPA fallback wildcard /*splat
│  ├─ app.js               # Middleware (Helmet, CORS, Rate Limit, Sanitize), Routes mount
│  ├─ config/
│  │  ├─ db.js             # Kết nối MongoDB Atlas an toàn
│  │  └─ constants.js      # Hằng số phí vận chuyển, trạng thái đơn, danh mục
│  ├─ models/
│  │  ├─ User.js           # Schema người dùng, mật khẩu bcrypt select: false
│  │  ├─ Product.js        # Schema mô hình set, model3d.parts, text index
│  │  ├─ Brick.js          # Schema gạch lẻ (#3001, #3002...), swatch màu, tồn kho
│  │  ├─ Cart.js           # Schema giỏ hàng
│  │  └─ Order.js          # Schema đơn hàng, snapshot giá & tên lúc đặt, timeline trạng thái
│  ├─ middleware/
│  │  ├─ auth.js           # verifyToken, requireRole('admin'), optionalAuth
│  │  ├─ errorHandler.js   # Middleware xử lý lỗi toàn cục, không lộ stack trace ở production
│  │  ├─ validate.js       # Tích hợp express-validator
│  │  └─ sanitize.js       # Chống NoSQL Injection đệ quy
│  ├─ controllers/         # Xử lý nghiệp vụ tách biệt từng tính năng
│  ├─ routes/              # Khai báo RESTful API endpoints
│  └─ seed/
│     └─ seed.js           # Nạp dữ liệu mẫu ban đầu (admin từ .env, khách demo, sản phẩm, gạch lẻ)
├─ public/
│  ├─ index.html           # Khung HTML Single Page Application, nạp CDN & Modals
│  ├─ css/
│  │  └─ custom.css        # Hiệu ứng kính mờ (Glassmorphism), viền vàng ánh kim, scrollbar
│  └─ js/
│     ├─ particles.js      # Hệ thống hạt bụi thiên giới & sao băng trên Canvas
│     ├─ viewer3d.js       # Trình dựng 3D Three.js r128, OrbitControls tự viết, Bung tách chi tiết
│     ├─ api.js            # Client gọi API có gắn JWT Authorization
│     ├─ store.js          # Quản lý state đăng nhập, token, local cart & cart badge
│     ├─ ui.js             # Toast thông báo, format VND, escapeHTML, modals
│     ├─ router.js         # SPA Hash Router tự động gọi destroy() giải phóng bộ nhớ
│     ├─ pages/            # Các trang giao diện (home, shop, product, bricks, qr, cart, checkout, orders, account, admin)
│     └─ app.js            # Khởi tạo sự kiện DOM và vòng đời ứng dụng
├─ .env.example            # Bản mẫu cấu hình biến môi trường
├─ .gitignore              # Bỏ qua node_modules và .env
├─ package.json            # Scripts & danh sách dependencies
└─ README.md               # Tài liệu hướng dẫn chi tiết
```

---

## ⚙️ Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Chuẩn Bị Cơ Sở Dữ Liệu MongoDB Atlas
1. Đăng ký/Đăng nhập tài khoản tại [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Tạo một **Cluster miễn phí (M0)**.
3. Tại mục **Security &rarr; Database Access**: Tạo một Database User (chọn phương thức Password Authentication).
   > **Lưu ý quan trọng**: Nếu mật khẩu tài khoản Atlas của bạn có chứa các ký tự đặc biệt như `@`, `:`, `/`, `#`, `?`, `%`... bạn **bắt buộc phải mã hóa URL (URL-encode)** các ký tự đó trước khi ghép vào chuỗi kết nối. Ví dụ: ký tự `#` mã hóa thành `%23`, ký tự `@` mã hóa thành `%40`.
4. Tại mục **Security &rarr; Network Access**: Thêm địa chỉ IP của bạn hoặc chọn **Allow Access from Anywhere (`0.0.0.0/0`)** để tiện cho môi trường phát triển cục bộ.
5. Lấy chuỗi kết nối (Connection String) dạng SRV:
   ```
   mongodb+srv://<TEN_USER>:<MAT_KHAU_DA_MA_HOA>@cluster0.rnozfqq.mongodb.net/?retryWrites=true&w=majority
   ```
   *(Chú ý: Chuỗi kết nối không cần ghi tên database ở đường dẫn, máy chủ sẽ tự động kết nối qua biến `DB_NAME`)*.

---

### 2. Thiết Lập File Biến Môi Trường (.env)
Tạo file `.env` tại thư mục gốc của dự án (cùng cấp với `package.json`), sao chép nội dung từ `.env.example` và điền thông tin thật của bạn:

```env
PORT=3000
MONGO_URI=mongodb+srv://<TEN_USER>:<MAT_KHAU_MOI>@cluster0.rnozfqq.mongodb.net/?retryWrites=true&w=majority
DB_NAME=cultivation_db
JWT_SECRET=toybrick666999
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=toybrick_admin
ADMIN_EMAIL=admin@toybrick.vn
ADMIN_PASSWORD="Tb#Studio2026-Kx7Qm9"
CLIENT_ORIGIN=http://localhost:3000
```

> **Quy tắc quan trọng**:
> - Biến kết nối là `MONGO_URI` (không phải `MONGODB_URI`).
> - Biến `ADMIN_PASSWORD` nên được bọc trong dấu ngoặc kép `"..."` nếu có chứa ký tự đặc biệt (chẳng hạn `#`).
> - Nếu `JWT_SECRET` ngắn hơn 32 ký tự, hệ thống sẽ in cảnh báo ra màn hình nhưng không chặn chạy.
> - Tuyệt đối không commit file `.env` chứa mật khẩu thật lên kho lưu trữ mã nguồn Git.

---

### 3. Cài Đặt Thư Viện & Nạp Dữ Liệu Mẫu

Mở Terminal tại thư mục dự án và thực hiện các bước sau:

```bash
# Bước 1: Cài đặt các thư viện cần thiết
npm install

# Bước 2: Nạp dữ liệu mẫu vào database (Seed)
npm run seed
```

**Kết quả sau khi chạy Seed thành công**:
- Khởi tạo tài khoản Quản trị viên (Admin) từ các biến `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` trong `.env`. Nếu tài khoản đã tồn tại, script sẽ cập nhật lại thông tin mà không tạo trùng.
- Tạo sẵn 1 tài khoản khách hàng demo:
  - **Tên đăng nhập / Email**: `khachhang@toybrick.vn` hoặc `demo_customer`
  - **Mật khẩu**: `KhachHang@123`
- Tạo sẵn **≥ 6 bộ mô hình Set đỉnh cao** (kèm mô hình 3D tương tác hoàn chỉnh, trong đó có **Siêu xe F1 Technic Vô Địch 2026** gồm 1.639 mảnh ghép, giá 2.490.000 đ).
- Tạo sẵn **≥ 40 loại gạch lẻ Pick-a-Brick** phong phú màu sắc và danh mục (gồm gạch #3001 2x4 Đỏ, #3002 2x3 Xanh dương, bánh răng 16 răng Technic, chốt pin, cùng một số mặt hàng có tồn kho bằng 0 để kiểm tra trạng thái hết hàng).

---

### 4. Khởi Chạy Ứng Dụng

Chạy lệnh:
```bash
npm start
```
*(Hoặc dùng `npm run dev` nếu bạn muốn chế độ tự động khởi động lại khi sửa mã nguồn với Node.js --watch)*.

Mở trình duyệt web và truy cập địa chỉ:
👉 **`http://localhost:3000`**

---

### 5. Cách Thay Đổi Tài Khoản Admin

Nếu bạn muốn thay đổi tên đăng nhập, email hoặc mật khẩu của tài khoản Admin:
1. Mở file `.env` và chỉnh sửa các giá trị `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
2. Chạy lại lệnh nạp dữ liệu:
   ```bash
   npm run seed
   ```
3. Đăng nhập tại giao diện web bằng thông tin mới cập nhật.

---

## 📡 Danh Sách RESTful API Endpoints

Mọi API đều có tiền tố `/api` và trả về cấu trúc JSON đồng nhất: `{ success: Boolean, data?: Any, message?: String, errors?: Array }`.

### 1. Xác thực & Tài khoản (`/api/auth`)
- `POST /api/auth/register`: Đăng ký tài khoản khách mới (nhận `name`, `username`, `email`, `password`).
- `POST /api/auth/login`: Đăng nhập bằng Email **HOẶC** Tên đăng nhập (nhận `{ identifier, password }`).
- `GET /api/auth/me`: Lấy thông tin tài khoản hiện tại (yêu cầu Bearer Token).
- `PUT /api/auth/me`: Cập nhật thông tin cá nhân và sổ địa chỉ giao hàng.
- `PUT /api/auth/password`: Đổi mật khẩu tài khoản.

### 2. Mô hình Sản phẩm (`/api/products`)
- `GET /api/products`: Danh sách sản phẩm (hỗ trợ tìm kiếm `q`, lọc theo `category`, khoảng giá `minPrice`/`maxPrice`, sắp xếp `sort`, phân trang `page`/`limit`).
- `GET /api/products/:slug`: Chi tiết sản phẩm theo đường dẫn thân thiện (kèm dữ liệu cấu trúc 3D).
- `GET /api/products/qr/:code`: Tra cứu thông tin sản phẩm tức thì bằng mã QR hoặc SKU.

### 3. Kho Gạch Lẻ Pick-a-Brick (`/api/bricks`)
- `GET /api/bricks`: Lấy danh sách gạch lẻ (lọc theo `color`, `category`, `inStock`, từ khóa `q`, phân trang).
- `GET /api/bricks/:code`: Xem chi tiết 1 mã gạch (ví dụ: `#3001`).

### 4. Giỏ Hàng (`/api/cart`) *(Yêu cầu đăng nhập)*
- `GET /api/cart`: Xem chi tiết các món trong giỏ, tự động tính tổng tiền và phí ship.
- `POST /api/cart`: Thêm sản phẩm hoặc gạch lẻ vào giỏ (`kind: 'product' | 'brick'`, `id`, `qty`). Kiểm tra tồn kho thực tế.
- `POST /api/cart/merge`: Đồng bộ và hợp nhất các mặt hàng lưu tạm từ `localStorage` khi khách vừa đăng nhập.
- `PATCH /api/cart/items/:itemId`: Cập nhật số lượng của một món hàng trong giỏ.
- `DELETE /api/cart/items/:itemId`: Xóa một món hàng khỏi giỏ.
- `DELETE /api/cart`: Xóa sạch toàn bộ giỏ hàng.

### 5. Đơn Hàng (`/api/orders`) *(Yêu cầu đăng nhập)*
- `POST /api/orders`: Tạo đơn hàng mới (Trừ tồn kho nguyên tử, ghi nhận snapshot giá & tên).
- `GET /api/orders`: Xem lịch sử các đơn hàng của khách.
- `GET /api/orders/:id`: Xem chi tiết đơn hàng, timeline trạng thái.
- `PATCH /api/orders/:id/cancel`: Tự hủy đơn hàng khi đang ở trạng thái `Chờ xác nhận` (hoàn trả lại số lượng tồn kho).

### 6. Quản Trị Hệ Thống (`/api/admin`) *(Yêu cầu quyền Admin)*
- `GET /api/admin/stats`: Thống kê tổng quan doanh thu, phân bổ đơn theo trạng thái, top sản phẩm và cảnh báo tồn kho thấp.
- `GET /api/admin/products`: Danh sách sản phẩm quản trị.
- `POST /api/admin/products`: Tạo mới sản phẩm kèm chi tiết 3D.
- `PUT /api/admin/products/:id`: Chỉnh sửa thông tin sản phẩm.
- `DELETE /api/admin/products/:id`: Xóa sản phẩm.
- `GET /api/admin/bricks`: Danh sách gạch lẻ quản trị.
- `POST /api/admin/bricks`: Thêm mới mã gạch lẻ.
- `PUT /api/admin/bricks/:id`: Chỉnh sửa nhanh tồn kho và đơn giá gạch lẻ.
- `DELETE /api/admin/bricks/:id`: Xóa gạch lẻ.
- `POST /api/admin/bricks/import-csv`: Nhập danh sách gạch lẻ hàng loạt từ định dạng CSV.
- `GET /api/admin/orders`: Quản lý danh sách đơn hàng toàn hệ thống.
- `PATCH /api/admin/orders/:id/status`: Cập nhật trạng thái đơn hàng (tự động hoàn tồn nếu chuyển sang `Đã hủy`).
- `GET /api/admin/users`: Quản lý danh sách thành viên và khách hàng.

---

## 🛡️ Tiêu Chuẩn Bảo Mật & Kiểm Thử Nghiệm Thu

1. **Bảo mật cơ sở dữ liệu**:
   - Mật khẩu người dùng được băm qua bcrypt với 10 vòng salt, không bao giờ lưu trữ mật khẩu plaintext.
   - Trường mật khẩu được cấu hình `select: false` trong Mongoose model, ngăn chặn rò rỉ hash trong các truy vấn thông thường.
   - Chống NoSQL Injection bằng cách làm sạch đệ quy mọi tham số có chứa ký tự `$` hoặc `.`.
2. **Bảo vệ chống tấn công Brute-Force**:
   - Áp dụng `express-rate-limit` nghiêm ngặt cho nhóm route `/api/auth` (tối đa 10 lần yêu cầu trong vòng 15 phút).
3. **An toàn giao diện (XSS Prevention)**:
   - Toàn bộ dữ liệu hiển thị từ người dùng và cơ sở dữ liệu được xử lý qua hàm `escapeHTML()` trước khi render vào cây DOM.
4. **Kiểm tra tính toàn vẹn tồn kho**:
   - Áp dụng kỹ thuật atomic update với điều kiện số lượng hiện tại `>= qty`.
   - Cơ chế rollback an toàn bảo vệ hệ thống không bao giờ xảy ra lỗi âm kho dù chịu tải song song.

---

Chúc bạn có những trải nghiệm sáng tạo tuyệt vời cùng **ToyBrick Studio**!
