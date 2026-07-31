import React, {useEffect, useMemo, useState} from "react";
import {Link, useParams} from "react-router-dom";
import "./BlogDetail.css";

const API_BASE = import.meta.env.VITE_API_BASE || "";

async function fetchDetail(id) {
    const res = await fetch(`${API_BASE}/api/blogs/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.data ? data.data : null;
}

async function fetchByCategory(categoryOrSlug) {
    const res = await fetch(`${API_BASE}/api/blogs/category/${encodeURIComponent(categoryOrSlug)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data && data.data ? data.data : [];
}

const FALLBACK_ARTICLES = {
    "1": {
        id: 1,
        title: "Ngành du lịch Việt Nam đón lượt khách quốc tế kỷ lục trong năm 2025 - 2026",
        category: "Tin du lịch",
        date: "30/07/2026",
        content: `
            <p style="font-size: 1.1rem; line-height: 1.8; color: #333; margin-bottom: 20px;">Theo thống kê mới nhất từ Tổng cục Du lịch, Việt Nam vừa xác lập kỷ lục ấn tượng về tăng trưởng lượng khách quốc tế ghé thăm. Sự bùng nổ của các đường bay quốc tế mở rộng cùng chính sách thị thực linh hoạt đã mang lại thành công vang dội.</p>
            
            <img src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=80" alt="Vịnh Hạ Long Việt Nam" style="width: 100%; border-radius: 12px; margin: 20px 0; max-height: 450px; object-fit: cover;" />
            <p style="text-align: center; font-size: 0.9rem; color: #666; font-style: italic; margin-bottom: 24px;">Vịnh Hạ Long - Một trong những biểu tượng thu hút hàng triệu du khách quốc tế mỗi năm</p>

            <h3 style="margin-top: 28px; color: #183153; font-weight: 700; font-size: 1.4rem;">1. Các thị trường quốc tế tăng trưởng mạnh mẽ</h3>
            <p style="line-height: 1.8; color: #444;">Hàn Quốc, Trung Quốc, Nhật Bản và các nước Châu Âu tiếp tục là những thị trường đóng góp lượng khách lớn nhất. Việc mở rộng chính sách miễn thị thực tạm trú lên đến 45 ngày đã thúc đẩy du khách lựa chọn Việt Nam cho các chuyến kỳ nghỉ dài ngày hơn.</p>

            <blockquote style="border-left: 4px solid #1f50ea; margin: 24px 0; font-style: italic; color: #1f50ea; background: #f0f4ff; padding: 16px 20px; border-radius: 0 8px 8px 0; font-size: 1.05rem;">
                "Việt Nam không chỉ nổi tiếng với cảnh quan thiên nhiên kỳ vĩ mà còn thu hút du khách bởi sự ấm áp, hiếu khách cùng nét văn hóa ẩm thực độc đáo khó quên."
            </blockquote>

            <h3 style="margin-top: 28px; color: #183153; font-weight: 700; font-size: 1.4rem;">2. Những điểm đến bùng nổ du khách</h3>
            <img src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1000&q=80" alt="Du lịch miền núi và biển Việt Nam" style="width: 100%; border-radius: 12px; margin: 20px 0; max-height: 420px; object-fit: cover;" />
            <p style="line-height: 1.8; color: #444;">Các địa danh như Vịnh Hạ Long, Phú Quốc, Hội An, Đà Nẵng và Hà Giang luôn đạt công suất phòng khách sạn cao kỷ lục. Ngành du lịch dự kiến sẽ tiếp tục đà bứt phá mạnh mẽ trong thời gian tới.</p>
        `,
    },
    "2": {
        id: 2,
        title: "Khai mạc lễ hội văn hóa và ẩm thực biển Mũi Né Phan Thiết",
        category: "Tin du lịch",
        date: "28/07/2026",
        content: `
            <p style="font-size: 1.1rem; line-height: 1.8; color: #333; margin-bottom: 20px;">Lễ hội văn hóa ẩm thực biển Phan Thiết chính thức mở màn tại bãi biển Mũi Né xinh đẹp, thu hút hàng ngàn du khách trong và ngoài nước hòa mình vào bầu không khí náo nhiệt rực rỡ sắc màu.</p>
            
            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80" alt="Biển Mũi Né Phan Thiết" style="width: 100%; border-radius: 12px; margin: 20px 0; max-height: 450px; object-fit: cover;" />
            <p style="text-align: center; font-size: 0.9rem; color: #666; font-style: italic; margin-bottom: 24px;">Bãi biển Mũi Né rực rỡ ánh nắng đón chào du khách tham dự lễ hội</p>

            <h3 style="margin-top: 28px; color: #183153; font-weight: 700; font-size: 1.4rem;">1. Trải nghiệm không gian ẩm thực biển đặc sắc</h3>
            <p style="line-height: 1.8; color: #444;">Du khách được trực tiếp thưởng thức hàng trăm món hải sản tươi sống được chế biến công phu: lẩu thả Phan Thiết, mực một nắng nướng sa tế, gỏi cá mai cùng các món quà biển thơm ngon.</p>

            <h3 style="margin-top: 28px; color: #183153; font-weight: 700; font-size: 1.4rem;">2. Chuỗi hoạt động thể thao & giải trí</h3>
            <p style="line-height: 1.8; color: #444;">Đến với lễ hội, du khách còn được thưởng lãm màn biểu diễn lướt ván diều chuyên nghiệp, giải đua thuyền thúng truyền thống và đêm nhạc hội EDM sôi động bên bờ biển.</p>
        `,
    },
    "3": {
        id: 3,
        title: "Phú Quốc vào top 10 hòn đảo hàng đầu Châu Á do du khách toàn cầu bình chọn",
        category: "Tin du lịch",
        date: "25/07/2026",
        content: `
            <p style="font-size: 1.1rem; line-height: 1.8; color: #333; margin-bottom: 20px;">Tạp chí du lịch quốc tế uy tín vừa vinh danh Đảo Ngọc Phú Quốc lọt vào top 10 hòn đảo nghỉ dưỡng tuyệt vời nhất Châu Á nhờ thiên nhiên tuyệt mỹ cùng hệ thống khu nghỉ dưỡng đẳng cấp thế giới.</p>
            
            <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80" alt="Đảo Ngọc Phú Quốc" style="width: 100%; border-radius: 12px; margin: 20px 0; max-height: 450px; object-fit: cover;" />
            <p style="text-align: center; font-size: 0.9rem; color: #666; font-style: italic; margin-bottom: 24px;">Làn nước biển ngọc bích tuyệt đẹp thu hút du khách toàn cầu tại Phú Quốc</p>

            <h3 style="margin-top: 28px; color: #183153; font-weight: 700; font-size: 1.4rem;">1. Thiên đường nghỉ dưỡng du lịch biển</h3>
            <p style="line-height: 1.8; color: #444;">Phú Quốc nổi tiếng với Bãi Kem, Bãi Sao, cáp treo Hòn Thơm vượt biển dài nhất thế giới, tổ hợp giải trí Grand World, VinWonders và Vinpearl Safari thu hút hàng triệu lượt khách mỗi năm.</p>
        `,
    },
    "4": {
        id: 4,
        title: "Trải nghiệm tuyến tàu hỏa di sản nối liền Đà Nẵng và Huế",
        category: "Tin du lịch",
        date: "20/07/2026",
        content: `
            <p style="font-size: 1.1rem; line-height: 1.8; color: #333; margin-bottom: 20px;">Tuyến tàu hỏa "Kết nối di sản miền Trung" đi qua đèo Hải Vân hùng vĩ ngắm vịnh Lăng Cô thơ mộng đang trở thành trải nghiệm du lịch số một không thể bỏ lỡ.</p>
            
            <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80" alt="Tàu hỏa di sản Huế Đà Nẵng" style="width: 100%; border-radius: 12px; margin: 20px 0; max-height: 450px; object-fit: cover;" />
            <p style="text-align: center; font-size: 0.9rem; color: #666; font-style: italic; margin-bottom: 24px;">Ngắm nhìn đèo Hải Vân và bờ biển xanh ngắt qua khung cửa sổ tàu hỏa</p>

            <h3 style="margin-top: 28px; color: #183153; font-weight: 700; font-size: 1.4rem;">1. Không gian văn hóa ẩm thực độc đáo</h3>
            <p style="line-height: 1.8; color: #444;">Mỗi toa tàu được trang trí hoài cổ, phục vụ âm nhạc ca Huế cùng các món ẩm thực truyền thống miền Trung đưa du khách vào một hành trình đắm say.</p>
        `,
    },
    "5": {
        id: 5,
        title: "10 đặc sản Điện Biên ngon không thể cưỡng lại",
        category: "Ẩm thực",
        date: "28/07/2026",
        content: `
            <p style="font-size: 1.1rem; line-height: 1.8; color: #333; margin-bottom: 20px;">Ẩm thực Điện Biên mang nét đặc trưng quyến rũ của núi rừng Tây Bắc với gia vị mắc khén đậm đà, hạt dổi nồng nàn cùng hương vị thơm dẻo của lúa nếp nương.</p>
            
            <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80" alt="Ẩm thực Tây Bắc Điện Biên" style="width: 100%; border-radius: 12px; margin: 20px 0; max-height: 450px; object-fit: cover;" />
            <p style="text-align: center; font-size: 0.9rem; color: #666; font-style: italic; margin-bottom: 24px;">Mâm cỗ ẩm thực đặc trưng vùng cao Điện Biên Tây Bắc</p>

            <h3 style="margin-top: 28px; color: #183153; font-weight: 700; font-size: 1.4rem;">1. Thịt trâu gác bếp Tây Bắc</h3>
            <p style="line-height: 1.8; color: #444;">Món ăn nổi tiếng được làm từ bắp trâu tươi ngon, tẩm ướp mắc khén, ớt, gừng rồi gác trên bếp củi truyền thống của người Thái. Vị ngọt đậm đà của thịt hòa quyện cùng mùi khói bếp cay nồng khiến ai thưởng thức cũng phải mê đắm.</p>

            <h3 style="margin-top: 28px; color: #183153; font-weight: 700; font-size: 1.4rem;">2. Xôi nếp nương & Chẩm chéo</h3>
            <p style="line-height: 1.8; color: #444;">Nếp nương Điện Biên hạt to tròn, dẻo thơm ngào ngạt ăn kèm chẩm chéo - loại thức chấm thần thánh ngâm cùng hạt dổi và rau thơm rừng.</p>
        `,
    },
    "6": {
        id: 6,
        title: "Cách ít người biết để thưởng thức Food tour Hạ Long chuẩn vị",
        category: "Ẩm thực",
        date: "26/07/2026",
        content: `
            <p style="font-size: 1.1rem; line-height: 1.8; color: #333; margin-bottom: 20px;">Hạ Long không chỉ hút du khách bởi vịnh biển di sản mà còn bởi thiên đường ẩm thực hải sản phong phú và tươi ngon bậc nhất miền Bắc.</p>
            
            <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80" alt="Chả mực Hạ Long" style="width: 100%; border-radius: 12px; margin: 20px 0; max-height: 450px; object-fit: cover;" />
            <p style="text-align: center; font-size: 0.9rem; color: #666; font-style: italic; margin-bottom: 24px;">Chả mực giã tay Hạ Long nướng vàng ươm thơm phức</p>

            <h3 style="margin-top: 28px; color: #183153; font-weight: 700; font-size: 1.4rem;">1. Chả mực giã tay truyền thống</h3>
            <p style="line-height: 1.8; color: #444;">Chả mực Hạ Long làm từ mực mai tươi sống giã tay thủ công, khi chiên rán có độ giòn sần sật, vị ngọt đậm tự nhiên ăn kèm bánh cuốn nóng giòn.</p>

            <h3 style="margin-top: 28px; color: #183153; font-weight: 700; font-size: 1.4rem;">2. Bún bề bề & Sữa chua trần trâu Hạ Long</h3>
            <p style="line-height: 1.8; color: #444;">Tô bún bề bề nước dùng ngọt thanh từ hải sản và món tráng miệng sữa chua trần trâu dẻo quánh trứ danh là bộ đôi hoàn hảo cho hành trình Food tour.</p>
        `,
    },
    "7": {
        id: 7,
        title: "Tổng hợp những quán ăn ngon ở Mù Cang Chải nhất định phải thử",
        category: "Ẩm thực",
        date: "24/07/2026",
        content: `
            <p style="font-size: 1.1rem; line-height: 1.8; color: #333; margin-bottom: 20px;">Khi đi săn mây và chiêm ngưỡng mùa lúa chín vàng óng tại Mù Cang Chải, chuyến đi sẽ trọn vẹn hơn khi bạn thưởng thức những món ăn đặc sản vùng cao Yên Bái.</p>
            
            <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80" alt="Ẩm thực Mù Cang Chải" style="width: 100%; border-radius: 12px; margin: 20px 0; max-height: 450px; object-fit: cover;" />
            <p style="text-align: center; font-size: 0.9rem; color: #666; font-style: italic; margin-bottom: 24px;">Hương vị ẩm thực núi rừng tươi ngon tại Mù Cang Chải</p>

            <h3 style="margin-top: 28px; color: #183153; font-weight: 700; font-size: 1.4rem;">1. Cốm nếp Tú Lệ & Lợn kẹp cây rừng nướng</h3>
            <p style="line-height: 1.8; color: #444;">Cốm Tú Lệ dẻo thơm ngạt ngào kết hợp lợn bản kẹp cây rừng nướng than hoa cho vị béo ngậy mà không ngấy.</p>
        `,
    },
    "8": {
        id: 8,
        title: "Danh sách nhà hàng hải sản ở đảo Cô Tô tươi ngon, chất lượng tuyệt vời",
        category: "Ẩm thực",
        date: "22/07/2026",
        content: `
            <p style="font-size: 1.1rem; line-height: 1.8; color: #333; margin-bottom: 20px;">Đảo Cô Tô nổi tiếng với nguồn hải sản dồi dào, từ bề bề, ốc móng tay, tu hài cho đến bào ngư tươi rói được đánh bắt trong ngày.</p>
            
            <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80" alt="Nhà hàng hải sản Cô Tô" style="width: 100%; border-radius: 12px; margin: 20px 0; max-height: 450px; object-fit: cover;" />
            <p style="text-align: center; font-size: 0.9rem; color: #666; font-style: italic; margin-bottom: 24px;">Nhà hàng ven biển Cô Tô với tầm nhìn hoàng hôn tuyệt đẹp</p>

            <h3 style="margin-top: 28px; color: #183153; font-weight: 700; font-size: 1.4rem;">1. Thưởng thức BBQ hải sản bên bờ biển</h3>
            <p style="line-height: 1.8; color: #444;">Tận hưởng tiệc nướng hải sản ngoài trời ngắm sóng biển róc rách và thưởng thức cua biển, ghẹ hấp sả gừng tươi giòn ngọt.</p>
        `,
    },
};

const BlogDetail = () => {
    const {id} = useParams();
    const [item, setItem] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        (async () => {
            try {
                const detail = await fetchDetail(id);
                if (!mounted) return;
                if (detail) {
                    setItem(detail);
                    const rel = await fetchByCategory(detail.category);
                    if (!mounted) return;
                    setRelated((rel || []).filter((b) => String(b.id) !== String(detail.id)).slice(0, 3));
                } else if (FALLBACK_ARTICLES[String(id)]) {
                    setItem(FALLBACK_ARTICLES[String(id)]);
                } else {
                    setItem({
                        id: id,
                        title: `Bài viết thông tin chi tiết #${id}`,
                        category: "Cẩm nang du lịch",
                        date: "06/05/2025",
                        content: `<p>Nội dung chi tiết của bài viết số ${id} đang được cập nhật thêm. Bạn vui lòng quay lại sau nhé!</p>`,
                    });
                }
            } catch (err) {
                console.error("Fetch blog detail error:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="container my-5 blog-detail-skeleton">
                {/* Breadcrumb Skeleton */}
                <div className="skeleton-box mb-4" style={{width: 250, height: 18}}></div>

                <div className="blog-detail-content mx-auto">
                    {/* Title Skeleton */}
                    <div className="skeleton-box mb-3" style={{width: "85%", height: 36, borderRadius: 8}}></div>
                    <div className="skeleton-box mb-4" style={{width: "55%", height: 28, borderRadius: 8}}></div>

                    {/* Date Skeleton */}
                    <div className="skeleton-box mb-4" style={{width: 140, height: 16}}></div>

                    {/* Featured Image Skeleton */}
                    <div className="skeleton-box mb-4" style={{width: "100%", height: 350, borderRadius: 12}}></div>

                    {/* Content Lines Skeleton */}
                    <div className="skeleton-box mb-3" style={{width: "100%", height: 18}}></div>
                    <div className="skeleton-box mb-3" style={{width: "98%", height: 18}}></div>
                    <div className="skeleton-box mb-3" style={{width: "95%", height: 18}}></div>
                    <div className="skeleton-box mb-3" style={{width: "70%", height: 18}}></div>

                    <div className="skeleton-box my-4" style={{width: "50%", height: 24, borderRadius: 6}}></div>

                    <div className="skeleton-box mb-3" style={{width: "100%", height: 18}}></div>
                    <div className="skeleton-box mb-3" style={{width: "92%", height: 18}}></div>
                    <div className="skeleton-box mb-3" style={{width: "85%", height: 18}}></div>
                </div>

                {/* Related posts skeleton */}
                <div className="mt-5">
                    <div className="skeleton-box mb-3" style={{width: 200, height: 24}}></div>
                    <div className="row row-cols-1 row-cols-md-3 g-4">
                        {[1, 2, 3].map((n) => (
                            <div className="col" key={n}>
                                <div className="card h-100 border-0 shadow-sm" style={{borderRadius: 12, overflow: "hidden"}}>
                                    <div className="skeleton-box" style={{width: "100%", height: 160}}></div>
                                    <div className="card-body">
                                        <div className="skeleton-box mb-2" style={{width: "85%", height: 18}}></div>
                                        <div className="skeleton-box" style={{width: "40%", height: 14}}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="container my-5">
                <div className="alert alert-warning" role="alert">
                    Bài viết không tồn tại
                </div>
                <Link to="/blog" className="btn btn-outline-primary mt-3">
                    Quay lại
                </Link>
            </div>
        );
    }

    return (
        <div className="container my-5">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/">Trang chủ</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="/blog">Blog</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        {item.title}
                    </li>
                </ol>
            </nav>

            <div className="blog-detail-content mx-auto">
                {/* Title */}
                <h1 className="fw-bold mb-3">{item.title}</h1>

                {/* Date */}
                {item.date && <small className="text-muted mb-4 d-block">{item.date}</small>}

                {/* Content */}
                <div className="mb-4">
                    {item.content ? <div dangerouslySetInnerHTML={{__html: item.content}} /> : <p className="lh-lg">Nội dung đang cập nhật.</p>}
                </div>

                <Link to="/blog" className="btn btn-outline-primary mt-3">
                    Quay lại
                </Link>
            </div>

            {/* Related posts */}
            <div className="mt-5">
                <h5 className="mb-3">Bài viết liên quan</h5>
                <div className="row row-cols-1 row-cols-md-3 g-4">
                    {related.map((r) => (
                        <div className="col" key={r.id}>
                            <div className="card h-100">
                                {r.image && <img src={r.image} className="card-img-top" alt={r.title} />}
                                <div className="card-body">
                                    <h6 className="card-title">{r.title}</h6>
                                    <Link to={`/blog/${r.id}`} className="stretched-link" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
