using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookingTourAPI.Models
{
    [Table("blogs")]
    public class Blog
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("title")]
        [StringLength(255)]
        public string Title { get; set; } = null!;

        [Required]
        [Column("category")]
        [StringLength(100)]
        public string Category { get; set; } = null!;

        [Column("date")]
        public DateTime? Date { get; set; }

        [Column("image")]
        [StringLength(500)]
        public string? Image { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Required]
        [Column("content")]
        public string Content { get; set; } = null!;

        [Column("created_at")]
        public DateTime? CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}
