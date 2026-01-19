# 🌍 Booking Tour - Hệ Thống Đặt Tour Du Lịch

<div align="center">

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-ISC-green)

**Một nền tảng đặt tour du lịch hiện đại với admin dashboard, thanh toán online và quản lý booking.**

[Xem Demo](#) • [Báo Cáo Lỗi](../../issues) • [Yêu Cầu Tính Năng](../../issues)

</div>

---

## 📋 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Tính Năng](#-tính-năng)
- [Công Nghệ](#-công-nghệ-sử-dụng)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
- [Cài Đặt](#-cài-đặt)
- [Cấu Hình](#-cấu-hình)
- [Chạy Ứng Dụng](#-chạy-ứng-dụng)
- [API Documentation](#-api-documentation)
- [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
- [Deployment](#-deployment)
- [Các Vấn Đề Đã Biết](#-các-vấn-đề-đã-biết)
- [Đóng Góp](#-đóng-góp)

---

## 🎯 Giới Thiệu

**Booking Tour** là một ứng dụng full-stack cho phép người dùng:

- Tìm kiếm và xem chi tiết các tour du lịch
- Đặt tour với lịch ngày linh hoạt
- Thanh toán an toàn qua MoMo
- Quản lý đơn đặt tour của mình
- Viết và xem bài blog về du lịch

Admin có thể:

- Quản lý tour (tạo, sửa, xóa)
- Quản lý blog posts
- Quản lý danh mục tour
- Xem báo cáo đặt tour
- Quản lý người dùng

---

## ✨ Tính Năng

### 👤 Cho Người Dùng

- ✅ Đăng ký / Đăng nhập (JWT Authentication)
- ✅ Đăng nhập với Google OAuth
- ✅ Tìm kiếm & lọc tour theo danh mục, giá, địa điểm
- ✅ Xem chi tiết tour với hình ảnh, mô tả, đánh giá
- ✅ Đặt tour với chọn ngày linh hoạt
- ✅ Thanh toán qua MoMo
- ✅ Quản lý booking của mình
- ✅ Đánh giá & bình luận tour
- ✅ Xem blog du lịch
- ✅ Cập nhật profile

### 🔧 Cho Admin

- 🔐 Dashboard admin với statistic
- 📝 CRUD Tour (tạo, sửa, xóa tour)
- 🏷️ CRUD Category (quản lý danh mục)
- 📰 CRUD Blog (quản lý bài viết)
- 👥 Quản lý người dùng
- 📊 Xem danh sách booking
- 🖼️ Upload ảnh với Cloudinary
- 📑 Import tour từ Excel

---

## 🛠️ Công Nghệ Sử Dụng

### Backend

| Công Nghệ  | Phiên Bản | Mục Đích             |
| ---------- | --------- | -------------------- |
| Node.js    | LTS       | JavaScript runtime   |
| Express.js | 4.21.2    | Web framework        |
| MySQL2     | 3.14.2    | Database             |
| JWT        | 9.0.2     | Authentication       |
| Cloudinary | 2.7.0     | Image storage        |
| Multer     | 1.4.5     | File upload          |
| BCryptJS   | 3.0.2     | Password hashing     |
| Nodemailer | 7.0.5     | Email service        |
| CORS       | 2.8.5     | Cross-origin support |

### Frontend

| Công Nghệ    | Phiên Bản | Mục Đích         |
| ------------ | --------- | ---------------- |
| React        | 18.3.1    | UI library       |
| Vite         | 6.3.1     | Build tool       |
| Tailwind CSS | 4.1.8     | Styling          |
| React Router | 7.5.1     | Routing          |
| Axios        | 1.11.0    | HTTP client      |
| Ant Design   | 5.27.1    | UI components    |
| React Quill  | 2.0.0     | Rich text editor |
| Date-fns     | 4.1.0     | Date utilities   |
| Google OAuth | 0.12.2    | Social login     |

---

## 📦 Yêu Cầu Hệ Thống

- **Node.js**: v14.0.0 hoặc cao hơn
- **npm/yarn**: v6.0.0 hoặc cao hơn
- **MySQL**: v5.7 hoặc cao hơn
- **Git**: v2.0 hoặc cao hơn

**Kiểm tra phiên bản:**

```bash
node --version
npm --version
mysql --version
```

---

## 🚀 Cài Đặt

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/booking-tour.git
cd booking-tour
```

### 2. Setup Backend

#### 2.1 Cài Đặt Dependencies

```bash
cd backend
npm install
```

#### 2.2 Tạo Database

```bash
# Kết nối MySQL và chạy SQL script
mysql -u root -p < create_table.sql
```

#### 2.3 Cấu Hình Environment

Tạo file `.env` trong thư mục `backend`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=booking_tour
DB_PORT=3306

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# MoMo Payment
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create

# Admin Email
ADMIN_EMAIL=admin@bookingour.com
```

### 3. Setup Frontend

#### 3.1 Cài Đặt Dependencies

```bash
cd ../client
npm install
```

#### 3.2 Cấu Hình Environment

Tạo file `.env.local` trong thư mục `client`:

```env
VITE_API_BASE=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## ⚙️ Cấu Hình

### Cấu Trúc Database

Database gồm các bảng chính:

- `users` - Người dùng
- `tours` - Tour du lịch
- `categories` - Danh mục tour
- `bookings` - Đơn đặt tour
- `blog_posts` - Bài blog
- `ratings` - Đánh giá tour
- `payments` - Thanh toán

Xem chi tiết tại [backend/create_table.sql](backend/create_table.sql)

### Cấu Hình Cloudinary

1. Đăng ký tài khoản tại [cloudinary.com](https://cloudinary.com)
2. Lấy `Cloud Name`, `API Key`, `API Secret`
3. Thêm vào file `.env` backend

Xem hướng dẫn chi tiết: [backend/CLOUDINARY_UPLOAD_GUIDE.md](backend/CLOUDINARY_UPLOAD_GUIDE.md)

### Cấu Hình MoMo Payment

1. Đăng ký tại [MoMo Developer](https://developers.momo.vn)
2. Tạo app và lấy credentials
3. Thêm vào file `.env` backend

---

## 🏃 Chạy Ứng Dụng

### Development

#### Backend (Terminal 1)

```bash
cd backend
npm run dev
# Server chạy tại http://localhost:3000
```

#### Frontend (Terminal 2)

```bash
cd client
npm run dev
# App chạy tại http://localhost:5173
```

### Production

#### Build Frontend

```bash
cd client
npm run build
# Output: dist/
```

#### Start Backend

```bash
cd backend
npm start
```

---

## 📚 API Documentation

### Authentication

```
POST   /api/auth/register       - Đăng ký tài khoản
POST   /api/auth/login          - Đăng nhập
POST   /api/auth/refresh-token  - Làm mới token
POST   /api/auth/logout         - Đăng xuất
POST   /api/auth/google         - Đăng nhập Google
```

### Tours

```
GET    /api/tours               - Danh sách tour (phân trang)
GET    /api/tours/:id           - Chi tiết tour
GET    /api/tours/search        - Tìm kiếm tour
POST   /api/tours               - Tạo tour (admin)
PUT    /api/tours/:id           - Sửa tour (admin)
DELETE /api/tours/:id           - Xóa tour (admin)
```

### Bookings

```
GET    /api/bookings            - Danh sách booking của user
POST   /api/bookings            - Tạo booking mới
GET    /api/bookings/:id        - Chi tiết booking
PUT    /api/bookings/:id        - Cập nhật booking
DELETE /api/bookings/:id        - Hủy booking
```

### Payments

```
POST   /api/payments/momo       - Tạo thanh toán MoMo
GET    /api/payments/:id        - Xác nhận thanh toán
```

### Blog

```
GET    /api/blog                - Danh sách bài blog
GET    /api/blog/:id            - Chi tiết bài blog
POST   /api/blog                - Tạo bài blog (admin)
PUT    /api/blog/:id            - Sửa bài blog (admin)
DELETE /api/blog/:id            - Xóa bài blog (admin)
```

### Admin

```
GET    /api/admin/stats         - Thống kê
GET    /api/admin/users         - Quản lý người dùng
GET    /api/admin/bookings      - Quản lý booking
```

Chi tiết API: [Xem Postman Collection](#)

---

## 📁 Cấu Trúc Thư Mục

```
booking-tour/
├── backend/
│   ├── config/              # Cấu hình database, Cloudinary, MoMo
│   ├── controllers/         # Logic xử lý request
│   ├── middlewares/         # Auth, upload, CORS middleware
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── utils/               # Helper functions
│   ├── public/uploads/      # Upload files
│   ├── certs/               # SSL certificates
│   ├── index.js             # Entry point
│   ├── package.json
│   └── .env                 # Environment variables
│
├── client/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React Context
│   │   ├── utils/           # Helper functions
│   │   ├── assets/          # Images, icons
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/              # Static assets
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.local           # Environment variables
│
├── README.md                # File này
└── PROJECT_ANALYSIS.md      # Phân tích dự án

```

---

## 🌐 Deployment

### Deploy Backend (Render)

1. Push code lên GitHub
2. Kết nối Render với repo
3. Tạo Web Service với:
    - Build: `npm install`
    - Start: `npm start`
    - Environment variables: Thêm tất cả biến từ `.env`

Xem hướng dẫn: [README_DEPLOY.md](README_DEPLOY.md)

### Deploy Frontend (Vercel)

1. Push code lên GitHub
2. Import project trong Vercel
3. Build settings:
    - Framework: Vite
    - Build command: `npm run build`
    - Output directory: `dist`

---

## 🐛 Các Vấn Đề Đã Biết

### Priority Cao

- ⚠️ Hardcoded API URLs - Cần chuyển sang environment variables
- ⚠️ Thiếu input validation - Cần thêm express-validator
- ⚠️ Thiếu rate limiting - Dễ bị attack
- ⚠️ Error handling không nhất quán

### Priority Trung

- ⚠️ Thiếu Error Boundary trong React
- ⚠️ Thiếu loading states ở nhiều component
- ⚠️ Thiếu error messages thân thiện

### Priority Thấp

- ⚠️ Cần thêm unit tests
- ⚠️ Cần thêm API documentation
- ⚠️ Cần optimize performance

Xem chi tiết: [PROJECT_ANALYSIS.md](PROJECT_ANALYSIS.md)

---

## 🧪 Testing

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd client
npm run lint
```

---

## 📝 Logging & Debugging

### Backend Logs

```bash
# Development
npm run dev

# Xem logs trong file
tail -f logs/app.log
```

### Frontend Debugging

- Mở DevTools: F12 hoặc Ctrl+Shift+I
- Tab Console để xem errors
- Tab Network để kiểm tra API calls
- Tab Application để xem localStorage

---

## 🤝 Đóng Góp

Chúng tôi rất hoan nghênh những đóng góp! Vui lòng làm theo các bước sau:

1. Fork project
2. Tạo branch cho feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push đến branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

## 📄 License

Distributed under the ISC License. Xem `LICENSE` file để chi tiết.

---

## 📞 Hỗ Trợ

Nếu bạn gặp vấn đề:

1. **Kiểm tra Database Connection**

    ```bash
    cd backend
    npm run test-db
    ```

2. **Xem logs**

    ```bash
    npm run dev
    # Kiểm tra console output
    ```

3. **Kiểm tra Environment Variables**

    ```bash
    # Chắc chắn tất cả biến trong .env đều được set
    ```

4. **Liên hệ**: [support@bookingtour.com](mailto:support@bookingtour.com)

---

## 📅 Changelog

### v1.0.0 (Current)

- ✅ Core features: Tours, Bookings, Payments
- ✅ Admin Dashboard
- ✅ Blog system
- ✅ User authentication with JWT & Google OAuth
- ✅ MoMo payment integration
- ✅ Cloudinary image storage

### Sắp Tới (v1.1.0)

- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Social sharing
- [ ] Wishlist feature

---

## � Tác Giả

- **Phạm Ngọc Khánh Duy** - Developer & Project Lead

---

## 🙏 Cảm Ơn

- [Express.js](https://expressjs.com/) - Backend framework
- [React](https://react.dev/) - Frontend library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Cloudinary](https://cloudinary.com/) - Image hosting

---

<div align="center">

**⭐ Nếu project này hữu ích, vui lòng cho một sao! ⭐**

Made with ❤️ by Phạm Ngọc Khánh Duy

</div>
