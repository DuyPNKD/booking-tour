import React from "react";
import {Link} from "react-router-dom";
import "./Home.css";

const Home = () => {
    // Mock data for domestic tours
    const domesticTours = [
        {
            id: 1,
            title: "Tour Hà Nội - Sapa",
            image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            duration: "3 ngày 2 đêm",
            price: "2.500.000",
        },
        {
            id: 2,
            title: "Tour Đà Nẵng - Hội An",
            image: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            duration: "4 ngày 3 đêm",
            price: "3.500.000",
        },
        {
            id: 3,
            title: "Tour Nha Trang - Đà Lạt",
            image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            duration: "5 ngày 4 đêm",
            price: "4.200.000",
        },
    ];

    // Mock data for international tours
    const internationalTours = [
        {
            id: 4,
            title: "Tour Singapore - Malaysia",
            image: "https://images.unsplash.com/photo-1534274867514-d5b80ef98447?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            duration: "5 ngày 4 đêm",
            price: "12.500.000",
        },
        {
            id: 5,
            title: "Tour Thái Lan - Bangkok",
            image: "https://images.unsplash.com/photo-1528181304800-259b08848526?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            duration: "4 ngày 3 đêm",
            price: "9.800.000",
        },
        {
            id: 6,
            title: "Tour Hàn Quốc - Seoul",
            image: "https://images.unsplash.com/photo-1538485399081-695137bcebcd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            duration: "6 ngày 5 đêm",
            price: "15.900.000",
        },
    ];

    // Mock data for cherry blossom tours
    const cherryBlossomTours = [
        {
            id: 7,
            title: "Tour Nhật Bản Mùa Hoa Anh Đào",
            image: "https://images.unsplash.com/photo-1541233349642-6e425fe619a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            duration: "7 ngày 6 đêm",
            price: "25.000.000",
        },
        {
            id: 8,
            title: "Tour Hàn Quốc Mùa Hoa Anh Đào",
            image: "https://images.unsplash.com/photo-1528164344705-47542687000d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            duration: "6 ngày 5 đêm",
            price: "18.500.000",
        },
    ];

    // Mock data for explore Vietnam tours
    const exploreVietnamTours = [
        {
            id: 9,
            title: "Tour Miền Tây Sông Nước",
            image: "https://images.unsplash.com/photo-1583417319070-4a9415c5d1e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            duration: "4 ngày 3 đêm",
            price: "3.800.000",
        },
        {
            id: 10,
            title: "Tour Phú Quốc - Đảo Ngọc",
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            duration: "5 ngày 4 đêm",
            price: "5.500.000",
        },
    ];

    // Mock data for abroad tours
    const abroadTours = [
        {
            id: 11,
            title: "Tour Châu Âu - Pháp, Ý, Thụy Sĩ",
            image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            duration: "12 ngày 11 đêm",
            price: "45.000.000",
        },
        {
            id: 12,
            title: "Tour Úc - Sydney, Melbourne",
            image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            duration: "8 ngày 7 đêm",
            price: "32.000.000",
        },
    ];

    // Mock data for travel guides
    const travelGuides = [
        {
            id: 1,
            title: "Kinh nghiệm du lịch Nhật Bản mùa hoa anh đào",
            image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            category: "Cẩm nang du lịch",
        },
        {
            id: 2,
            title: "Top 10 địa điểm check-in tại Đà Lạt",
            image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            category: "Cẩm nang du lịch",
        },
    ];

    return (
        <div className="home">
            {/* Banner Section */}
            <section className="banner">
                <div className="banner-content">
                    <h1>Khám phá thế giới cùng chúng tôi</h1>
                    <p>Hành trình của bạn bắt đầu từ đây</p>
                </div>
            </section>

            {/* Search Box */}
            <div className="search-container">
                <div className="search-box">
                    <input type="text" placeholder="Bạn muốn đi đâu?" />
                    <input type="date" placeholder="Ngày đi" />
                    <input type="date" placeholder="Ngày về" />
                    <select>
                        <option value="">Số người</option>
                        <option value="1">1 người</option>
                        <option value="2">2 người</option>
                        <option value="3">3 người</option>
                        <option value="4">4 người</option>
                        <option value="5">5+ người</option>
                    </select>
                    <button className="search-button">Tìm kiếm</button>
                </div>
            </div>

            {/* Tour Categories */}
            <div className="tour-categories">
                {/* Tour Hot Trong Nước */}
                <section className="category-section">
                    <div className="category-header">
                        <h2>Tour Hot Trong Nước Giá Tốt</h2>
                        <Link to="/tours/domestic" className="view-all">
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="tours-grid">
                        {domesticTours.map((tour) => (
                            <div key={tour.id} className="tour-card">
                                <img src={tour.image} alt={tour.title} className="tour-image" />
                                <div className="tour-content">
                                    <h3>{tour.title}</h3>
                                    <p className="tour-duration">{tour.duration}</p>
                                    <p className="tour-price">{tour.price} VNĐ</p>
                                    <Link to={`/tour/${tour.id}`} className="tour-button">
                                        Xem chi tiết
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tour Hot Nước Ngoài */}
                <section className="category-section">
                    <div className="category-header">
                        <h2>Tour Hot Nước Ngoài Giá Tốt</h2>
                        <Link to="/tours/international" className="view-all">
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="tours-grid">
                        {internationalTours.map((tour) => (
                            <div key={tour.id} className="tour-card">
                                <img src={tour.image} alt={tour.title} className="tour-image" />
                                <div className="tour-content">
                                    <h3>{tour.title}</h3>
                                    <p className="tour-duration">{tour.duration}</p>
                                    <p className="tour-price">{tour.price} VNĐ</p>
                                    <Link to={`/tour/${tour.id}`} className="tour-button">
                                        Xem chi tiết
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Chùm Tour Mùa Anh Đào */}
                <section className="category-section">
                    <div className="category-header">
                        <h2>Chùm Tour Mùa Anh Đào</h2>
                        <Link to="/tours/cherry-blossom" className="view-all">
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="tours-grid">
                        {cherryBlossomTours.map((tour) => (
                            <div key={tour.id} className="tour-card">
                                <img src={tour.image} alt={tour.title} className="tour-image" />
                                <div className="tour-content">
                                    <h3>{tour.title}</h3>
                                    <p className="tour-duration">{tour.duration}</p>
                                    <p className="tour-price">{tour.price} VNĐ</p>
                                    <Link to={`/tour/${tour.id}`} className="tour-button">
                                        Xem chi tiết
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Khám Phá Việt Nam */}
                <section className="category-section">
                    <div className="category-header">
                        <h2>Khám Phá Việt Nam</h2>
                        <Link to="/tours/explore-vietnam" className="view-all">
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="tours-grid">
                        {exploreVietnamTours.map((tour) => (
                            <div key={tour.id} className="tour-card">
                                <img src={tour.image} alt={tour.title} className="tour-image" />
                                <div className="tour-content">
                                    <h3>{tour.title}</h3>
                                    <p className="tour-duration">{tour.duration}</p>
                                    <p className="tour-price">{tour.price} VNĐ</p>
                                    <Link to={`/tour/${tour.id}`} className="tour-button">
                                        Xem chi tiết
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Vi Vu Nước Ngoài */}
                <section className="category-section">
                    <div className="category-header">
                        <h2>Vi Vu Nước Ngoài</h2>
                        <Link to="/tours/abroad" className="view-all">
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="tours-grid">
                        {abroadTours.map((tour) => (
                            <div key={tour.id} className="tour-card">
                                <img src={tour.image} alt={tour.title} className="tour-image" />
                                <div className="tour-content">
                                    <h3>{tour.title}</h3>
                                    <p className="tour-duration">{tour.duration}</p>
                                    <p className="tour-price">{tour.price} VNĐ</p>
                                    <Link to={`/tour/${tour.id}`} className="tour-button">
                                        Xem chi tiết
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Cẩm Nang Du Lịch */}
                <section className="category-section">
                    <div className="category-header">
                        <h2>Cẩm Nang Du Lịch</h2>
                        <Link to="/travel-guide" className="view-all">
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="travel-guide-grid">
                        {travelGuides.map((guide) => (
                            <div key={guide.id} className="guide-card">
                                <img src={guide.image} alt={guide.title} className="guide-image" />
                                <div className="guide-content">
                                    <span className="guide-category">{guide.category}</span>
                                    <h3>{guide.title}</h3>
                                    <Link to={`/travel-guide/${guide.id}`} className="guide-button">
                                        Đọc thêm
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
