using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookingTourAPI.Models
{
    [Table("subregions")]
    public class Subregion
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("name")]
        [StringLength(100)]
        public string Name { get; set; } = null!;

        [Required]
        [Column("region_id")]
        public int RegionId { get; set; }

        // Navigation properties
        [ForeignKey("RegionId")]
        public Region? Region { get; set; }

        public ICollection<Location> Locations { get; set; } = new List<Location>();
    }
}
