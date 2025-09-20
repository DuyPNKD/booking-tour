import React from "react";

const statCards = [
    { key: "tours", title: "Tổng số tour", value: "128", icon: "fa-map", variant: "primary" },
    { key: "orders", title: "Tổng số đơn hàng", value: "342", icon: "fa-bag-shopping", variant: "info" },
    { key: "users", title: "Tổng số người dùng", value: "5,642", icon: "fa-users", variant: "success" },
    { key: "revenue", title: "Doanh thu", value: "₫ 1.25B", icon: "fa-sack-dollar", variant: "warning" },
];

const recentOrders = [
    { id: "ODR-00123", tour: "Hà Giang 3N2Đ", customer: "Nguyễn Văn A", startDate: "2025-09-20", status: "Đã thanh toán" },
    { id: "ODR-00124", tour: "Đà Nẵng 4N3Đ", customer: "Trần Thị B", startDate: "2025-09-22", status: "Chờ xác nhận" },
    { id: "ODR-00125", tour: "Phú Quốc 3N2Đ", customer: "Lê Minh C", startDate: "2025-09-25", status: "Đang xử lý" },
    { id: "ODR-00126", tour: "Ninh Thuận 2N1Đ", customer: "Phạm Thu D", startDate: "2025-09-26", status: "Đã hủy" },
];

const AdminDashboard = () => {
    return (
        <div className="container-fluid">
            <div className="row g-3 mb-3">
                {statCards.map((c) => (
                    <div className="col-12 col-sm-6 col-xl-3" key={c.key}>
                        <div className="card admin-card h-100">
                            <div className="card-body d-flex align-items-center justify-content-between">
                                <div>
                                    <div className="text-muted small">{c.title}</div>
                                    <div className="h4 mb-0 fw-bold">{c.value}</div>
                                </div>
                                <div className={`admin-icon bg-${c.variant}`}>
                                    <i className={`fa-solid ${c.icon}`}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <span className="fw-semibold">Đơn hàng gần đây</span>
                    <button className="btn btn-sm btn-outline-primary">Xem tất cả</button>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Mã đơn</th>
                                <th>Tên tour</th>
                                <th>Khách hàng</th>
                                <th>Ngày khởi hành</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((o) => (
                                <tr key={o.id}>
                                    <td className="fw-medium">{o.id}</td>
                                    <td>{o.tour}</td>
                                    <td>{o.customer}</td>
                                    <td>{o.startDate}</td>
                                    <td>
                                        <span className={`badge ${
                                            o.status === "Đã thanh toán" ? "bg-success" :
                                            o.status === "Chờ xác nhận" ? "bg-warning text-dark" :
                                            o.status === "Đã hủy" ? "bg-danger" : "bg-info text-dark"
                                        }`}>
                                            {o.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;


