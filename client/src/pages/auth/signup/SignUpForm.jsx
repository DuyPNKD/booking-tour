import React, {useState} from "react";
import {Eye, EyeOff, ArrowLeft} from "lucide-react";
import "./SignUpForm.css";
import BackButton from "../../../components/backButton/BackButton";

function SignUpForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Thêm state cho các trường nhập và lỗi
    const [form, setForm] = useState({
        name: "",
        emailOrPhone: "",
        password: "",
        confirmPassword: "",
        captcha: false,
    });
    const [errors, setErrors] = useState({});
    const [errorTimeouts, setErrorTimeouts] = useState({}); // Thêm state lưu timeout

    // Hàm validate
    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = "Vui lòng nhập họ tên";
        if (!form.emailOrPhone.trim()) newErrors.emailOrPhone = "Vui lòng nhập email hoặc số điện thoại";
        // Đơn giản kiểm tra email hoặc số điện thoại
        if (form.emailOrPhone && !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)@([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,}|(\+?\d{9,13}))$/.test(form.emailOrPhone)) {
            newErrors.emailOrPhone = "Email hoặc số điện thoại không hợp lệ";
        }
        if (!form.password) newErrors.password = "Vui lòng nhập mật khẩu";
        if (form.password && form.password.length < 6) newErrors.password = "Mật khẩu tối thiểu 6 ký tự";
        if (!form.confirmPassword) newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
        if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu nhập lại không khớp";
        }
        // if (!form.captcha) newErrors.captcha = "Vui lòng xác nhận bạn không phải là người máy";
        return newErrors;
    };

    // Xử lý thay đổi input
    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Nếu có lỗi ở trường đang nhập
        if (errors[name]) {
            // Nếu có timeout cũ, clear
            if (errorTimeouts[name]) {
                clearTimeout(errorTimeouts[name]);
            }

            // Tạo timeout mới
            const timeoutId = setTimeout(() => {
                setErrors((prev) => ({
                    ...prev,
                    [name]: undefined,
                }));
            }, 400);

            // Lưu timeout mới
            setErrorTimeouts((prev) => ({
                ...prev,
                [name]: timeoutId,
            }));
        }
    };

    // Xử lý submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                const res = await fetch("http://localhost:3000/api/auth/signup", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(form),
                });

                if (!res.ok) throw new Error("Đăng ký thất bại");

                const data = await res.json();
                localStorage.setItem("token", data.token);
                // setUser(data.user) => lưu vào context/global state
                // Sau khi đăng ký xong thì chuyển sang trang login hoặc home
                // navigate("/login") hoặc navigate("/")
                navigate("/");
                alert("Đăng ký & đăng nhập thành công!");
            } catch (err) {
                console.error(err);
                alert("Có lỗi xảy ra!");
            }
        }
    };

    return (
        <div className="signup-bg">
            <div className="signup-form-container">
                <div className="signup-form-header">
                    <BackButton />
                    <h2>Đăng ký</h2>
                </div>

                <form className="signup-auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="signup-input-group">
                        <label>
                            Tên hiển thị <span className="signup-required">*</span>
                        </label>
                        <input type="text" className="signup-form-input" name="name" value={form.name} onChange={handleChange} />
                        {errors.name && <div className="signup-error">{errors.name}</div>}
                    </div>

                    <div className="signup-input-group">
                        <label>
                            Email / Số điện thoại di động <span className="signup-required">*</span>
                        </label>
                        <input type="text" className="signup-form-input" name="emailOrPhone" value={form.emailOrPhone} onChange={handleChange} />
                        {errors.emailOrPhone && <div className="signup-error">{errors.emailOrPhone}</div>}
                    </div>

                    <div className="signup-input-group">
                        <label>
                            Mật khẩu <span className="signup-required">*</span>
                        </label>
                        <div className="signup-password-input">
                            <input type={showPassword ? "text" : "password"} className="signup-form-input" name="password" value={form.password} onChange={handleChange} />
                            <button type="button" className="signup-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <div className="signup-error">{errors.password}</div>}
                    </div>

                    <div className="signup-input-group">
                        <label>
                            Nhập lại mật khẩu <span className="signup-required">*</span>
                        </label>
                        <div className="signup-password-input">
                            <input type={showConfirmPassword ? "text" : "password"} className="signup-form-input" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
                            <button type="button" className="signup-password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.confirmPassword && <div className="signup-error">{errors.confirmPassword}</div>}
                    </div>

                    {/* <div className="signup-captcha">
                    <div className="signup-captcha-checkbox">
                        <input type="checkbox" id="signup-captcha" name="captcha" checked={form.captcha} onChange={handleChange} />
                        <label htmlFor="signup-captcha">Tôi không phải là người máy</label>
                    </div>
                    {errors.captcha && <div className="signup-error">{errors.captcha}</div>}
                    <div className="signup-captcha-logo">
                        <span>reCAPTCHA</span>
                        <div className="signup-captcha-links">
                            <small>Bảo mật - Điều khoản</small>
                        </div>
                    </div>
                </div> */}

                    <button type="submit" className="signup-submit-button">
                        Đăng ký
                    </button>

                    <div className="signup-divider">
                        <span>Hoặc</span>
                    </div>

                    <div className="signup-social-buttons">
                        <button type="button" className="signup-social-button signup-facebook">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                        </button>
                        <button type="button" className="signup-social-button signup-google">
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                    </div>

                    <div className="signup-terms">
                        <p>
                            Bằng cách đăng ký, Quý khách đồng ý tất cả{" "}
                            <a href="#" className="signup-link">
                                điều kiện & điều khoản
                            </a>{" "}
                            của DTravel
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignUpForm;
