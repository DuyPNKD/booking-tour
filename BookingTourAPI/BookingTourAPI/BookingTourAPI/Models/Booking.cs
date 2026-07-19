using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookingTourAPI.Models
{
    [Table("bookings")]
    public class Booking
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [Column("tour_id")]
        public int TourId { get; set; }

        [Required]
        [Column("status")]
        [StringLength(50)]
        public string Status { get; set; } = "pending"; // 'pending', 'paid', 'cancelled', 'completed'

        [Required]
        [Column("departure_date")]
        public DateTime DepartureDate { get; set; }

        [Required]
        [Column("total_price")]
        public int TotalPrice { get; set; }

        [Column("note", TypeName = "text")]
        public string? Note { get; set; }

        [Column("created_at")]
        public DateTime? CreatedAt { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public User? User { get; set; }

        [ForeignKey("TourId")]
        public Tour? Tour { get; set; }

        public ICollection<BookingDetail> Details { get; set; } = new List<BookingDetail>();
    }
}
