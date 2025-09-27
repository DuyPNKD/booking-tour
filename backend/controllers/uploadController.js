const multer = require("multer");
const {uploadToCloudinary, uploadMultipleToCloudinary} = require("../middlewares/cloudinaryUpload");
const cloudinary = require("../config/cloudinaryConfig");

// Multer config
const upload = multer({
    storage: multer.memoryStorage(), // lưu tạm thời trong bộ nhớ RAM
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        console.log("Loại file upload:", file.mimetype); // Xem loại file ở đây
        if (file.mimetype.startsWith("image/")) {
            // chỉ chấp nhận file ảnh
            cb(null, true);
        } else {
            cb(new Error("Chỉ cho phép upload file ảnh!"), false);
        }
    },
});

/**
 * Upload single image (KHÔNG cần auth - chỉ để test)
 * Route: POST /api/upload/cloudinary/test
 * Body: multipart/form-data với field 'file'
 * Quy trình:
 *  - Kiểm tra file có tồn tại không
 *  - Upload lên Cloudinary với folder 'uploads'
 *  - Trả về thông tin ảnh đã upload
 * Kết quả:
 *  { success: true, url, public_id, width, height, format, bytes }
 */
exports.uploadSingleTest = [
    // Nhận file từ field 'file' trong multipart/form-data
    upload.single("file"),
    // Upload file lên Cloudinary, lưu thông tin vào req.file.cloudinary
    uploadToCloudinary("uploads"),
    // Xử lý response trả về cho client
    (req, res) => {
        // Kiểm tra nếu không có file thì trả về lỗi
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Không có file được upload",
            });
        }

        // Trả về thông tin ảnh đã upload từ Cloudinary
        res.json({
            success: true,
            url: req.file.cloudinary.secure_url, // URL ảnh trên Cloudinary
            public_id: req.file.cloudinary.public_id, // ID duy nhất của ảnh
            width: req.file.cloudinary.width, // Chiều rộng ảnh
            height: req.file.cloudinary.height, // Chiều cao ảnh
            format: req.file.cloudinary.format, // Định dạng ảnh
            bytes: req.file.cloudinary.bytes, // Dung lượng ảnh
        });
    },
];

/**
 * Upload single image (CẦN auth - production)
 * Route: POST /api/upload/cloudinary
 * Body: multipart/form-data với field 'file'
 * Auth: Bearer JWT token
 * Quy trình:
 *  - Kiểm tra file có tồn tại không
 *  - Upload lên Cloudinary với folder 'uploads'
 *  - Trả về thông tin ảnh đã upload
 * Kết quả:
 *  { success: true, url, public_id, width, height, format, bytes }
 */
exports.uploadSingle = [
    // Nhận file từ field 'file'
    upload.single("file"),
    // Upload file lên Cloudinary
    uploadToCloudinary("uploads"),
    // Xử lý response trả về cho client
    (req, res) => {
        // Kiểm tra nếu không có file thì trả về lỗi
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Không có file được upload",
            });
        }

        // Trả về thông tin ảnh đã upload từ Cloudinary
        res.json({
            success: true,
            url: req.file.cloudinary.secure_url,
            public_id: req.file.cloudinary.public_id,
            width: req.file.cloudinary.width,
            height: req.file.cloudinary.height,
            format: req.file.cloudinary.format,
            bytes: req.file.cloudinary.bytes,
        });
    },
];

/**
 * Upload multiple images
 * Route: POST /api/upload/cloudinary/multiple
 * Body: multipart/form-data với field 'files' (array)
 * Auth: Bearer JWT token
 * Quy trình:
 *  - Kiểm tra files có tồn tại không
 *  - Upload tất cả ảnh lên Cloudinary với folder 'uploads'
 *  - Trả về danh sách thông tin ảnh đã upload
 * Kết quả:
 *  { success: true, files: [...], count: number }
 */
exports.uploadMultiple = [
    // Nhận tối đa 50 file từ field 'files'
    upload.array("files", 50),
    // Upload tất cả file lên Cloudinary
    uploadMultipleToCloudinary("uploads"),
    // Xử lý response trả về cho client
    (req, res) => {
        // Kiểm tra nếu không có file thì trả về lỗi
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Không có file được upload",
            });
        }

        // Tạo danh sách thông tin ảnh đã upload từ Cloudinary
        const results = req.files.map((file) => ({
            url: file.cloudinary.secure_url,
            public_id: file.cloudinary.public_id,
            width: file.cloudinary.width,
            height: file.cloudinary.height,
            format: file.cloudinary.format,
            bytes: file.cloudinary.bytes,
        }));

        // Trả về danh sách ảnh đã upload
        res.json({
            success: true,
            files: results,
            count: results.length,
        });
    },
];

/**
 * Delete image from Cloudinary
 * Route: DELETE /api/upload/cloudinary/:publicId
 * Params: publicId - Cloudinary public ID của ảnh cần xóa
 * Auth: Bearer JWT token
 * Quy trình:
 *  - Lấy public_id từ URL params
 *  - Gọi Cloudinary API để xóa ảnh
 *  - Trả về kết quả xóa
 * Kết quả:
 *  { success: true, result: cloudinary_result }
 */
exports.deleteImage = async (req, res) => {
    try {
        // Lấy publicId từ URL params (dùng req.params[0] để lấy toàn bộ phần sau /cloudinary/)
        const publicId = req.params[0];
        // Kiểm tra nếu không có publicId thì trả về lỗi
        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: "Public ID không hợp lệ",
            });
        }

        // Gọi Cloudinary API để xóa ảnh theo publicId
        const result = await cloudinary.uploader.destroy(publicId);

        // Trả về kết quả xóa cho client
        res.json({
            success: true,
            result: result,
        });
    } catch (error) {
        // Nếu có lỗi, log ra console và trả về lỗi cho client
        console.error("Delete error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi xóa ảnh",
            error: error.message,
        });
    }
};

module.exports = {
    uploadSingleTest: exports.uploadSingleTest,
    uploadSingle: exports.uploadSingle,
    uploadMultiple: exports.uploadMultiple,
    deleteImage: exports.deleteImage,
};
