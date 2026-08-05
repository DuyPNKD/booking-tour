using BookingTourAPI.Data; // Import Database Context (Giống require('./models/db'))
using BookingTourAPI.DTOs; // Import các Data Transfer Object (Giống Schema/Interface)
using BookingTourAPI.Services;
using Microsoft.AspNetCore.Mvc; // Import các thư viện lõi của API (Controller, Ok, NotFound...)
using Microsoft.EntityFrameworkCore; // Import Entity Framework (ORM giống Sequelize/Mongoose)

namespace BookingTourAPI.Controllers
{
    [ApiController] // Khai báo class này là một API Controller (Tự động validate data đầu vào)
    [Route("api/tours")] // Định nghĩa Base URL chung cho tất cả API trong file này là /api/tours
    public class ToursController : ControllerBase // Kế thừa ControllerBase để có các hàm trả kết quả như Ok(), NotFound()
    {
        private readonly BookingTourContext _context; // Biến lưu trữ kết nối Database
        private readonly ICacheService _cacheService;

        // Dependency Injection: Khi Controller được tạo, framework tự động "bơm" Database và CacheService vào đây
        public ToursController(BookingTourContext context, ICacheService cacheService)
        {
            _context = context;
            _cacheService = cacheService;
        }

        // ---------------------------------------------------------
        // 1. API: Lấy danh sách Tour (Có lọc, sắp xếp, phân trang)
        // [GET] /api/tours
        // ---------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetTours(
            [FromQuery] int? regionId,     // req.query.regionId
            [FromQuery] int? subregionId,  // req.query.subregionId
            [FromQuery] int? locationId,   // req.query.locationId
            [FromQuery] string? sortBy,    // req.query.sortBy
            [FromQuery] string? departure, // req.query.departure
            [FromQuery] int? duration,     // req.query.duration
            [FromQuery] int? priceFrom,    // req.query.priceFrom
            [FromQuery] int? priceTo,      // req.query.priceTo
            [FromQuery] int page = 1,      // req.query.page (mặc định = 1)
            [FromQuery] int limit = 10)    // req.query.limit (mặc định = 10)
        {
            try
            {
                // Thử lấy kết quả từ Cache (Cache-Aside Pattern)
                var cacheKey = $"tours:list:{regionId}:{subregionId}:{locationId}:{departure}:{duration}:{priceFrom}:{priceTo}:{sortBy}:{page}:{limit}";
                var cachedResult = await _cacheService.GetAsync<object>(cacheKey);
                if (cachedResult != null)
                {
                    return Ok(cachedResult);
                }
                // Khởi tạo câu truy vấn (Giống Tour.find())
                var query = _context.Tours
                    // Include giống .populate() hoặc include trong Node.js (Join bảng)
                    .Include(t => t.Location)
                        .ThenInclude(l => l!.Subregion) // Join lồng (populate lồng nhau)
                            .ThenInclude(sr => sr!.Region)
                    .Include(t => t.Departures)
                    .Include(t => t.Images)
                    .AsQueryable(); // Báo hiệu: "Đây mới là câu query nháp, chưa gọi xuống DB"

                // --- XỬ LÝ LỌC (FILTERING) ---
                if (regionId.HasValue)
                {
                    // Giống việc thêm điều kiện WHERE vào SQL: query.where({ regionId: ... })
                    query = query.Where(t => t.Location!.Subregion!.RegionId == regionId.Value);
                }
                if (subregionId.HasValue)
                {
                    query = query.Where(t => t.Location!.SubregionId == subregionId.Value);
                }
                if (locationId.HasValue)
                {
                    query = query.Where(t => t.LocationId == locationId.Value);
                }

                // Lọc theo Nơi khởi hành
                if (!string.IsNullOrEmpty(departure))
                {
                    // Lọc những tour có bất kỳ (Any) lịch khởi hành nào chứa từ khóa "departure"
                    query = query.Where(t => t.Departures.Any(d => d.DepartureCity != null && d.DepartureCity.Contains(departure)));
                }

                // Lọc theo số ngày
                if (duration.HasValue)
                {
                    query = query.Where(t => t.NumDay == duration.Value);
                }

                // Lọc theo khoảng giá
                if (priceFrom.HasValue)
                {
                    query = query.Where(t => t.Price >= priceFrom.Value); // Giá >= priceFrom
                }
                if (priceTo.HasValue)
                {
                    query = query.Where(t => t.Price <= priceTo.Value); // Giá <= priceTo
                }

                // --- XỬ LÝ SẮP XẾP (SORTING) ---
                if (sortBy == "priceAsc")
                {
                    query = query.OrderBy(t => t.Price); // ORDER BY Price ASC
                }
                else if (sortBy == "priceDesc")
                {
                    query = query.OrderByDescending(t => t.Price); // ORDER BY Price DESC
                }
                else if (sortBy == "durationAsc")
                {
                    query = query.OrderBy(t => t.NumDay);
                }
                else if (sortBy == "durationDesc")
                {
                    query = query.OrderByDescending(t => t.NumDay);
                }
                else
                {
                    query = query.OrderBy(t => t.Price); // Sắp xếp mặc định
                }

                // --- XỬ LÝ PHÂN TRANG (PAGINATION) ---
                // Đếm tổng số tour trước khi phân trang (để trả về tổng số trang cho Frontend)
                var totalItems = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalItems / (double)limit);

                // Lấy dữ liệu theo trang hiện tại
                var tours = await query
                    .Skip((page - 1) * limit) // Bỏ qua các phần tử của trang trước (Giống skip của MongoDB)
                    .Take(limit) // Lấy số lượng phần tử của trang hiện tại (Giống limit của MongoDB)
                    // Select giống mảng.map() -> Gọt bớt dữ liệu, chỉ lấy những trường cần thiết
                    .Select(t => new TourDto
                    {
                        Id = t.Id,
                        Title = t.Title,
                        Slug = t.Slug,
                        Price = t.Price,
                        OldPrice = t.OldPrice,
                        Rating = t.Rating,
                        RatingCount = t.RatingCount,
                        NumDay = t.NumDay,
                        NumNight = t.NumNight,
                        LocationName = t.Location != null ? t.Location.Name : null,
                        RegionName = t.Location != null && t.Location.Subregion != null && t.Location.Subregion.Region != null ? t.Location.Subregion.Region.Name : null,
                        ThumbnailUrl = t.ThumbnailUrl,
                        DepartureDate = t.Departures.OrderBy(d => d.DepartureDate).Select(d => d.DepartureDate.ToString("dd-MM-yyyy")).FirstOrDefault()
                    })
                    .ToListAsync(); // Chạy câu SQL xuống Database và trả về danh sách dạng List

                var response = new
                {
                    result = tours,
                    pagination = new
                    {
                        totalItems,
                        totalItemsPerPage = limit,
                        currentPage = page,
                        totalPages
                    }
                };

                await _cacheService.SetAsync(cacheKey, response, TimeSpan.FromMinutes(15));
                return Ok(response);
            }
            catch (Exception ex)
            {
                // Bắt lỗi (try-catch giống Node.js)
                Console.WriteLine($"[GET TOURS ERROR] {ex.ToString()}"); // Log lỗi ra console
                return StatusCode(500, new { message = "Lỗi server" }); // Trả về status 500
            }
        }

        // ---------------------------------------------------------
        // 2. API: Lấy chi tiết Tour theo ID
        // [GET] /api/tours/{id} (Giống req.params.id)
        // ---------------------------------------------------------
        [HttpGet("{id}")] // Định nghĩa Route có tham số động
        public async Task<IActionResult> GetTourById(int id) // Tham số id được ánh xạ tự động từ URL
        {
            try
            {
                var cacheKey = $"tours:detail:{id}";
                var cachedData = await _cacheService.GetAsync<object>(cacheKey);
                if (cachedData != null)
                {
                    return Ok(cachedData);
                }

                // Tìm Tour theo ID và join với TẤT CẢ các bảng liên quan (Location, Images, Departures...)
                var tour = await _context.Tours
                    .Include(t => t.Location)
                    .Include(t => t.Images)
                    .Include(t => t.Departures)
                    .Include(t => t.Schedules)
                    .Include(t => t.Prices)
                    .Include(t => t.Terms)
                    .Include(t => t.Reviews)
                    .FirstOrDefaultAsync(t => t.Id == id); // Giống findOne({ id: id })

                // Nếu không tìm thấy, trả về lỗi 404 (Not Found)
                if (tour == null) return NotFound(new { message = "Không tìm thấy tour" });

                // Map dữ liệu từ Entity (DB) sang DTO (Data Transfer Object) để gửi về Frontend
                var detailDto = new TourDetailDto
                {
                    Id = tour.Id,
                    Title = tour.Title,
                    Slug = tour.Slug,
                    NumDay = tour.NumDay,
                    NumNight = tour.NumNight,
                    Price = tour.Price,
                    OldPrice = tour.OldPrice,
                    Rating = tour.Rating,
                    RatingCount = tour.RatingCount,
                    Overview = tour.Overview,
                    LocationName = tour.Location?.Name, // Dùng toán tử ? (Optional Chaining) giống hệt JS
                    DepartureDate = tour.Departures.OrderBy(d => d.DepartureDate).Select(d => d.DepartureDate.ToString("dd-MM-yyyy")).FirstOrDefault(),
                    Images = tour.Images.OrderBy(i => i.Id).Select(i => i.ImageUrl).ToList(),
                    Departures = tour.Departures.OrderBy(d => d.DepartureDate).Select(d => new TourDepartureDto
                    {
                        Id = d.Id,
                        DepartureDate = d.DepartureDate.ToString("yyyy-MM-dd"),
                        ReturnDate = d.ReturnDate.ToString("yyyy-MM-dd"),
                        // Logic kiểm tra chỗ trống
                        SeatStatus = d.AvailableSeats == null ? "Liên hệ" : (d.AvailableSeats == 0 ? "Hết chỗ" : $"Còn {d.AvailableSeats} chỗ"),
                        Price = d.Price,
                        DepartureCity = d.DepartureCity
                    }).ToList(),
                    Schedules = tour.Schedules.OrderBy(s => s.Id).Select(s => new TourScheduleDto
                    {
                        Id = s.Id,
                        DayText = s.DayText,
                        Content = s.Content
                    }).ToList(),
                    Prices = tour.Prices.Select(p => new TourPriceDto
                    {
                        Id = p.Id,
                        TargetType = p.TargetType,
                        MinAge = p.MinAge,
                        MaxAge = p.MaxAge,
                        Price = p.Price
                    }).ToList(),
                    Terms = tour.Terms.Select(t => new TourTermDto
                    {
                        Id = t.Id,
                        SectionTitle = t.SectionTitle,
                        Content = t.Content
                    }).ToList(),
                    Reviews = tour.Reviews.Select(r => new TourReviewDto
                    {
                        Id = r.Id,
                        Name = r.Name,
                        Rating = r.Rating,
                        Comment = r.Comment,
                        CreatedAt = r.CreatedAt
                    }).ToList()
                };

                var response = new { success = true, data = detailDto };
                await _cacheService.SetAsync(cacheKey, response, TimeSpan.FromMinutes(30));
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GET TOUR BY ID ERROR] {ex.ToString()}");
                var innerMsg = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new { message = "Lỗi server", error = innerMsg, fullError = ex.ToString() });
            }
        }

        // ---------------------------------------------------------
        // 3. API: Lấy danh sách các điểm khởi hành (Ví dụ: Hà Nội, TP HCM)
        // [GET] /api/tours/departure-cities
        // ---------------------------------------------------------
        [HttpGet("departure-cities")]
        public async Task<IActionResult> GetDepartureCities()
        {
            try
            {
                var cities = await _context.TourDepartures
                    .Where(d => d.DepartureCity != null && d.DepartureCity != "") // Lọc bỏ giá trị rỗng
                    .Select(d => d.DepartureCity) // Chỉ lấy cột DepartureCity
                    .Distinct() // Loại bỏ các tên trùng lặp (UNIQUE)
                    .OrderBy(c => c) // Sắp xếp theo bảng chữ cái
                    .ToListAsync();
                    
                return Ok(cities);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GET DEPARTURE CITIES ERROR] {ex.ToString()}");
                return StatusCode(500, new { error = "Lỗi server" });
            }
        }

        // ---------------------------------------------------------
        // 4. API: Gợi ý Tour khi người dùng gõ vào thanh tìm kiếm (Autocomplete)
        // [GET] /api/tours/suggest?q=nha-trang
        // ---------------------------------------------------------
        [HttpGet("suggest")]
        public async Task<IActionResult> GetSuggestTours([FromQuery] string q)
        {
            // Nếu từ khóa ngắn hơn 2 ký tự thì không tìm kiếm
            if (string.IsNullOrEmpty(q) || q.Length < 2) return Ok(new { success = true, data = new List<object>() });

            try
            {
                var search = q.Trim().ToLower(); // Cắt khoảng trắng và đưa về chữ thường
                var tours = await _context.Tours
                    // Tìm kiếm (LIKE %search%) trên Tiêu đề HOẶC Đường dẫn (Slug)
                    .Where(t => t.Title.ToLower().Contains(search) || t.Slug.ToLower().Contains(search))
                    .Take(10) // Chỉ lấy tối đa 10 gợi ý
                    .Select(t => new SuggestTourDto // Chỉ trả về Id, Title, Slug cho nhẹ
                    {
                        Id = t.Id,
                        Title = t.Title,
                        Slug = t.Slug
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = tours });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GET SUGGEST TOURS ERROR] {ex.ToString()}");
                return StatusCode(500, new { error = "Lỗi server" });
            }
        }

        // ---------------------------------------------------------
        // 5. API: Tìm kiếm Tour chi tiết
        // [GET] /api/tours/search?destination=...&startDate=...&departure=...
        // ---------------------------------------------------------
        [HttpGet("search")]
        public async Task<IActionResult> GetSearchTours(
            [FromQuery] string? destination, // Điểm đến
            [FromQuery] DateTime? startDate, // Ngày khởi hành
            [FromQuery] string? departure,   // Điểm khởi hành
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10)
        {
            try
            {
                // Ở đây lập trình viên đang rẽ nhánh: Tìm kiếm theo Tour hoặc Tìm kiếm theo Lịch khởi hành
                var query = _context.Tours
                    .Include(t => t.Departures)
                    .Include(t => t.Location)
                    .Include(t => t.Images)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(destination))
                {
                    var dest = destination.ToLower();
                    query = query.Where(t => t.Title.ToLower().Contains(dest));
                }

                if (startDate.HasValue)
                {
                    // Lọc Tour có NGÀY khởi hành lớn hơn hoặc bằng ngày tìm kiếm
                    query = query.Where(t => t.Departures.Any(d => d.DepartureDate >= startDate.Value));
                }

                if (!string.IsNullOrEmpty(departure))
                {
                    var dep = departure.ToLower();
                    // Lọc Tour có ĐIỂM khởi hành chứa từ khóa
                    query = query.Where(t => t.Departures.Any(d => d.DepartureCity != null && d.DepartureCity.ToLower().Contains(dep)));
                }

                // --- CHÚ Ý: Logic bên dưới là Query lấy từ bảng TourDepartures (Lịch khởi hành) làm gốc ---
                var depQuery = _context.TourDepartures
                    .Include(d => d.Tour)
                        .ThenInclude(t => t!.Location)
                    .Include(d => d.Tour)
                        .ThenInclude(t => t!.Images)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(destination))
                {
                    var dest = destination.ToLower();
                    depQuery = depQuery.Where(d => d.Tour!.Title.ToLower().Contains(dest));
                }
                if (startDate.HasValue)
                {
                    depQuery = depQuery.Where(d => d.DepartureDate >= startDate.Value);
                }
                if (!string.IsNullOrEmpty(departure))
                {
                    var dep = departure.ToLower();
                    depQuery = depQuery.Where(d => d.DepartureCity != null && d.DepartureCity.ToLower().Contains(dep));
                }

                var totalItems = await depQuery.CountAsync();
                var totalPages = (int)Math.Ceiling(totalItems / (double)limit);

                // Trả về kết quả dựa trên TourDepartures (Mỗi ngày khởi hành là 1 dòng kết quả)
                var results = await depQuery
                    .OrderBy(d => d.DepartureDate)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .Select(d => new
                    {
                        d.Tour!.Id,
                        d.Tour.Title,
                        d.Tour.Slug,
                        d.Tour.NumDay,
                        d.Tour.NumNight,
                        d.Tour.Price,
                        d.Tour.OldPrice,
                        d.Tour.Rating,
                        d.Tour.RatingCount,
                        ImageUrl = d.Tour.Images.OrderBy(i => i.Id).Select(i => i.ImageUrl).FirstOrDefault(),
                        DepartureCity = d.DepartureCity,
                        DepartureDate = d.DepartureDate.ToString("dd-MM-yyyy"),
                        ReturnDate = d.ReturnDate.ToString("dd-MM-yyyy"),
                        LocationName = d.Tour.Location != null ? d.Tour.Location.Name : null
                    })
                    .ToListAsync();

                return Ok(new
                {
                    result = results,
                    pagination = new
                    {
                        totalItems,
                        totalItemsPerPage = limit,
                        currentPage = page,
                        totalPages
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SEARCH TOURS ERROR] {ex.ToString()}");
                return StatusCode(500, new { error = "Lỗi server" });
            }
        }

        // ---------------------------------------------------------
        // 6. API: Lấy Tour theo loại (Trong nước / Quốc tế)
        // [GET] /api/tours/by-type?type=domestic
        // ---------------------------------------------------------
        [HttpGet("by-type")]
        public async Task<IActionResult> GetToursByType([FromQuery] string type, [FromQuery] int limit = 8)
        {
            try
            {
                var query = _context.Tours
                    .Include(t => t.Location)
                        .ThenInclude(l => l!.Subregion)
                            .ThenInclude(sr => sr!.Region)
                    .Include(t => t.Departures)
                    .Include(t => t.Images)
                    .AsQueryable();

                // Dựa vào "type" để lọc theo Khu vực (Region)
                if (type == "domestic") // Trong nước
                {
                    var domesticRegions = new List<string> { "Miền Bắc", "Miền Trung", "Miền Nam" };
                    query = query.Where(t => t.Location != null && t.Location.Subregion != null && t.Location.Subregion.Region != null && domesticRegions.Contains(t.Location.Subregion.Region.Name));
                }
                else if (type == "international") // Quốc tế
                {
                    var intlRegions = new List<string> { "Châu Á", "Châu Âu", "Châu Úc, Mỹ, Phi" };
                    query = query.Where(t => t.Location != null && t.Location.Subregion != null && t.Location.Subregion.Region != null && intlRegions.Contains(t.Location.Subregion.Region.Name));
                }
                else
                {
                    return BadRequest(new { success = false, message = "Type phải là 'domestic' hoặc 'international'" });
                }

                var tours = await query
                    .OrderByDescending(t => t.CreatedAt) // Mới nhất lên đầu
                    .Take(limit)
                    .Select(t => new TourDto
                    {
                        Id = t.Id,
                        Title = t.Title,
                        Slug = t.Slug,
                        Price = t.Price,
                        OldPrice = t.OldPrice,
                        Rating = t.Rating ?? 0,
                        RatingCount = t.RatingCount ?? 0,
                        NumDay = t.NumDay,
                        NumNight = t.NumNight,
                        LocationName = t.Location != null ? t.Location.Name : null,
                        RegionName = t.Location != null && t.Location.Subregion != null && t.Location.Subregion.Region != null ? t.Location.Subregion.Region.Name : null,
                        ThumbnailUrl = t.Images.OrderBy(i => i.Id).Select(i => i.ImageUrl).FirstOrDefault() ?? t.ThumbnailUrl,
                        DepartureDate = t.Departures.OrderBy(d => d.DepartureDate).Select(d => d.DepartureDate.ToString("dd-MM-yyyy")).FirstOrDefault(),
                        DepartureCity = t.Departures.OrderBy(d => d.DepartureDate).Select(d => d.DepartureCity).FirstOrDefault()
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = tours,
                    type = type, // Trả về type để frontend biết
                    count = tours.Count
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GET TOURS BY TYPE ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy danh sách tour", error = ex.Message });
            }
        }

        // ---------------------------------------------------------
        // 7. API: Lấy các điểm đến Hot nhất (Nhiều Tour nhất)
        // [GET] /api/tours/hot-destinations
        // ---------------------------------------------------------
        [HttpGet("hot-destinations")]
        public async Task<IActionResult> GetHotDestinations()
        {
            try
            {
                var destinations = await _context.Locations
                    .Select(l => new
                    {
                        Name = l.Name,
                        Count = l.Tours.Count, // Đếm số lượng Tour của mỗi Địa điểm (Location)
                        // Lấy ảnh của Tour đầu tiên thuộc địa điểm này làm ảnh đại diện
                        Image = l.Tours.SelectMany(t => t.Images).OrderBy(i => i.Id).Select(i => i.ImageUrl).FirstOrDefault()
                    })
                    .OrderByDescending(d => d.Count) // Sắp xếp giảm dần theo số lượng Tour
                    .Take(9) // Lấy top 9
                    .ToListAsync();

                var results = destinations.Select(d => new HotDestinationDto
                {
                    Name = d.Name,
                    Count = d.Count,
                    // Nếu không có ảnh thì lấy ảnh mặc định của Unsplash
                    Image = string.IsNullOrEmpty(d.Image) ? "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800" : d.Image
                });

                return Ok(new { success = true, data = results });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GET HOT DESTINATIONS ERROR] {ex.ToString()}");
                return StatusCode(500, new { error = "Lỗi server" });
            }
        }
    }
}
