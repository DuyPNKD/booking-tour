# 🚀 HƯỚNG DẪN DEPLOY - BẮT ĐẦU TỪ ĐÂU?

## 📌 BẠN ĐANG Ở ĐÂU?

### Nếu bạn là người mới bắt đầu:

👉 **Đọc file: `HUONG_DAN_DEPLOY_DON_GIAN.md`**

-   Giải thích từng bước chi tiết
-   Hướng dẫn cách kết nối đến server
-   Dễ hiểu, không cần kiến thức nâng cao

### Nếu bạn đã quen với Linux/Server:

👉 **Đọc file: `QUICK_DEPLOY.md`**

-   Tóm tắt nhanh các lệnh cần thiết
-   Dành cho người có kinh nghiệm

### Nếu bạn muốn hiểu sâu:

👉 **Đọc file: `DEPLOYMENT_GUIDE.md`**

-   Hướng dẫn đầy đủ, chi tiết
-   Giải thích từng phần
-   Troubleshooting

---

## 🎯 QUY TRÌNH TỔNG QUAN

```
1. Chuẩn bị trên máy tính của bạn
   ↓
2. Kết nối đến Server (PuTTY/SSH)
   ↓
3. Cài đặt công cụ trên Server
   ↓
4. Upload code lên Server
   ↓
5. Cấu hình Backend
   ↓
6. Build Frontend
   ↓
7. Cấu hình Nginx
   ↓
8. Cài đặt SSL
   ↓
9. Kiểm tra và hoàn thành!
```

---

## ⚡ BẮT ĐẦU NHANH

1. **Mở file `HUONG_DAN_DEPLOY_DON_GIAN.md`**
2. **Làm theo từng bước**
3. **Nếu gặp lỗi, xem phần Troubleshooting**

---

## 📝 CHECKLIST

Trước khi bắt đầu, đảm bảo bạn có:

-   [ ] Server/VPS với IP công khai
-   [ ] Domain name (ví dụ: bookingtour.com)
-   [ ] Domain đã trỏ về IP server (A record)
-   [ ] Thông tin đăng nhập server (username, password hoặc SSH key)
-   [ ] Thông tin Cloudinary (nếu dùng)
-   [ ] Thông tin MoMo Payment (nếu dùng)

---

## 🆘 CẦN GIÚP ĐỠ?

1. Đọc file `HUONG_DAN_DEPLOY_DON_GIAN.md` trước
2. Kiểm tra phần Troubleshooting
3. Xem logs: `pm2 logs` hoặc `sudo tail -f /var/log/nginx/error.log`

---

**Chúc bạn deploy thành công! 🎉**
