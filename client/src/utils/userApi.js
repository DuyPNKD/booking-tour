import axios from "axios";

export const userApi = axios.create({
    baseURL: "http://localhost:3000/api",
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
                const res = await axios.post("/refresh-token", {}, {withCredentials: true});
                const newAccessToken = res.data.access_token;

                localStorage.setItem("token", newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return api(originalRequest); // gửi lại request cũ
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
