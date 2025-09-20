import axios from "axios";

/**
 * Admin API Utility
 * Cấu hình axios instance cho các API calls của admin
 * - Tự động thêm Authorization header với admin token
 * - Xử lý lỗi 401 (Unauthorized) bằng cách redirect về login
 */

// Tạo axios instance với base URL cho admin API
export const adminApi = axios.create({
    baseURL: "http://localhost:3000/api/admin",
    withCredentials: false,
});

// Request interceptor: Tự động thêm Authorization header
adminApi.interceptors.request.use((config) => {
    // Lấy admin token từ localStorage
    const token = localStorage.getItem("adminToken");
    if (token) {
        // Thêm Bearer token vào header
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: Xử lý lỗi authentication
adminApi.interceptors.response.use(
    (res) => res, // Trả về response thành công
    (err) => {
        // Nếu gặp lỗi 401 (Unauthorized)
        if (err.response?.status === 401) {
            // Xóa token khỏi localStorage
            localStorage.removeItem("adminToken");
            // Redirect về trang login
            window.location.href = "/admin/login";
        }
        return Promise.reject(err);
    }
);
