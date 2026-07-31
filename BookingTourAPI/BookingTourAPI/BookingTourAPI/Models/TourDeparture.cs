using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookingTourAPI.Models
{
    [Table("tour_departures")]
    public class TourDeparture
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("tour_id")]
        public int TourId { get; set; }

        [Required]
        [Column("departure_date")]
        public DateTime DepartureDate { get; set; }

        [Required]
        [Column("return_date")]
        public DateTime ReturnDate { get; set; }

        [Column("price")]
        public int Price { get; set; }

        [Column("available_seats")]
        [ConcurrencyCheck]
        public int? AvailableSeats { get; set; }

        [Column("departure_city")]
        [StringLength(100)]
        public string? DepartureCity { get; set; }

        [ForeignKey("TourId")]
        public Tour? Tour { get; set; }
    }
}
