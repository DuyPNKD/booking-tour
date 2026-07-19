using BookingTourAPI.Data;
using BookingTourAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BookingTourAPI.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly BookingTourContext _context;

        public UsersController(BookingTourContext context)
        {
            _context = context;
        }

        // GET: api/Users
        // GET: api/Users?page=1&limit=10&search=abc&role=admin&status=active
        [HttpGet]
        public async Task<IActionResult> GetUsers(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10,
            [FromQuery] string search = "",
            [FromQuery] string role = "",
            [FromQuery] string status = "")
        {
            try
            {
                var query = _context.Users.AsQueryable();

                // Lọc theo search (name hoặc email)
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(u => u.Name.Contains(search) || (u.Email != null && u.Email.Contains(search)));
                }

                // Lọc theo role
                if (!string.IsNullOrEmpty(role))
                {
                    query = query.Where(u => u.Role == role);
                }

                // Lọc theo status
                if (!string.IsNullOrEmpty(status))
                {
                    int isActive = status.ToLower() == "active" ? 1 : 0;
                    query = query.Where(u => u.IsActive == isActive);
                }

                // Lấy tổng số record trước khi phân trang
                var totalItems = await query.CountAsync();

                // Sắp xếp và phân trang
                var users = await query
                    .OrderByDescending(u => u.CreatedAt)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .Select(u => new
                    {
                        u.Id,
                        u.Name,
                        u.Email,
                        u.Phone,
                        u.Gender,
                        u.Address,
                        u.Role,
                        u.IsActive,
                        u.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = users,
                    pagination = new
                    {
                        current = page,
                        pageSize = limit,
                        total = totalItems,
                        pages = (int)Math.Ceiling((double)totalItems / limit)
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GET USERS ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy danh sách người dùng" });
            }
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var user = await _context.Users
                    .Where(u => u.Id == id)
                    .Select(u => new
                    {
                        u.Id,
                        u.Name,
                        u.Email,
                        u.Phone,
                        u.Gender,
                        u.Address,
                        u.Role,
                        u.IsActive,
                        u.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy người dùng" });
                }

                return Ok(new { success = true, data = user });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GET USER ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy thông tin người dùng" });
            }
        }

        // POST: api/Users
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] DTOs.CreateUserDto createUserDto)
        {
            try
            {
                // Validate email đã tồn tại chưa
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == createUserDto.Email);
                if (existingUser != null)
                {
                    return BadRequest(new { success = false, message = "Email đã tồn tại" });
                }

                // Hash password nếu có
                string? hashedPassword = null;
                if (!string.IsNullOrEmpty(createUserDto.Password))
                {
                    hashedPassword = BCrypt.Net.BCrypt.HashPassword(createUserDto.Password);
                }

                var newUser = new User
                {
                    Name = createUserDto.Name,
                    Email = createUserDto.Email,
                    Password = hashedPassword,
                    Phone = createUserDto.Phone,
                    Gender = createUserDto.Gender,
                    Address = createUserDto.Address,
                    Role = createUserDto.Role ?? "user",
                    IsActive = (sbyte?)(createUserDto.IsActive ?? 1),
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                return StatusCode(201, new
                {
                    success = true,
                    message = "Tạo người dùng thành công",
                    data = new
                    {
                        newUser.Id,
                        newUser.Name,
                        newUser.Email,
                        newUser.Phone,
                        newUser.Gender,
                        newUser.Address,
                        newUser.Role,
                        newUser.IsActive,
                        newUser.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                var innerMsg = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                Console.WriteLine($"[CREATE USER ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi khi tạo người dùng", error = innerMsg, fullError = ex.ToString() });
            }
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] DTOs.UpdateUserDto updateUserDto)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy người dùng" });
                }

                // Validate email nếu có email mới
                if (!string.IsNullOrEmpty(updateUserDto.Email) && updateUserDto.Email != user.Email)
                {
                    var emailCheck = await _context.Users.FirstOrDefaultAsync(u => u.Email == updateUserDto.Email && u.Id != id);
                    if (emailCheck != null)
                    {
                        return BadRequest(new { success = false, message = "Email đã tồn tại" });
                    }
                    user.Email = updateUserDto.Email;
                }

                if (updateUserDto.Name != null) user.Name = updateUserDto.Name;
                if (updateUserDto.Phone != null) user.Phone = updateUserDto.Phone;
                if (updateUserDto.Gender != null) user.Gender = updateUserDto.Gender;
                if (updateUserDto.Address != null) user.Address = updateUserDto.Address;
                if (updateUserDto.Role != null) user.Role = updateUserDto.Role;
                if (updateUserDto.IsActive.HasValue) user.IsActive = (sbyte?)updateUserDto.IsActive.Value;

                // Hash password mới nếu có
                if (!string.IsNullOrEmpty(updateUserDto.Password))
                {
                    user.Password = BCrypt.Net.BCrypt.HashPassword(updateUserDto.Password);
                }

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Cập nhật người dùng thành công",
                    data = new
                    {
                        user.Id,
                        user.Name,
                        user.Email,
                        user.Phone,
                        user.Gender,
                        user.Address,
                        user.Role,
                        user.IsActive,
                        user.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UPDATE USER ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi khi cập nhật người dùng" });
            }
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy người dùng" });
                }

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = $"Đã xóa người dùng {user.Name} thành công"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DELETE USER ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi khi xóa người dùng" });
            }
        }
    }
}
