import React, {useState, useRef, useEffect} from "react";
import "./TourDetail.css";
import detail1 from "../../assets/detail1.webp";
import detail2 from "../../assets/detail2.webp";
import detail3 from "../../assets/detail3.webp";
import detail4 from "../../assets/detail4.webp";
import detail5 from "../../assets/detail5.webp";
import detail6 from "../../assets/detail6.webp";
import detail7 from "../../assets/detail7.webp";
import VietnamGrid from "../../components/vietNam/VietnamGrid";
import haGiang from "../../assets/ha_giang.webp";
import haLong from "../../assets/ha_long.webp";
import hoBaBe from "../../assets/ho_ba_be.webp";
import daNang from "../../assets/da_nang.webp";
import ninhThuan from "../../assets/ninh_thuan.webp";
import mienTay from "../../assets/mien_tay.webp";
import TourCategory from "../../components/tourCategory/TourCategory";
import {Link, useNavigate} from "react-router-dom";
import {getRatingLabel} from "../../utils/ratingUtils";
import Calendar from "../../components/calendar/Calendar";

const tour = {
    id: 1,
    title: "Tour Vĩnh Hy - Ninh Thuận 3 ngày 2 đêm từ TP.HCM",
    price: 3380000,
    oldPrice: 3980000,
    duration: "3 ngày 2 đêm",
    location: "Hồ Chí Minh",
    schedule: "Lịch khởi hành: Thứ 6 hàng tuần",
    rating: "9.2",
    ratingCount: 124,
    images: [ninhThuan, detail1, detail2, detail3, detail4, detail5, detail6, detail7],
    highlights: ["Khuyến mãi ĐẶC BIỆT", "Khám phá vịnh Vĩnh Hy", "Tham quan tháp Chàm", "Trải nghiệm vườn nho Ninh Thuận", "Ưu đãi cho khách hàng cao tuổi"],
    itinerary: [
        {
            day: "NGÀY 1",
            title: "Hà Nội - Cảng Ao Tiên - Cô Tô (Ăn Trưa, Tối)",
        },
        {
            day: "NGÀY 2",
            title: "Bãi Đá Móng Rồng - Hải Đăng - Cô Tô Con/ Tour 3 Đảo (Ăn Sáng, Trưa, Tối)",
        },
        {
            day: "NGÀY 3",
            title: "Cô Tô - Cảng Ao Tiên - Hà Nội (Ăn Sáng, Trưa)",
        },
    ],
    includes: [
        "Thuế VAT",
        "Xe tham quan theo chương trình",
        "Khách sạn theo tiêu chuẩn 3 sao : 2 khách/1 phòng, lẻ nam nữ ghép 3",
        "Vé tham quan các điểm theo chương trình",
        "Tàu đáy kính ngắm san hô theo chương trình tham quan Vịnh Vĩnh Hy",
        "Các bữa ăn theo chương trình (4 bữa chính: tiêu chuẩn 150.000 VNĐ/ khách + 1 bữa hải sản trên bè 200.000 VNĐ/khách + 01 bữa sáng 60.000 VNĐ/ khách/ bữa + 02 bữa sáng tại khách sạn)",
        "Hướng dẫn viên tiếng Việt kinh nghiệm, nhiệt tình",
        "Bảo hiểm du lịch với mức bồi thường 30.000.000 VNĐ/vụ",
        "Nước suối 1 chai 500ml/khách/ngày",
    ],
    excludes: ["Chi phí cá nhân, giặt ủi, điện thoại, minibar, phụ phí phòng đơn, đồ uống trong các bữa ăn….", "Các chi phí khác ngoài chương trình tour.", "Tiền tip cho lái xe và HDV địa phương", "Phụ Thu phòng đơn: 800.000 VNĐ/khách"],
    childrenPolicy: ["Trẻ em dưới 5 tuổi miễn phí (ăn uống và ngủ cùng với bố mẹ, bố mẹ tự túc lo cho bé). Hai người lớn chỉ kèm 1 trẻ em, trẻ em thứ 2 trở đi tính giá 50% giá tour người lớn.", "Trẻ em từ 5- dưới 11 tuổi giá tour là 75% giá tour người lớn. (Tiêu chuẩn: 01 suất ăn + 01 ghế ngồi và ngủ ghép cùng giường với bố mẹ). Hai người lớn chỉ kèm 1 trẻ em , trẻ em thứ 2 trở đi tính giá tour như người lớn.", "Trẻ từ 11 tuổi trở lên, tính bằng chi phí người lớn."],
    notes: [
        "Giá và hành trình có thể thay đổi theo từng thời điểm cụ thể, Quý khách vui lòng liên hệ để cập nhật giá và hành trình trước khi đặt tour.",
        "Giờ bay có thể thay đổi theo giờ bay của Hãng hàng không.",
        "Về tính chất đoàn ghép, tour không đủ khách khởi hành sẽ hủy. Đơn vị lữ hành sẽ có nhiệm vụ báo trước tới khách",
        "15ngày và thỏa thuận với khách về ngày khởi hành mới. Mọi chi phí phát sinh hai bên cùng thỏa thuận",
        "Đối với các khách hàng đi riêng lẻ (lẻ 01 người) thì sẽ chịu phí phòng đơn. Khi có khách lẻ khác cùng đăng",
        "kýghép vào thì chúng tôi sẽ trả lại phụ phí phòng đơn cho quý khách",
        "Trẻ em từ 0-5 tuổi: Miễn phí tour, ăn ngủ chung với bố mẹ. (Hai người lớn chỉ được kèm 01 trẻ em. Từ trẻ em thứ",
        "2phụ thu 50% người lớn). Trẻ em từ 1 tuổi trở lên đóng 700.000 VNĐ vé tàu cao tốc",
        "Trẻ em từ 5-11 tuổi: Phụ thu 75% tour. Hai người lớn chỉ được kèm 01 suất trẻ em từ 5-11 tuổi. Từ bé thứ 2, ba mẹ nên mua thêm 01 suất giường đơn.",
        "Trẻ trên 11 tuổi: Tính như người lớn.",
        "Khách nước ngoài phụ thu 10USD/người/ngày, khi đi mang theo 2 bản photo hộ chiếu và bản gốc để đối chiếu.",
    ],
    cancelPolicy: ["Nếu quý khách hủy tour sau khi đăng ký và trước 20 ngày khởi hành: mất phí cọc tour", "Nếu quý khách hủy tour trước 15 ngày khởi hành: phí hủy 50% tiền tour + 100% tiền Vé máy bay.", "Nếu quý khách hủy tour trước 07 ngày khởi hành: phí hủy 70% tiền tour + 100% tiền vé máy bay", "Nếu quý khách hủy tour trong vòng 07 ngày trước ngày khởi hành: phí hủy 100% tiền tour + 100% tiền vé máy bay ( 100% giá trị tour trọn gói)"],
    reviews: [
        {
            name: "Lan Hương Trương",
            rating: 5,
            comment: "Xe mới, sạch sẽ, hướng dẫn viên nhiệt tình, lịch trình hợp lý. Sẽ quay lại!",
        },
        {
            name: "Minh Châu",
            rating: 5,
            comment: "Chuyến đi rất vui, dịch vụ tốt, giá hợp lý. Cảm ơn DTravel!",
        },
    ],
    relatedTours: [
        {
            title: "Tour Phú Quốc 3 ngày 2 đêm từ TP.HCM",
            price: 4960000,
            image: "/images/related1.jpg",
        },
        {
            title: "Tour Ninh Thuận - Vĩnh Hy 4 ngày 3 đêm từ Hà Nội",
            price: 7230000,
            image: "/images/related2.jpg",
        },
        {
            title: "Tour Cô Tô 3 ngày 2 đêm từ Hà Nội",
            price: 2960000,
            image: "/images/related3.jpg",
        },
        {
            title: "Tour Cam Ranh - Nha Trang 4 ngày",
            price: 4980000,
            image: "/images/related4.jpg",
        },
    ],
    suggestions: [
        {title: "Hà Giang", image: haGiang, className: "ha-giang"},
        {title: "Hạ Long", image: haLong, className: "ha-long"},
        {title: "Hồ Ba Bể - Thác Bản Giốc", image: hoBaBe, className: "ho-ba-be"},
        {title: "Đà Nẵng", image: daNang, className: "da-nang"},
        {title: "Ninh Thuận", image: ninhThuan, className: "ninh-thuan"},
        {title: "Miền Tây", image: mienTay, className: "mien-tay"},
    ],
};

