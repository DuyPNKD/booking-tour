import React, {useState} from "react";
import {ArrowLeft} from "lucide-react";
import {useNavigate} from "react-router-dom";
import "./ForgotPasswordForm.css";
import BackButton from "../../../components/backButton/BackButton";

function ForgotPasswordForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const validate = () => {
        if (!email.trim()) return "Vui lòng nhập email";
        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email)) return "Email không hợp lệ";
        return "";
    };

    const handleChange = (e) => {
        setEmail(e.target.value);
        if (error) {
            setTimeout(() => setError(""), 400);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const err = validate();
        setError(err);
        if (!err) {
            // Xử lý gửi yêu cầu quên mật khẩu ở đây
            alert("Yêu cầu thành công!");
        }
    };

    return (
        <div className="forgot-bg">
            <div className="forgot-form-container">
                <div className="forgot-form-header">
                    <BackButton />
                    <h2>Quên mật khẩu</h2>
                </div>

                <div className="forgot-form-description">
                    <p>Vui lòng nhập email Quý khách đã đăng ký với DTravel</p>
                </div>

                <style>{`
                .forgot-error {
                    color: #e53935;
                    font-size: 0.95em;
                    margin-top: 4px;
                }
            `}</style>

                <form className="forgot-auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="forgot-input-group">
                        <label>Email</label>
                        <input type="email" placeholder="" className="forgot-form-input" value={email} onChange={handleChange} name="email" />
                        {error && <div className="forgot-error">{error}</div>}
                    </div>

                    <div className="forgot-captcha">
                        <div className="forgot-captcha-checkbox">
                            <input type="checkbox" id="forgot-captcha" />
                            <label htmlFor="forgot-captcha">Tôi không phải là người máy</label>
                        </div>
                        <div className="forgot-captcha-logo">
                            <span>reCAPTCHA</span>
                            <div className="forgot-captcha-links">
                                <small>Bảo mật - Điều khoản</small>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="forgot-submit-button">
                        Kích hoạt lại mật khẩu
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ForgotPasswordForm;
