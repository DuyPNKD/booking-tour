using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookingTourAPI.Models
{
    [Table("tour_prices")]
    public class TourPrice
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("tour_id")]
        public int TourId { get; set; }

        [Required]
        [Column("target_type")]
        [StringLength(20)]
        public string TargetType { get; set; } = null!; // 'adult', 'child', 'infant'

        [Column("min_age")]
        public int? MinAge { get; set; }

        [Column("max_age")]
        public int? MaxAge { get; set; }

        [Required]
        [Column("price")]
        public int Price { get; set; }

        [ForeignKey("TourId")]
        public Tour? Tour { get; set; }
    }
}