const domesticTours = [
    {
        id: 1,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "3 ngày 2 đêm",
        location: "Hà Nội, Sapa",
        rating: 4.8,
        booked: 320,
        oldPrice: "2.800.000",
        price: "2.500.000",
    },
    {
        id: 2,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "4 ngày 3 đêm",
        location: "Đà Nẵng, Hội An",
        rating: 4.7,
        booked: 410,
        oldPrice: "3.800.000",
        price: "3.500.000",
    },
    {
        id: 3,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "5 ngày 4 đêm",
        location: "Nha Trang, Đà Lạt",
        rating: 4.9,
        booked: 500,
        oldPrice: "4.600.000",
        price: "4.200.000",
    },
    {
        id: 4,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "4 ngày 3 đêm",
        location: "Đà Nẵng, Hội An",
        rating: 4.7,
        booked: 410,
        oldPrice: "3.800.000",
        price: "3.500.000",
    },
    {
        id: 5,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "5 ngày 4 đêm",
        location: "Nha Trang, Đà Lạt",
        rating: 4.9,
        booked: 500,
        oldPrice: "4.600.000",
        price: "4.200.000",
    },
    {
        id: 6,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "4 ngày 3 đêm",
        location: "Đà Nẵng, Hội An",
        rating: 4.7,
        booked: 410,
        oldPrice: "3.800.000",
        price: "3.500.000",
    },
    {
        id: 7,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "5 ngày 4 đêm",
        location: "Nha Trang, Đà Lạt",
        rating: 4.9,
        booked: 500,
        oldPrice: "4.600.000",
        price: "4.200.000",
    },
    {
        id: 8,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "4 ngày 3 đêm",
        location: "Đà Nẵng, Hội An",
        rating: 4.7,
        booked: 410,
        oldPrice: "3.800.000",
        price: "3.500.000",
    },
    {
        id: 9,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "5 ngày 4 đêm",
        location: "Nha Trang, Đà Lạt",
        rating: 4.9,
        booked: 500,
        oldPrice: "4.600.000",
        price: "4.200.000",
    },
    {
        id: 10,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "4 ngày 3 đêm",
        location: "Đà Nẵng, Hội An",
        rating: 4.7,
        booked: 410,
        oldPrice: "3.800.000",
        price: "3.500.000",
    },
];

