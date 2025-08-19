import React, {useState, useRef} from "react";
import "./ProfilePage.css";

const months = ["Tháng Một", "Tháng Hai", "Tháng Ba", "Tháng Tư", "Tháng Năm", "Tháng Sáu", "Tháng Bảy", "Tháng Tám", "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Mười Hai"];

const currentYear = new Date().getFullYear();
const years = [];
for (let y = currentYear - 1; y >= 1875; y--) years.push(y);

export default function ProfilePage() {
    const [form, setForm] = useState({
        name: "Phạm Ngọc Khánh Duy",
        email: "duy@example.com",
        phone: "0799097860",
        address: "",
        gender: "",
        birthDay: "",
        birthMonth: "",
        birthYear: "",
    });

    const fileInputRef = useRef(null);
    const [avatar, setAvatar] = useState(null);

    const handleAvatarClick = () => {
        fileInputRef.current.click(); // kích hoạt chọn file
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(URL.createObjectURL(file)); // preview ảnh tạm thời
            // TODO: gọi API upload avatar lên server ở đây
        }
    };
    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    return (
        <div className="profile-card">
            <div className="profile-header">
                <div>
                    <div className="profile-title">Thông tin cá nhân</div>
                    <div className="profile-desc">Lưu thông tin của Quý khách để đặt dịch vụ nhanh hơn</div>
                </div>
                {/* Avatar */}
                <div className="profile-avatar" onClick={handleAvatarClick} style={{cursor: "pointer"}}>
                    {avatar ? (
                        <img
                            src={avatar}
                            alt="avatar"
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                objectFit: "cover",
                            }}
                        />
                    ) : (
                        "Avatar"
                    )}
                </div>

                {/* Input file ẩn */}
                <input type="file" accept="image/*" ref={fileInputRef} style={{display: "none"}} onChange={handleFileChange} />
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
                    <div className="profile-info-label">Địa chỉ</div>
                    <input className="profile-input" type="text" name="address" value={form.address} onChange={handleChange} placeholder="Nhập địa chỉ" />
                </div>
            </div>
            {/* Nút Lưu bọc trong div căn phải */}
            <div className="profile-save-row">
                <button className="profile-save-btn" type="button">
                    Cập nhật
                </button>
            </div>
        </div>
    );
}
