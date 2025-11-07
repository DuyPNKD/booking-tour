const db = require("../config/db");
const {uploadToCloudinary} = require("../middlewares/cloudinaryUpload");

/**
 * Admin Blog Controller
 * Chứa các handler liên quan đến quản lý bài viết (blog) cho khu vực admin
 */

/**
 * Hàm tiện ích: Xây dựng thông tin phân trang
 * @param {Object} query - Query parameters từ request
 * @returns {Object} - Thông tin phân trang {page, limit, offset}
 */
function buildPagination(query) {
    const page = Math.max(1, parseInt(query.page || 1, 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || 10, 10)));
    const offset = (page - 1) * limit;
    return {page, limit, offset};
}

/**
 * Hàm tiện ích: Format date về YYYY-MM-DD format cho MySQL DATE field
 * @param {string|Date} dateInput - Date string hoặc Date object
 * @returns {string} - Date string dạng YYYY-MM-DD
 */
function formatDateForMySQL(dateInput) {
    if (!dateInput) return null;

    // Nếu đã là format YYYY-MM-DD thì trả về luôn
    if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return dateInput;
    }

    try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) {
            return null;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    } catch (error) {
        return null;
    }
}

/**
 * Lấy danh sách bài viết với phân trang và tìm kiếm
 * Route: GET /api/admin/blogs
 * Query: { q?, category?, page?, limit? }
 * - Hỗ trợ tìm kiếm theo tiêu đề
 * - Lọc theo category
 * - Phân trang với page và limit
 * - Sắp xếp theo ID giảm dần (bài viết mới nhất trước)
 * Response: 200 + { success: true, data: { result: [], pagination: {} } }
 */
exports.listBlogs = async (req, res) => {
    try {
        const {q, category} = req.query;
        const {page, limit, offset} = buildPagination(req.query);

        // Xây dựng điều kiện WHERE cho tìm kiếm và lọc
        const conditions = [];
        const params = [];
        if (q) {
            conditions.push("title LIKE ?");
            params.push(`%${q}%`);
        }
        if (category) {
            conditions.push("category = ?");
            params.push(category);
        }
        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        // Đếm tổng số bài viết để tính phân trang
        const [[{totalItems}]] = await db.query(`SELECT COUNT(*) AS totalItems FROM blogs ${where}`, params);

        // Lấy danh sách bài viết với phân trang
        const [rows] = await db.query(
            `SELECT id, title, category, date, image, description, content, created_at, updated_at
             FROM blogs
             ${where}
             ORDER BY id DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        return res.json({
            success: true,
            message: "Lấy danh sách bài viết thành công",
            data: {
                result: rows,
                pagination: {
                    totalItems,
                    totalItemsPerPage: limit,
                    currentPage: page,
                    totalPages: Math.ceil(totalItems / limit),
                },
            },
        });
    } catch (err) {
        console.error("listBlogs error", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách bài viết",
            error: err.message,
        });
    }
};

/**
 * Lấy chi tiết bài viết theo ID
 * Route: GET /api/admin/blogs/:id
 * Params: { id }
 * Response: 200 + { success: true, data: { blog data } } hoặc 404 nếu không tìm thấy
 */
exports.getBlogDetail = async (req, res) => {
    const {id} = req.params;
    try {
        const [[blog]] = await db.query(
            `SELECT id, title, category, date, image, description, content, created_at, updated_at
             FROM blogs
             WHERE id = ?`,
            [id]
        );

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bài viết",
            });
        }

        return res.json({
            success: true,
            message: "Lấy chi tiết bài viết thành công",
            data: blog,
        });
    } catch (err) {
        console.error("getBlogDetail error", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy chi tiết bài viết",
            error: err.message,
        });
    }
};

/**
 * Tạo bài viết mới
 * Route: POST /api/admin/blogs
 * Body: { title, category, date, image?, description?, content }
 * - Validate: title, category, content là bắt buộc
 * - Cho phép upload ảnh qua file hoặc URL
 * - Nếu có file upload, sử dụng Cloudinary
 * Response: 201 + { success: true, message: "...", data: { blog data } }
 */
exports.createBlog = async (req, res) => {
    try {
        const {title, category, date, image, description, content} = req.body;

        // Validate các trường bắt buộc
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Tiêu đề là bắt buộc",
            });
        }
        if (!category || !category.trim()) {
            return res.status(400).json({
                success: false,
                message: "Danh mục là bắt buộc",
            });
        }
        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Nội dung là bắt buộc",
            });
        }

        // Xử lý ảnh: ưu tiên file upload, sau đó mới đến URL
        let imageUrl = image || "";
        if (req.file && req.file.cloudinary) {
            imageUrl = req.file.cloudinary.secure_url;
        }

        // Format date cho MySQL
        const formattedDate = formatDateForMySQL(date) || new Date().toISOString().split("T")[0];

        // Chèn bài viết mới vào database
        const [result] = await db.query(
            `INSERT INTO blogs (title, category, date, image, description, content, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [title.trim(), category.trim(), formattedDate, imageUrl, description || "", content.trim()]
        );

        // Lấy lại bài viết vừa tạo
        const [[newBlog]] = await db.query(`SELECT * FROM blogs WHERE id = ?`, [result.insertId]);

        return res.status(201).json({
            success: true,
            message: "Tạo bài viết mới thành công",
            data: newBlog,
        });
    } catch (err) {
        console.error("createBlog error", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi tạo bài viết",
            error: err.message,
        });
    }
};

