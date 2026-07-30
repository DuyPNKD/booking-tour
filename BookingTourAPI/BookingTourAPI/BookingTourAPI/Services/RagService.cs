using BookingTourAPI.Data;
using BookingTourAPI.DTOs;
using BookingTourAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace BookingTourAPI.Services
{
    /// <summary>
    /// Service xử lý kỹ thuật RAG (Retrieval-Augmented Generation):
    /// Truy vấn dữ liệu thực tế từ Database để cung cấp cho AI Agent đọc và thực thi tác vụ đặt tour
    /// </summary>
    public class RagService : IRagService
    {
        private readonly BookingTourContext _context; // Đổi tượng DbContext kết nối với SQL Server

        public RagService(BookingTourContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Hàm tìm kiếm danh sách tour theo tham số động (Từ khóa, Giá tối đa, Số ngày, Địa điểm)
        /// </summary>
        public async Task<List<SuggestedTourDto>> SearchToursAsync(string? keyword, int? maxPrice, int? durationDays, string? destination)
        {
            // Khởi tạo truy vấn trên bảng Tours kèm thông tin Location
            var query = _context.Tours
                .Include(t => t.Location)
                .AsQueryable();

            // Nếu có từ khóa tìm kiếm (vd: "nghỉ dưỡng", "biển") -> lọc theo Tên hoặc Mô tả tour
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var kw = keyword.ToLower();
                query = query.Where(t => t.Title.ToLower().Contains(kw) || (t.Overview != null && t.Overview.ToLower().Contains(kw)));
            }

            // Nếu có địa điểm (vd: "Hà Giang") -> lọc theo tên Địa điểm hoặc Tên tour
            if (!string.IsNullOrWhiteSpace(destination))
            {
                var dest = destination.ToLower();
                query = query.Where(t => (t.Location != null && t.Location.Name.ToLower().Contains(dest)) || t.Title.ToLower().Contains(dest));
            }

            // Lọc theo ngân sách tối đa
            if (maxPrice.HasValue && maxPrice.Value > 0)
            {
                query = query.Where(t => t.Price <= maxPrice.Value);
            }

            // Lọc theo số ngày đi
            if (durationDays.HasValue && durationDays.Value > 0)
            {
                query = query.Where(t => t.NumDay == durationDays.Value);
            }

            // Lấy tối đa 6 tour phù hợp nhất
            var tours = await query.Take(6).ToListAsync();

            // Chuyển đổi thành dạng SuggestedTourDto trả về cho AI và Frontend
            return tours.Select(t => new SuggestedTourDto
            {
                Id = t.Id,
                Title = t.Title,
                Slug = t.Slug,
                Price = t.Price,
                OldPrice = t.OldPrice,
                ThumbnailUrl = t.ThumbnailUrl,
                NumDay = t.NumDay,
                NumNight = t.NumNight,
                LocationName = t.Location?.Name,
                Rating = t.Rating
            }).ToList();
        }

        /// <summary>
        /// Hàm lấy toàn bộ lịch trình chi tiết và điều khoản tour dưới dạng chuỗi Text sạch để đút vào ngữ cảnh AI
        /// </summary>
        public async Task<string> GetTourDetailRAGContextAsync(int tourId)
        {
            var tour = await _context.Tours
                .Include(t => t.Location)
                .Include(t => t.Schedules)
                .Include(t => t.Terms)
                .Include(t => t.Prices)
                .FirstOrDefaultAsync(t => t.Id == tourId);

            if (tour == null) return "Không tìm thấy thông tin tour.";

            var sb = new StringBuilder();
            sb.AppendLine($"--- THÔNG TIN CHI TIẾT TOUR [ID: {tour.Id}] ---");
            sb.AppendLine($"Tên Tour: {tour.Title}");
            sb.AppendLine($"Địa điểm: {tour.Location?.Name ?? "Việt Nam"}");
            sb.AppendLine($"Thời gian: {tour.NumDay} Ngày {tour.NumNight} Đêm");
            sb.AppendLine($"Giá niêm yết: {tour.Price:N0} VNĐ (Giá cũ: {tour.OldPrice:N0} VNĐ)");
            sb.AppendLine($"Đánh giá: {tour.Rating ?? 5}/5.0");
            sb.AppendLine($"Mô tả chung: {tour.Overview}");

            // Đưa thông tin các ngày đi lịch trình vào text
            if (tour.Schedules.Any())
            {
                sb.AppendLine("\nLỊCH TRÌNH CHI TIẾT:");
                foreach (var sch in tour.Schedules.OrderBy(s => s.Id))
                {
                    sb.AppendLine($"+ {sch.DayText}: {sch.Content}");
                }
            }

            // Đưa thông tin chính sách hủy/đổi tour vào text
            if (tour.Terms.Any())
            {
                sb.AppendLine("\nCHÍNH SÁCH & ĐIỀU KIỆN:");
                foreach (var term in tour.Terms)
                {
                    sb.AppendLine($"+ {term.SectionTitle}: {term.Content}");
                }
            }

            return sb.ToString();
        }

        /// <summary>
        /// Hàm lấy riêng danh sách lịch trình tour theo ID
        /// </summary>
        public async Task<string> GetTourScheduleRAGContextAsync(int tourId)
        {
            var schedules = await _context.TourSchedules
                .Where(s => s.TourId == tourId)
                .OrderBy(s => s.Id)
                .ToListAsync();

            if (!schedules.Any()) return $"Chưa cập nhật lịch trình chi tiết cho Tour ID {tourId}.";

            var sb = new StringBuilder();
            sb.AppendLine($"Lịch trình Tour ID {tourId}:");
            foreach (var sch in schedules)
            {
                sb.AppendLine($"- {sch.DayText}: {sch.Content}");
            }
            return sb.ToString();
        }

        /// <summary>
        /// Hàm tổng hợp danh sách tour tìm được thành định dạng văn bản chuẩn RAG cho AI đọc
        /// </summary>
        public async Task<string> SearchToursRAGContextAsync(string userQuery, int? maxPrice, string? destination)
        {
            var tours = await SearchToursAsync(userQuery, maxPrice, null, destination);
            if (!tours.Any())
            {
                // Nếu không tìm thấy theo bộ lọc chính xác, lấy danh sách tour gợi ý nổi bật mặc định
                tours = await SearchToursAsync(null, null, null, null);
            }

            var sb = new StringBuilder();
            sb.AppendLine("DANH SÁCH TOUR PHÙ HỢP TRONG DATABASE:");
            foreach (var t in tours)
            {
                sb.AppendLine($"[ID: {t.Id}] {t.Title}");
                sb.AppendLine($"   - Địa điểm: {t.LocationName} | Thời gian: {t.NumDay}N{t.NumNight}Đ");
                sb.AppendLine($"   - Giá vé: {t.Price:N0} VNĐ | Đánh giá: {t.Rating ?? 5} sao");
                sb.AppendLine($"   - Thumbnail: {t.ThumbnailUrl}");
                sb.AppendLine($"   - Slug: {t.Slug}");
            }
            return sb.ToString();
        }

        /// <summary>
        /// HÀM TẠO ĐƠN ĐẶT TOUR TỰ ĐỘNG (Thực thi khi khách chốt đồng ý đặt qua AI Chat)
        /// </summary>
        public async Task<(bool Success, int? BookingId, string Message)> CreateBookingDraftAsync(
            int tourId, 
            DateTime departureDate, 
            string customerName, 
            string customerPhone, 
            string customerEmail, 
            int numAdults, 
            int numChildren, 
            string? note)
        {
            // 1. Kiểm tra xem Tour có tồn tại hay không
            var tour = await _context.Tours.FirstOrDefaultAsync(t => t.Id == tourId);
            if (tour == null)
            {
                return (false, null, $"Tour ID {tourId} không tồn tại trong hệ thống.");
            }

            // 2. Tìm hoặc tạo mới người dùng theo SĐT/Email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == customerEmail || u.Phone == customerPhone);
            if (user == null)
            {
                user = new User
                {
                    Name = customerName,
                    Email = customerEmail,
                    Phone = customerPhone,
                    Password = BCrypt.Net.BCrypt.HashPassword("123456"), // Mật khẩu mặc định khởi tạo
                    Role = "user",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            // 3. Tính toán tổng số tiền (Trẻ em = 70% giá người lớn)
            int totalPrice = (tour.Price * numAdults) + ((int)(tour.Price * 0.7) * numChildren);

            // 4. Tạo bản ghi Booking mới ở trạng thái 'pending'
            var booking = new Booking
            {
                UserId = user.Id,
                TourId = tour.Id,
                DepartureDate = departureDate,
                TotalPrice = totalPrice,
                Status = "pending",
                Note = $"[AI Agent Automated Booking] Khách: {customerName} - SĐT: {customerPhone} - Email: {customerEmail}. {note}",
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            // 5. Thêm chi tiết số lượng người lớn vào BookingDetails
            if (numAdults > 0)
            {
                _context.BookingDetails.Add(new BookingDetail
                {
                    BookingId = booking.Id,
                    TargetType = "adult",
                    Quantity = numAdults
                });
            }

            // 6. Thêm chi tiết số lượng trẻ em vào BookingDetails
            if (numChildren > 0)
            {
                _context.BookingDetails.Add(new BookingDetail
                {
                    BookingId = booking.Id,
                    TargetType = "child",
                    Quantity = numChildren
                });
            }

            // Lưu thay đổi vào SQL Server
            await _context.SaveChangesAsync();

            return (true, booking.Id, $"Đặt tour '{tour.Title}' thành công! Mã đơn đặt tour là #{booking.Id}. Tổng tiền: {totalPrice:N0} VNĐ.");
        }
    }
}

