// src/pages/auth/reset-password/ResetPassword.jsx
import {useState, useEffect} from "react";
import {useNavigate, useSearchParams, useLocation} from "react-router-dom";
import "./ResetPassword.css";
import axios from "axios";

function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const [token, setToken] = useState(null);
    const [email, setEmail] = useState("");

    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 👉 Lấy token từ query, xoá trên URL và check API
    useEffect(() => {
        const t = searchParams.get("token");
        if (!t && !location.state?.token) {
            setMessage({
                type: "error",
                text: "Token không tồn tại hoặc đã hết hạn.",
            });
            setLoading(false);
            return;
        }

        const tokenFromUrl = t || location.state?.token;
        setToken(tokenFromUrl);

        // Nếu có token từ URL thì xoá nó (chỉ giữ step)
        if (t) {
            const step = searchParams.get("step") || "reset-password";
            navigate(`${location.pathname}?step=${step}`, {
                replace: true,
                state: {token: t},
            });
        }

        // 👉 Check token còn hạn không
        const checkToken = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_BASE || "";
                const res = await axios.post(
                    `${API_BASE}/api/auth/check-reset-token`,
                    {
                        token: tokenFromUrl,
                    }
                );
                setMessage(null);
                setEmail(res.data.email); // ✅ lấy email từ API
            } catch (err) {
                setMessage({
                    type: "error",
                    text:
                        err.response?.data?.message ||
                        "Token không hợp lệ hoặc đã hết hạn.",
                });
            } finally {
                setLoading(false);
            }
        };

        checkToken();
    }, [searchParams, navigate, location]);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({type: "error", text: "Mật khẩu nhập lại không khớp"});
            return;
        }

        try {
            setLoading(true);
            const API_BASE = import.meta.env.VITE_API_BASE || "";
            const res = await axios.post(
                `${API_BASE}/api/auth/reset-password`,
                {
                    token,
                    newPassword: formData.newPassword,
                }
            );

            // ✅ Thành công
            setMessage({
                type: "success",
                text: "Thiết lập mật khẩu mới thành công. Nhấn đăng nhập để tiếp tục.",
            });
        } catch (err) {
            // ❌ Lỗi
            setMessage({
                type: "error",
                text:
                    err.response?.data?.message ||
                    "Có lỗi xảy ra, vui lòng thử lại",
            });
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        if (field === "newPassword") {
            setShowNewPassword(!showNewPassword);
        } else {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    return (
        <div className="reset-password-bg">
            <div className="reset-password-container">
                {/* Main Heading */}
                <h2 className="reset-heading">Thiết lập lại mật khẩu</h2>

                {/* Form */}

                {message?.type === "error" ? (
                    <div className="message-box error">{message.text}</div>
                ) : message?.type === "success" ? (
                    // ✅ Hiển thị khi thành công
                    <div className="message-box success">
                        <p>Thiết lập mật khẩu mới thành công.</p>
                        <p>
                            Nhấn{" "}
                            <span
                                onClick={() =>
                                    navigate("/auth/login?step=signin", {
                                        state: {
                                            email: email,
                                            password: formData.newPassword,
                                        },
                                    })
                                }
                                style={{
                                    textDecoration: "none",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                }}
                            >
                                đăng nhập
                            </span>{" "}
                            để tiếp tục.
                        </p>
                    </div>
                ) : (
                    // ❌ Hiển thị form khi chưa thành công
                    <form onSubmit={handleSubmit} className="reset-form">
                        {/* New Password Field */}
                        <div className="input-group">
                            <label
                                htmlFor="newPassword"
                                className="input-label"
                            >
                                Mật khẩu mới
                            </label>
                            <div className="password-input-container">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    className="password-input"
                                    required
                                />
                                <button
                                    type="button"
                                    className="eye-icon-button"
                                    onClick={() =>
                                        togglePasswordVisibility("newPassword")
                                    }
                                >
                                    👁
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="input-group">
                            <label
                                htmlFor="confirmPassword"
                                className="input-label"
                            >
                                Xác nhận mật khẩu mới
                            </label>
                            <div className="password-input-container">
                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="password-input"
                                    required
                                />
                                <button
                                    type="button"
                                    className="eye-icon-button"
                                    onClick={() =>
                                        togglePasswordVisibility(
                                            "confirmPassword"
                                        )
                                    }
                                >
                                    👁
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="reset-submit-button">
                            Hoàn thành
                        </button>

                        {/* Hiển thị lỗi nếu có */}
                        {message?.type === "error" && (
                            <div className="message-box error">
                                {message.text}
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;
