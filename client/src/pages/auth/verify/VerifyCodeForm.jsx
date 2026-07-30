import React, {useState} from "react";
import {useNavigate, useLocation, useSearchParams} from "react-router-dom"; // 👈 cần để nhận email từ trang trước
import "./VerifyCodeForm.css";
import BackButton from "../../../components/backButton/BackButton";
import {useAuth} from "../../../context/AuthContext";

function VerifyCodeForm() {
    const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const email = searchParams.get("email") || "";
    const {login} = useAuth(); // Lấy hàm setUser từ context

    const handleCodeChange = (index, value) => {
        if (value.length <= 1) {
            const newCode = [...verificationCode];
            newCode[index] = value;
            setVerificationCode(newCode);

            // Auto focus next input
            if (value && index < 5) {
                const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
                if (nextInput) nextInput.focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = verificationCode.join("");
        console.log("Email: ", email, " Code: ", code);

        try {
            const API_BASE = import.meta.env.VITE_API_BASE || "";
            const res = await fetch(`${API_BASE}/api/auth/verify`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, code}),
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("Server error:", data);
                throw new Error("Xác minh thất bại");
            }

            // ✅ login sau khi verify thành công
            login(data.token, data.user);

            alert("Xác thực thành công!");
            navigate("/");
        } catch (err) {
            console.error(err);
            alert("Mã xác thực không đúng hoặc đã hết hạn!");
        }
    };

    const handleResend = async () => {
        try {
            const API_BASE = import.meta.env.VITE_API_BASE || "";
            const res = await fetch(`${API_BASE}/api/auth/resend-otp`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email}),
            });

            const data = await res.json();
            alert(data.message || "Đã gửi lại mã!");
        } catch (err) {
            console.error(err);
            alert("Không gửi lại được mã!");
        }
    };

    return (
        <div className="verify-bg">
            <div className="verify-form-container">
                <div className="verify-form-header">
                    <BackButton />
                    <h2>Nhập mã xác minh</h2>
                </div>

                <div className="verify-form-description">
                    <p>
                        Vui lòng nhập mã xác minh DTravel đã gửi đến <strong>{email}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="verify-auth-form">
                    <div className="verify-verification-code">
                        {verificationCode.map((digit, index) => (
                            <input
                                key={index}
                                data-index={index}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                className="verify-code-input"
                            />
                        ))}
                    </div>

                    <div className="verify-resend-code">
                        <p>
                            Quý khách vẫn chưa nhận được?{" "}
                            <button type="button" onClick={handleResend} className="verify-link-button">
                                Bấm để gửi lại
                            </button>
                        </p>
                    </div>

                    <button type="submit" className="verify-submit-button">
                        Xác minh
                    </button>
                </form>
            </div>
        </div>
    );
}

export default VerifyCodeForm;
