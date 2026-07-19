using BookingTourAPI.Data;
using BookingTourAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookingTourAPI.Controllers
{
    [ApiController]
    [Route("api/admin/blogs")]
    // [Authorize(Roles = "admin,staff")] // Bật xác thực Admin/Staff khi deploy
    public class AdminBlogsController : ControllerBase
    {
        private readonly BookingTourContext _context;

        public AdminBlogsController(BookingTourContext context)
        {
            _context = context;
        }

        // GET: api/AdminBlogs
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
                    }) // Loại bỏ cột content lớn khi List
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

        // GET: api/AdminBlogs/{id}
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

        // POST: api/AdminBlogs
        [HttpPost]
        public async Task<IActionResult> CreateBlog([FromBody] Blog blog)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(blog.Title) || string.IsNullOrWhiteSpace(blog.Category) || string.IsNullOrWhiteSpace(blog.Content))
                {
                    return BadRequest(new { success = false, message = "Tiêu đề, danh mục và nội dung là bắt buộc" });
                }

                blog.CreatedAt = DateTime.UtcNow;
                blog.UpdatedAt = DateTime.UtcNow;
                if (!blog.Date.HasValue) blog.Date = DateTime.UtcNow.Date;

                _context.Blogs.Add(blog);
                await _context.SaveChangesAsync();

                return StatusCode(201, new
                {
                    success = true,
                    message = "Tạo bài viết mới thành công",
                    data = blog
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CREATE BLOG ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi server khi tạo bài viết" });
            }
        }

        // PUT: api/AdminBlogs/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBlog(int id, [FromBody] Blog updateDto)
        {
            try
            {
                var blog = await _context.Blogs.FindAsync(id);
                if (blog == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy bài viết" });
                }

                if (!string.IsNullOrWhiteSpace(updateDto.Title)) blog.Title = updateDto.Title.Trim();
                if (!string.IsNullOrWhiteSpace(updateDto.Category)) blog.Category = updateDto.Category.Trim();
                if (!string.IsNullOrWhiteSpace(updateDto.Content)) blog.Content = updateDto.Content.Trim();
                if (updateDto.Date.HasValue) blog.Date = updateDto.Date;
                if (updateDto.Image != null) blog.Image = updateDto.Image;
                if (updateDto.Description != null) blog.Description = updateDto.Description;

                blog.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Cập nhật bài viết thành công",
                    data = blog
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UPDATE BLOG ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi server khi cập nhật bài viết" });
            }
        }

        // DELETE: api/AdminBlogs/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBlog(int id)
        {
            try
            {
                var blog = await _context.Blogs.FindAsync(id);
                if (blog == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy bài viết" });
                }

                _context.Blogs.Remove(blog);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Xóa bài viết thành công" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DELETE BLOG ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi server khi xóa bài viết" });
            }
        }

        // GET: api/AdminBlogs/category/{category}
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

                if (!blogs.Any())
                {
                    return NotFound(new { success = false, message = $"Không có bài viết nào trong danh mục '{realCategory}'" });
                }

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
