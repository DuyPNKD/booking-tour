import React, {useState} from "react";

import "./VerifyCodeForm.css";
import BackButton from "../../../components/backButton/BackButton";

function VerifyCodeForm() {
    const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);

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

    return (
        <div className="verify-bg">
            <div className="verify-form-container">
                <div className="verify-form-header">
                    <BackButton />
                    <h2>Nhập mã xác minh</h2>
                </div>

                <div className="verify-form-description">
                    <p>
                        Vui lòng nhập mã xác minh DTravel đã gửi đến <strong>khanhpham2004zx@gmail.com</strong>
                    </p>
                </div>

                <div className="verify-auth-form">
                    <div className="verify-verification-code">
                        {verificationCode.map((digit, index) => (
                            <input key={index} data-index={index} type="text" maxLength="1" value={digit} onChange={(e) => handleCodeChange(index, e.target.value)} className="verify-code-input" />
                        ))}
                    </div>

                    <div className="verify-resend-code">
                        <p>
                            Quý khách vẫn chưa nhận được?{" "}
                            <button type="button" className="verify-link-button">
                                Bấm để gửi lại
                            </button>
                        </p>
                    </div>

                    <button type="submit" className="verify-submit-button">
                        Xác minh
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VerifyCodeForm;