const tabSections = [
    {label: "Tổng quan", key: "intro", id: "tour-intro-section"},
    {label: "Chương trình tour", key: "itinerary", id: "tour-itinerary-section"},
    {label: "Lịch khởi hành", key: "departure", id: "tour-departure-section"},
    {label: "Thông tin cần lưu ý", key: "terms", id: "tour-terms-section"},
    {label: "Đánh giá tour", key: "reviews", id: "tour-reviews-section"},
];

// Thêm dữ liệu mẫu cho lịch khởi hành
const departureSchedule = [
    {
        start: "T6, 13/06/2025",
        end: "CN, 15/06/2025",
        status: "Liên hệ",
        price: 3110000,
    },
    {
        start: "T6, 20/06/2025",
        end: "CN, 22/06/2025",
        status: "Liên hệ",
        price: 3110000,
    },
    {
        start: "T6, 27/06/2025",
        end: "CN, 29/06/2025",
        status: "Liên hệ",
        price: 3110000,
    },
    {
        start: "T6, 04/07/2025",
        end: "CN, 06/07/2025",
        status: "Liên hệ",
        price: 3110000,
    },
    {
        start: "T6, 11/07/2025",
        end: "CN, 13/07/2025",
        status: "Liên hệ",
        price: 3110000,
    },
];

// Thêm dữ liệu cho các tab "Thông tin cần lưu ý"
const infoTabs = [
    {
        label: "Giá bao gồm",
        key: "included",
        content: (
            <div>
                <b>Vận Chuyển:</b>
                <ul style={{listStyle: "none", paddingLeft: 0}}>
                    <li>- Xe du lịch 16 - 45 chỗ (Tùy vào số lượng khách) sang trọng, lái xe chuyên nghiệp, lịch sự phục vụ theo hành trình.</li>
                    <li>- Tàu cao tốc khứ hồi: Ao Tiên - Đảo Cô Tô - Ao Tiên</li>
                    <li>- Xe điện đưa đón tham quan theo chương trình tại Cô Tô.</li>
                </ul>
                <b>Lưu Trú:</b>
                <ul style={{listStyle: "none", paddingLeft: 0}}>
                    <li>- Khách sạn 2 sao địa phương: tiêu chuẩn 2 khách/ phòng.</li>
                </ul>
                <b>Khác:</b>
                <ul style={{listStyle: "none", paddingLeft: 0}}>
                    <li>- Các bữa ăn theo chương trình.</li>
                    <li>- Vé tham quan các điểm theo chương trình.</li>
                    <li>- Vé vào cửa cảng Quốc Tế Ao Tiên</li>
                    <li>- Hướng dẫn viên chuyên nghiệp phục vụ nhiệt tình chu đáo suốt chuyến đi.</li>
                    <li>- Bảo hiểm du lịch mức đền bù tối đa 120.000.000VNĐ/vụ/người.</li>
                    <li>- Thuế VAT.</li>
                    <li>- Hướng Dẫn Viên (HDV) sẽ liên lạc với Quý Khách khoảng 1 ngày trước khi khởi hành để sắp xếp giờ đón và cung cấp các thông tin cần thiết cho chuyến đi.</li>
                </ul>
            </div>
        ),
    },
    {
        label: "Giá không bao gồm",
        key: "excluded",
        content: (
            <div>
                <ul style={{listStyle: "none", paddingLeft: 0}}>
                    <li> - Phí phụ thu phòng đơn (nếu có): 756.000 vnđ/ khách.</li>

                    <li>- Đồ uống: rượu, bia, nước ngọt và các loại đồ uống cá nhân không đề cập.</li>

                    <li>- Các chi phí cá nhân: mua sắm, điện thoại, thăm quan tự do ngoài lịch trình.</li>

                    <li>- Vé tham quan Cô Tô con hoặc tour 3 đảo.</li>

                    <li>- TIP lái xe và hướng dẫn viên.</li>
                </ul>
            </div>
        ),
    },
    {
        label: "Phụ thu",
        key: "surcharge",
        content: (
            <div>
                <ul style={{listStyle: "none", paddingLeft: 0}}>
                    <li>- Trẻ em dưới 2 tuổi: Miễn phí (Ngủ chung giường với bố mẹ, các chi phí ăn uống, phát sinh (nếu có) của bé bố mẹ tự túc)</li>

                    <li>- Trẻ em từ 02 - dưới 05 tuổi: 324.000 vnđ (Vé tàu cao tốc khứ hồi cho bé, ngủ chung giường với bố mẹ. các chi phí ăn uống, phát sinh (nếu có) của bé bố mẹ tự túc).</li>

                    <li>- Từ trên 05 - dưới 09 tuổi: Áp dụng theo giá website (Ngủ chung giường với bố mẹ)</li>

                    <li>- Từ 09 tuổi trở lên: Áp dụng theo giá người lớn.</li>
                </ul>
            </div>
        ),
    },
    {
        label: "Hủy đổi",
        key: "cancel",
        content: (
            <div>
                <ul style={{listStyle: "none", paddingLeft: 0}}>
                    <li>Điều kiện hủy tour (ngày thường) </li>
                    <li>- Quý khách hủy tour sau khi đặt cọc: 30% giá trị tour </li>
                    <li>- Quý khách huỷ tour trước 07 – 10 ngày khởi hành: 50% giá trị tour </li>
                    <li>- Quý khách hủy tour trước 04 - 06 ngày khởi hành: 75% giá trị tour. </li>
                    <li>- Quý khách hủy tour trước 03 ngày khởi hành: 100% giá trị tour. </li>
                    <li>Điều kiện hủy tour (ngày lễ tết) - Các ngày lễ tết việc dời ngày và hủy tour mất 100% giá tour.</li>
                    <li>- Các ngày lễ tết việc dời ngày và hủy tour mất 100% giá tour.</li>
                </ul>
            </div>
        ),
    },
    {
        label: "Lưu ý",
        key: "note",
        content: (
            <div>
                <ul style={{listStyle: "none", paddingLeft: 0}}>
                    <li>- Chương trình có thể thay đổi tuỳ thuộc vào điều kiện thực tế như thời tiết, giờ tàu, quy định của điểm đến nhưng vẫn đảm bảo đủ điểm tham quan trong chương trình.</li>
                    <li>- Khách đi du lịch lưu ý mang theo căn cước công dân; khách nước ngoài phải mang theo hộ chiếu để thực hiện khai báo lưu trú.</li>
                    <li>- Do tính chất tour ghép lẻ nên Quý khách vui lòng có mặt đúng thời gian khởi hành để không làm ảnh hưởng các thành viên khác trong đoàn.</li>
                    <li>- Quý khách nên mang theo hành lý gọn gàng để thuận tiện cho việc di chuyển.</li>
                    <li>- Quý khách nên mang theo: Thuốc chống côn trùng, say xe, đau bụng, cảm sốt hoặc thuốc được kê đơn riêng theo chỉ định bác sĩ.</li>
                </ul>
            </div>
        ),
    },
    {
        label: "Hướng dẫn viên",
        key: "guide",
        content: (
            <div>
                <ul style={{listStyle: "none", paddingLeft: 0}}>
                    <li>- Hướng Dẫn Viên (HDV) sẽ liên lạc với Quý Khách khoảng 1 ngày trước khi khởi hành để sắp xếp giờ đón và cung cấp các thông tin cần thiết cho chuyển đi.</li>
                </ul>
            </div>
        ),
    },
];

