using BookingTourAPI.Data;
using BookingTourAPI.Models;
using BookingTourAPI.DTOs;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace BookingTourAPI.Controllers
{
    [ApiController]
    [Route("api/admin/tours")]
    // [Authorize(Roles = "admin,staff")] // Bật xác thực Admin/Staff khi deploy
    public class AdminToursController : ControllerBase
    {
        private readonly BookingTourContext _context;

        public AdminToursController(BookingTourContext context)
        {
            _context = context;
        }

        // GET: api/AdminTours
        [HttpGet]
        public async Task<IActionResult> ListTours([FromQuery] string? q, [FromQuery] int? locationId, [FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            try
            {
                page = Math.Max(1, page);
                limit = Math.Max(1, Math.Min(100, limit));
                int offset = (page - 1) * limit;

                var query = _context.Tours.Include(t => t.Location).AsQueryable();

                if (!string.IsNullOrEmpty(q))
                {
                    query = query.Where(t => t.Title.Contains(q));
                }

                if (locationId.HasValue)
                {
                    query = query.Where(t => t.LocationId == locationId.Value);
                }

                int totalItems = await query.CountAsync();

                var rows = await query
                    .OrderByDescending(t => t.Id)
                    .Skip(offset)
                    .Take(limit)
                    .Select(t => new
                    {
                        t.Id,
                        t.Title,
                        t.Price,
                        t.OldPrice,
                        t.LocationId,
                        LocationName = t.Location != null ? t.Location.Name : null,
                        t.CreatedAt,
                        t.Status
                    })
                    .ToListAsync();

                return Ok(new
                {
                    result = rows,
                    pagination = new
                    {
                        totalItems,
                        totalItemsPerPage = limit,
                        currentPage = page,
                        totalPages = (int)Math.Ceiling((double)totalItems / limit)
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LIST TOURS ERROR] {ex.ToString()}");
                return StatusCode(500, new { message = "Server error" });
            }
        }

        // GET: api/AdminTours/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTourDetail(int id)
        {
            try
            {
                var tour = await _context.Tours
                    .Include(t => t.Location)
                    .Include(t => t.Images)
                    .Include(t => t.Schedules)
                    .Include(t => t.Departures)
                    .Include(t => t.Terms)
                    .Include(t => t.Prices)
                    .Include(t => t.Reviews)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (tour == null) return NotFound(new { message = "Not found" });

                return Ok(new
                {
                    tour.Id,
                    tour.Title,
                    tour.Slug,
                    tour.NumDay,
                    tour.NumNight,
                    tour.Price,
                    tour.OldPrice,
                    tour.LocationId,
                    LocationName = tour.Location?.Name,
                    tour.ThumbnailUrl,
                    tour.Overview,
                    tour.Status,
                    tour.CreatedAt,

                    Images = tour.Images.OrderBy(i => i.Id),
                    Schedules = tour.Schedules.OrderBy(s => s.Id),
                    Departures = tour.Departures.OrderBy(d => d.DepartureDate),
                    Terms = tour.Terms.OrderBy(t => t.Id),
                    Prices = tour.Prices.OrderBy(p => p.Id),
                    Reviews = tour.Reviews.OrderByDescending(r => r.Id)
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GET TOUR DETAIL ERROR] {ex.ToString()}");
                return StatusCode(500, new { message = "Server error" });
            }
        }

        // POST: api/AdminTours
        [HttpPost]
        public async Task<IActionResult> CreateTour([FromBody] TourCreateDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var tour = new Tour
                {
                    Title = dto.Title,
                    Slug = dto.Slug,
                    NumDay = dto.NumDay,
                    NumNight = dto.NumNight,
                    Price = dto.Price,
                    OldPrice = dto.OldPrice,
                    LocationId = dto.LocationId,
                    Status = dto.Status ?? "active",
                    ThumbnailUrl = dto.ThumbnailUrl,
                    Overview = dto.Overview,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Tours.Add(tour);
                await _context.SaveChangesAsync(); 

                if (dto.Images != null && dto.Images.Any())
                {
                    _context.TourImages.AddRange(dto.Images.Select(img => new TourImage { TourId = tour.Id, ImageUrl = img.ImageUrl }));
                }

                if (dto.Schedules != null && dto.Schedules.Any())
                {
                    int index = 1;
                    foreach (var s in dto.Schedules)
                    {
                        var ts = new TourSchedule
                        {
                            TourId = tour.Id,
                            DayText = s.DayText,
                            Content = s.Content
                        };
                        _context.TourSchedules.Add(ts);
                    }
                }

                if (dto.Departures != null && dto.Departures.Any())
                {
                    foreach (var d in dto.Departures)
                    {
                        d.TourId = tour.Id;
                        _context.TourDepartures.Add(d);
                    }
                }

                if (dto.Terms != null && dto.Terms.Any())
                {
                    foreach (var t in dto.Terms)
                    {
                        t.TourId = tour.Id;
                        _context.TourTerms.Add(t);
                    }
                }

                if (dto.Prices != null && dto.Prices.Any())
                {
                    foreach (var p in dto.Prices)
                    {
                        p.TourId = tour.Id;
                        _context.TourPrices.Add(p);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return StatusCode(201, new { id = tour.Id, message = "Created" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"[CREATE TOUR ERROR] {ex.ToString()}");
                return StatusCode(500, new { message = "Server error" });
            }
        }

        // PUT: api/AdminTours/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTour(int id, [FromBody] TourCreateDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var tour = await _context.Tours.FindAsync(id);
                if (tour == null) return NotFound(new { message = "Not found" });

                tour.Title = dto.Title;
                tour.Slug = dto.Slug;
                tour.NumDay = dto.NumDay;
                tour.NumNight = dto.NumNight;
                tour.Price = dto.Price;
                tour.OldPrice = dto.OldPrice;
                tour.LocationId = dto.LocationId;
                tour.Status = dto.Status ?? tour.Status;
                tour.ThumbnailUrl = dto.ThumbnailUrl;
                tour.Overview = dto.Overview;

                // Xóa dữ liệu liên quan
                var existingImages = await _context.TourImages.Where(i => i.TourId == id).ToListAsync();
                var existingSchedules = await _context.TourSchedules.Where(s => s.TourId == id).ToListAsync();
                var existingDepartures = await _context.TourDepartures.Where(d => d.TourId == id).ToListAsync();
                var existingTerms = await _context.TourTerms.Where(t => t.TourId == id).ToListAsync();
                var existingPrices = await _context.TourPrices.Where(p => p.TourId == id).ToListAsync();

                _context.TourImages.RemoveRange(existingImages);
                _context.TourSchedules.RemoveRange(existingSchedules);
                _context.TourDepartures.RemoveRange(existingDepartures);
                _context.TourTerms.RemoveRange(existingTerms);
                _context.TourPrices.RemoveRange(existingPrices);

                await _context.SaveChangesAsync(); 

                // Thêm lại
                if (dto.Images != null && dto.Images.Any())
                {
                    _context.TourImages.AddRange(dto.Images.Select(img => new TourImage { TourId = tour.Id, ImageUrl = img.ImageUrl }));
                }

                if (dto.Schedules != null && dto.Schedules.Any())
                {
                    int index = 1;
                    foreach (var s in dto.Schedules)
                    {
                        var ts = new TourSchedule
                        {
                            TourId = tour.Id,
                            DayText = s.DayText,
                            Content = s.Content
                        };
                        _context.TourSchedules.Add(ts);
                    }
                }

                if (dto.Departures != null && dto.Departures.Any())
                {
                    foreach (var d in dto.Departures)
                    {
                        d.TourId = tour.Id;
                        _context.TourDepartures.Add(d);
                    }
                }

                if (dto.Terms != null && dto.Terms.Any())
                {
                    foreach (var t in dto.Terms)
                    {
                        t.TourId = tour.Id;
                        _context.TourTerms.Add(t);
                    }
                }

                if (dto.Prices != null && dto.Prices.Any())
                {
                    foreach (var p in dto.Prices)
                    {
                        p.TourId = tour.Id;
                        _context.TourPrices.Add(p);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Updated" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"[UPDATE TOUR ERROR] {ex.ToString()}");
                return StatusCode(500, new { message = "Server error" });
            }
        }

        // DELETE: api/AdminTours/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTour(int id)
        {
            try
            {
                var tour = await _context.Tours.FindAsync(id);
                if (tour == null) return NotFound(new { message = "Not found" });

                _context.Tours.Remove(tour); 
                // Navigation Properties in EF Core typically imply cascading deletes if configured in setup/MySQL.
                await _context.SaveChangesAsync();

                return Ok(new { message = "Deleted" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DELETE TOUR ERROR] {ex.ToString()}");
                return StatusCode(500, new { message = "Server error" });
            }
        }

        // GET: api/admin/locations
        [HttpGet("/api/admin/locations")]
        public async Task<IActionResult> ListLocations()
        {
            try
            {
                var locs = await _context.Locations.Select(l => new { l.Id, l.Name }).ToListAsync();
                var subs = await _context.Subregions.Select(s => new { s.Id, s.Name }).ToListAsync();

                var merged = locs.Concat(subs).OrderBy(x => x.Name).ToList();

                return Ok(merged);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LIST LOCATIONS ERROR] {ex.ToString()}");
                return StatusCode(500, new { message = "Server error" });
            }
        }

        // POST: api/AdminTours/import
        [HttpPost("import")]
        public async Task<IActionResult> ImportTours(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded" });
            }

            try
            {
                int success = 0;
                int failed = 0;
                var errors = new List<object>();

                using var stream = file.OpenReadStream();
                using var workbook = new XLWorkbook(stream);
                var worksheet = workbook.Worksheet(1);
                var rows = worksheet.RangeUsed().RowsUsed().Skip(1); // Skip header

                foreach (var row in rows)
                {
                    using var transaction = await _context.Database.BeginTransactionAsync();
                    try
                    {
                        string title = row.Cell(1).GetString().Trim();
                        string slug = row.Cell(2).GetString().Trim();
                        if (string.IsNullOrEmpty(slug) && !string.IsNullOrEmpty(title))
                        {
                            slug = GenerateSlug(title);
                        }
                        
                        int.TryParse(row.Cell(3).GetString(), out int numDay);
                        int.TryParse(row.Cell(4).GetString(), out int numNight);
                        int.TryParse(row.Cell(5).GetString(), out int price);
                        int.TryParse(row.Cell(6).GetString(), out int oldPrice);
                        int.TryParse(row.Cell(7).GetString(), out int locationId);

                        if (string.IsNullOrEmpty(title) || price == 0 || locationId == 0)
                        {
                            failed++;
                            errors.Add(new { index = row.RowNumber(), message = "Missing required fields (title, price, location_id)" });
                            continue;
                        }

                        string overview = row.Cell(8).GetString().Trim();
                        string schedulesRaw = row.Cell(9).GetString();
                        string departureDateRaw = row.Cell(10).GetString();
                        string returnDateRaw = row.Cell(11).GetString();
                        int.TryParse(row.Cell(12).GetString(), out int availableSeats);
                        string departureCity = row.Cell(13).GetString().Trim();
                        string termsRaw = row.Cell(14).GetString();

                        var tour = new Tour
                        {
                            Title = title,
                            Slug = slug,
                            NumDay = numDay,
                            NumNight = numNight,
                            Price = price,
                            OldPrice = oldPrice,
                            LocationId = locationId,
                            Overview = overview,
                            Status = "pending",
                            CreatedAt = DateTime.UtcNow
                        };

                        _context.Tours.Add(tour);
                        await _context.SaveChangesAsync();

                        // Schedules
                        if (!string.IsNullOrEmpty(schedulesRaw))
                        {
                            var scheduleStrs = schedulesRaw.Split(new[] { "\n", "\r\n", ";" }, StringSplitOptions.RemoveEmptyEntries);
                            for (int i = 0; i < scheduleStrs.Length; i++)
                            {
                                _context.TourSchedules.Add(new TourSchedule
                                {
                                    TourId = tour.Id,
                                    DayText = $"Ngày {i + 1}",
                                    Content = scheduleStrs[i].Trim()
                                    // Bỏ DayOrder vì trong DB hiện tại bảng tour_schedules không có cột day_order
                                });
                            }
                        }

                        // Departures
                        if (!string.IsNullOrEmpty(departureDateRaw) && DateTime.TryParse(departureDateRaw, out DateTime depDate))
                        {
                            DateTime retDateVal = DateTime.MinValue; // Tạm giả lập nếu trong Model yêu cầu Required
                            if (DateTime.TryParse(returnDateRaw, out DateTime parsedRet)) retDateVal = parsedRet;

                            _context.TourDepartures.Add(new TourDeparture
                            {
                                TourId = tour.Id,
                                DepartureDate = depDate,
                                ReturnDate = retDateVal,
                                AvailableSeats = availableSeats > 0 ? availableSeats : null,
                                Price = price,
                                DepartureCity = departureCity
                            });
                        }

                        // Terms
                        if (!string.IsNullOrEmpty(termsRaw))
                        {
                            try
                            {
                                var termDict = JsonSerializer.Deserialize<Dictionary<string, string>>(termsRaw);
                                if (termDict != null)
                                {
                                    foreach (var kvp in termDict)
                                    {
                                        _context.TourTerms.Add(new TourTerm { TourId = tour.Id, SectionTitle = kvp.Key, Content = kvp.Value });
                                    }
                                }
                            }
                            catch
                            {
                                var termStrs = termsRaw.Split(new[] { "\n", "\r\n", ";" }, StringSplitOptions.RemoveEmptyEntries);
                                foreach (var ts in termStrs)
                                {
                                    _context.TourTerms.Add(new TourTerm { TourId = tour.Id, SectionTitle = "Điều khoản", Content = ts.Trim() });
                                }
                            }
                        }

                        // Tuổi Prices (cột 15 về sau, giản lược cho bản demo):
                        int.TryParse(row.Cell(15).GetString(), out int priceAdult);
                        if (priceAdult > 0)
                        {
                             _context.TourPrices.Add(new TourPrice { TourId = tour.Id, TargetType = "adult", MinAge = 12, Price = priceAdult });
                        }

                        int.TryParse(row.Cell(17).GetString(), out int priceChild);
                        if (priceChild > 0)
                        {
                             _context.TourPrices.Add(new TourPrice { TourId = tour.Id, TargetType = "child", MinAge = 2, MaxAge = 11, Price = priceChild });
                        }

                        int.TryParse(row.Cell(19).GetString(), out int priceInfant);
                        if (priceInfant > 0)
                        {
                             _context.TourPrices.Add(new TourPrice { TourId = tour.Id, TargetType = "infant", MinAge = 0, MaxAge = 1, Price = priceInfant });
                        }


                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                        success++;
                    }
                    catch (Exception rowEx)
                    {
                        await transaction.RollbackAsync();
                        failed++;
                        errors.Add(new { index = row.RowNumber(), message = rowEx.Message });
                    }
                }

                return Ok(new { success, failed, errors });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[IMPORT TOURS ERROR] {ex.ToString()}");
                return StatusCode(500, new { message = "Server error" });
            }
        }

        private string GenerateSlug(string phrase)
        {
            string str = phrase.ToLower();
            str = Regex.Replace(str, @"à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ", "a");
            str = Regex.Replace(str, @"è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ", "e");
            str = Regex.Replace(str, @"ì|í|ị|ỉ|ĩ", "i");
            str = Regex.Replace(str, @"ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ", "o");
            str = Regex.Replace(str, @"ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ", "u");
            str = Regex.Replace(str, @"ỳ|ý|ỵ|ỷ|ỹ", "y");
            str = Regex.Replace(str, @"đ", "d");
            str = Regex.Replace(str, @"\s+", "-");
            str = Regex.Replace(str, @"[^a-z0-9-]", "");
            str = Regex.Replace(str, @"-+", "-");
            return str.Trim('-');
        }
    }

    public class TourCreateDto
    {
        public string Title { get; set; } = null!;
        public string Slug { get; set; } = null!;
        public int NumDay { get; set; }
        public int NumNight { get; set; }
        public int Price { get; set; }
        public int? OldPrice { get; set; }
        public int LocationId { get; set; }
        public string? Status { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? Overview { get; set; }

        public List<TourImageDto>? Images { get; set; }
        public List<TourScheduleDto>? Schedules { get; set; }
        public List<TourDeparture>? Departures { get; set; }
        public List<TourTerm>? Terms { get; set; }
        public List<TourPrice>? Prices { get; set; }
    }

    public class TourImageDto
    {
        public string ImageUrl { get; set; } = null!;
    }
}
