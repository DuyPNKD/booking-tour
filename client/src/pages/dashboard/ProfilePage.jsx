import React, {useState, useEffect, useRef} from "react";
import "./ProfilePage.css";
import {useAuth} from "../../context/AuthContext";

const months = ["Tháng Một", "Tháng Hai", "Tháng Ba", "Tháng Tư", "Tháng Năm", "Tháng Sáu", "Tháng Bảy", "Tháng Tám", "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Mười Hai"];

const currentYear = new Date().getFullYear();
const years = [];
for (let y = currentYear - 1; y >= 1875; y--) years.push(y);

export default function ProfilePage() {
    const {user, updateUser} = useAuth();
    const [form, setForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        gender: user?.gender || "",
        birthDay: "",
        birthMonth: "",
        birthYear: "",
    });
    const [newAvatar, setNewAvatar] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const fileInputRef = useRef(null);

    // Parse birth_date từ user nếu có
    useEffect(() => {
        if (user?.birth_date) {
            const date = new Date(user.birth_date);
            setForm((prev) => ({
                ...prev,
                birthDay: date.getDate().toString(),
                birthMonth: (date.getMonth() + 1).toString(),
                birthYear: date.getFullYear().toString(),
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    // Khi người dùng chọn ảnh mới từ máy tính,
    // hàm này sẽ lưu file gốc vào state để chuẩn bị upload lên server,
    // đồng thời đọc file thành chuỗi Base64 để hiển thị ngay ảnh vừa chọn trên giao diện.
    // Như vậy, người dùng sẽ thấy ảnh mới trước khi nhấn nút "Cập nhật".
    const handleFileChange = (e) => {
        // Kiểm tra xem có file nào được chọn không
        if (e.target.files && e.target.files[0]) {
            // Lưu file gốc vào state avatarFile để dùng khi upload lên server
            setAvatarFile(e.target.files[0]);
            // Tạo FileReader để đọc file và hiển thị ảnh tạm thời trên giao diện
            const reader = new FileReader();
            reader.onloadend = () => {
                // Lưu chuỗi Base64 vào state newAvatar để hiển thị ngay ảnh vừa chọn
                setNewAvatar(reader.result);
            };
            // Đọc file dưới dạng URL data (Base64)
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    // Hàm xử lý cập nhật hồ sơ và upload avatar
    const handleProfileUpdate = async () => {
        try {
            // Nếu có file avatar mới, upload trước
            let avatarPath = user?.picture;
            if (avatarFile) {
                const formData = new FormData();
                formData.append("avatar", avatarFile);
                const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
                const resUpload = await fetch(`${API_BASE}/api/auth/upload/avatar`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                    },
                    body: formData,
                });
                const jsonUpload = await resUpload.json();
                if (jsonUpload.success) {
                    avatarPath = jsonUpload.path;
                }
            }
            // Cập nhật thông tin text
            const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
            const res = await fetch(`${API_BASE}/api/auth/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
                body: JSON.stringify({
                    name: form.name,
                    phone: form.phone,
                    address: form.address,
                    gender: form.gender,
                    birthDay: form.birthDay,
                    birthMonth: form.birthMonth,
                    birthYear: form.birthYear,
                }),
            });
            const json = await res.json();
            if (!json?.success) throw new Error(json?.message || "Cập nhật thất bại");
            // Cập nhật context để Navbar/Sidebar phản chiếu ngay
            updateUser({
                ...(user || {}),
                name: json.user?.name ?? user?.name,
                email: json.user?.email ?? user?.email,
                phone: json.user?.phone ?? user?.phone,
                address: json.user?.address ?? user?.address,
                gender: json.user?.gender ?? user?.gender,
                birth_date: json.user?.birth_date ?? user?.birth_date,
                picture: avatarPath,
            });
            alert("Cập nhật thành công");
        } catch (e) {
            console.error(e);
            alert("Có lỗi khi cập nhật hồ sơ");
        }
    };

    return (
        <div className="profile-card">
            <div className="profile-header">
                <div>
                    <div className="profile-title">Thông tin cá nhân</div>
                    <div className="profile-desc">Lưu thông tin của Quý khách để đặt dịch vụ nhanh hơn</div>
                </div>
                {/* Avatar */}
                <div className="profile-avatar-block">
                    <div className="profile-avatar">
                        <img src={newAvatar || user?.picture || "/default-avatar.jpg"} alt="avatar" />
                    </div>
                    <div style={{textAlign: "center", marginTop: "8px", cursor: "pointer", color: "#007bff"}} onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                        Thay avatar
                    </div>
                    <input type="file" accept="image/*" style={{display: "none"}} ref={fileInputRef} onChange={handleFileChange} />
                </div>
            </div>
            <div className="profile-info-list">
                <div className="profile-info-row">
                    <div className="profile-info-label">Tên hiển thị</div>
                    <input className="profile-input" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Nhập họ tên" />
                </div>
                <div className="profile-info-row">
                    <div className="profile-info-label">Email</div>
                    <input className="profile-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="Nhập địa chỉ email" />
                </div>
                <div className="profile-info-row profile-info-row-inline">
                    <div className="profile-info-col">
                        <div className="profile-info-label">Giới tính</div>
                        <select className="profile-input profile-select" name="gender" value={form.gender} onChange={handleChange}>
                            <option value=""></option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                        </select>
                    </div>
                    <div className="profile-info-col">
                        <div className="profile-info-label">Ngày sinh</div>
                        <select className="profile-input profile-select" name="birthDay" value={form.birthDay} onChange={handleChange}>
                            <option value=""></option>
                            {[...Array(31)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="profile-info-col">
                        <div className="profile-info-label">&nbsp;</div>
                        <select className="profile-input profile-select" name="birthMonth" value={form.birthMonth} onChange={handleChange}>
                            <option value=""></option>
                            {months.map((m, idx) => (
                                <option key={idx + 1} value={idx + 1}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="profile-info-col">
                        <div className="profile-info-label">&nbsp;</div>
                        <select className="profile-input profile-select" name="birthYear" value={form.birthYear} onChange={handleChange}>
                            <option value=""></option>
                            {years.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="profile-info-row">
                    <div className="profile-info-label">Số điện thoại</div>
                    <input className="profile-input" type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="Nhập số điện thoại" />
                </div>
                <div className="profile-info-row">
                    <div className="profile-info-label">Thành phố cư trú</div>
                    <input className="profile-input" type="text" name="address" value={form.address} onChange={handleChange} placeholder="Thành phố cư trú" />
                </div>
            </div>
            {/* Nút Lưu bọc trong div căn phải */}
            <div className="profile-save-row">
                <button className="profile-save-btn" type="button" onClick={handleProfileUpdate}>
                    Cập nhật
                </button>
            </div>
        </div>
    );
}
