import React, {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import Pagination from "../../components/pagination/Pagination";
import {useAuth} from "../../context/AuthContext";
import {userApi} from "../../utils/userApi"; // ✅ import userApi có interceptor
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

                const {data} = await userApi.get("/booking/me/list"); // ✅ Dùng userApi

                if (!ignore && data?.success) {
                    // Gắn dữ liệu booking vào state
                    setItems(data.data || []);
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
                        const bookingId = b.id ?? b.booking_id ?? b.bookingId;
                        const tourId = b.tourId ?? b.tour_id ?? b.tour?.id;
                        const title = b.tourTitle ?? b.tour_title ?? b.tour?.title ?? "Chuyến đi";
                        const imageUrl = b.thumbnailUrl ?? b.thumbnail_url ?? b.tour?.image_url ?? "/assets/default-avatar.jpg";
                        const locationName = b.locationName ?? b.location_name ?? b.tour?.location_name;
                        const numDay = b.numDay ?? b.num_day ?? b.tour?.num_day;
                        const numNight = b.numNight ?? b.num_night ?? b.tour?.num_night;
                        const departureDate = b.departureDate ?? b.departure_date;
                        const totalPrice = b.totalPrice ?? b.total_price ?? 0;

                        const isNew = orderId && String(b.order_id || b.orderId) === String(orderId);

                        return (
                            <div key={bookingId} className="trip-card" onClick={() => tourId && navigate(`/tours/${tourId}`)}>
                                <button
                                    className="trip-delete-btn"
                                    aria-label="Xóa booking"
                                    title="Xóa"
                                    onClick={async (e) => {
                                        e.stopPropagation();

                                        if (!bookingId) {
                                            alert("Không tìm thấy ID chuyến đi để xóa.");
                                            return;
                                        }

                                        if (!confirm("Xóa chuyến đi này?")) return;

                                        try {
                                            const res = await userApi.delete(`/booking/me/${bookingId}`);

                                            if (res.data?.success) {
                                                setItems((prev) => prev.filter((it) => (it.id ?? it.booking_id ?? it.bookingId) !== bookingId));
                                            } else {
                                                alert(res.data?.message || res.data?.error || "Xóa không thành công");
                                            }
                                        } catch (err) {
                                            console.error("Lỗi khi xóa booking:", err);
                                            alert(err.response?.data?.message || "Có lỗi xảy ra khi xóa");
                                        }
                                    }}
                                >
                                    ×
                                </button>
                                <img className="trip-image" src={imageUrl} alt={title} />
                                <div className="trip-content">
                                    <div className="trip-header">
                                        <h3 className="trip-title">{title}</h3>
                                        {isNew && <span className="badge-new">Mới</span>}
                                    </div>
                                    <div className="trip-location">
                                        {locationName ? `Điểm đi: ${locationName}` : ""} {numDay ? `· ${numDay}N${numNight || 0}Đ` : ""}
                                    </div>
                                    <div className="trip-meta">
                                        <span className="trip-departure">
                                            Khởi hành: {departureDate ? (new Date(departureDate).toString() !== "Invalid Date" ? new Date(departureDate).toLocaleDateString("vi-VN") : departureDate) : "Chưa xác định"}
                                        </span>
                                        <strong className="trip-price" title={`${Number(totalPrice).toLocaleString("vi-VN")} đ`}>
                                            <span className="trip-price-number">{Number(totalPrice).toLocaleString("vi-VN")}</span>
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
