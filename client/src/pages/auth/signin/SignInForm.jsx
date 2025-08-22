import React, {useState, useEffect} from "react";
import {Eye, EyeOff, ArrowLeft} from "lucide-react";
import {Link, useNavigate, useLocation} from "react-router-dom";
import "./SignInForm.css";
import BackButton from "../../../components/backButton/BackButton";
import {useAuth} from "../../../context/AuthContext";

function SignInForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const {login} = useAuth(); // Lấy hàm login từ context
    const [showPassword, setShowPassword] = useState(false);

    // State cho form và lỗi
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [errorTimeouts, setErrorTimeouts] = useState({});

    // Khi mount, nếu có state, điền vào form và xóa state
    useEffect(() => {
        // Nếu có state truyền sang (từ reset password)
        if (location.state?.email || location.state?.password) {
            setForm((prev) => ({
                ...prev,
                email: location.state.email || "",
                password: location.state.password || "",
            }));
            // Xóa state để tránh lộ khi back
            navigate(location.pathname + location.search, {replace: true, state: {}});
        }
    }, [location, navigate]);

    // Validate
    const validate = () => {
        const newErrors = {};
        if (!form.email.trim()) {
            newErrors.email = "Vui lòng nhập email hoặc số điện thoại";
        } else if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)@([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,}|(\+?\d{9,13}))$/.test(form.email)) {
            newErrors.email = "Email hoặc số điện thoại không hợp lệ";
        }
        if (!form.password) {
            newErrors.password = "Vui lòng nhập mật khẩu";
        }
        return newErrors;
    };

    // handleChange có xóa lỗi
    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            if (errorTimeouts[name]) {
                clearTimeout(errorTimeouts[name]);
            }
            const timeoutId = setTimeout(() => {
                setErrors((prev) => ({
                    ...prev,
                    [name]: undefined,
                }));
            }, 400);
            setErrorTimeouts((prev) => ({
                ...prev,
                [name]: timeoutId,
            }));
        }
    };

    // handle submit
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email: form.email, password: form.password}),
            });

            if (!res.ok) throw new Error("Đăng nhập thất bại");

            const data = await res.json();
            login(data.token, data.user); // Lưu token và user vào context
            navigate("/"); // Chuyển sang trang chính sau khi đăng nhập thành công
            alert("Đăng nhập thành công!");
        } catch (err) {
            console.error(err);
            alert("Sai email hoặc mật khẩu!");
        }
    };

    return (
        <div className="signin-bg">
            <div className="signin-form-container">
                <div className="signin-form-header">
                    <BackButton />
                    <h2>Đăng nhập</h2>
                </div>

                <form className="signin-auth-form" onSubmit={handleLogin} noValidate>
                    <div className="signin-input-group">
                        <label>Email / Số điện thoại di động</label>
                        <input type="text" name="email" value={form.email} onChange={handleChange} className="signin-form-input" />
                        {errors.email && <div className="signin-error">{errors.email}</div>}
                    </div>

                    <div className="signin-input-group">
                        <label>Mật khẩu</label>
                        <div className="signin-password-input">
                            <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} className="signin-form-input" />
                            <button type="button" className="signin-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <div className="signin-error">{errors.password}</div>}
                    </div>

                    <div className="signin-form-links">
                        <Link to="/auth/login?step=forgot-password" className="signin-link-button">
                            Quên mật khẩu?
                        </Link>
                    </div>

                    <button type="submit" className="signin-submit-button">
                        Đăng nhập
                    </button>

                    <div className="signin-divider">
                        <span>Hoặc</span>
                    </div>

                    <div className="signin-social-buttons">
                        <button type="button" className="signin-social-button signin-facebook">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                        </button>
                        <button type="button" className="signin-social-button signin-google">
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                    </div>
                </form>
                <div className="signin-terms">
                    <p>
                        Nếu bạn chưa có tài khoản,{" "}
                        <button className="signin-link" onClick={() => navigate("/auth/login?step=signup")}>
                            đăng ký ngay
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignInForm;
