using System.ComponentModel.DataAnnotations;

namespace BookingTourAPI.DTOs
{
    public class CreateUserDto
    {
        [Required(ErrorMessage = "Tên là bắt buộc")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = null!;

        public string? Password { get; set; }
        public string? Phone { get; set; }

        [RegularExpression("^(male|female|other)$", ErrorMessage = "Gender phải là male, female hoặc other")]
        public string? Gender { get; set; }

        public string? Address { get; set; }
        
        [RegularExpression("^(admin|user)$", ErrorMessage = "Role không hợp lệ. Chỉ chấp nhận: user, admin")]
        public string? Role { get; set; } = "user";

        public int? IsActive { get; set; } = 1;
    }

    public class UpdateUserDto
    {
        public string? Name { get; set; }
        
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string? Email { get; set; }
        
        public string? Password { get; set; }
        public string? Phone { get; set; }

        [RegularExpression("^(male|female|other)$", ErrorMessage = "Gender phải là male, female hoặc other")]
        public string? Gender { get; set; }

        public string? Address { get; set; }

        [RegularExpression("^(admin|user)$", ErrorMessage = "Role không hợp lệ. Chỉ chấp nhận: user, admin")]
        public string? Role { get; set; }

        public int? IsActive { get; set; }
    }
}
