// src/pages/auth/forgotPassword/ForgotPasswordSuccess.jsx
import {useNavigate} from "react-router-dom";
import "./ForgotPasswordSuccess.css";

function ForgotPasswordSuccess() {
    const navigate = useNavigate();

    return (
        <div className="forgot-success-bg">
            <div className="forgot-success-container">
                {/* Main Heading */}
                <h2 className="success-heading">Đặt lại mật khẩu</h2>

                {/* Success Message */}
                <div className="success-message">
                    <p>Hệ thống đã gửi link lấy lại mật khẩu đến email của Quý khách!</p>
                    <p>Trong vòng 5 phút vẫn chưa nhận được mail, Quý khách vui lòng thử lại bước này.</p>
                </div>

                {/* Continue Button */}
                <button onClick={() => navigate("/auth/login?step=signin")} className="success-continue-button">
                    Trở về đăng nhập
                </button>
            </div>
        </div>
    );
}

export default ForgotPasswordSuccess;
