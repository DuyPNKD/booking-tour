function checkRole(roles = []) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({error: "Forbidden"});
        }
        next();
    };
}

module.exports = checkRole;
// Middleware kiểm tra vai trò người dùng
// Sử dụng sau authMiddleware để đảm bảo req.user đã có thông tin người dùng
// roles: mảng các vai trò được phép truy cập (ví dụ: ['admin', 'staff'])
