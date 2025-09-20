import React, {useMemo, useState} from "react";

const makeDays = () => {
    // build last 14 days sample
    const today = new Date();
    const days = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const orders = Math.floor(Math.random() * 20) + 5; // 5..24
        const revenue = orders * (Math.floor(Math.random() * 500000) + 500000); // ~ VND
        const newUsers = Math.floor(Math.random() * 15); // 0..14
        days.push({ date: dateStr, orders, revenue, newUsers });
    }
    return days;
};

const formatVnd = (v) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

const AdminReports = () => {
    const [data] = useState(makeDays());
    const [from, setFrom] = useState(data[0]?.date || "");
    const [to, setTo] = useState(data[data.length - 1]?.date || "");
    const [type, setType] = useState("Doanh thu");

    const filtered = useMemo(() => {
        return data.filter(d => (!from || d.date >= from) && (!to || d.date <= to));
    }, [data, from, to]);

    const totals = useMemo(() => {
        const revenue = filtered.reduce((s, d) => s + d.revenue, 0);
        const orders = filtered.reduce((s, d) => s + d.orders, 0);
        const newUsers = filtered.reduce((s, d) => s + d.newUsers, 0);
        return { revenue, orders, newUsers };
    }, [filtered]);

    // Chart dimensions
    const width = 900;
    const height = 260;
    const padding = 40;

    const chart = useMemo(() => {
        const points = filtered.map((d, idx) => ({
            x: idx,
            y: type === "Doanh thu" ? d.revenue : type === "Số tour đã bán" ? d.orders : d.newUsers,
            label: d.date,
        }));
        const n = Math.max(1, points.length - 1);
        const minY = Math.min(...points.map(p => p.y), 0);
        const maxY = Math.max(...points.map(p => p.y), 1);
        const scaleX = (x) => padding + (x / n) * (width - padding * 2);
        const scaleY = (y) => height - padding - ((y - minY) / (maxY - minY || 1)) * (height - padding * 2);
        const dPath = points.map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(p.x)},${scaleY(p.y)}`).join(" ");
        return { points, dPath, scaleX, scaleY, minY, maxY };
    }, [filtered, type]);

    return (
        <div className="container-fluid">
            {/* Filters */}
            <div className="row g-3 align-items-end mb-3">
                <div className="col-12 col-md-3">
                    <label className="form-label">Từ ngày</label>
                    <input type="date" className="form-control" value={from} onChange={(e)=>setFrom(e.target.value)} />
                </div>
                <div className="col-12 col-md-3">
                    <label className="form-label">Đến ngày</label>
                    <input type="date" className="form-control" value={to} onChange={(e)=>setTo(e.target.value)} />
                </div>
                <div className="col-12 col-md-3">
                    <label className="form-label">Loại báo cáo</label>
                    <select className="form-select" value={type} onChange={(e)=>setType(e.target.value)}>
                        <option>Doanh thu</option>
                        <option>Số tour đã bán</option>
                        <option>Số người dùng mới</option>
                    </select>
                </div>
                <div className="col-12 col-md-3 d-flex gap-2">
                    <button className="btn btn-outline-secondary flex-grow-1" onClick={()=>{setFrom(data[0]?.date||""); setTo(data[data.length-1]?.date||"");}}>Reset</button>
                    <button className="btn btn-primary flex-grow-1" onClick={()=>{ /* placeholder apply */ }}>Áp dụng</button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="row g-3 mb-3">
                <div className="col-12 col-md-4">
                    <div className="card admin-card h-100">
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted small">Tổng doanh thu</div>
                                <div className="h5 mb-0 fw-bold">{formatVnd(totals.revenue)}</div>
                            </div>
                            <div className="admin-icon bg-primary"><i className="fa-solid fa-sack-dollar"></i></div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="card admin-card h-100">
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted small">Tổng số tour đã bán</div>
                                <div className="h5 mb-0 fw-bold">{totals.orders}</div>
                            </div>
                            <div className="admin-icon bg-success"><i className="fa-solid fa-ticket"></i></div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="card admin-card h-100">
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted small">Số lượng user mới</div>
                                <div className="h5 mb-0 fw-bold">{totals.newUsers}</div>
                            </div>
                            <div className="admin-icon bg-info"><i className="fa-solid fa-user-plus"></i></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="card mb-3">
                <div className="card-header fw-semibold">{type} theo ngày</div>
                <div className="card-body">
                    <div className="overflow-auto">
                        <svg width={width} height={height} role="img">
                            {/* Axes */}
                            <line x1={40} y1={height-40} x2={width-20} y2={height-40} stroke="#e6eaf0" />
                            <line x1={40} y1={20} x2={40} y2={height-40} stroke="#e6eaf0" />
                            {/* Path */}
                            <path d={chart.dPath} fill="none" stroke="#0d6efd" strokeWidth="2" />
                            {/* Points */}
                            {chart.points.map((p, i) => (
                                <circle key={i} cx={chart.scaleX(p.x)} cy={chart.scaleY(p.y)} r="3" fill="#0d6efd" />
                            ))}
                        </svg>
                    </div>
                </div>
            </div>

            {/* Details table */}
            <div className="card">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Ngày</th>
                                <th>Số đơn hàng</th>
                                <th>Doanh thu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(d => (
                                <tr key={d.date}>
                                    <td className="text-muted">{d.date}</td>
                                    <td className="fw-medium">{d.orders}</td>
                                    <td>{formatVnd(d.revenue)}</td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center text-muted py-4">Không có dữ liệu</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;


