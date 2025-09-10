import React from "react";
import {Outlet, useNavigate, useLocation} from "react-router-dom";
import "./DashboardLayout.css";
import {useAuth} from "../../context/AuthContext";

const menu = [
    {label: "Kỳ nghỉ của tôi", icon: "fa-file", path: "/dashboard/trips"},
    {label: "Voucher của tôi", icon: "fa-ticket", path: "/dashboard/voucher"},
    {label: "Hồ sơ của tôi", icon: "fa-user", path: "/dashboard/profile"},
];

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const {user} = useAuth();

    return (
        <div className="dashboard-bg">
            <div className="dashboard-container">
                <div className="dashboard-sidebar">
                    {/* User info item */}
                    <div className="dashboard-sidebar-item dashboard-user-item" onClick={() => navigate("/dashboard/profile")}>
                        {(() => {
                            const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
                            const avatarSrc = user?.picture
                                ? user.picture.startsWith("/")
                                    ? API_BASE + user.picture
                                    : user.picture
                                : "/default-avatar.jpg";
                            return <img className="dashboard-user-avatar" src={avatarSrc} alt={user?.name || "User"} />;
                        })()}
                        <div className="dashboard-user-texts">
                            <span className="dashboard-user-name">{user?.name || "Người dùng"}</span>
                            <span className="dashboard-user-email">{user?.email || "Chưa cập nhật email"}</span>
                        </div>
                    </div>
                    {menu.map((item) => (
                        <div
                            key={item.label}
                            className={`dashboard-sidebar-item${location.pathname === item.path ? " active" : ""}`}
                            onClick={() => navigate(item.path)}
                        >
                            <i className={`fa ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
                <div className="dashboard-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
