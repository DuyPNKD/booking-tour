import React, {useState} from "react";

const AdminSettings = () => {
    const [active, setActive] = useState("account");

    // Account forms state
    const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
    const [profileForm, setProfileForm] = useState({ name: "Admin", email: "admin@example.com", avatar: null });

    // System forms state
    const [logo, setLogo] = useState(null);
    const [smtp, setSmtp] = useState({ host: "smtp.example.com", port: 587, email: "noreply@example.com", password: "" });
    const [payments, setPayments] = useState({ momo: true, vnpay: true, paypal: false });

    const saveAccount = (e) => {
        e.preventDefault();
        if (passwordForm.next && passwordForm.next !== passwordForm.confirm) {
            alert("Xác nhận mật khẩu không khớp");
            return;
        }
        if (!confirm("Xác nhận lưu thay đổi tài khoản?")) return;
        alert("Đã lưu thay đổi tài khoản (demo)");
    };

    const saveSystem = (e) => {
        e.preventDefault();
        if (!confirm("Xác nhận lưu cấu hình hệ thống?")) return;
        alert("Đã lưu cấu hình hệ thống (demo)");
    };

    return (
        <div className="container-fluid">
            {/* Tabs */}
            <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                    <button className={`nav-link ${active === "account" ? "active" : ""}`} onClick={()=>setActive("account")}>Cài đặt tài khoản</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${active === "system" ? "active" : ""}`} onClick={()=>setActive("system")}>Cài đặt hệ thống</button>
                </li>
            </ul>

            {active === "account" && (
                <div className="row g-3">
                    <div className="col-12 col-lg-6">
                        <div className="card h-100">
                            <div className="card-header fw-semibold">Đổi mật khẩu</div>
                            <form onSubmit={saveAccount}>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label">Mật khẩu cũ</label>
                                        <input type="password" className="form-control" value={passwordForm.current} onChange={(e)=>setPasswordForm({...passwordForm, current: e.target.value})} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Mật khẩu mới</label>
                                        <input type="password" className="form-control" value={passwordForm.next} onChange={(e)=>setPasswordForm({...passwordForm, next: e.target.value})} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Xác nhận mật khẩu</label>
                                        <input type="password" className="form-control" value={passwordForm.confirm} onChange={(e)=>setPasswordForm({...passwordForm, confirm: e.target.value})} required />
                                    </div>
                                </div>
                                <div className="card-footer text-end">
                                    <button className="btn btn-primary" type="submit">Lưu thay đổi</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="col-12 col-lg-6">
                        <div className="card h-100">
                            <div className="card-header fw-semibold">Cập nhật thông tin admin</div>
                            <form onSubmit={saveAccount}>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label">Tên</label>
                                        <input className="form-control" value={profileForm.name} onChange={(e)=>setProfileForm({...profileForm, name: e.target.value})} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control" value={profileForm.email} onChange={(e)=>setProfileForm({...profileForm, email: e.target.value})} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Avatar</label>
                                        <input type="file" accept="image/*" className="form-control" onChange={(e)=>setProfileForm({...profileForm, avatar: e.target.files?.[0] || null})} />
                                    </div>
                                </div>
                                <div className="card-footer text-end">
                                    <button className="btn btn-primary" type="submit">Lưu thay đổi</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {active === "system" && (
                <div className="row g-3">
                    <div className="col-12 col-lg-6">
                        <div className="card h-100">
                            <div className="card-header fw-semibold">Đổi logo website</div>
                            <form onSubmit={saveSystem}>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label">Logo</label>
                                        <input type="file" accept="image/*" className="form-control" onChange={(e)=>setLogo(e.target.files?.[0] || null)} />
                                    </div>
                                </div>
                                <div className="card-footer text-end">
                                    <button className="btn btn-primary" type="submit">Lưu thay đổi</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="col-12 col-lg-6">
                        <div className="card h-100">
                            <div className="card-header fw-semibold">Cấu hình email (SMTP)</div>
                            <form onSubmit={saveSystem}>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-12 col-md-6">
                                            <label className="form-label">SMTP Host</label>
                                            <input className="form-control" value={smtp.host} onChange={(e)=>setSmtp({...smtp, host: e.target.value})} required />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label">Port</label>
                                            <input type="number" className="form-control" value={smtp.port} onChange={(e)=>setSmtp({...smtp, port: Number(e.target.value)})} required />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label">Email</label>
                                            <input type="email" className="form-control" value={smtp.email} onChange={(e)=>setSmtp({...smtp, email: e.target.value})} required />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label">Mật khẩu</label>
                                            <input type="password" className="form-control" value={smtp.password} onChange={(e)=>setSmtp({...smtp, password: e.target.value})} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer text-end">
                                    <button className="btn btn-primary" type="submit">Lưu thay đổi</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="card h-100">
                            <div className="card-header fw-semibold">Phương thức thanh toán</div>
                            <form onSubmit={saveSystem}>
                                <div className="card-body">
                                    <div className="form-check form-switch mb-2">
                                        <input className="form-check-input" type="checkbox" id="pmMomo" checked={payments.momo} onChange={(e)=>setPayments({...payments, momo: e.target.checked})} />
                                        <label className="form-check-label" htmlFor="pmMomo">Momo</label>
                                    </div>
                                    <div className="form-check form-switch mb-2">
                                        <input className="form-check-input" type="checkbox" id="pmVnpay" checked={payments.vnpay} onChange={(e)=>setPayments({...payments, vnpay: e.target.checked})} />
                                        <label className="form-check-label" htmlFor="pmVnpay">VNPAY</label>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" id="pmPaypal" checked={payments.paypal} onChange={(e)=>setPayments({...payments, paypal: e.target.checked})} />
                                        <label className="form-check-label" htmlFor="pmPaypal">PayPal</label>
                                    </div>
                                </div>
                                <div className="card-footer text-end">
                                    <button className="btn btn-primary" type="submit">Lưu thay đổi</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSettings;


