import axios from "axios";

/**
 * Centralized API Client
 * Quản lý tất cả API calls với base URL từ environment variable
 * - Tự động thêm Authorization header
 * - Xử lý errors và token refresh
 */

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

// Tạo axios instance chung
const apiClient = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Cho phép gửi cookies (refreshToken)
});

// Request interceptor - Thêm token vào header
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Xử lý lỗi chung
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Xử lý lỗi 401 (Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Thử refresh token
                const res = await axios.post(`${API_BASE}/api/auth/refresh`, {}, {withCredentials: true});

                const newToken = res.data.token || res.data.access_token;
                if (newToken) {
                    localStorage.setItem("token", newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh token failed - logout user
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                if (window.location.pathname !== "/auth/login") {
                    window.location.href = "/auth/login";
                }
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
