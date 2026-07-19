using BookingTourAPI.Data;
using BookingTourAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookingTourAPI.Controllers
{
    [ApiController]
    [Route("api/blogs")]
    public class BlogsController : ControllerBase
    {
        private readonly BookingTourContext _context;

        public BlogsController(BookingTourContext context)
        {
            _context = context;
        }

        // GET: api/blogs
        [HttpGet]
        public async Task<IActionResult> ListBlogs([FromQuery] string? q, [FromQuery] string? category, [FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            try
            {
                page = Math.Max(1, page);
                limit = Math.Max(1, Math.Min(100, limit));
                int offset = (page - 1) * limit;

                var query = _context.Blogs.AsQueryable();

                if (!string.IsNullOrEmpty(q))
                {
                    query = query.Where(b => b.Title.Contains(q));
                }

                if (!string.IsNullOrEmpty(category))
                {
                    query = query.Where(b => b.Category == category);
                }

                int totalItems = await query.CountAsync();

                var blogs = await query
                    .OrderByDescending(b => b.Id)
                    .Skip(offset)
                    .Take(limit)
                    .Select(b => new
                    {
                        b.Id,
                        b.Title,
                        b.Category,
                        b.Date,
                        b.Image,
                        b.Description,
                        b.CreatedAt,
                        b.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách bài viết thành công",
                    data = new
                    {
                        result = blogs,
                        pagination = new
                        {
                            totalItems,
                            totalItemsPerPage = limit,
                            currentPage = page,
                            totalPages = (int)Math.Ceiling((double)totalItems / limit)
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LIST BLOGS ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi server khi lấy danh sách bài viết" });
            }
        }

        // GET: api/blogs/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBlogDetail(int id)
        {
            try
            {
                var blog = await _context.Blogs.FindAsync(id);
                if (blog == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy bài viết" });
                }

                return Ok(new
                {
                    success = true,
                    message = "Lấy chi tiết bài viết thành công",
                    data = blog
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GET BLOG DETAIl ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi server khi lấy chi tiết bài viết" });
            }
        }

        // GET: api/blogs/category/{category}
        [HttpGet("category/{category}")]
        public async Task<IActionResult> GetBlogsByCategory(string category)
        {
            var categoryMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                { "tin-du-lich", "Tin du lịch" },
                { "kinh-nghiem", "Kinh nghiệm" },
                { "am-thuc", "Ẩm thực" },
                { "dich-vu-visa", "Dịch vụ visa" },
                { "khuyen-mai", "Khuyến mãi" }
            };

            string realCategory = categoryMap.ContainsKey(category) ? categoryMap[category] : category;

            try
            {
                var blogs = await _context.Blogs
                    .Where(b => b.Category == realCategory)
                    .OrderByDescending(b => b.Id)
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    message = $"Lấy danh sách bài viết thuộc danh mục '{realCategory}' thành công",
                    data = blogs
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GET BLOGS BY CATEGORY ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi server khi lấy danh sách bài viết theo danh mục" });
            }
        }
    }
}
