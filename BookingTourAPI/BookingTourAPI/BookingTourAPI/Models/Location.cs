using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookingTourAPI.Models
{
    [Table("locations")]
    public class Location
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("name")]
        [StringLength(100)]
        public string Name { get; set; } = null!;

        [Required]
        [Column("subregion_id")]
        public int SubregionId { get; set; }

        [ForeignKey("SubregionId")]
        public Subregion? Subregion { get; set; }

        // Navigation properties
        public ICollection<Tour> Tours { get; set; } = new List<Tour>();
    }
}
