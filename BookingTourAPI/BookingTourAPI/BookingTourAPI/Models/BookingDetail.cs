using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookingTourAPI.Models
{
    [Table("booking_details")]
    public class BookingDetail
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("booking_id")]
        public int BookingId { get; set; }

        [Required]
        [Column("target_type")]
        [StringLength(20)]
        public string TargetType { get; set; } = null!; // 'adult', 'child', 'infant'

        [Required]
        [Column("quantity")]
        public int Quantity { get; set; }

        [ForeignKey("BookingId")]
        public Booking? Booking { get; set; }
    }
}
