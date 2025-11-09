import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export const userApi = axios.create({
    baseURL: `${API_BASE}/api`,
    withCredentials: true, // quan trọng để gửi cookie (refreshToken)
});

// interceptor request (gửi accessToken kèm mỗi request)
userApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// interceptor response (tự động refresh khi accessToken hết hạn)
userApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const res = await axios.post(`${API_BASE}/api/auth/refresh`, {}, {withCredentials: true});
                const newAccessToken = res.data.token || res.data.access_token;

                localStorage.setItem("token", newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return userApi(originalRequest); // gửi lại request cũ
            } catch (err) {
                console.error("Refresh token failed", err);
                // Nếu refresh cũng fail thì logout user
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);
