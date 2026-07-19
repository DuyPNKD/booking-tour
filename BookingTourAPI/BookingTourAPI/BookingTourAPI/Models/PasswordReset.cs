using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookingTourAPI.Models
{
    [Table("password_resets")]
    public class PasswordReset
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [Column("token")]
        [StringLength(255)]
        public string Token { get; set; } = null!;

        [Required]
        [Column("expire_at")]
        public DateTime ExpireAt { get; set; }

        [Column("created_at")]
        public DateTime? CreatedAt { get; set; }

        // Navigation property
        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
