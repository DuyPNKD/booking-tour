using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookingTourAPI.Models
{
    [Table("tour_terms")]
    public class TourTerm
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("tour_id")]
        public int TourId { get; set; }

        [Required]
        [Column("section_title")]
        [StringLength(255)]
        public string SectionTitle { get; set; } = null!;

        [Required]
        [Column("content", TypeName = "text")]
        public string Content { get; set; } = null!;

        [ForeignKey("TourId")]
        public Tour? Tour { get; set; }
    }
}
