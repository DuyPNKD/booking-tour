const cloudinary = require("../config/cloudinaryConfig"); // Import cấu hình Cloudinary
const {Readable} = require("stream"); // Import Readable để tạo stream từ buffer

/**
 * Middleware upload ảnh lên Cloudinary
 * @param {string} folder - Thư mục lưu trữ trên Cloudinary (ví dụ: 'avatars', 'tours')
 * @param {Object} options - Tùy chọn upload (quality, format, etc.)
 */
const uploadToCloudinary = (folder = "uploads", options = {}) => {
    return async (req, res, next) => {
        try {
            // Kiểm tra nếu không có file thì chuyển tiếp middleware tiếp theo
            if (!req.file) {
                return next();
            }

            // Tạo stream từ buffer của file upload
            const stream = Readable.from(req.file.buffer);

            // Thiết lập các tùy chọn upload cho Cloudinary
            const uploadOptions = {
                folder: folder, // Lưu vào thư mục chỉ định
                resource_type: "auto", // Tự động nhận diện loại file
                quality: "auto", // Tối ưu chất lượng ảnh
                fetch_format: "auto", // Tự động chọn định dạng tối ưu
                ...options, // Gộp thêm các tùy chọn truyền vào
            };

            // Upload file lên Cloudinary bằng stream
            const result = await new Promise((resolve, reject) => {
                // Tạo upload stream
                const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                    if (error) {
                        reject(error); // Nếu lỗi, reject promise
                    } else {
                        resolve(result); // Nếu thành công, resolve với kết quả
                    }
                });

                stream.pipe(uploadStream); // Đẩy dữ liệu từ stream lên Cloudinary
            });

            // Lưu thông tin ảnh đã upload vào req.file.cloudinary
            req.file.cloudinary = {
                public_id: result.public_id, // ID duy nhất của ảnh trên Cloudinary
                secure_url: result.secure_url, // URL HTTPS của ảnh
                url: result.url, // URL của ảnh
                width: result.width, // Chiều rộng ảnh
                height: result.height, // Chiều cao ảnh
                format: result.format, // Định dạng ảnh
                bytes: result.bytes, // Dung lượng ảnh (byte)
            };

            next(); // Chuyển tiếp sang middleware/controller tiếp theo
        } catch (error) {
            // Nếu có lỗi, log ra console và trả về lỗi cho client
            console.error("Cloudinary upload error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi upload ảnh lên Cloudinary",
                error: error.message,
            });
        }
    };
};

/**
 * Middleware upload nhiều file lên Cloudinary
 * @param {string} folder - Tên thư mục lưu trữ trên Cloudinary (mặc định: 'uploads')
 * @param {Object} options - Tùy chọn upload (chất lượng, định dạng, v.v.)
 * Quy trình:
 *  1. Kiểm tra nếu không có file thì chuyển tiếp sang middleware tiếp theo.
 *  2. Duyệt qua từng file trong req.files:
 *      - Tạo stream từ buffer của file.
 *      - Thiết lập các tùy chọn upload cho Cloudinary.
 *      - Upload từng file lên Cloudinary bằng upload_stream.
 *      - Khi upload thành công, lưu thông tin ảnh vào thuộc tính cloudinary của file.
 *  3. Đợi tất cả các file upload xong (Promise.all).
 *  4. Gán lại req.files với thông tin ảnh đã upload.
 *  5. Gọi next() để chuyển tiếp xử lý.
 *  6. Nếu có lỗi, trả về mã lỗi 500 và thông báo lỗi cho client.
 */
const uploadMultipleToCloudinary = (folder = "uploads", options = {}) => {
    return async (req, res, next) => {
        try {
            // Nếu không có file nào thì chuyển tiếp middleware tiếp theo
            if (!req.files || req.files.length === 0) {
                return next();
            }

            // Tạo mảng các promise upload từng file lên Cloudinary
            const uploadPromises = req.files.map(async (file) => {
                // Tạo stream từ buffer của từng file
                const stream = Readable.from(file.buffer);

                // Thiết lập các tùy chọn upload cho Cloudinary
                const uploadOptions = {
                    folder: folder,
                    resource_type: "auto",
                    quality: "auto",
                    fetch_format: "auto",
                    ...options,
                };

                // Trả về promise upload file lên Cloudinary
                return new Promise((resolve, reject) => {
                    // Tạo upload stream
                    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                        if (error) {
                            reject(error); // Nếu lỗi, reject promise
                        } else {
                            // Nếu thành công, resolve với thông tin file và ảnh
                            resolve({
                                ...file,
                                cloudinary: {
                                    public_id: result.public_id,
                                    secure_url: result.secure_url,
                                    url: result.url,
                                    width: result.width,
                                    height: result.height,
                                    format: result.format,
                                    bytes: result.bytes,
                                },
                            });
                        }
                    });

                    stream.pipe(uploadStream); // Đẩy dữ liệu từ stream lên Cloudinary
                });
            });

            // Đợi tất cả các file upload xong
            req.files = await Promise.all(uploadPromises);

            next(); // Chuyển tiếp sang middleware/controller tiếp theo
        } catch (error) {
            // Nếu có lỗi, log ra console và trả về lỗi cho client
            console.error("Cloudinary multiple upload error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi upload nhiều ảnh lên Cloudinary",
                error: error.message,
            });
        }
    };
};

/**
 * Xóa ảnh khỏi Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        // Gọi API của Cloudinary để xóa ảnh theo publicId
        const result = await cloudinary.uploader.destroy(publicId);
        return result; // Trả về kết quả xóa
    } catch (error) {
        // Nếu có lỗi, log ra console và ném lỗi ra ngoài
        console.error("Cloudinary delete error:", error);
        throw error;
    }
};

/**
 * Lấy URL ảnh với transformations
 */
const getCloudinaryUrl = (publicId, transformations = {}) => {
    // Tạo URL ảnh với các biến đổi (resize, crop, ...)
    return cloudinary.url(publicId, transformations);
};

// Export các hàm/middleware để sử dụng ở nơi khác
module.exports = {
    uploadToCloudinary,
    uploadMultipleToCloudinary,
    deleteFromCloudinary,
    getCloudinaryUrl,
};
