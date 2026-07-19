using BookingTourAPI.Data;
using BookingTourAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookingTourAPI.Controllers
{
    [ApiController]
    [Route("api/admin/topics")]
    // [Authorize(Roles = "admin,staff")] // Bật xác thực Admin/Staff khi deploy
    public class AdminTopicsController : ControllerBase
    {
        private readonly BookingTourContext _context;

        public AdminTopicsController(BookingTourContext context)
        {
            _context = context;
        }

        // GET: api/AdminTopics
        [HttpGet]
        public async Task<IActionResult> ListTopics()
        {
            try
            {
                var topics = await _context.Topics
                    .OrderByDescending(t => t.Id)
                    .ToListAsync();

                return Ok(topics);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LIST TOPICS ERROR] {ex.ToString()}");
                return StatusCode(500, new { message = "Lỗi server khi truy vấn chủ đề" });
            }
        }

        // POST: api/AdminTopics
        [HttpPost]
        public async Task<IActionResult> CreateTopic([FromBody] Topic topic)
        {
            try
            {
                if (string.IsNullOrEmpty(topic.Name) || string.IsNullOrEmpty(topic.Slug))
                {
                    return BadRequest(new { message = "Tên và slug là bắt buộc" });
                }

                bool exists = await _context.Topics.AnyAsync(t => t.Name == topic.Name || t.Slug == topic.Slug);
                if (exists)
                {
                    return BadRequest(new { message = "Tên hoặc slug đã tồn tại" });
                }

                topic.CreatedAt = DateTime.UtcNow;
                if (string.IsNullOrEmpty(topic.Status)) topic.Status = "active";
                if (topic.IsFeatured == null) topic.IsFeatured = 0;

                _context.Topics.Add(topic);
                await _context.SaveChangesAsync();

                return StatusCode(201, topic);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CREATE TOPIC ERROR] {ex.ToString()}");
                return StatusCode(500, new { message = "Lỗi server khi thêm chủ đề" });
            }
        }

        // PUT: api/AdminTopics/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTopic(int id, [FromBody] Topic topicUpdate)
        {
            try
            {
                if (string.IsNullOrEmpty(topicUpdate.Name) || string.IsNullOrEmpty(topicUpdate.Slug))
                {
                    return BadRequest(new { message = "Tên và slug là bắt buộc" });
                }

                var existingTopic = await _context.Topics.FindAsync(id);
                if (existingTopic == null)
                {
                    return NotFound(new { message = "Không tìm thấy chủ đề" });
                }

                bool duplicateMatch = await _context.Topics.AnyAsync(t => t.Id != id && (t.Name == topicUpdate.Name || t.Slug == topicUpdate.Slug));
                if (duplicateMatch)
                {
                    return BadRequest(new { message = "Tên hoặc slug đã tồn tại ở chủ đề khác" });
                }

                existingTopic.Name = topicUpdate.Name;
                existingTopic.Slug = topicUpdate.Slug;
                existingTopic.Status = string.IsNullOrEmpty(topicUpdate.Status) ? existingTopic.Status : topicUpdate.Status;

                await _context.SaveChangesAsync();
                return Ok(existingTopic);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UPDATE TOPIC ERROR] {ex.ToString()}");
                return StatusCode(500, new { message = "Lỗi server khi cập nhật chủ đề" });
            }
        }

        // DELETE: api/AdminTopics/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTopic(int id)
        {
            try
            {
                var topic = await _context.Topics.FindAsync(id);
                if (topic == null)
                {
                    return NotFound(new { message = "Không tìm thấy chủ đề" });
                }

                _context.Topics.Remove(topic);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Đã xóa chủ đề" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DELETE TOPIC ERROR] {ex.ToString()}");
                return StatusCode(500, new { message = "Lỗi server khi xóa chủ đề" });
            }
        }

        // GET: api/admin/topics/feature
        [HttpGet("feature")]
        public async Task<IActionResult> ListFeaturedTopics()
        {
            try
            {
                var topics = await _context.Topics
                    .Where(t => t.IsFeatured == 1)
                    .OrderByDescending(t => t.Id)
                    .ToListAsync();
                return Ok(topics);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LIST FEATURED TOPICS ERROR] {ex.ToString()}");
                return StatusCode(500, new { message = "Lỗi server khi truy vấn chủ đề nổi bật" });
            }
        }

        // POST: api/admin/topics/:id/feature
        [HttpPost("{id}/feature")]
        public async Task<IActionResult> MarkAsFeatured(int id)
        {
            try
            {
                var topic = await _context.Topics.FindAsync(id);
                if (topic == null) return NotFound(new { message = "Không tìm thấy chủ đề" });

                topic.IsFeatured = 1;
                await _context.SaveChangesAsync();
                return Ok(topic);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MARK FEATURED ERROR] {ex.ToString()}");
                return StatusCode(500, new { message = "Lỗi server khi đánh dấu chủ đề nổi bật" });
            }
        }

        // DELETE: api/admin/topics/:id/feature
        [HttpDelete("{id}/feature")]
        public async Task<IActionResult> UnmarkAsFeatured(int id)
        {
            try
            {
                var topic = await _context.Topics.FindAsync(id);
                if (topic == null) return NotFound(new { message = "Không tìm thấy chủ đề" });

                topic.IsFeatured = 0;
                await _context.SaveChangesAsync();
                return Ok(topic);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UNMARK FEATURED ERROR] {ex.ToString()}");
                return StatusCode(500, new { message = "Lỗi server khi bỏ đánh dấu chủ đề nổi bật" });
            }
        }
    }
}
