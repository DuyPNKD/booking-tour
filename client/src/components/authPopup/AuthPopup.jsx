import React from "react";
import {Link} from "react-router-dom";
import "./AuthPopup.css";

const AuthPopup = ({onClose}) => (
    <>
        <div className="auth-popup-overlay" onClick={onClose}></div>
        <div className="auth-popup">
            <div className="auth-popup-arrow" />
            <button className="auth-popup-register">Đăng ký</button>
            <div className="auth-popup-text">
                Quý khách đã có tài khoản?
                <br />
                <Link to="/login" className="auth-popup-login-link">
                    Đăng nhập ngay
                </Link>
            </div>
        </div>
    </>
);

export default AuthPopup;
