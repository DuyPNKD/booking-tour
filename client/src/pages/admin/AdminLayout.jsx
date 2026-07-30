import React, {useState} from "react";
import {Outlet, NavLink, useNavigate, useLocation} from "react-router-dom";
import {Drawer, Button} from "antd";
import {MenuOutlined} from "@ant-design/icons";
import axios from "axios";
import { adminApi } from "../../utils/adminApi";
import "./admin.css";

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [drawerVisible, setDrawerVisible] = useState(false);

    const handleLogout = async () => {
        try {
            await adminApi.post("/logout");
        } catch (err) {
            console.error("Logout error", err);
        } finally {
            localStorage.removeItem("adminToken");
            navigate("/admin/login");
        }
    };

    const navLinks = [
        { to: "/admin/dashboard", icon: "fa-gauge", label: "Dashboard", end: true },
        { to: "/admin/tours", icon: "fa-map-location-dot", label: "Quản lý Tour" },
        { to: "/admin/topics", icon: "fa-receipt", label: "Quản lý Chủ đề" },
        { to: "/admin/blog", icon: "fa-receipt", label: "Quản lý Bài viết" },
        { to: "/admin/orders", icon: "fa-receipt", label: "Quản lý Đơn hàng" },
        { to: "/admin/users", icon: "fa-users", label: "Quản lý Người dùng" },
    ];

    const renderNavItems = (onItemClick = null) => (
        <ul className="nav nav-pills flex-column mb-auto">
            {navLinks.map((link) => (
                <li key={link.to}>
                    <NavLink 
                        end={link.end} 
                        to={link.to} 
                        className="nav-link" 
                        onClick={() => onItemClick && onItemClick()}
                    >
                        <i className={`fa-solid ${link.icon} me-2`}></i> {link.label}
                    </NavLink>
                </li>
            ))}
        </ul>
    );

    return (
        <div className="admin-wrapper d-flex">
            {/* Desktop Sidebar (Hidden on mobile) */}
            <aside className="admin-sidebar d-flex flex-column p-3 d-none d-lg-flex">
                <div className="d-flex align-items-center mb-4 ps-3">
                    <i className="fa-solid fa-suitcase-rolling me-2 text-primary"></i>
                    <span className="fw-bold">DTravel Admin</span>
                </div>
                {renderNavItems()}
                <hr />
                <button className="btn btn-outline-primary w-100" onClick={handleLogout}>
                    <i className="fa-solid fa-right-from-bracket me-2"></i> Đăng xuất
                </button>
            </aside>

            {/* Mobile Navigation Drawer */}
            <Drawer
                title={
                    <div className="d-flex align-items-center">
                        <i className="fa-solid fa-suitcase-rolling me-2 text-primary"></i>
                        <span className="fw-bold">DTravel Admin</span>
                    </div>
                }
                placement="left"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                width={280}
                styles={{ body: { padding: "16px" } }}
            >
                <div className="d-flex flex-column h-100 justify-content-between">
                    <div>
                        {renderNavItems(() => setDrawerVisible(false))}
                    </div>
                    <div>
                        <hr />
                        <button className="btn btn-outline-primary w-100" onClick={() => { setDrawerVisible(false); handleLogout(); }}>
                            <i className="fa-solid fa-right-from-bracket me-2"></i> Đăng xuất
                        </button>
                    </div>
                </div>
            </Drawer>

            <div className="admin-content flex-grow-1">
                {/* Topbar with Drawer Trigger for Mobile */}
                <header className="admin-topbar d-flex align-items-center justify-content-between" style={{padding: "16px 24px"}}>
                    <div className="d-flex align-items-center">
                        <Button 
                            type="text" 
                            icon={<MenuOutlined />} 
                            onClick={() => setDrawerVisible(true)} 
                            className="d-lg-none me-3"
                            style={{ fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}
                        />
                        <form className="d-none d-md-flex align-items-center admin-search">
                            <span className="me-2 text-muted">
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </span>
                            <input className="form-control" placeholder="Tìm kiếm..." />
                        </form>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-link position-relative text-muted">
                            <i className="fa-regular fa-bell"></i>
                            <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle p-1"></span>
                        </button>
                        <div className="d-flex align-items-center">
                            <img src="/default-avatar.jpg" alt="admin" className="rounded-circle" width="36" height="36" />
                        </div>
                    </div>
                </header>

                <main className="p-3 p-md-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
