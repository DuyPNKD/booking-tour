import React, {useEffect, useMemo, useState} from "react";
import {Link, useParams} from "react-router-dom";
import "./BlogDetail.css";
async function fetchDetail(id) {
    const res = await fetch(`http://localhost:3000/api/blogs/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.data ? data.data : null;
}

async function fetchByCategory(categoryOrSlug) {
    const res = await fetch(`http://localhost:3000/api/blogs/category/${encodeURIComponent(categoryOrSlug)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data && data.data ? data.data : [];
}

const BlogDetail = () => {
    const {id} = useParams();
    const [item, setItem] = useState(null);
    const [related, setRelated] = useState([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const detail = await fetchDetail(id);
            if (!mounted) return;
            if (!detail) {
                setItem(null);
                setRelated([]);
                return;
            }
            setItem(detail);
            // Fetch related by its category (public route accepts VN text too)
            const rel = await fetchByCategory(detail.category);
            if (!mounted) return;
            setRelated((rel || []).filter((b) => String(b.id) !== String(detail.id)).slice(0, 3));
        })();
        return () => {
            mounted = false;
        };
    }, [id]);

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
