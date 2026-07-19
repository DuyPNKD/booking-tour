using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookingTourAPI.Models
{
    [Table("topics")]
    public class Topic
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("name")]
        [StringLength(255)]
        public string Name { get; set; } = null!;

        [Required]
        [Column("slug")]
        [StringLength(255)]
        public string Slug { get; set; } = null!;

        [Column("status")]
        [StringLength(50)]
        public string? Status { get; set; } = "active";

        [Column("is_featured")]
        public sbyte? IsFeatured { get; set; } = 0;

        [Column("created_at")]
        public DateTime? CreatedAt { get; set; }
    }
}
