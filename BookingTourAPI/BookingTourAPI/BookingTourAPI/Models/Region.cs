using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookingTourAPI.Models
{
    [Table("regions")]
    public class Region
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("name")]
        [StringLength(100)]
        public string Name { get; set; } = null!;

        [Column("display_name")]
        [StringLength(255)]
        public string? DisplayName { get; set; }

        // Mối quan hệ 1-nhiều với Subregion
        public ICollection<Subregion> Subregions { get; set; } = new List<Subregion>();
    }
}
