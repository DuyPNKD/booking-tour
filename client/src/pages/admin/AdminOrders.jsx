import React, {useMemo, useState} from "react";

const sampleOrders = [
    { id: "ODR-00123", customer: "Nguyễn Văn A", tour: "Hà Giang 3N2Đ", startDate: "2025-10-05", total: 3990000, status: "Paid" },
    { id: "ODR-00124", customer: "Trần Thị B", tour: "Đà Nẵng 4N3Đ", startDate: "2025-10-10", total: 5490000, status: "Pending" },
    { id: "ODR-00125", customer: "Lê Minh C", tour: "Phú Quốc 3N2Đ", startDate: "2025-10-15", total: 4990000, status: "Cancelled" },
    { id: "ODR-00126", customer: "Phạm Thu D", tour: "Ninh Thuận 2N1Đ", startDate: "2025-10-20", total: 2990000, status: "Paid" },
];

const formatVnd = (v) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

const statusBadge = (s) => {
    if (s === "Paid") return "bg-success";
    if (s === "Pending") return "bg-warning text-dark";
    return "bg-danger";
};

const AdminOrders = () => {
    const [orders] = useState(sampleOrders);
    const [status, setStatus] = useState("All");
    const [selected, setSelected] = useState(null);

    const filtered = useMemo(() => {
        if (status === "All") return orders;
        return orders.filter(o => o.status === status);
    }, [orders, status]);

    const openDetail = (order) => setSelected(order);
    const closeDetail = () => setSelected(null);

    return (
        <div className="container-fluid">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-2 mb-3">
                <h5 className="mb-0">Quản lý Đơn hàng</h5>
                <div className="d-flex align-items-center gap-2">
                    <label className="text-muted small">Trạng thái</label>
                    <select className="form-select" style={{minWidth: 160}} value={status} onChange={(e)=>setStatus(e.target.value)}>
                        <option>All</option>
                        <option>Pending</option>
                        <option>Paid</option>
                        <option>Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Tour</th>
                                <th>Ngày khởi hành</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(o => (
                                <tr key={o.id} role="button" onClick={()=>openDetail(o)}>
                                    <td className="fw-medium">{o.id}</td>
                                    <td>{o.customer}</td>
                                    <td>{o.tour}</td>
                                    <td>{o.startDate}</td>
                                    <td>{formatVnd(o.total)}</td>
                                    <td><span className={`badge ${statusBadge(o.status)}`}>{o.status}</span></td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted py-4">Không có đơn hàng</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            <div className={`modal fade ${selected ? "show d-block" : ""}`} tabIndex="-1" role="dialog" style={{background: selected ? "rgba(0,0,0,.5)" : "transparent"}}>
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h6 className="modal-title mb-0">Chi tiết đơn hàng</h6>
                            <button type="button" className="btn-close" onClick={closeDetail}></button>
                        </div>
                        {selected && (
                            <div className="modal-body">
                                <div className="row g-3">
                                    <div className="col-12 col-md-6">
                                        <div className="text-muted small">Mã đơn</div>
                                        <div className="fw-semibold">{selected.id}</div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="text-muted small">Trạng thái</div>
                                        <div><span className={`badge ${statusBadge(selected.status)}`}>{selected.status}</span></div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="text-muted small">Khách hàng</div>
                                        <div>{selected.customer}</div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="text-muted small">Tour</div>
                                        <div>{selected.tour}</div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="text-muted small">Ngày khởi hành</div>
                                        <div>{selected.startDate}</div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="text-muted small">Tổng tiền</div>
                                        <div className="fw-semibold">{formatVnd(selected.total)}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={closeDetail}>Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;


