using System.ComponentModel.DataAnnotations;

namespace BookingTourAPI.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Tên là bắt buộc")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "Email hoặc Số điện thoại là bắt buộc")]
        public string EmailOrPhone { get; set; } = null!;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải từ 6 ký tự trở lên")]
        public string Password { get; set; } = null!;
    }

    public class LoginDto
    {
        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        public string Password { get; set; } = null!;
    }

    public class VerifyOtpDto
    {
        [Required(ErrorMessage = "UserId là bắt buộc")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "Mã OTP là bắt buộc")]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "Mã OTP phải có 6 chữ số")]
        public string Otp { get; set; } = null!;
    }
}
