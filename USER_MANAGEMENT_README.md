# Module Quản lý User - Booking Tour

## Tổng quan

Module quản lý người dùng cho trang admin của hệ thống booking tour, được xây dựng với React + Node.js (Express + MySQL).

## Chức năng chính

-   ✅ **CRUD Operations**: Thêm, sửa, xóa, xem danh sách người dùng
-   ✅ **Tìm kiếm**: Tìm kiếm theo tên, email
-   ✅ **Phân trang**: Hỗ trợ phân trang với tùy chọn số lượng hiển thị
-   ✅ **Lọc dữ liệu**: Lọc theo role (admin/user) và trạng thái (hoạt động/khóa)
-   ✅ **Phân quyền**: Quản lý role và trạng thái người dùng
-   ✅ **Validation**: Validate dữ liệu đầu vào (email, role, v.v.)

## Cấu trúc dự án

### Backend (Node.js + Express + MySQL)

```
backend/
├── controllers/
│   └── userController.js          # Logic xử lý CRUD operations
├── routes/
│   └── userRoutes.js              # API routes cho user management
├── config/
│   └── db.js                      # Cấu hình kết nối MySQL
└── test-user-api.js               # Script test API
```

### Frontend (React + Ant Design)

```
client/src/
├── pages/admin/
│   └── AdminUsers.jsx             # Component quản lý users
└── utils/
    └── adminApi.js                # Cấu hình axios cho admin API
```

## API Endpoints

### 1. Lấy danh sách users

```
GET /api/users
Query params:
- page: số trang (default: 1)
- limit: số lượng/trang (default: 10)
- search: tìm kiếm theo tên/email
- role: lọc theo role (admin/user)
- status: lọc theo trạng thái (active/inactive)
```

### 2. Lấy thông tin user theo ID

```
GET /api/users/:id
```

### 3. Tạo user mới

```
POST /api/users
Body: {
  name: string (required),
  email: string (required),
  password: string (required for new user),
  phone: string,
  gender: 'male'|'female'|'other',
  address: string,
  role: 'user'|'admin' (default: 'user'),
  is_active: boolean (default: true)
}
```

### 4. Cập nhật user

```
PUT /api/users/:id
Body: {
  name?: string,
  email?: string,
  password?: string,
  phone?: string,
  gender?: 'male'|'female'|'other',
  address?: string,
  role?: 'user'|'admin',
  is_active?: boolean
}
```

### 5. Xóa user

```
DELETE /api/users/:id
```

## Database Schema

### Bảng `users`

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  phone VARCHAR(20),
  gender ENUM('male', 'female', 'other'),
  address VARCHAR(255),
  role ENUM('user', 'admin') DEFAULT 'user',
  is_active TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Cách sử dụng

### 1. Khởi động Backend

```bash
cd backend
npm install
npm run dev
```

### 2. Khởi động Frontend

```bash
cd client
npm install
npm run dev
```

### 3. Truy cập trang admin

-   URL: `http://localhost:5173/admin/users`
-   Yêu cầu đăng nhập với quyền admin

## Tính năng Frontend

### Giao diện chính

-   **Bảng danh sách**: Hiển thị thông tin users với các cột ID, Tên, Email, Số điện thoại, Giới tính, Role, Trạng thái, Ngày tạo
-   **Tìm kiếm**: Ô tìm kiếm theo tên hoặc email
-   **Bộ lọc**: Lọc theo role và trạng thái
-   **Phân trang**: Hỗ trợ phân trang với tùy chọn số lượng hiển thị

### Modal thêm/sửa user

-   **Form validation**: Validate dữ liệu đầu vào
-   **Các trường**: Tên, Email, Số điện thoại, Giới tính, Địa chỉ, Role, Trạng thái
-   **Mật khẩu**: Chỉ hiển thị khi thêm user mới

### Hành động

-   **Sửa**: Mở modal với dữ liệu hiện tại
-   **Xóa**: Xác nhận trước khi xóa
-   **Cập nhật**: Tự động refresh danh sách sau khi thao tác

## Validation Rules

### Backend Validation

-   **Email**: Format hợp lệ, unique
-   **Role**: Chỉ chấp nhận 'user' hoặc 'admin'
-   **Password**: Hash với bcrypt (khi tạo mới)
-   **Required fields**: name, email

### Frontend Validation

-   **Tên**: Bắt buộc, tối thiểu 2 ký tự
-   **Email**: Bắt buộc, format hợp lệ
-   **Mật khẩu**: Bắt buộc khi tạo mới, tối thiểu 6 ký tự

## Security Features

### Authentication & Authorization

-   Tất cả API endpoints yêu cầu authentication
-   Chỉ admin mới có thể truy cập
-   Sử dụng JWT token với refresh token

### Data Protection

-   Password được hash với bcrypt
-   Input validation và sanitization
-   SQL injection protection với prepared statements

## Testing

### Test API

```bash
cd backend
node test-user-api.js
```

### Test Cases

1. ✅ Lấy danh sách users
2. ✅ Tạo user mới
3. ✅ Lấy thông tin user theo ID
4. ✅ Cập nhật user
5. ✅ Tìm kiếm users
6. ✅ Xóa user

## Troubleshooting

### Lỗi thường gặp

1. **Lỗi kết nối database**

    - Kiểm tra cấu hình trong `backend/config/db.js`
    - Đảm bảo MySQL service đang chạy

2. **Lỗi authentication**

    - Kiểm tra admin token trong localStorage
    - Đảm bảo đã đăng nhập với quyền admin

3. **Lỗi CORS**
    - Kiểm tra cấu hình CORS trong `backend/index.js`
    - Đảm bảo frontend URL được whitelist

## Mở rộng

### Thêm tính năng

-   Export/Import users
-   Bulk operations
-   User activity logs
-   Advanced search filters

### Tối ưu hóa

-   Caching với Redis
-   Database indexing
-   API rate limiting
-   Frontend lazy loading

## Liên hệ

Nếu có vấn đề hoặc cần hỗ trợ, vui lòng tạo issue hoặc liên hệ team phát triển.
