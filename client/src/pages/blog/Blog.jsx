import React, {useEffect, useMemo, useState} from "react";
import {useLocation, Link} from "react-router-dom";
import "./Blog.css";

const TABS = [
    {key: "news", label: "Tin du lịch"},
    {key: "experience", label: "Kinh nghiệm"},
    {key: "food", label: "Ẩm thực"},
    {key: "visa", label: "Dịch vụ visa"},
    {key: "promotion", label: "Khuyến mãi"},
];

// map tab key -> category slug used by backend/routes
const CATEGORY_SLUG = {
    news: "tin-du-lich",
    experience: "kinh-nghiem",
    food: "am-thuc",
    visa: "dich-vu-visa",
    promotion: "khuyen-mai",
};

// Helper: fetch category posts
async function fetchCategory(slug) {
    const res = await fetch(`http://localhost:3000/api/blogs/category/${encodeURIComponent(slug)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data && data.data ? data.data : [];
}

const Blog = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get("category");

    const initialTab = useMemo(() => {
        const found = TABS.find((t) => t.key === categoryParam);
        return found ? found.key : "news";
    }, [categoryParam]);

    const [activeTab, setActiveTab] = useState(initialTab);

    // State for real data
    const [news, setNews] = useState([]);
    const [experience, setExperience] = useState([]);
    const [food, setFood] = useState([]);
    const [visa, setVisa] = useState([]);
    const [promotion, setPromotion] = useState([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const [n, e, f, v, p] = await Promise.all([
                fetchCategory("tin-du-lich"),
                fetchCategory("kinh-nghiem"),
                fetchCategory("am-thuc"),
                fetchCategory("dich-vu-visa"),
                fetchCategory("khuyen-mai"),
            ]);
            if (!mounted) return;
            // Limit counts: news/experience/food = 5, visa/promotion = 6
            const limit = (arr, max) => (Array.isArray(arr) ? arr.slice(0, max) : []);
            setNews(limit(n, 5));
            setExperience(limit(e, 5));
            setFood(limit(f, 5));
            setVisa(limit(v, 6));
            setPromotion(limit(p, 6));
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const renderNews = (list) => {
        if (!Array.isArray(list) || list.length === 0) {
            return <div className="alert alert-light border">Chưa có bài viết.</div>;
        }
        const featured = list[0];
        const others = list.slice(1);
        return (
            <div className="blog-news">
                <div className="blog-news-featured">
                    <div className="featured-image-wrap">
                        <img className="featured-image" src={featured?.image || ""} alt={featured?.title || "featured"} />
                    </div>
                    <div className="featured-content">
                        <h3 className="featured-title">{featured?.title}</h3>
                        {featured?.description && <p className="featured-desc">{featured.description}</p>}
                        <Link className="featured-btn" to={`/blog/${featured?.id}`}>
                            Xem thêm
                        </Link>
                    </div>
                </div>
                <div className="blog-news-grid">
                    {others.map((item) => (
                        <div key={item.id} className="news-card">
                            <div className="news-thumb-wrap">
                                <img className="news-thumb" src={item.image || ""} alt={item.title} />
                            </div>
                            <div className="news-info">
                                <Link className="news-title" to={`/blog/${item.id}`}>
                                    {item.title}
                                </Link>
                                <div className="news-date">
                                    <i className="fa-regular fa-clock" /> {item.date}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderAllSections = () => {
        return (
            <>
                <section id="news" className="blog-section">
                    <div className="category-header">
                        <h2>Tin du lịch</h2>
                        <Link className="view-all" to={`/blog/category/${CATEGORY_SLUG.news}`}>
                            <span>Xem thêm</span>
                            <i className="fa-solid fa-arrow-right" />
                        </Link>
                    </div>
                    {renderNews(news)}
                </section>

                <section id="experience" className="blog-section">
                    <div className="category-header">
                        <h2>Kinh nghiệm</h2>
                        <Link className="view-all" to={`/blog/category/${CATEGORY_SLUG.experience}`}>
                            <span>Xem thêm</span>
                            <i className="fa-solid fa-arrow-right" />
                        </Link>
                    </div>
                    {renderNews(experience)}
                </section>

                <section id="food" className="blog-section">
                    <div className="category-header">
                        <h2>Ẩm thực</h2>
                        <Link className="view-all" to={`/blog/category/${CATEGORY_SLUG.food}`}>
                            <span>Xem thêm</span>
                            <i className="fa-solid fa-arrow-right" />
                        </Link>
                    </div>
                    {renderNews(food)}
                </section>

                <section id="visa" className="blog-section visa-section">
                    <div className="category-header">
                        <h2>Dịch vụ Visa</h2>
                        <Link className="view-all" to={`/blog/category/${CATEGORY_SLUG.visa}`}>
                            <span>Xem thêm</span>
                            <i className="fa-solid fa-arrow-right" />
                        </Link>
                    </div>
                    <div className="grid-six">
                        {visa.map((item) => (
                            <div key={item.id} className="grid-card">
                                <div className="grid-thumb-wrap">
                                    <img className="grid-thumb" src={item.image} alt={item.title} />
                                </div>
                                <div className="grid-info">
                                    <Link className="grid-title" to={`/blog?id=${item.id}`}>
                                        {item.title}
                                    </Link>
                                    <div className="grid-date">
                                        <i className="fa-regular fa-clock" /> {item.date}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="promotion" className="blog-section promotion-section">
                    <div className="category-header">
                        <h2>Khuyến Mãi</h2>
                        <Link className="view-all" to={`/blog/category/${CATEGORY_SLUG.promotion}`}>
                            <span>Xem thêm</span>
                            <i className="fa-solid fa-arrow-right" />
                        </Link>
                    </div>
                    <div className="grid-six">
                        {promotion.map((item) => (
                            <div key={item.id} className="grid-card">
                                <div className="grid-thumb-wrap">
                                    <img className="grid-thumb" src={item.image} alt={item.title} />
                                </div>
                                <div className="grid-info">
                                    <Link className="grid-title" to={`/blog?id=${item.id}`}>
                                        {item.title}
                                    </Link>
                                    <div className="grid-date">
                                        <i className="fa-regular fa-clock" /> {item.date}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </>
        );
    };

    return (
        <div className="blog">
            <div className="blog-container">
                <div className="blog-left">{renderAllSections()}</div>
                <aside className="blog-right">
                    <div className="blog-tabs">
                        <div className="blog-tabs-header">
                            <h3 className="blog-tabs-title">Danh mục</h3>
                            <div className="border-b-primary-light w-16 border-b-2 mt-1" style={{color: "#0099cc", width: "4rem"}}></div>
                        </div>

                        {TABS.slice(0, 5).map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                className={`blog-tab ${activeTab === tab.key ? "active" : ""}`}
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    const el = document.getElementById(tab.key);
                                    if (el) el.scrollIntoView({behavior: "smooth", block: "start"});
                                }}
                                aria-pressed={activeTab === tab.key}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Blog;
