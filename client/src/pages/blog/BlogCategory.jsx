import React, {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

async function fetchCategory(slug) {
    const res = await fetch(`${API_BASE}/api/blogs/category/${encodeURIComponent(slug)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data && data.data ? data.data : [];
}

const CATEGORY_TITLES = {
    "tin-du-lich": "Tin du lịch",
    "kinh-nghiem": "Kinh nghiệm",
    "am-thuc": "Ẩm thực",
    "dich-vu-visa": "Dịch vụ Visa",
    "khuyen-mai": "Khuyến mãi",
};

const ALL_CATEGORIES = [
    {slug: "tin-du-lich", name: "Tin du lịch", icon: "📰"},
    {slug: "kinh-nghiem", name: "Kinh nghiệm", icon: "💡"},
    {slug: "am-thuc", name: "Ẩm thực", icon: "🍜"},
    {slug: "dich-vu-visa", name: "Dịch vụ Visa", icon: "📋"},
    {slug: "khuyen-mai", name: "Khuyến mãi", icon: "🎁"},
];

function pickRandomPosts(list, count) {
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

const BlogCategory = () => {
    const {slug} = useParams();
    // Use a safe title for the current category (fix undefined "category" variable)
    const categoryTitle = CATEGORY_TITLES[slug] || "Danh mục";
    const [items, setItems] = useState([]);
    const [activeTab, setActiveTab] = useState("latest");
    const [latestPosts, setLatestPosts] = useState([]);
    const [popularPosts, setPopularPosts] = useState([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const [current, news, exp, food, visa, promo] = await Promise.all([
                fetchCategory(slug),
                fetchCategory("tin-du-lich"),
                fetchCategory("kinh-nghiem"),
                fetchCategory("am-thuc"),
                fetchCategory("dich-vu-visa"),
                fetchCategory("khuyen-mai"),
            ]);
            if (!mounted) return;
            setItems(current);
            setLatestPosts(news.slice(0, 3));
            const pool = [...news, ...exp, ...food, ...visa, ...promo];
            setPopularPosts(pickRandomPosts(pool, 3));
        })();
        return () => {
            mounted = false;
        };
    }, [slug]);

    const styles = {
        breadcrumb: {
            backgroundColor: "#f8f9fa",
            padding: "12px 20px",
            borderRadius: "8px",
            fontSize: "14px",
        },
        breadcrumbLink: {
            color: "#6c757d",
            textDecoration: "none",
            transition: "color 0.3s",
        },
        categoryTitle: {
            fontSize: "32px",
            fontWeight: "700",
            color: "#212529",
            marginBottom: "30px",
            paddingBottom: "15px",
            borderBottom: "3px solid #0d6efd",
            display: "inline-block",
        },
        card: {
            border: "1px solid #e5e7eb",
            borderRadius: "4px",
            overflow: "hidden",
            transition: "all 0.3s ease",
            height: "100%",
            backgroundColor: "#fff",
        },
        cardHover: {
            transform: "translateY(-5px)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        },
        cardImg: {
            height: "220px",
            objectFit: "cover",
            transition: "transform 0.3s ease",
        },
        cardImgHover: {
            transform: "scale(1.05)",
        },
        cardBody: {
            padding: "20px",
        },
        cardTitle: {
            fontSize: "18px",
            fontWeight: "600",
            color: "#212529",
            marginBottom: "12px",
            lineHeight: "1.4",
            display: "-webkit-box",
            WebkitLineClamp: "2",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
        },
        dateText: {
            fontSize: "13px",
            color: "#6c757d",
            marginBottom: "15px",
        },
        detailBtn: {
            padding: "8px 20px",
            fontSize: "14px",
            fontWeight: "500",
            borderRadius: "6px",
            transition: "all 0.3s",
        },
        sidebarCard: {
            border: "none",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
        sidebarHeader: {
            backgroundColor: "#0d6efd",
            color: "#fff",
            padding: "15px 20px",
            fontSize: "16px",
            fontWeight: "600",
        },
        listItem: {
            padding: "12px 20px",
            borderBottom: "1px solid #f0f0f0",
            transition: "background-color 0.2s",
        },
        listItemHover: {
            backgroundColor: "#f8f9fa",
        },
        listLink: {
            color: "#495057",
            textDecoration: "none",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "color 0.2s",
        },
        navTabs: {
            borderBottom: "none",
        },
        navTab: {
            border: "none",
            borderBottom: "3px solid transparent",
            color: "#6c757d",
            fontWeight: "500",
            padding: "12px 24px",
            transition: "all 0.3s",
            backgroundColor: "transparent",
        },
        navTabActive: {
            color: "#0d6efd",
            borderBottom: "3px solid #0d6efd",
            backgroundColor: "transparent",
        },
        latestThumb: {
            width: "80px",
            height: "80px",
            objectFit: "cover",
            borderRadius: "8px",
        },
        postTitle: {
            fontSize: "14px",
            fontWeight: "500",
            color: "#212529",
            textDecoration: "none",
            lineHeight: "1.4",
            display: "-webkit-box",
            WebkitLineClamp: "2",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            transition: "color 0.2s",
        },
        emptyAlert: {
            backgroundColor: "#e7f3ff",
            border: "1px solid #b3d9ff",
            borderRadius: "8px",
            padding: "20px",
            color: "#004085",
        },
    };

    return (
        <div className="container my-5">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                        <Link to="/">Trang chủ</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="/blog">Blog</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        {categoryTitle}
                    </li>
                </ol>
            </nav>

            <div className="row g-4">
                {/* Left column */}
                <div className="col-lg-8 col-md-12">
                    <h2 className="category-title">{CATEGORY_TITLES[slug] || "Danh mục"}</h2>

                    {items && items.length > 0 ? (
                        <div className="row row-cols-1 row-cols-md-2 g-4">
                            {items.map((item) => (
                                <div className="col" key={item.id}>
                                    <div
                                        className="shadow-sm"
                                        style={styles.card}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-5px)";
                                            e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
                                            const img = e.currentTarget.querySelector("img");
                                            if (img) img.style.transform = "scale(1.05)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                                            const img = e.currentTarget.querySelector("img");
                                            if (img) img.style.transform = "scale(1)";
                                        }}
                                    >
                                        <img src={item.image} alt={item.title} className="card-img-top" style={styles.cardImg} />
                                        <div className="card-body" style={styles.cardBody}>
                                            <h5 className="card-title" style={styles.cardTitle}>
                                                {item.title}
                                            </h5>
                                            <div style={styles.dateText}>
                                                <i className="fa-regular fa-clock me-1" />
                                                {item.date}
                                            </div>
                                            <Link to={`/blog/${item.id}`} className="btn btn-outline-primary" style={styles.detailBtn}>
                                                Xem chi tiết
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="alert alert-info">Chưa có bài viết trong danh mục này</div>
                    )}
                </div>

                {/* Right column - Sidebar */}
                <div className="col-lg-4 col-md-12">
                    {/* Danh mục */}
                    <div className="card mb-4 shadow-sm sidebar-card">
                        <div className="card-header fw-bold" style={{paddingBottom: 12}}>
                            <div style={{fontWeight: 600}}>Danh mục</div>
                            <div style={{height: 3, width: 56, background: "#0d6efd", marginTop: 8}} />
                        </div>
                        <ul className="list-group list-group-flush" style={{marginTop: 8}}>
                            {ALL_CATEGORIES.map((c) => (
                                <li
                                    className={`list-group-item ${c.slug === slug ? "active" : ""}`}
                                    key={c.slug}
                                    style={{
                                        border: "none",
                                        paddingTop: 8,
                                        paddingBottom: 8,
                                        background: c.slug === slug ? "#f8f9fa" : "transparent",
                                    }}
                                >
                                    <Link
                                        to={`/blog/category/${c.slug}`}
                                        style={{color: c.slug === slug ? "#0d6efd" : undefined, textDecoration: "none"}}
                                    >
                                        {c.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tin du lịch */}
                    <div className="card mb-4 shadow-sm sidebar-card">
                        <div className="card-header fw-bold" style={{paddingBottom: 12}}>
                            <div style={{fontWeight: 600}}>Tin du lịch</div>
                            <div style={{height: 3, width: 56, background: "#0d6efd", marginTop: 8}} />
                        </div>
                        <ul className="list-group list-group-flush" style={{marginTop: 8}}>
                            <li className="list-group-item" style={{border: "none", paddingTop: 8, paddingBottom: 8}}>
                                <Link to="/blog/category/tin-du-lich" style={{textDecoration: "none"}}>
                                    Tin du lịch trong nước
                                </Link>
                            </li>
                            <li className="list-group-item" style={{border: "none", paddingTop: 8, paddingBottom: 8}}>
                                <Link to="/blog/category/tin-du-lich" style={{textDecoration: "none"}}>
                                    Tin du lịch nước ngoài
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Tabs: Mới nhất / Phổ biến */}
                    <div className="card mb-4 shadow-sm sidebar-card">
                        <div className="card-header p-0">
                            <ul className="nav nav-tabs" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={`nav-link ${activeTab === "latest" ? "active" : ""}`}
                                        onClick={() => setActiveTab("latest")}
                                        type="button"
                                        role="tab"
                                    >
                                        Mới nhất
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={`nav-link ${activeTab === "popular" ? "active" : ""}`}
                                        onClick={() => setActiveTab("popular")}
                                        type="button"
                                        role="tab"
                                    >
                                        Phổ biến
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div className="card-body">
                            {(activeTab === "latest" ? latestPosts : popularPosts).map((post) => (
                                <div className="d-flex align-items-start mb-3" key={post.id}>
                                    <img src={post.image} alt={post.title} className="img-fluid rounded me-3 latest-thumb" />
                                    <div>
                                        <Link to={`/blog/${post.id}`} className="d-block fw-semibold small">
                                            {post.title}
                                        </Link>
                                        <div className="text-muted small">
                                            <i className="fa-regular fa-clock me-1" />
                                            {post.date}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogCategory;
