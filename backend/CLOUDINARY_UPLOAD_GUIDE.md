# 🖼️ Hướng dẫn Upload Ảnh lên Cloudinary

## 📋 Tổng quan

Hệ thống booking tour sử dụng **Cloudinary** để lưu trữ và quản lý ảnh. Tất cả các endpoint upload đều yêu cầu **authentication** (JWT token) và hỗ trợ upload single/multiple images với tự động optimize.

## 🚀 Cài đặt và Cấu hình

### 1. Tạo tài khoản Cloudinary

1. Truy cập [https://cloudinary.com](https://cloudinary.com)
2. Đăng ký tài khoản miễn phí
3. Sau khi đăng nhập, lấy thông tin từ Dashboard:
    - Cloud Name
    - API Key
    - API Secret

### 2. Cấu hình Environment Variables

Thêm vào file `.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# JWT Configuration
JWT_SECRET=your_jwt_secret
```

### 3. Cài đặt Dependencies

```bash
cd backend
npm install cloudinary axios form-data
```

## 🔧 API Endpoints

### Upload Single Image

```
POST /api/upload/cloudinary
Content-Type: multipart/form-data
Authorization: Bearer <JWT_TOKEN>
Body: { image: File }
```

**Response:**

```json
{
    "success": true,
    "url": "https://res.cloudinary.com/...",
    "public_id": "uploads/abc123",
    "width": 1920,
    "height": 1080,
    "format": "webp",
    "bytes": 245760
}
```

### Upload Multiple Images

```
POST /api/upload/cloudinary/multiple
Content-Type: multipart/form-data
Authorization: Bearer <JWT_TOKEN>
Body: { images: File[] }
```

**Response:**

```json
{
    "success": true,
    "images": [
        {
            "url": "https://res.cloudinary.com/...",
            "public_id": "uploads/abc123",
            "width": 1920,
            "height": 1080
        }
    ],
    "message": "Upload thành công 3 ảnh"
}
```

### Delete Image

```
DELETE /api/upload/cloudinary/:publicId
Authorization: Bearer <JWT_TOKEN>
```

**Response:**

```json
{
    "success": true,
    "message": "Xóa ảnh thành công"
}
```

### Upload Avatar User

```
POST /api/auth/upload/avatar
Content-Type: multipart/form-data
Authorization: Bearer <JWT_TOKEN>
Body: { avatar: File }
```

**Response:**

```json
{
    "success": true,
    "path": "https://res.cloudinary.com/...",
    "public_id": "avatars/user_123_1640995200000",
    "width": 300,
    "height": 300
}
```

### Upload Tour Images

```
POST /api/admin/tours/:id/images
Content-Type: multipart/form-data
Authorization: Bearer <JWT_TOKEN>
Body: { images: File[] }
```

**Response:**

```json
{
    "success": true,
    "images": [
        {
            "url": "https://res.cloudinary.com/...",
            "public_id": "tours/tour-slug/image1",
            "width": 1200,
            "height": 800
        }
    ],
    "message": "Upload thành công 5 ảnh"
}
```

## 📁 Cấu trúc Cloudinary

```
Cloudinary/
├── avatars/                    # Avatar người dùng
│   ├── user_123_1640995200000.jpg
│   └── user_456_1640995200001.jpg
├── tours/                      # Ảnh tour
│   ├── thumbnails/            # Ảnh thumbnail tour
│   │   ├── tour_1_thumb.jpg
│   │   └── tour_2_thumb.jpg
│   ├── ha-long-bay/           # Ảnh tour cụ thể
│   │   ├── image1.jpg
│   │   └── image2.jpg
│   └── sapa/
│       ├── image1.jpg
│       └── image2.jpg
└── uploads/                    # Ảnh upload từ frontend
    ├── temp_upload1.jpg
    └── temp_upload2.jpg
```

## 🧪 Testing

### Test Tự Động (Khuyến nghị)

```bash
# Chạy tất cả test tự động
node run-upload-tests.js
```

Script này sẽ:

-   ✅ Tạo tài khoản test
-   ✅ Lấy JWT token
-   ✅ Test upload single image
-   ✅ Test upload multiple images
-   ✅ Test delete image
-   ✅ Test các trường hợp lỗi

### Test Từng Bước

```bash
# 1. Lấy JWT Token
node get-test-token.js

# 2. Test Upload
node test-upload.js YOUR_JWT_TOKEN_HERE

# 3. Test đơn giản
node simple-test.js
```

### Test Cases

#### ✅ Upload Single Image

-   Upload thành công với JWT token
-   Upload thất bại không có token
-   Upload thất bại với file không phải ảnh
-   Upload thất bại với file quá lớn (>10MB)

#### ✅ Upload Multiple Images

-   Upload nhiều ảnh thành công
-   Upload thất bại không có token
-   Upload thất bại với quá nhiều file (>10)

#### ✅ Delete Image

-   Xóa ảnh thành công
-   Xóa thất bại không có token
-   Xóa thất bại với public_id không tồn tại

## 🔄 Migration từ Local Storage

### Auto Migration (Khuyến nghị)

```bash
# Chạy script tự động với hướng dẫn từng bước
node autoMigration.js
```

### Migration Thủ Công

```bash
# 1. Kiểm tra ảnh hiện tại
node checkOldImageUrls.js

# 2. Chạy migration
node migrateToCloudinary.js

# 3. Kiểm tra kết quả
node checkOldImageUrls.js

# 4. Xóa ảnh cũ (tùy chọn)
node migrateToCloudinary.js --delete-old
```

### Quy trình Migration

1. **Avatar Users** → `avatars/` folder (300x300, crop fill, face detection)
2. **Tour Thumbnails** → `tours/thumbnails/` folder (400x300, crop fill)
3. **Tour Images** → `tours/{tour-slug}/` folder (1200x800, crop fill)
4. **New Uploads** → `uploads/` folder

## 🎯 Lợi ích của Cloudinary

-   ✅ **CDN toàn cầu**: Ảnh load nhanh từ mọi nơi
-   ✅ **Tự động tối ưu**: Format, quality, size tự động
-   ✅ **Transformations**: Resize, crop, filter real-time
-   ✅ **Backup tự động**: Không lo mất ảnh
-   ✅ **Analytics**: Theo dõi bandwidth, storage
-   ✅ **Free tier**: 25GB storage, 25GB bandwidth/tháng

## 🛠️ Troubleshooting

### Lỗi "Server không chạy"

```bash
# Khởi động server
cd backend
npm start
```

### Lỗi "Invalid cloud name"

-   Kiểm tra CLOUDINARY_CLOUD_NAME trong .env
-   Đảm bảo không có khoảng trắng thừa

### Lỗi "Invalid API credentials"

-   Kiểm tra CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET
-   Đảm bảo copy đúng từ Dashboard

### Lỗi "Chỉ cho phép upload file ảnh!"

-   Đảm bảo file là ảnh (.jpg, .png, .gif, .webp)
-   Kiểm tra MIME type của file

### Upload bị lỗi

-   Kiểm tra kết nối internet
-   Kiểm tra file size (giới hạn 10MB)
-   Kiểm tra file format (chỉ hỗ trợ ảnh)

### Ảnh không hiển thị sau migration

1. Kiểm tra URL trong database
2. Kiểm tra Cloudinary console
3. Kiểm tra CORS settings

## 📊 Monitoring

### Cloudinary Dashboard

Theo dõi tại: [https://cloudinary.com/console](https://cloudinary.com/console)

-   **Storage used**: Theo dõi dung lượng
-   **Bandwidth used**: Theo dõi traffic
-   **Transformations**: Theo dõi số lần transform
-   **API calls made**: Theo dõi số lần gọi API

### Free Tier Limits

-   **Storage**: 25GB
-   **Bandwidth**: 25GB/tháng
-   **Transformations**: 25,000/tháng

## ⚠️ Lưu ý quan trọng

### Trước khi Migration

-   [ ] **Backup database** - Quan trọng nhất!
-   [ ] **Backup thư mục uploads** - Để phòng trường hợp cần rollback
-   [ ] **Test trên môi trường dev** trước khi chạy production

### Trong quá trình Migration

-   [ ] **Không tắt server** trong lúc migration
-   [ ] **Theo dõi log** để đảm bảo không có lỗi
-   [ ] **Kiểm tra từng bước** với script checkOldImageUrls.js

### Sau khi Migration

-   [ ] **Test tất cả chức năng** upload/display ảnh
-   [ ] **Kiểm tra performance** - ảnh phải load nhanh hơn
-   [ ] **Monitor Cloudinary usage** để tránh vượt free tier

## 🔄 Rollback Plan

Nếu cần rollback:

1. **Khôi phục database** từ backup
2. **Khôi phục thư mục uploads** từ backup
3. **Uncomment static file serving** trong index.js:

```javascript
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
```

## 📝 Scripts có sẵn

```bash
# Kiểm tra ảnh hiện tại
npm run migrate:check

# Migration tự động (khuyến nghị)
npm run migrate:auto

# Migration thủ công
npm run migrate:run

# Xóa ảnh cũ
npm run migrate:clean

# Test upload
npm run test:upload
```

## 🎉 Kết quả mong đợi

Sau khi migration hoàn tất:

-   ✅ Server không cần lưu trữ ảnh
-   ✅ Ảnh load nhanh hơn nhờ CDN
-   ✅ Tự động backup và optimize
-   ✅ Dễ dàng scale khi cần
-   ✅ Giảm tải cho server

## 💡 Tips

1. **Sử dụng script tự động**: `node run-upload-tests.js` để test toàn bộ
2. **Kiểm tra Cloudinary dashboard**: Xem ảnh đã upload
3. **Test với nhiều loại ảnh**: jpg, png, gif, webp
4. **Test với ảnh lớn**: Kiểm tra giới hạn 10MB
5. **Test network**: Upload khi mạng chậm

## 📞 Hỗ trợ

Nếu gặp vấn đề:

1. Kiểm tra server có chạy không
2. Kiểm tra cấu hình Cloudinary
3. Kiểm tra JWT token có hợp lệ không
4. Xem log console để debug

---

**Chúc bạn upload thành công! 🎉**
