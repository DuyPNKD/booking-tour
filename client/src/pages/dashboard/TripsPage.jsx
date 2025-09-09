import React, {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import Pagination from "../../components/pagination/Pagination";
import {useAuth} from "../../context/AuthContext";
import "./DashboardLayout.css";
import "./TripsPage.css";

export default function TripsPage() {
    const {token} = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;
    const navigate = useNavigate();

    // Lấy orderId từ query để có thể highlight đơn mới thanh toán
    const orderId = useMemo(() => new URLSearchParams(window.location.search).get("orderId"), []);

    useEffect(() => {
        // Biến cờ để tránh cập nhật state nếu component đã bị unmount
        let ignore = false;

        // Hàm bất đồng bộ để gọi API lấy danh sách booking
        async function fetchData() {
            try {
                // Bật trạng thái loading để hiển thị "Đang tải..."
                setLoading(true);

                // Gọi API backend để lấy danh sách booking của user hiện tại
                const res = await fetch("http://localhost:3000/api/booking/me/list", {
                    headers: {
                        // Gắn token vào header để xác thực
                        Authorization: token ? `Bearer ${token}` : undefined,
                    },
                    credentials: "include", // Cho phép gửi cookie nếu cần
                });

                // Chuyển kết quả về dạng JSON
                const json = await res.json();

                // Thao tác xóa item
                // Nếu component vẫn còn tồn tại và API trả về thành công
                if (!ignore && json?.success) {
                    // Gắn dữ liệu booking vào state
                    setItems(json.data || []);
                }
            } catch (e) {
                // Nếu có lỗi khi gọi API → log ra console
                console.error(e);
            } finally {
                // Tắt trạng thái loading nếu component vẫn tồn tại
                if (!ignore) setLoading(false);
            }
        }

        // Gọi hàm fetchData khi component mount hoặc token thay đổi
        fetchData();

        // Cleanup function: nếu component bị unmount → không cập nhật state nữa
        return () => (ignore = true);
    }, [token]); // Chạy lại effect nếu token thay đổi

    return (
        <div className="trips-page">
            <h2 className="trips-title">Kỳ nghỉ của tôi</h2>
            {loading ? (
                <div className="trips-state">Đang tải...</div>
            ) : items.length === 0 ? (
                <div className="trips-state">Chưa có chuyến đi nào.</div>
            ) : (
                <div className="trips-grid">
                    {items.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((b) => {
                        const isNew = orderId && String(b.order_id) === String(orderId);
                        return (
                            <div key={b.booking_id} className="trip-card" onClick={() => navigate(`/tours/${b.tour?.id}`)}>
                                <button
                                    className="trip-delete-btn"
                                    aria-label="Xóa booking" // Hỗ trợ accessibility (screen reader)
                                    title="Xóa" // Tooltip khi hover
                                    onClick={async (e) => {
                                        e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài (tránh điều hướng tour)

                                        // Hiện hộp thoại xác nhận trước khi xóa
                                        if (!confirm("Xóa chuyến đi này?")) return;

                                        try {
                                            // Gọi API DELETE để xóa booking theo ID
                                            const res = await fetch(`http://localhost:3000/api/booking/me/${b.booking_id}`, {
                                                method: "DELETE", // Phương thức HTTP DELETE
                                                headers: {
                                                    // Gắn token vào header để xác thực người dùng
                                                    Authorization: token ? `Bearer ${token}` : undefined,
                                                },
                                                credentials: "include", // Cho phép gửi cookie nếu backend cần
                                            });

                                            // Chuyển kết quả về dạng JSON
                                            const json = await res.json();

                                            // Nếu xóa thành công → cập nhật lại danh sách bằng cách lọc bỏ item vừa xóa
                                            if (json?.success) {
                                                setItems((prev) => prev.filter((it) => it.booking_id !== b.booking_id));
                                            } else {
                                                // Nếu API trả về lỗi → hiển thị thông báo
                                                alert(json?.error || "Xóa không thành công");
                                            }
                                        } catch (err) {
                                            // Nếu có lỗi khi gọi API → log ra và hiển thị thông báo
                                            console.error(err);
                                            alert("Có lỗi xảy ra khi xóa");
                                        }
                                    }}
                                >
                                    ×
                                </button>
                                <img className="trip-image" src={b.tour?.image_url || "/assets/default-avatar.jpg"} alt={b.tour?.title} />
                                <div className="trip-content">
                                    <div className="trip-header">
                                        <h3 className="trip-title">{b.tour?.title}</h3>
                                        {isNew && <span className="badge-new">Mới</span>}
                                    </div>
                                    <div className="trip-location">
                                        Điểm đi: {b.tour?.location_name} · {b.tour?.num_day}N{b.tour?.num_night}Đ
                                    </div>
                                    <div className="trip-meta">
                                        <span className="trip-departure">Khởi hành: {new Date(b.departure_date).toLocaleDateString("vi-VN")}</span>
                                        <strong className="trip-price" title={`${Number(b.total_price).toLocaleString("vi-VN")} đ`}>
                                            <span className="trip-price-number">{Number(b.total_price).toLocaleString("vi-VN")}</span>
                                            <span className="trip-price-currency"> đ</span>
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {!loading && items.length > 0 && (
                <div style={{marginTop: 16}}>
                    <Pagination currentPage={currentPage} totalPages={Math.ceil(items.length / pageSize)} onPageChange={setCurrentPage} />
                </div>
            )}
        </div>
    );
}
