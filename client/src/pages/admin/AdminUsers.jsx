import React, {useMemo, useState} from "react";

const initialUsers = [
    {id: 1, name: "Nguyễn Văn A", email: "a@example.com", role: "user", createdAt: "2025-08-01", status: "Active"},
    {id: 2, name: "Trần Thị B", email: "b@example.com", role: "admin", createdAt: "2025-08-10", status: "Active"},
    {id: 3, name: "Lê Minh C", email: "c@example.com", role: "user", createdAt: "2025-09-05", status: "Locked"},
    {id: 4, name: "Phạm Thu D", email: "d@example.com", role: "user", createdAt: "2025-09-10", status: "Active"},
    {id: 5, name: "Hoàng E", email: "e@example.com", role: "user", createdAt: "2025-09-12", status: "Active"},
    {id: 6, name: "Mai F", email: "f@example.com", role: "user", createdAt: "2025-09-13", status: "Locked"},
    {id: 7, name: "Vũ G", email: "g@example.com", role: "admin", createdAt: "2025-09-14", status: "Active"},
    {id: 8, name: "Đặng H", email: "h@example.com", role: "user", createdAt: "2025-09-15", status: "Active"},
    {id: 9, name: "Ngô I", email: "i@example.com", role: "user", createdAt: "2025-09-16", status: "Active"},
    {id: 10, name: "Phan J", email: "j@example.com", role: "user", createdAt: "2025-09-17", status: "Active"},
    {id: 11, name: "Tô K", email: "k@example.com", role: "user", createdAt: "2025-09-18", status: "Active"},
    {id: 12, name: "La L", email: "l@example.com", role: "user", createdAt: "2025-09-19", status: "Active"},
];

const AdminUsers = () => {
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", role: "user" });
    const [page, setPage] = useState(1);
    const pageSize = 6;

    const filtered = useMemo(() => {
        const s = search.trim().toLowerCase();
        if (!s) return users;
        return users.filter(u =>
            u.name.toLowerCase().includes(s) ||
            u.email.toLowerCase().includes(s) ||
            String(u.id).includes(s)
        );
    }, [search, users]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const current = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, page]);

    const openAdd = () => {
        setForm({ name: "", email: "", role: "user" });
        setShowModal(true);
    };
    const closeModal = () => setShowModal(false);

    const onChange = (e) => {
        const {name, value} = e.target;
        setForm(prev => ({...prev, [name]: value}));
    };

    const onAdd = (e) => {
        e.preventDefault();
        const nextId = (users[users.length - 1]?.id || 0) + 1;
        const newUser = { id: nextId, name: form.name, email: form.email, role: form.role, createdAt: new Date().toISOString().slice(0,10), status: "Active" };
        setUsers(prev => [newUser, ...prev]);
        setShowModal(false);
        setPage(1);
    };

    const toggleRole = (id) => {
        setUsers(prev => prev.map(u => u.id === id ? {...u, role: u.role === "admin" ? "user" : "admin"} : u));
    };

    const toggleLock = (id) => {
        setUsers(prev => prev.map(u => u.id === id ? {...u, status: u.status === "Locked" ? "Active" : "Locked"} : u));
    };

    const go = (p) => setPage(Math.min(Math.max(1, p), totalPages));

    return (
        <div className="container-fluid">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-2 mb-3">
                <h5 className="mb-0">Quản lý Người dùng</h5>
                <div className="d-flex gap-2">
                    <input className="form-control" placeholder="Tìm theo tên, email..." value={search} onChange={(e)=>{setSearch(e.target.value); setPage(1);}} />
                    <button className="btn btn-primary" onClick={openAdd}><i className="fa-solid fa-user-plus me-2"></i> Thêm user mới</button>
                </div>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Tên</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Ngày tạo</th>
                                <th>Trạng thái</th>
                                <th className="text-end">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {current.map(u => (
                                <tr key={u.id}>
                                    <td className="text-muted">{u.id}</td>
                                    <td className="fw-medium">{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`badge ${u.role === "admin" ? "bg-primary" : "bg-secondary"}`}>{u.role}</span>
                                    </td>
                                    <td>{u.createdAt}</td>
                                    <td>
                                        <span className={`badge ${u.status === "Active" ? "bg-success" : "bg-danger"}`}>{u.status}</span>
                                    </td>
                                    <td className="text-end">
                                        <div className="btn-group">
                                            <button className="btn btn-sm btn-outline-secondary" onClick={()=>toggleRole(u.id)}>
                                                <i className="fa-solid fa-rotate me-1"></i> Đổi role
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={()=>toggleLock(u.id)}>
                                                <i className="fa-solid fa-user-lock me-1"></i> {u.status === "Locked" ? "Mở khóa" : "Khóa"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {current.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-4">Không có người dùng</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="card-footer d-flex justify-content-between align-items-center">
                    <div className="text-muted small">Trang {page}/{totalPages} • Tổng {filtered.length} người dùng</div>
                    <ul className="pagination mb-0">
                        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                            <button className="page-link" onClick={()=>go(page-1)}>Prev</button>
                        </li>
                        {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
                            <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                                <button className="page-link" onClick={()=>go(p)}>{p}</button>
                            </li>
                        ))}
                        <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                            <button className="page-link" onClick={()=>go(page+1)}>Next</button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Add User Modal */}
            <div className={`modal fade ${showModal ? "show d-block" : ""}`} tabIndex="-1" role="dialog" style={{background: showModal ? "rgba(0,0,0,.5)" : "transparent"}}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h6 className="modal-title mb-0">Thêm user mới</h6>
                            <button type="button" className="btn-close" onClick={closeModal}></button>
                        </div>
                        <form onSubmit={onAdd}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Tên</label>
                                    <input name="name" className="form-control" value={form.name} onChange={onChange} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input name="email" type="email" className="form-control" value={form.email} onChange={onChange} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Role</label>
                                    <select name="role" className="form-select" value={form.role} onChange={onChange}>
                                        <option value="user">user</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Hủy</button>
                                <button type="submit" className="btn btn-primary">Thêm</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;


