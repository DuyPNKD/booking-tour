import React from "react";
import {Outlet, NavLink, useNavigate, useLocation} from "react-router-dom";
import "./admin.css";

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await axios.post("/api/logout", {}, {withCredentials: true}); // clear cookie / refresh token ở server
        } catch (err) {
            console.error("Logout error", err);
        } finally {
            localStorage.removeItem("adminToken");
            navigate("/admin/login");
        }
    };

    return (
        <div className="admin-wrapper d-flex">
            <aside className="admin-sidebar d-flex flex-column p-3">
                <div className="d-flex align-items-center mb-4 ps-3">
                    <i className="fa-solid fa-suitcase-rolling me-2 text-primary"></i>
                    <span className="fw-bold">DTravel Admin</span>
                </div>
                <ul className="nav nav-pills flex-column mb-auto">
                    <li className="nav-item">
                        <NavLink end to="/admin/dashboard" className="nav-link">
                            <i className="fa-solid fa-gauge me-2"></i> Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/tours" className="nav-link">
                            <i className="fa-solid fa-map-location-dot me-2"></i> Quản lý Tour
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/topics" className="nav-link">
                            <i className="fa-solid fa-receipt me-2"></i> Quản lý Chủ đề
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/blog" className="nav-link">
                            <i className="fa-solid fa-receipt me-2"></i> Quản lý Bài viết
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/orders" className="nav-link">
                            <i className="fa-solid fa-receipt me-2"></i> Quản lý Đơn hàng
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/users" className="nav-link">
                            <i className="fa-solid fa-users me-2"></i> Quản lý Người dùng
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/reports" className="nav-link">
                            <i className="fa-solid fa-chart-line me-2"></i> Báo cáo
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/settings" className="nav-link">
                            <i className="fa-solid fa-gear me-2"></i> Cài đặt
                        </NavLink>
                    </li>
                </ul>
                <hr />
                <button className="btn btn-outline-primary w-100" onClick={handleLogout}>
                    <i className="fa-solid fa-right-from-bracket me-2"></i> Đăng xuất
                </button>
            </aside>

            <div className="admin-content flex-grow-1">
                <header className="admin-topbar d-flex align-items-center justify-content-between" style={{padding: "16px 36px"}}>
                    <form className="d-none d-md-flex align-items-center admin-search">
                        <span className="me-2 text-muted">
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </span>
                        <input className="form-control" placeholder="Tìm kiếm..." />
                    </form>
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
