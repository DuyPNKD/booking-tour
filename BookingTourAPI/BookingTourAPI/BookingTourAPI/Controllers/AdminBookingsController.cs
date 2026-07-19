using BookingTourAPI.Data;
using BookingTourAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace BookingTourAPI.Controllers
{
    [ApiController]
    [Route("api/admin")]
    // [Authorize(Roles = "admin,staff")] // Bật xác thực Admin/Staff khi deploy
    public class AdminBookingsController : ControllerBase
    {
        private readonly BookingTourContext _context;

        public AdminBookingsController(BookingTourContext context)
        {
            _context = context;
        }

        // ---------------------------------------------------------
        // 1. API: Lấy thống kê dashboard
        // [GET] /api/admin/dashboard/stats
        // ---------------------------------------------------------
        [HttpGet("dashboard/stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                int toursCount = await _context.Tours.CountAsync();
                int bookingsCount = await _context.Bookings.CountAsync();
                int usersCount = await _context.Users.CountAsync(u => u.Role == "user");
                int totalRevenue = await _context.Bookings
                    .Where(b => b.Status == "confirmed")
                    .SumAsync(b => (int?)b.TotalPrice) ?? 0;

                var recentBookings = await _context.Bookings
                    .Include(b => b.Tour)
                    .Include(b => b.User)
                    .OrderByDescending(b => b.Id)
                    .Take(5)
                    .Select(b => new RecentBookingDto
                    {
                        Id = b.Id,
                        UserId = b.UserId,
                        TourId = b.TourId,
                        Status = b.Status,
                        DepartureDate = b.DepartureDate.ToString("yyyy-MM-dd"),
                        TotalPrice = b.TotalPrice,
                        Note = b.Note,
                        CreatedAt = b.CreatedAt.HasValue ? b.CreatedAt.Value.ToString("yyyy-MM-dd HH:mm:ss") : null,
                        TourName = b.Tour != null ? b.Tour.Title : "",
                        CustomerName = b.User != null ? b.User.Name : ""
                    })
                    .ToListAsync();

                var stats = new DashboardStatsResponse
                {
                    ToursCount = toursCount,
                    BookingsCount = bookingsCount,
                    UsersCount = usersCount,
                    TotalRevenue = totalRevenue,
                    RecentBookings = recentBookings
                };

                return Ok(new
                {
                    success = true,
                    data = stats
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DASHBOARD STATS ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi máy chủ khi lấy thống kê dashboard" });
            }
        }

        // ---------------------------------------------------------
        // 2. API: Lấy danh sách bookings
        // [GET] /api/admin/bookings
        // ---------------------------------------------------------
        [HttpGet("bookings")]
        public async Task<IActionResult> ListBookings([FromQuery] string? status, [FromQuery] string? q)
        {
            try
            {
                var query = _context.Bookings
                    .Include(b => b.Tour)
                    .Include(b => b.User)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(status) && status != "All")
                {
                    query = query.Where(b => b.Status == status.ToLower());
                }

                if (!string.IsNullOrEmpty(q))
                {
                    var search = q.Trim().ToLower();
                    query = query.Where(b => 
                        (b.User != null && b.User.Name.ToLower().Contains(search)) ||
                        (b.User != null && b.User.Email.ToLower().Contains(search)) ||
                        (b.User != null && b.User.Phone.ToLower().Contains(search)) ||
                        b.Id.ToString().Contains(search) ||
                        (b.Tour != null && b.Tour.Title.ToLower().Contains(search))
                    );
                }

                var bookings = await query
                    .OrderByDescending(b => b.Id)
                    .Select(b => new
                    {
                        b.Id,
                        b.UserId,
                        b.TourId,
                        b.Status,
                        DepartureDate = b.DepartureDate.ToString("yyyy-MM-dd"),
                        b.TotalPrice,
                        b.Note,
                        CreatedAt = b.CreatedAt.HasValue ? b.CreatedAt.Value.ToString("yyyy-MM-dd HH:mm:ss") : null,
                        TourName = b.Tour != null ? b.Tour.Title : "",
                        FullName = b.User != null ? b.User.Name : "",
                        PhoneNumber = b.User != null ? b.User.Phone : "",
                        Email = b.User != null ? b.User.Email : "",
                        Address = b.User != null ? b.User.Address : "",
                        Gender = b.User != null ? b.User.Gender : ""
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = bookings });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LIST BOOKINGS ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi máy chủ khi lấy danh sách đơn hàng" });
            }
        }

        // ---------------------------------------------------------
        // 3. API: Chi tiết booking
        // [GET] /api/admin/bookings/{id}
        // ---------------------------------------------------------
        [HttpGet("bookings/{id}")]
        public async Task<IActionResult> GetBookingDetail(int id)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Tour)
                    .Include(b => b.User)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (booking == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy đơn hàng" });
                }

                var details = await _context.BookingDetails
                    .Where(d => d.BookingId == id)
                    .Select(d => new { d.TargetType, d.Quantity })
                    .ToListAsync();

                var bookingData = new
                {
                    booking.Id,
                    booking.UserId,
                    booking.TourId,
                    booking.Status,
                    DepartureDate = booking.DepartureDate.ToString("yyyy-MM-dd"),
                    booking.TotalPrice,
                    booking.Note,
                    CreatedAt = booking.CreatedAt.HasValue ? booking.CreatedAt.Value.ToString("yyyy-MM-dd HH:mm:ss") : null,
                    TourName = booking.Tour != null ? booking.Tour.Title : "",
                    NumDay = booking.Tour != null ? (int?)booking.Tour.NumDay : null,
                    NumNight = booking.Tour != null ? (int?)booking.Tour.NumNight : null,
                    FullName = booking.User != null ? booking.User.Name : "",
                    PhoneNumber = booking.User != null ? booking.User.Phone : "",
                    Email = booking.User != null ? booking.User.Email : "",
                    Address = booking.User != null ? booking.User.Address : "",
                    Gender = booking.User != null ? booking.User.Gender : ""
                };

                return Ok(new { success = true, data = new { booking = bookingData, details } });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GET BOOKING DETAIL ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi máy chủ khi lấy chi tiết đơn hàng" });
            }
        }

        // ---------------------------------------------------------
        // 4. API: Cập nhật trạng thái booking
        // [PUT] /api/admin/bookings/{id}/status
        // ---------------------------------------------------------
        [HttpPut("bookings/{id}/status")]
        public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] UpdateBookingStatusDto dto)
        {
            try
            {
                var status = dto.Status.ToLower();
                if (status != "pending" && status != "confirmed" && status != "cancelled")
                {
                    return BadRequest(new { success = false, message = "Trạng thái không hợp lệ" });
                }

                var booking = await _context.Bookings.FindAsync(id);
                if (booking == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy đơn hàng để cập nhật" });
                }

                booking.Status = status;
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Cập nhật trạng thái đơn hàng thành công" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UPDATE BOOKING STATUS ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi máy chủ khi cập nhật đơn hàng" });
            }
        }

        // ---------------------------------------------------------
        // 5. API: Xóa booking
        // [DELETE] /api/admin/bookings/{id}
        // ---------------------------------------------------------
        [HttpDelete("bookings/{id}")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var booking = await _context.Bookings.FindAsync(id);
                if (booking == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy đơn hàng để xóa" });
                }

                // Xóa chi tiết đơn hàng trước
                var details = await _context.BookingDetails.Where(d => d.BookingId == id).ToListAsync();
                _context.BookingDetails.RemoveRange(details);

                // Xóa đơn hàng chính
                _context.Bookings.Remove(booking);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return Ok(new { success = true, message = "Đã xóa đơn hàng thành công" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"[DELETE BOOKING ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi máy chủ khi xóa đơn hàng" });
            }
        }
    }

    public class UpdateBookingStatusDto
    {
        public string Status { get; set; } = null!;
    }

    public class DashboardStatsResponse
    {
        [JsonPropertyName("toursCount")]
        public int ToursCount { get; set; }

        [JsonPropertyName("bookingsCount")]
        public int BookingsCount { get; set; }

        [JsonPropertyName("usersCount")]
        public int UsersCount { get; set; }

        [JsonPropertyName("totalRevenue")]
        public int TotalRevenue { get; set; }

        [JsonPropertyName("recentBookings")]
        public List<RecentBookingDto> RecentBookings { get; set; } = new();
    }

    public class RecentBookingDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("user_id")]
        public int UserId { get; set; }

        [JsonPropertyName("tour_id")]
        public int TourId { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; } = null!;

        [JsonPropertyName("departure_date")]
        public string DepartureDate { get; set; } = null!;

        [JsonPropertyName("total_price")]
        public int TotalPrice { get; set; }

        [JsonPropertyName("note")]
        public string? Note { get; set; }

        [JsonPropertyName("created_at")]
        public string? CreatedAt { get; set; }

        [JsonPropertyName("tour_name")]
        public string TourName { get; set; } = null!;

        [JsonPropertyName("customer_name")]
        public string CustomerName { get; set; } = null!;
    }
}
