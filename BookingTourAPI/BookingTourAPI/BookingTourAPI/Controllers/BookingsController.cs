using BookingTourAPI.Data;
using BookingTourAPI.DTOs;
using BookingTourAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BookingTourAPI.Controllers
{
    [ApiController]
    [Route("api/booking")]
    public class BookingsController : ControllerBase
    {
        private readonly BookingTourContext _context;

        public BookingsController(BookingTourContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ", errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
            }

            int totalSeatsNeeded = request.Passengers.Sum(p => p.Quantity);
            if (totalSeatsNeeded <= 0)
            {
                return BadRequest(new { success = false, message = "Số lượng hành khách phải lớn hơn 0" });
            }

            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync<IActionResult>(async () =>
            {
                int maxRetries = 3;
                int retryCount = 0;

                while (true)
                {
                    using var transaction = await _context.Database.BeginTransactionAsync();
                    try
                    {
                        var tour = await _context.Tours
                            .Include(t => t.Prices)
                            .FirstOrDefaultAsync(t => t.Id == request.TourId);

                        if (tour == null)
                            return NotFound(new { success = false, message = "Tour không tồn tại" });

                        // 1. Kiểm tra & Trừ số lượng chỗ trống (AvailableSeats) trong TourDeparture (Optimistic Concurrency)
                        var departure = await _context.TourDepartures
                            .FirstOrDefaultAsync(d => d.TourId == request.TourId && d.DepartureDate.Date == request.DepartureDate.Date);

                        int defaultMaxSeats = 20; // Giới hạn chỗ mặc định cho mỗi chuyến đi nếu chưa cấu hình

                        if (departure == null)
                        {
                            departure = new TourDeparture
                            {
                                TourId = request.TourId,
                                DepartureDate = request.DepartureDate.Date,
                                ReturnDate = request.DepartureDate.Date.AddDays(tour.NumDay > 0 ? tour.NumDay : 1),
                                Price = tour.Price,
                                AvailableSeats = defaultMaxSeats,
                                DepartureCity = "Hồ Chí Minh"
                            };
                            _context.TourDepartures.Add(departure);
                        }

                        int currentAvailableSeats = departure.AvailableSeats ?? defaultMaxSeats;

                        if (currentAvailableSeats < totalSeatsNeeded)
                        {
                            return BadRequest(new { 
                                success = false, 
                                message = $"Ngày khởi hành {request.DepartureDate:dd/MM/yyyy} chỉ còn {currentAvailableSeats} chỗ trống, không đủ cho {totalSeatsNeeded} khách." 
                            });
                        }

                        departure.AvailableSeats = currentAvailableSeats - totalSeatsNeeded;
                        if (departure.Id > 0)
                        {
                            _context.Entry(departure).State = EntityState.Modified;
                        }

                        // 2. Tính tổng tiền dựa trên loại khách (adult, child, infant)
                        int totalPrice = 0;
                        foreach (var passenger in request.Passengers)
                        {
                            var priceConfig = tour.Prices.FirstOrDefault(p => p.TargetType == passenger.TargetType);
                            if (priceConfig != null)
                            {
                                totalPrice += priceConfig.Price * passenger.Quantity;
                            }
                            else
                            {
                                return BadRequest(new { success = false, message = $"Giá chưa được cấu hình cho đối tượng {passenger.TargetType}" });
                            }
                        }

                        // 3. Kiểm tra xem User đã đăng nhập hay Guest
                        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                        int finalUserId;

                        if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int loggedInUserId))
                        {
                            finalUserId = loggedInUserId;
                        }
                        else
                        {
                            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.FullName))
                            {
                                return BadRequest(new { success = false, message = "Khách hàng phải cung cấp Email và Họ tên để liên lạc." });
                            }

                            var existingGuest = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                            if (existingGuest != null)
                            {
                                finalUserId = existingGuest.Id;
                            }
                            else
                            {
                                var newGuest = new User
                                {
                                    Name = request.FullName,
                                    Email = request.Email,
                                    Phone = request.Phone,
                                    Gender = request.Gender,
                                    Address = request.Address,
                                    Role = "user",
                                    IsActive = 1,
                                    CreatedAt = DateTime.UtcNow
                                };

                                _context.Users.Add(newGuest);
                                await _context.SaveChangesAsync();
                                finalUserId = newGuest.Id;
                            }
                        }

                        // 4. Tạo Booking
                        var booking = new Booking
                        {
                            UserId = finalUserId,
                            TourId = request.TourId,
                            Status = "pending",
                            DepartureDate = request.DepartureDate,
                            TotalPrice = totalPrice,
                            Note = request.Note,
                            CreatedAt = DateTime.UtcNow
                        };

                        _context.Bookings.Add(booking);
                        await _context.SaveChangesAsync();

                        // 5. Tạo Booking Details
                        var bookingDetails = request.Passengers.Select(p => new BookingDetail
                        {
                            BookingId = booking.Id,
                            TargetType = p.TargetType,
                            Quantity = p.Quantity
                        }).ToList();

                        _context.BookingDetails.AddRange(bookingDetails);
                        await _context.SaveChangesAsync();

                        await transaction.CommitAsync();

                        return Ok(new
                        {
                            success = true,
                            message = "Đặt tour thành công!",
                            bookingId = booking.Id
                        });
                    }
                    catch (DbUpdateConcurrencyException ex)
                    {
                        await transaction.RollbackAsync();
                        retryCount++;
                        if (retryCount >= maxRetries)
                        {
                            Console.WriteLine($"[CONCURRENCY CONFLICT] Over {maxRetries} attempts failed: {ex.Message}");
                            return StatusCode(409, new { 
                                success = false, 
                                message = "Hệ thống đang xử lý nhiều lượt đặt chỗ cùng lúc. Vui lòng thực hiện lại yêu cầu." 
                            });
                        }
                        await Task.Delay(50 * retryCount);
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        Console.WriteLine($"[CREATE BOOKING ERROR] {ex.ToString()}");
                        var innerMsg = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                        return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi đặt tour", error = innerMsg, detail = ex.ToString() });
                    }
                }
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookingDetails(int id)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.User)
                    .Include(b => b.Tour)
                        .ThenInclude(t => t.Location)
                    .Include(b => b.Tour)
                        .ThenInclude(t => t.Prices)
                    .Include(b => b.Details)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (booking == null)
                    return NotFound(new { success = false, message = "Không tìm thấy thông tin đặt tour" });

                var response = new BookingResponseDto
                {
                    Id = booking.Id,
                    UserId = booking.UserId,
                    UserName = booking.User?.Name ?? "",
                    FullName = booking.User?.Name,
                    Email = booking.User?.Email,
                    Phone = booking.User?.Phone,
                    Address = booking.User?.Address,
                    TourId = booking.TourId,
                    TourTitle = booking.Tour?.Title ?? "",
                    TourName = booking.Tour?.Title ?? "",
                    LocationName = booking.Tour?.Location?.Name,
                    NumDay = booking.Tour?.NumDay ?? 0,
                    NumNight = booking.Tour?.NumNight ?? 0,
                    PriceAdult = booking.Tour?.Prices?.FirstOrDefault(p => p.TargetType == "adult")?.Price ?? 0,
                    PriceChild = booking.Tour?.Prices?.FirstOrDefault(p => p.TargetType == "child")?.Price ?? 0,
                    PriceInfant = booking.Tour?.Prices?.FirstOrDefault(p => p.TargetType == "infant")?.Price ?? 0,
                    Status = booking.Status,
                    DepartureDate = booking.DepartureDate.ToString("yyyy-MM-dd"),
                    TotalPrice = booking.TotalPrice,
                    Note = booking.Note,
                    CreatedAt = booking.CreatedAt?.ToString("yyyy-MM-dd HH:mm:ss"),
                    Details = booking.Details.Select(d => new BookingPassengerDetailDto
                    {
                        Id = d.Id,
                        TargetType = d.TargetType,
                        Quantity = d.Quantity
                    }).ToList()
                };

                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GET BOOKING ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy thông tin booking" });
            }
        }

        [Authorize]
        [HttpGet("me/list")]
        public async Task<IActionResult> GetMyBookings()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized(new { success = false, message = "Bạn chưa đăng nhập" });
                }

                int userId = int.Parse(userIdClaim);

                var bookings = await _context.Bookings
                    .Include(b => b.Tour)
                        .ThenInclude(t => t.Images)
                    .Where(b => b.UserId == userId)
                    .OrderByDescending(b => b.CreatedAt)
                    .Select(b => new MyBookingDto
                    {
                        Id = b.Id,
                        TourTitle = b.Tour!.Title,
                        TourSlug = b.Tour.Slug,
                        ThumbnailUrl = b.Tour.Images.OrderBy(i => i.Id).Select(i => i.ImageUrl).FirstOrDefault() ?? b.Tour.ThumbnailUrl ?? "",
                        Status = b.Status,
                        DepartureDate = b.DepartureDate.ToString("dd-MM-yyyy"),
                        TotalPrice = b.TotalPrice,
                        CreatedAt = b.CreatedAt.HasValue ? b.CreatedAt.Value.ToString("dd-MM-yyyy HH:mm:ss") : null
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = bookings });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GET MY BOOKINGS ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi lấy danh sách tour của bạn" });
            }
        }

        [Authorize]
        [HttpDelete("me/{id}")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized(new { success = false, message = "Bạn chưa đăng nhập" });
                }

                int userId = int.Parse(userIdClaim);
                var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

                var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == id);

                if (booking == null)
                    return NotFound(new { success = false, message = "Booking không tồn tại" });

                // Chỉ cho phép admin xoá, user bình thường chỉ có thể huỷ (chuyển status)
                // Theo Node.js logic gốc, xoá thì kiểm duyệt nếu thuộc về user đó hoặc admin
                if (booking.UserId != userId && roleClaim != "admin")
                {
                    return StatusCode(403, new { success = false, message = "Không có quyền xoá booking này" });
                }

                _context.Bookings.Remove(booking);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Đã xoá thông tin đặt tour" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DELETE BOOKING ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi khi xoá booking" });
            }
        }
    }
}
