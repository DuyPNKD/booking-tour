import React from "react";
import "./TourDetail.css";

const TourDetail = () => {
    // Mock data for tour detail
    const tour = {
        id: 1,
        title: "Tour Hà Nội - Sapa - Fansipan 3N2Đ",
        image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        duration: "3 ngày 2 đêm",
        price: "3.990.000 VNĐ",
        departure: "Hà Nội",
        destination: "Sapa",
        description: "Tour du lịch Sapa 3 ngày 2 đêm khám phá vẻ đẹp của núi rừng Tây Bắc, tham quan Fansipan - nóc nhà Đông Dương, trải nghiệm văn hóa độc đáo của đồng bào dân tộc thiểu số.",
        highlights: ["Tham quan Fansipan - nóc nhà Đông Dương", "Khám phá bản Cát Cát - bản làng cổ của người Mông", "Thưởng thức ẩm thực đặc sắc vùng cao", "Trải nghiệm văn hóa độc đáo của đồng bào dân tộc"],
        itinerary: [
            {
                day: "Ngày 1",
                title: "Hà Nội - Sapa",
                activities: ["05:30: Xe đón đoàn tại điểm hẹn", "12:00: Ăn trưa tại nhà hàng", "14:00: Nhận phòng khách sạn", "15:00: Tham quan bản Cát Cát", "19:00: Ăn tối và nghỉ đêm tại Sapa"],
            },
            {
                day: "Ngày 2",
                title: "Sapa - Fansipan",
                activities: ["07:00: Ăn sáng", "08:00: Tham quan Fansipan", "12:00: Ăn trưa", "14:00: Tham quan thung lũng Mường Hoa", "19:00: Ăn tối và nghỉ đêm tại Sapa"],
            },
            {
                day: "Ngày 3",
                title: "Sapa - Hà Nội",
                activities: ["07:00: Ăn sáng", "08:00: Tham quan chợ Sapa", "12:00: Ăn trưa", "13:00: Khởi hành về Hà Nội", "20:00: Về đến Hà Nội, kết thúc tour"],
            },
        ],
        inclusions: ["Xe ô tô đời mới đưa đón theo chương trình", "Khách sạn 3 sao tại Sapa", "Ăn uống theo chương trình", "Vé tham quan các điểm du lịch", "Hướng dẫn viên nhiệt tình, kinh nghiệm", "Bảo hiểm du lịch"],
        exclusions: ["Chi phí cá nhân", "Đồ uống trong các bữa ăn", "Thuế VAT"],
        policies: ["Trẻ em dưới 5 tuổi miễn phí (ngủ chung với bố mẹ)", "Trẻ em từ 5-10 tuổi tính 75% giá tour", "Trẻ em từ 11 tuổi trở lên tính như người lớn", "Hủy tour trước 7 ngày: miễn phí", "Hủy tour trước 3-6 ngày: phí 30%", "Hủy tour trước 1-2 ngày: phí 50%", "Hủy tour trong ngày: phí 100%"],
    };

    return (
        <div className="tour-detail">
            <div className="tour-header">
                <h1>{tour.title}</h1>
                <div className="tour-meta">
                    <span className="duration">{tour.duration}</span>
                    <span className="price">{tour.price}</span>
                </div>
            </div>

            <div className="tour-image">
                <img src={tour.image} alt={tour.title} />
            </div>

            <div className="tour-info">
                <div className="tour-description">
                    <h2>Giới thiệu tour</h2>
                    <p>{tour.description}</p>
                </div>

                <div className="tour-highlights">
                    <h2>Điểm nổi bật</h2>
                    <ul>
                        {tour.highlights.map((highlight, index) => (
                            <li key={index}>{highlight}</li>
                        ))}
                    </ul>
                </div>

                <div className="tour-itinerary">
                    <h2>Lịch trình</h2>
                    {tour.itinerary.map((day, index) => (
                        <div key={index} className="day-schedule">
                            <h3>
                                {day.day}: {day.title}
                            </h3>
                            <ul>
                                {day.activities.map((activity, i) => (
                                    <li key={i}>{activity}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="tour-inclusions">
                    <h2>Bao gồm</h2>
                    <ul>
                        {tour.inclusions.map((inclusion, index) => (
                            <li key={index}>{inclusion}</li>
                        ))}
                    </ul>
                </div>

                <div className="tour-exclusions">
                    <h2>Không bao gồm</h2>
                    <ul>
                        {tour.exclusions.map((exclusion, index) => (
                            <li key={index}>{exclusion}</li>
                        ))}
                    </ul>
                </div>

                <div className="tour-policies">
                    <h2>Chính sách</h2>
                    <ul>
                        {tour.policies.map((policy, index) => (
                            <li key={index}>{policy}</li>
                        ))}
                    </ul>
                </div>

                <div className="tour-booking">
                    <button className="book-now">Đặt tour ngay</button>
                </div>
            </div>
        </div>
    );
};

export default TourDetail;