/**
 * Cập nhật bài viết
 * Route: PUT /api/admin/blogs/:id
 * Params: { id }
 * Body: { title?, category?, date?, image?, description?, content? }
 * - Validate các trường nếu có
 * - Cho phép upload ảnh mới hoặc cập nhật URL
 * Response: 200 + { success: true, message: "...", data: { blog data } } hoặc 404
 */
exports.updateBlog = async (req, res) => {
    const {id} = req.params;
    try {
        // Kiểm tra bài viết có tồn tại không
        const [[existingBlog]] = await db.query(`SELECT * FROM blogs WHERE id = ?`, [id]);
        if (!existingBlog) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bài viết",
            });
        }

        const {title, category, date, image, description, content} = req.body;

        // Xây dựng câu lệnh UPDATE động dựa trên các trường có trong body
        const updates = [];
        const values = [];

        if (title !== undefined) {
            if (!title || !title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Tiêu đề không được để trống",
                });
            }
            updates.push("title = ?");
            values.push(title.trim());
        }

        if (category !== undefined) {
            if (!category || !category.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Danh mục không được để trống",
                });
            }
            updates.push("category = ?");
            values.push(category.trim());
        }

        if (date !== undefined) {
            const formattedDate = formatDateForMySQL(date);
            if (formattedDate) {
                updates.push("date = ?");
                values.push(formattedDate);
            }
        }

        // Xử lý ảnh: ưu tiên file upload, sau đó mới đến URL
        if (req.file && req.file.cloudinary) {
            updates.push("image = ?");
            values.push(req.file.cloudinary.secure_url);
        } else if (image !== undefined) {
            updates.push("image = ?");
            values.push(image);
        }

        if (description !== undefined) {
            updates.push("description = ?");
            values.push(description);
        }

        if (content !== undefined) {
            if (!content || !content.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Nội dung không được để trống",
                });
            }
            updates.push("content = ?");
            values.push(content.trim());
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Không có trường nào để cập nhật",
            });
        }

        // Thêm updated_at và id vào values
        updates.push("updated_at = NOW()");
        values.push(id);

        // Thực hiện cập nhật
        await db.query(`UPDATE blogs SET ${updates.join(", ")} WHERE id = ?`, values);

        // Lấy lại bài viết đã cập nhật
        const [[updatedBlog]] = await db.query(`SELECT * FROM blogs WHERE id = ?`, [id]);

        return res.json({
            success: true,
            message: "Cập nhật bài viết thành công",
            data: updatedBlog,
        });
    } catch (err) {
        console.error("updateBlog error", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật bài viết",
            error: err.message,
        });
    }
};

/**
 * Xóa bài viết theo ID
 * Route: DELETE /api/admin/blogs/:id
 * Params: { id }
 * Response: 200 + { success: true, message: "..." } hoặc 404
 */
exports.deleteBlog = async (req, res) => {
    const {id} = req.params;
    try {
        // Kiểm tra bài viết có tồn tại không
        const [[existingBlog]] = await db.query(`SELECT * FROM blogs WHERE id = ?`, [id]);
        if (!existingBlog) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bài viết",
            });
        }

        // Xóa bài viết
        const [result] = await db.query(`DELETE FROM blogs WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bài viết để xóa",
            });
        }

        return res.json({
            success: true,
            message: "Xóa bài viết thành công",
        });
    } catch (err) {
        console.error("deleteBlog error", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi xóa bài viết",
            error: err.message,
        });
    }
};

/**
 * Lấy danh sách bài viết theo danh mục
 * Route: GET /api/admin/blogs/category/:category
 * Params: { category }
 * Query: { page?, limit? } (tùy chọn)
 * Response: 200 + { success: true, data: [...] }
 */
exports.getBlogsByCategory = async (req, res) => {
    const {category} = req.params;

    // Map slug (URL-friendly) sang tên tiếng Việt trong DB
    const categoryMap = {
        "tin-du-lich": "Tin du lịch",
        "kinh-nghiem": "Kinh nghiệm",
        "am-thuc": "Ẩm thực",
        "dich-vu-visa": "Dịch vụ visa",
        "khuyen-mai": "Khuyến mãi",
    };

    const realCategory = categoryMap[category] || category; // Nếu gọi trực tiếp bằng tiếng Việt thì vẫn dùng

    try {
        const [rows] = await db.query(`SELECT * FROM blogs WHERE category = ? ORDER BY id DESC`, [realCategory]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Không có bài viết nào trong danh mục '${realCategory}'`,
            });
        }

        res.json({
            success: true,
            message: `Lấy danh sách bài viết thuộc danh mục '${realCategory}' thành công`,
            data: rows,
        });
    } catch (err) {
        console.error("getBlogsByCategory error", err);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách bài viết theo danh mục",
            error: err.message,
        });
    }
};
