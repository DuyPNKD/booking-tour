using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookingTourAPI.Models
{
    [Table("tour_schedules")]
    public class TourSchedule
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("tour_id")]
        public int TourId { get; set; }

        [Required]
        [Column("day_text")]
        [StringLength(50)]
        public string DayText { get; set; } = null!;

        [Column("content", TypeName = "text")]
        public string? Content { get; set; }

        [ForeignKey("TourId")]
        public Tour? Tour { get; set; }
    }
}
