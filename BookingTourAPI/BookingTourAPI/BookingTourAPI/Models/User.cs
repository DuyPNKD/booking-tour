using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookingTourAPI.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("name")]
        [StringLength(100)]
        public string? Name { get; set; }

        [Column("email")]
        [StringLength(100)]
        public string? Email { get; set; }

        [Column("password")]
        [StringLength(255)]
        public string? Password { get; set; }

        [Column("phone")]
        [StringLength(20)]
        public string? Phone { get; set; }

        [Column("gender")]
        [StringLength(10)]
        public string? Gender { get; set; }

        [Column("address")]
        [StringLength(255)]
        public string? Address { get; set; }

        [Column("role")]
        [StringLength(50)]
        public string? Role { get; set; } // 'user', 'admin'

        [Column("avatar")]
        [StringLength(255)]
        public string? Avatar { get; set; }

        [Column("is_active")]
        public sbyte? IsActive { get; set; }

        [Column("birth_date")]
        public DateTime? BirthDate { get; set; }

        [Column("created_at")]
        public DateTime? CreatedAt { get; set; }
    }
}
