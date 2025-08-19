import React from "react";
import {Outlet, useNavigate, useLocation} from "react-router-dom";
import "./DashboardLayout.css";

const menu = [
    {label: "Kỳ nghỉ của tôi", icon: "fa-file", path: "/dashboard/trips"},
    {label: "Voucher của tôi", icon: "fa-ticket", path: "/dashboard/voucher"},
    {label: "Hồ sơ của tôi", icon: "fa-user", path: "/dashboard/profile"},
];

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="dashboard-bg">
            <div className="dashboard-container">
                <div className="dashboard-sidebar">
                    {menu.map((item) => (
                        <div key={item.label} className={`dashboard-sidebar-item${location.pathname === item.path ? " active" : ""}`} onClick={() => navigate(item.path)}>
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
