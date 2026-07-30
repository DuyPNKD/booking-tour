import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Form, Input, Button, message, Typography} from "antd";
import {UserOutlined, LockOutlined, CompassOutlined} from "@ant-design/icons";
import axios from "axios";
import "./AdminLoginPage.css";

const {Title, Text} = Typography;

const AdminLoginPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        const {email, password} = values;
        setLoading(true);
        try {
            const API_BASE = import.meta.env.VITE_API_BASE || "";
            const response = await axios.post(`${API_BASE}/api/admin/login`, {email, password});
            
            if (response.data?.access_token) {
                localStorage.setItem("adminToken", response.data.access_token);
                message.success(`Chào mừng quay trở lại, ${response.data.user?.name || "Admin"}!`);
                navigate("/admin/dashboard");
            } else {
                message.error("Đăng nhập thất bại!");
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Đăng nhập thất bại!";
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-card-glass">
                <div className="admin-logo-wrapper">
                    <div className="admin-logo-icon">
                        <CompassOutlined />
                    </div>
                </div>
                
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <Title level={4} style={{ margin: 0, fontWeight: 700, color: "#1f1f1f" }}>
                        DTravel Admin
                    </Title>
                    <Text type="secondary" style={{ fontSize: "13px" }}>
                        Đăng nhập hệ thống quản lý đặt tour
                    </Text>
                </div>

                <Form
                    name="admin_login"
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập Email!" },
                            { type: "email", message: "Email không hợp lệ!" }
                        ]}
                    >
                        <Input 
                            prefix={<UserOutlined style={{ color: "#bfbfbf" }} />} 
                            placeholder="Nhập email tài khoản" 
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: "Vui lòng nhập Mật khẩu!" },
                            { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" }
                        ]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined style={{ color: "#bfbfbf" }} />} 
                            placeholder="Nhập mật khẩu" 
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={loading} 
                            block
                            style={{ 
                                height: "46px", 
                                borderRadius: "8px", 
                                fontWeight: 600,
                                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                                border: "none"
                            }}
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default AdminLoginPage;