export default function TourDetail() {
    const [accordion, setAccordion] = useState(null);
    const [mainImgIdx, setMainImgIdx] = useState(0);
    const [activeTab, setActiveTab] = useState(tabSections[0].key);
    const [showFullIntro, setShowFullIntro] = useState(false); // Trạng thái hiển thị nội dung đầy đủ
    const [showSeeMore, setShowSeeMore] = useState(false); // Trạng thái hiển thị nút "Xem thêm"
    const [infoTab, setInfoTab] = useState(infoTabs[0].key);
    const [selectedDate, setSelectedDate] = useState("13/06"); // State cho ngày đang chọn
    const introRef = useRef(null); // Ref cho phần nội dung
    const seeMoreRef = useRef(null); // Ref cho nút "Xem thêm"
    const seeMorePositionRef = useRef(null); // Ref lưu vị trí của nút
    const [showCalendar, setShowCalendar] = useState(false); // Trạng thái hiển thị lịch
    const calendarRef = useRef(null); // Ref cho vùng calendar
    const navigate = useNavigate();
    const buttonRef = useRef(null); // ⬅️ thêm ref cho nút
    const tourMainRightRef = useRef(null);
    const reviewsSectionRef = useRef(null);
    const [isStickyStopped, setIsStickyStopped] = useState(false);

    useEffect(() => {
        if (introRef.current && introRef.current.scrollHeight > 300) {
            setShowSeeMore(true);
        }
    }, []);

    useEffect(() => {
        if (!showFullIntro && seeMoreRef.current) {
            seeMoreRef.current.scrollIntoView({behavior: "smooth", block: "start"});
        }
    }, [showFullIntro]);

    // Đóng khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                calendarRef.current &&
                !calendarRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target) // ⬅️ Đừng quên nút cũng cần check
            ) {
                setShowCalendar(false);
            }
        };
        if (showCalendar) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showCalendar]);

    useEffect(() => {
        const handleScroll = () => {
            if (!tourMainRightRef.current || !reviewsSectionRef.current) return;
            const rightBox = tourMainRightRef.current.getBoundingClientRect();
            const reviews = reviewsSectionRef.current.getBoundingClientRect();
            // Nếu bottom của box chạm top của reviews section thì dừng sticky
            if (rightBox.bottom > reviews.top) {
                setIsStickyStopped(true);
            } else {
                setIsStickyStopped(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const prevImg = () => setMainImgIdx((prev) => (prev === 0 ? tour.images.length - 1 : prev - 1));
    const nextImg = () => setMainImgIdx((prev) => (prev === tour.images.length - 1 ? 0 : prev + 1));

    const getVisibleThumbnails = () => {
        const total = tour.images.length;
        const thumbnails = [];
        for (let i = 0; i < 4; i++) {
            thumbnails.push(tour.images[(mainImgIdx + i) % total]);
        }
        return thumbnails;
    };

    const handleTabClick = (id, key) => {
        setActiveTab(key);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({behavior: "smooth", block: "start"});
        }
    };

    const handleExpand = () => {
        if (seeMoreRef.current) {
            // Lưu vị trí theo đơn vị pixel so với viewport
            const rect = seeMoreRef.current.getBoundingClientRect();
            seeMorePositionRef.current = window.scrollY + rect.top;
        }
        setShowFullIntro(true);
    };

    const handleCollapse = () => {
        setShowFullIntro(false);

        // Đợi nội dung co lại rồi scroll
        setTimeout(() => {
            if (seeMoreRef.current) {
                seeMoreRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }, 100);
    };

    // State cho số lượng khách từng loại
    const [guestCounts, setGuestCounts] = useState({
        adult: 1,
        child58: 0,
        child24: 0,
        infant: 0,
    });

    // Hàm tăng/giảm số lượng khách
    const handleGuestChange = (type, delta) => {
        setGuestCounts((prev) => {
            let min = 0;
            if (type === "adult") min = 1;
            const next = {...prev, [type]: Math.max(min, prev[type] + delta)};
            return next;
        });
    };

    // Giá từng loại khách
    const PRICE_ADULT = 3110000;
    const PRICE_CHILD_58 = 3110000;
    const PRICE_CHILD_24 = 3110000;
    const PRICE_INFANT = 0;

    // Tính tổng tiền
    const totalPrice = guestCounts.adult * PRICE_ADULT + guestCounts.child58 * PRICE_CHILD_58 + guestCounts.child24 * PRICE_CHILD_24 + guestCounts.infant * PRICE_INFANT;

    return (
        <div className="tour-detail-container">
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <a href="/">
                    <i className="fa fa-house"></i>
                </a>
                <span> &gt; </span>
                <a href="/">Du lịch trong nước</a>
                <span> &gt; </span>
                <span>{tour.title}</span>
            </div>

            <div className="tour-header">
                <h1 className="tour-title">{tour.title}</h1>
                <div className="tour-card-row-rating" title="Click để xem đánh giá" onClick={() => handleTabClick("tour-reviews-section", "reviews")} style={{cursor: "pointer"}}>
                    <span className="tour-card-row-rating-badge">{tour.rating}</span>
                    <span className="tour-card-row-rating-text">{getRatingLabel(tour.rating)}</span>
                    <span className="tour-card-row-rating-count">| {tour.ratingCount} đánh giá</span>
                    <i className="fa-solid fa-angle-down"></i>
                </div>
            </div>
            {/* Main content */}
            <div className="tour-main" style={{position: "relative"}}>
                {/* Left: Images & Info */}

                <div className="tour-main-left">
                    {/* Slider ảnh lớn */}
                    <div className="tour-main-img-slider">
                        <div className="img-nav-btn left" onClick={prevImg}>
                            <i className="fa-solid fa-chevron-left"></i>
                        </div>
                        <img src={tour.images[mainImgIdx]} alt="main" />
                        <div className="img-nav-btn right" onClick={nextImg}>
                            <i className="fa-solid fa-chevron-right"></i>
                        </div>
                    </div>
                    {/* Thumbnails */}
                    <div className="tour-main-thumbs">
                        {getVisibleThumbnails().map((img, i) => {
                            const realIdx = (mainImgIdx + i) % tour.images.length;
                            return (
                                <div key={img} className={"thumb-wrapper" + (mainImgIdx === realIdx ? " active" : "")} onClick={() => setMainImgIdx(realIdx)}>
                                    <img src={img} alt={`thumb${realIdx}`} />
                                </div>
                            );
                        })}
                    </div>

                    {/* Thông tin khởi hành, mã tour, bao gồm */}
                    <div className="tour-main-summary">
                        <div className="tour-main-summary-row">
                            <div>
                                <i className="fa fa-location-dot tour-main-summary-icons"></i>
                                <span>
                                    Khởi hành từ: <b>Hà Nội</b>
                                </span>
                            </div>
                            <div>
                                <i className="fa fa-bus tour-main-summary-icons"></i>
                                <i className="fa fa-user"></i>
                            </div>
                            <div>
                                Mã Tour: <b>TO1231</b>
                            </div>
                        </div>
                        <div>
                            <h3 className="tour-main-summary-title">Tour Trọn Gói bao gồm</h3>
                            <div className="tour-main-summary-list">
                                <ul>
                                    <li>
                                        <i className="fa fa-check"></i>Khách sạn 2*
                                    </li>
                                    <li>
                                        <i className="fa fa-check"></i>Vé tham quan
                                    </li>
                                </ul>
                                <ul>
                                    <li>
                                        <i className="fa fa-check"></i>Bữa ăn
                                    </li>
                                    <li>
                                        <i className="fa fa-check"></i>Hướng dẫn viên
                                    </li>
                                </ul>
                                <ul>
                                    <li>
                                        <i className="fa fa-check"></i>Xe tham quan
                                    </li>
                                    <li>
                                        <i className="fa fa-check"></i>Bảo hiểm du lịch
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="tour-main-tabs">
                        {tabSections.map((t) => (
                            <button key={t.key} className={"tour-main-tab-btn" + (activeTab === t.key ? " active" : "")} onClick={() => handleTabClick(t.id, t.key)}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <div className="tour-main-tab-content">
                        <div id="tour-intro-section" style={{scrollMarginTop: 120, position: "relative"}}>
                            <h2>Trải nghiệm thú vị trong tour</h2>
                            <div
                                ref={introRef}
                                className={`tour-intro-content${showFullIntro ? " expanded" : ""}`}
                                style={{
                                    maxHeight: showFullIntro ? "none" : 300,
                                    overflow: showFullIntro ? "visible" : "hidden",
                                    position: "relative",
                                    transition: "max-height 0.3s",
                                }}
                            >
                                <ul style={{listStyle: "none", paddingLeft: 0}}>
                                    <li>- Tắm biển Hồng Vàn & Vàn Chảy: Nước trong xanh, cát mịn, nhiều trò chơi biển hấp dẫn.</li>
                                    <li>- Ngắm bình minh Bãi đá Móng Rồng: Sóng vỗ trên những khối đá sắc màu, cảnh đẹp thơ mộng.</li>
                                    <li>- Chinh phục Hải đăng Cô Tô: Ngắm toàn cảnh đảo từ độ cao lý tưởng.</li>
                                    <li>- Khám phá Cô Tô Con: Bãi biển hoang sơ, nước biển trong vắt, không gian yên bình.</li>
                                    <li>- Dạo Con đường tình yêu & chợ đảo: Đi dạo lãng mạn, mua sắm hải sản tươi ngon.</li>
                                </ul>
                            </div>
                        </div>
                        <div id="tour-itinerary-section" style={{scrollMarginTop: 120, marginTop: 40}}>
                            <div className="tour-program-header">
                                <h2>Chương trình tour</h2>
                                <span className="tour-program-seeall">Xem tất cả</span>
                            </div>
                            <div className="tour-program-list">
                                <div className="tour-program-item">
                                    <div className="tour-program-item-header">
                                        <img src={detail1} alt="Ngày 1" className="tour-program-img" />
                                        <div className="tour-program-info">
                                            <div className="tour-program-day">Ngày 1</div>
                                            <div className="tour-program-title">Hà Nội - Cảng Ao Tiên - Cô Tô (Ăn Trưa, Tối)</div>
                                        </div>
                                        <button className="tour-program-toggle">
                                            <i className="fa-solid fa-chevron-down"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="tour-program-item">
                                    <div className="tour-program-item-header">
                                        <img src={detail2} alt="Ngày 2" className="tour-program-img" />
                                        <div className="tour-program-info">
                                            <div className="tour-program-day">Ngày 2</div>
                                            <div className="tour-program-title">Bãi Đá Móng Rồng - Hải Đăng - Cô Tô Con/ Tour 3 Đảo (Ăn Sáng, Trưa, Tối)</div>
                                        </div>
                                        <button className="tour-program-toggle">
                                            <i className="fa-solid fa-chevron-down"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="tour-program-item">
                                    <div className="tour-program-item-header">
                                        <img src={detail3} alt="Ngày 3" className="tour-program-img" />
                                        <div className="tour-program-info">
                                            <div className="tour-program-day">Ngày 3</div>
                                            <div className="tour-program-title">Cô Tô - Cảng Ao Tiên - Hà Nội (Ăn Sáng, Trưa)</div>
                                        </div>
                                        <button className="tour-program-toggle">
                                            <i className="fa-solid fa-chevron-down"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lịch khởi hành & giá tour */}
                        <div id="tour-departure-section" style={{scrollMarginTop: 120, marginTop: 40}}>
                            <div style={{display: "flex", alignItems: "center", gap: 16, marginBottom: 16, justifyContent: "space-between"}}>
                                <h2 style={{margin: 0}}>Lịch khởi hành & giá tour</h2>
                                <div style={{display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: 6, padding: "4px 10px", background: "#fff"}}>
                                    <i className="fa-regular fa-calendar" style={{marginRight: 6, color: "#1f50ea"}}></i>
                                    <input
                                        type="date"
                                        style={{
                                            border: "none",
                                            outline: "none",
                                            fontSize: 15,
                                            background: "transparent",
                                            color: "#222",
                                            minWidth: 120,
                                            cursor: "pointer",
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="departure-table-wrapper" style={{background: "#fff", borderRadius: 8, border: "1px solid #eee", marginBottom: 32}}>
                                <table className="departure-table" style={{width: "100%", borderCollapse: "collapse"}}>
                                    <thead>
                                        <tr style={{background: "#f7f7f7"}}>
                                            <th style={{padding: 8, fontWeight: 600}}>Ngày khởi hành</th>
                                            <th style={{padding: 8, fontWeight: 600}}>Ngày về</th>
                                            <th style={{padding: 8, fontWeight: 600}}>Tình trạng chỗ</th>
                                            <th style={{padding: 8, fontWeight: 600}}>Giá</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {departureSchedule.map((item, idx) => (
                                            <tr key={idx} style={{borderBottom: "1px solid #eee"}}>
                                                <td style={{padding: 8}}>{item.start}</td>
                                                <td style={{padding: 8}}>{item.end}</td>
                                                <td style={{padding: 8, color: "#219653", fontWeight: 500}}>{item.status}</td>
                                                <td style={{padding: 8, color: "#1f50ea", fontWeight: 600}}>
                                                    {item.price.toLocaleString()} <span style={{color: "#333", fontWeight: 400}}>đ</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div style={{textAlign: "center", padding: 12}}>
                                    <span style={{color: "#1f50ea", cursor: "pointer", fontWeight: 500}}>
                                        Xem thêm <i className="fa-solid fa-chevron-down" style={{fontSize: 12}}></i>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div id="tour-terms-section" style={{scrollMarginTop: 120, marginTop: 40}}>
                            <h2>Thông tin cần lưu ý</h2>
                            <div style={{borderBottom: "1px solid #eee", marginBottom: 16, display: "flex", gap: 8}}>
                                {infoTabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setInfoTab(tab.key)}
                                        style={{
                                            border: "none",
                                            background: infoTab === tab.key ? "#eaf2ff" : "#f7f7f7",
                                            color: infoTab === tab.key ? "#1f50ea" : "#222",
                                            fontWeight: infoTab === tab.key ? 600 : 400,
                                            padding: "8px 18px",
                                            borderRadius: "6px 6px 0 0",
                                            cursor: "pointer",
                                            outline: "none",
                                            borderBottom: infoTab === tab.key ? "2px solid #1f50ea" : "2px solid transparent",
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div style={{padding: 8, background: "#fff", borderRadius: 8, minHeight: 120}}>{infoTabs.find((tab) => tab.key === infoTab)?.content}</div>
                        </div>
                        <div id="tour-reviews-section" ref={reviewsSectionRef} style={{scrollMarginTop: 120, marginTop: 40}}>
                            <h2>Đánh giá tour</h2>
                            <div className="tour-review-list">
                                {tour.reviews.map((r, idx) => (
                                    <div key={idx} className="tour-review-item">
                                        <div className="tour-review-name">{r.name}</div>
                                        <div className="tour-review-rating">
                                            {"★".repeat(r.rating)}
                                            <span>5/5</span>
                                        </div>
                                        <div className="tour-review-comment">{r.comment}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right: Price box */}
                <div className="tour-main-right" ref={tourMainRightRef} style={{position: "sticky", top: 100}}>
                    <div className="tour-price-box custom-tour-price-box">
                        <div className="tour-price-box-inner">
                            <div className="tour-price-box-title">Lịch Trình và Giá Tour</div>
                            <div className="tour-price-box-desc">Chọn Lịch Trình và Xem Giá:</div>
                            <div className="tour-date-btn-group" style={{position: "relative"}}>
                                <button className={"tour-date-btn" + (selectedDate === "13/06" ? " active" : "")} onClick={() => setSelectedDate("13/06")}>
                                    13/06
                                </button>
                                <button className={"tour-date-btn" + (selectedDate === "20/06" ? " active" : "")} onClick={() => setSelectedDate("20/06")}>
                                    20/06
                                </button>
                                <button className={"tour-date-btn" + (selectedDate === "27/06" ? " active" : "")} onClick={() => setSelectedDate("27/06")}>
                                    27/06
                                </button>
                                <button
                                    ref={buttonRef} // ⬅️ quan trọng
                                    className={"tour-date-btn-all tour-date-btn" + (selectedDate === "all" ? " active" : "")}
                                    onClick={() => {
                                        if (selectedDate === "all") {
                                            setShowCalendar((prev) => !prev); // toggle lịch
                                        } else {
                                            setSelectedDate("all");
                                            setShowCalendar(true);
                                        }
                                    }}
                                    style={{position: "relative", zIndex: 2}}
                                >
                                    <i className="fa-regular fa-calendar"></i>Tất cả
                                </button>
                                {showCalendar && selectedDate === "all" && (
                                    <div ref={calendarRef} className="tour-calendar-dropdown">
                                        <Calendar />
                                    </div>
                                )}
                            </div>
                            {/* Chọn số lượng khách */}
                            <div className="tour-guest-select-box">
                                {/* Người lớn */}
                                <div className="tour-guest-row guest-adult">
                                    <div className="tour-guest-info">
                                        <span className="tour-guest-label">Người lớn</span>
                                        <span className="tour-guest-desc">&gt; 8 tuổi</span>
                                    </div>
                                    <div className="tour-guest-qty">
                                        <span className="tour-guest-price">x {PRICE_ADULT.toLocaleString()}</span>
                                        <button className="qty-btn" onClick={() => handleGuestChange("adult", -1)}>
                                            <i className="fa-solid fa-minus"></i>
                                        </button>
                                        <span className="tour-guest-count">{guestCounts.adult}</span>
                                        <button className="qty-btn" onClick={() => handleGuestChange("adult", 1)}>
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                                {/* Trẻ em 5-8 */}
                                <div className="tour-guest-row">
                                    <div className="tour-guest-info">
                                        <span className="tour-guest-label">Trẻ em</span>
                                        <span className="tour-guest-desc">5 - 8 tuổi</span>
                                    </div>
                                    <div className="tour-guest-qty">
                                        <span className="tour-guest-price">x {PRICE_CHILD_58.toLocaleString()}</span>
                                        <button className="qty-btn" onClick={() => handleGuestChange("child58", -1)}>
                                            <i className="fa-solid fa-minus"></i>
                                        </button>
                                        <span className="tour-guest-count">{guestCounts.child58}</span>
                                        <button className="qty-btn" onClick={() => handleGuestChange("child58", 1)}>
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                                {/* Trẻ em 2-4 */}
                                <div className="tour-guest-row">
                                    <div className="tour-guest-info">
                                        <span className="tour-guest-label">Trẻ em</span>
                                        <span className="tour-guest-desc">2 - 4 tuổi</span>
                                    </div>
                                    <div className="tour-guest-qty">
                                        <span className="tour-guest-price">x {PRICE_CHILD_24.toLocaleString()}</span>
                                        <button className="qty-btn" onClick={() => handleGuestChange("child24", -1)}>
                                            <i className="fa-solid fa-minus"></i>
                                        </button>
                                        <span className="tour-guest-count">{guestCounts.child24}</span>
                                        <button className="qty-btn" onClick={() => handleGuestChange("child24", 1)}>
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                                {/* Trẻ nhỏ dưới 2 */}
                                <div className="tour-guest-row last">
                                    <div className="tour-guest-info">
                                        <span className="tour-guest-label">Trẻ nhỏ</span>
                                        <span className="tour-guest-desc">&lt; 2 tuổi</span>
                                    </div>
                                    <div className="tour-guest-qty">
                                        <span className="tour-guest-price">x {PRICE_INFANT.toLocaleString()}</span>
                                        <button className="qty-btn" onClick={() => handleGuestChange("infant", -1)}>
                                            <i className="fa-solid fa-minus"></i>
                                        </button>
                                        <span className="tour-guest-count">{guestCounts.infant}</span>
                                        <button className="qty-btn" onClick={() => handleGuestChange("infant", 1)}>
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Liên hệ xác nhận chỗ */}
                            <div className="tour-contact-confirm">
                                <i className="fa-regular fa-circle-question"></i>
                                <span>Liên hệ để xác nhận chỗ</span>
                            </div>
                            {/* Giá gốc và tổng giá */}
                            <div className="tour-price-summary">
                                <div className="tour-price-summary-item">
                                    <div className="tour-price-summary-label">Giá gốc</div>
                                    <div className="tour-price-summary-old">6.300.000 đ</div>
                                </div>

                                <div className="tour-price-summary-item">
                                    <div className="tour-price-summary-label-total">Tổng Giá Tour</div>
                                    <div className="tour-price-summary-total">{totalPrice.toLocaleString()} đ</div>
                                </div>
                            </div>
                            {/* Nút đặt */}
                            <Link
                                to={`/booking/${tour.id}`}
                                state={{
                                    title: tour.title,
                                    image: tour.images[0],
                                    duration: tour.duration,
                                    departurePlace: tour.location,
                                    price: totalPrice,
                                    rating: tour.rating,
                                    ratingCount: tour.ratingCount,
                                    departureDate: selectedDate,
                                    guestCounts: guestCounts,
                                }}
                                className="tour-book-btn custom-tour-book-btn"
                            >
                                Yêu cầu đặt
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related tours */}
            <div className="tour-related">
                <TourCategory title="Khách hàng còn xem thêm" tours={domesticTours} link="/danh-muc-tour?type=domestic" categoryId="domestic" />
            </div>

            {/* Suggestions */}
            <div className="tour-suggest">
                <h3>Có thể bạn sẽ thích</h3>
                <VietnamGrid destinations={tour.suggestions} />
            </div>
        </div>
    );
}

/*
    // Để một phần tử luôn nằm ở bên phải khi cuộn (sticky sidebar):
    // 1. Đặt phần tử đó trong một container cha có display: flex (ví dụ .tour-main).
    // 2. Đặt style cho phần tử cần sticky: position: sticky; top: [khoảng cách từ trên xuống].
    // 3. Đảm bảo cha của nó đủ cao để sticky hoạt động (thường là chiều cao của cột trái).
    // 4. Không dùng position: absolute trừ khi bạn kiểm soát được chiều cao cha.
    // 5. Nếu muốn dừng sticky khi chạm section nào đó, cần tính toán vị trí bằng JS hoặc dùng thư viện hỗ trợ sticky nâng cao.

    // Ví dụ với React:
    // <div className="tour-main" style={{display: "flex", position: "relative"}}>
    //   <div className="tour-main-left">...</div>
    //   <div className="tour-main-right" style={{position: "sticky", top: 100}}>...</div>
    // </div>
    // Và CSS:
    // .tour-main { display: flex; align-items: flex-start; }
    // .tour-main-right { position: sticky; top: 100px; }

    // Khi cuộn, .tour-main-right sẽ luôn nằm ở bên phải và dừng lại khi hết vùng cha.
    // Nếu muốn dừng sticky khi chạm section đánh giá, cần xử lý thêm bằng JS như ví dụ trước.
    */
