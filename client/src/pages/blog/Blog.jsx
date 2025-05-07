import React from "react";
import {useLocation} from "react-router-dom";

const Blog = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const category = queryParams.get("category"); // Lấy giá trị của query parameter "category"

    return (
        <div className="blog">
            <h1>Cẩm Nang Du Lịch</h1>
            {category === "promotion" && <h2>Danh mục: Khuyến Mãi</h2>}
            {category === "news" && <h2>Danh mục: Tin Du Lịch</h2>}
            {category === "experience" && <h2>Danh mục: Kinh Nghiệm</h2>}
            {category === "food" && <h2>Danh mục: Ẩm Thực</h2>}
            {category === "visa" && <h2>Danh mục: Dịch Vụ Visa</h2>}
            {/* Hiển thị nội dung tương ứng với danh mục */}
        </div>
    );
};

export default Blog;
