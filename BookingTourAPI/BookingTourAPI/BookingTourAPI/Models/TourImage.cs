using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookingTourAPI.Models
{
    [Table("tours_images")]
    public class TourImage
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("tour_id")]
        public int TourId { get; set; }

        [Required]
        [Column("image_url")]
        [StringLength(500)]
        public string ImageUrl { get; set; } = null!;

        [ForeignKey("TourId")]
        public Tour? Tour { get; set; }
    }
}
