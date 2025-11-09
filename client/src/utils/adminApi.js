import axios from "axios";

/**
 * Admin API Utility
 * Cấu hình axios instance cho các API calls của admin
 * - Tự động thêm Authorization header với admin token
 * - Xử lý lỗi 401 (Unauthorized) bằng cách redirect về login
 */

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

// Tạo axios instance với base URL cho admin API
export const adminApi = axios.create({
    baseURL: `${API_BASE}/api/admin`,
    withCredentials: true, // phải bật true để cookie refreshToken được gửi kèm
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
    async (err) => {
        const originalRequest = err.config;

        // Nếu gặp lỗi 401 (Unauthorized) và chưa retry
        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Gọi API refresh token (BE sẽ đọc từ cookie HttpOnly)
                const {data} = await adminApi.post("/refresh", {}, {withCredentials: true});

                // Lưu token mới vào localStorage
                localStorage.setItem("adminToken", data.access_token);

                // Cập nhật header Authorization cho request gốc
                originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                // Retry request gốc
                return adminApi(originalRequest);
            } catch (refreshError) {
                // Nếu refresh token không hợp lệ, redirect về login
                localStorage.removeItem("adminToken");
                alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
                window.location.href = "/admin/login";
            }
        }
        return Promise.reject(err);
    }
);
