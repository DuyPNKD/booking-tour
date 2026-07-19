using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookingTourAPI.Models
{
    [Table("payments")]
    public class Payment
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("booking_id")]
        public int BookingId { get; set; }

        [Column("amount")]
        public int Amount { get; set; }

        [Column("payment_method")]
        [StringLength(50)]
        public string? PaymentMethod { get; set; }

        [Column("status")]
        [StringLength(50)]
        public string Status { get; set; } = "unpaid"; // 'unpaid', 'pending', 'paid', 'failed'

        [Column("paid_at")]
        public DateTime? PaidAt { get; set; }

        [Column("order_id")]
        [StringLength(50)]
        public string? OrderId { get; set; }

        // Navigation property
        [ForeignKey("BookingId")]
        public Booking? Booking { get; set; }
    }
}
