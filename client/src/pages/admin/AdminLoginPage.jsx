import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import "./AdminLoginPage.css";

const AdminLoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Vui lòng nhập email và mật khẩu");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post("http://localhost:3000/api/admin/login", {email, password});
            console.log(response.data);
            // BE trả: { access_token, user }
            if (response.data?.access_token) {
                localStorage.setItem("adminToken", response.data.access_token);
                alert(`Đăng nhập thành công! Chào mừng bạn trở lại, ${response.data.user?.name || "Admin"}`);
                navigate("/admin/dashboard");
            } else {
                setError("Đăng nhập thất bại!");
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Đăng nhập thất bại!";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-card">
                <h3 className="admin-title">Đăng nhập Admin</h3>

                {error && <div className="admin-alert admin-alert-error">{error}</div>}

                <form className="admin-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;
