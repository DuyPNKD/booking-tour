using BookingTourAPI.Data;
using BookingTourAPI.DTOs;
using BookingTourAPI.Models;
using BookingTourAPI.Services;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BookingTourAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly BookingTourContext _context;
        private readonly IConfiguration _configuration;
        private readonly IMailerService _mailerService;

        public AuthController(BookingTourContext context, IConfiguration configuration, IMailerService mailerService)
        {
            _context = context;
            _configuration = configuration;
            _mailerService = mailerService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
                if (user == null || string.IsNullOrEmpty(user.Password))
                {
                    return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });
                }

                if (user.IsActive == 0)
                {
                    return BadRequest(new { success = false, message = "Tài khoản chưa được xác thực. Vui lòng kiểm tra email." });
                }

                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password);
                if (!isPasswordValid)
                {
                    return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });
                }

                var token = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken(user);
                SetRefreshTokenCookie(refreshToken);

                return Ok(new
                {
                    success = true,
                    token = token,
                    user = new
                    {
                        id = user.Id,
                        name = user.Name,
                        email = user.Email,
                        role = user.Role
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AUTH ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi server trong quá trình đăng nhập" });
            }
        }

        [HttpPost("/api/admin/login")]
        public async Task<IActionResult> LoginAdmin([FromBody] LoginDto loginDto)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
                if (user == null || string.IsNullOrEmpty(user.Password))
                {
                    return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });
                }

                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password);
                if (!isPasswordValid)
                {
                    return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });
                }

                if (user.Role != "admin" && user.Role != "staff")
                {
                    return StatusCode(403, new { message = "Forbidden. Tài khoản không có quyền truy cập trang quản trị." });
                }

                var token = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken(user);
                SetRefreshTokenCookie(refreshToken);

                return Ok(new
                {
                    access_token = token,
                    user = new
                    {
                        id = user.Id,
                        name = user.Name,
                        email = user.Email,
                        role = user.Role
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ADMIN LOGIN ERROR] {ex.ToString()}");
                return StatusCode(500, new { message = "Lỗi server trong quá trình đăng nhập quản trị" });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == registerDto.EmailOrPhone);
                if (existingUser != null)
                {
                    return BadRequest(new { success = false, message = "Email đã được sử dụng" });
                }

                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

                var newUser = new User
                {
                    Name = registerDto.Name,
                    Email = registerDto.EmailOrPhone,
                    Password = hashedPassword,
                    IsActive = 0, // Mặc định là 0 để qua bước OTP
                    Role = "user",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                // Tạo và gửi OTP
                string otpCode = new Random().Next(100000, 999999).ToString();
                var verification = new UserVerification
                {
                    UserId = newUser.Id,
                    Code = otpCode,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(5)
                };
                _context.UserVerifications.Add(verification);
                await _context.SaveChangesAsync();

                try
                {
                    await _mailerService.SendVerificationEmailAsync(newUser.Email, otpCode);
                }
                catch (Exception emailEx)
                {
                    Console.WriteLine($"[REGISTER EMAIL ERROR] {emailEx.Message}");
                }

                return Ok(new
                {
                    success = true,
                    message = "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác thực.",
                    email = newUser.Email
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[REGISTER ERROR] {ex.ToString()}");
                return StatusCode(500, new { success = false, message = "Lỗi server trong quá trình đăng ký" });
            }
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            var user = await _context.Users.FindAsync(int.Parse(userIdClaim));
            if (user == null) return NotFound();

            return Ok(new
            {
                success = true,
                data = new
                {
                    id = user.Id,
                    name = user.Name,
                    email = user.Email,
                    role = user.Role,
                    phone = user.Phone,
                    address = user.Address,
                    avatar = user.Avatar,
                    gender = user.Gender,
                    birth_date = user.BirthDate?.ToString("yyyy-MM-dd")
                }
            });
        }

        [Authorize]
        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile([FromBody] UserUpdateDto updateDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            var user = await _context.Users.FindAsync(int.Parse(userIdClaim));
            if (user == null) return NotFound();

            user.Name = updateDto.Name ?? user.Name;
            user.Phone = updateDto.Phone ?? user.Phone;
            user.Address = updateDto.Address ?? user.Address;
            user.Gender = updateDto.Gender ?? user.Gender;
            if (!string.IsNullOrEmpty(updateDto.BirthDate))
            {
                user.BirthDate = DateTime.Parse(updateDto. BirthDate);
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Cập nhật hồ sơ thành công" });
        }

        [HttpPost("verify")]
        public async Task<IActionResult> Verify([FromBody] VerifyDto verifyDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == verifyDto.Email);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

            var verification = await _context.UserVerifications
                .Where(v => v.UserId == user.Id && v.Code == verifyDto.Code && v.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(v => v.ExpiresAt)
                .FirstOrDefaultAsync();

            if (verification == null)
            {
                return BadRequest(new { success = false, message = "Mã xác thực không đúng hoặc đã hết hạn" });
            }

            user.IsActive = 1;
            _context.UserVerifications.Remove(verification);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                success = true,
                message = "Xác thực thành công",
                token = token,
                user = new { id = user.Id, name = user.Name, email = user.Email, role = user.Role }
            });
        }

        [HttpPost("resend-otp")]
        public async Task<IActionResult> ResendOtp([FromBody] ResendOtpDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null) return NotFound();

            string otpCode = new Random().Next(100000, 999999).ToString();
            var verification = new UserVerification
            {
                UserId = user.Id,
                Code = otpCode,
                ExpiresAt = DateTime.UtcNow.AddMinutes(5)
            };
            _context.UserVerifications.Add(verification);
            await _context.SaveChangesAsync();

            await _mailerService.SendVerificationEmailAsync(user.Email!, otpCode);

            return Ok(new { success = true, message = "Đã gửi lại mã OTP" });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null) return NotFound();

            string token = Guid.NewGuid().ToString();
            var reset = new PasswordReset
            {
                UserId = user.Id,
                Token = token,
                ExpireAt = DateTime.UtcNow.AddHours(1)
            };
            _context.PasswordResets.Add(reset);
            await _context.SaveChangesAsync();

            // Gửi mail (simplifying link for now)
            string resetLink = $"http://localhost:5173/reset-password?token={token}";
            await _mailerService.SendEmailAsync(user.Email!, "Yêu cầu đặt lại mật khẩu", $"Nhấp vào đây để reset: {resetLink}");

            return Ok(new { success = true, message = "Email hướng dẫn đã được gửi" });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var reset = await _context.PasswordResets
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Token == dto.Token && r.ExpireAt > DateTime.UtcNow);

            if (reset == null || reset.User == null)
            {
                return BadRequest(new { success = false, message = "Token không hợp lệ hoặc đã hết hạn" });
            }

            reset.User.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            _context.PasswordResets.Remove(reset);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Mật khẩu đã được thay đổi" });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            try
            {
                var refreshToken = Request.Cookies["refreshToken"];
                if (string.IsNullOrEmpty(refreshToken))
                {
                    return BadRequest(new { message = "Thiếu refresh_token" });
                }

                var userId = VerifyRefreshToken(refreshToken);
                if (userId == null)
                {
                    return StatusCode(403, new { message = "Refresh token không hợp lệ hoặc đã hết hạn" });
                }

                var user = await _context.Users.FindAsync(userId.Value);
                if (user == null)
                {
                    return NotFound(new { message = "Không tìm thấy người dùng" });
                }

                var newAccessToken = GenerateJwtToken(user);
                return Ok(new { access_token = newAccessToken });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AUTH REFRESH ERROR] {ex.ToString()}");
                return StatusCode(500, new { message = "Lỗi server" });
            }
        }

        [HttpPost("/api/admin/refresh")]
        [HttpPost("/api/admin/refresh-token")]
        public async Task<IActionResult> RefreshAdmin()
        {
            try
            {
                var refreshToken = Request.Cookies["refreshToken"];
                if (string.IsNullOrEmpty(refreshToken))
                {
                    return Unauthorized(new { message = "Không có refresh token" });
                }

                var userId = VerifyRefreshToken(refreshToken);
                if (userId == null)
                {
                    return StatusCode(403, new { message = "Refresh token không hợp lệ hoặc đã hết hạn" });
                }

                var user = await _context.Users.FindAsync(userId.Value);
                if (user == null)
                {
                    return NotFound(new { message = "Không tìm thấy người dùng" });
                }

                if (user.Role != "admin" && user.Role != "staff")
                {
                    return StatusCode(403, new { message = "Forbidden" });
                }

                var newAccessToken = GenerateJwtToken(user);
                return Ok(new { access_token = newAccessToken });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ADMIN REFRESH ERROR] {ex.ToString()}");
                return StatusCode(500, new { message = "Lỗi server" });
            }
        }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto?.Token))
                {
                    return BadRequest(new { success = false, message = "Token không được để trống" });
                }

                var settings = new GoogleJsonWebSignature.ValidationSettings();
                var googleClientId = _configuration["Google:ClientId"] ?? _configuration["GOOGLE_CLIENT_ID"];
                if (!string.IsNullOrEmpty(googleClientId))
                {
                    settings.Audience = new[] { googleClientId };
                }

                var payload = await GoogleJsonWebSignature.ValidateAsync(dto.Token, settings);
                if (payload == null || string.IsNullOrEmpty(payload.Email))
                {
                    return BadRequest(new { success = false, message = "Token Google không hợp lệ" });
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);
                if (user == null)
                {
                    user = new User
                    {
                        Name = payload.Name ?? payload.Email.Split('@')[0],
                        Email = payload.Email,
                        Avatar = payload.Picture,
                        IsActive = 1,
                        Role = "user",
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                }

                var token = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken(user);
                SetRefreshTokenCookie(refreshToken);

                return Ok(new
                {
                    success = true,
                    token = token,
                    accessToken = token,
                    user = new
                    {
                        id = user.Id,
                        name = user.Name,
                        email = user.Email,
                        role = user.Role,
                        avatar = user.Avatar
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GOOGLE LOGIN ERROR] {ex}");
                return BadRequest(new { success = false, message = "Token Google không hợp lệ hoặc đã hết hạn" });
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            ClearRefreshTokenCookie();
            return Ok(new { success = true, message = "Đã logout" });
        }

        [HttpPost("/api/admin/logout")]
        public IActionResult LogoutAdmin()
        {
            ClearRefreshTokenCookie();
            return Ok(new { message = "Đã logout" });
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = _configuration["Jwt:SecretKey"] ?? "MộtChuỗiBảoMậtRấtDàiVàKhóĐoán123456789!@#";
            var key = Encoding.UTF8.GetBytes(jwtKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email ?? ""),
                    new Claim(ClaimTypes.Role, user.Role ?? "user")
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string GenerateRefreshToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var refreshKey = _configuration["Jwt:RefreshSecretKey"] ?? "MộtChuỗiBảoMậtRefreshCũngRấtDàiVàKhóĐoán123456789!@#";
            var key = Encoding.UTF8.GetBytes(refreshKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private int? VerifyRefreshToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var refreshKey = _configuration["Jwt:RefreshSecretKey"] ?? "MộtChuỗiBảoMậtRefreshCũngRấtDàiVàKhóĐoán123456789!@#";
                var key = Encoding.UTF8.GetBytes(refreshKey);

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var userIdClaim = jwtToken.Claims.First(x => x.Type == "nameid" || x.Type == ClaimTypes.NameIdentifier).Value;
                return int.Parse(userIdClaim);
            }
            catch
            {
                return null;
            }
        }

        private void SetRefreshTokenCookie(string refreshToken)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7),
                Path = "/"
            };
            Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
        }

        private void ClearRefreshTokenCookie()
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps,
                SameSite = SameSiteMode.Strict,
                Path = "/"
            };
            Response.Cookies.Delete("refreshToken", cookieOptions);
        }
    }

    public class GoogleLoginDto { public string Token { get; set; } = null!; }
    public class VerifyDto { public string Email { get; set; } = null!; public string Code { get; set; } = null!; }
    public class ResendOtpDto { public string Email { get; set; } = null!; }
    public class ForgotPasswordDto { public string Email { get; set; } = null!; }
    public class ResetPasswordDto { public string Token { get; set; } = null!; public string NewPassword { get; set; } = null!; }
    public class UserUpdateDto
    {
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? Gender { get; set; }
        public string? BirthDate { get; set; }
    }
}
