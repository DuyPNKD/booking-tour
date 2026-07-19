using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookingTourAPI.Models
{
    [Table("tours")]
    public class Tour
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("title")]
        [StringLength(255)]
        public string Title { get; set; } = null!;

        [Required]
        [Column("slug")]
        [StringLength(255)]
        public string Slug { get; set; } = null!;

        [Column("num_day")]
        public int NumDay { get; set; }

        [Column("num_night")]
        public int NumNight { get; set; }

        [Column("price")]
        public int Price { get; set; }

        [Column("old_price")]
        public int? OldPrice { get; set; }

        [Column("thumbnail_url")]
        [StringLength(500)]
        public string? ThumbnailUrl { get; set; }

        [Column("rating")]
        public float? Rating { get; set; }

        [Column("rating_count")]
        public int? RatingCount { get; set; }

        [Column("overview")]
        public string? Overview { get; set; }

        [Column("location_id")]
        public int LocationId { get; set; }

        [Column("status")]
        [StringLength(50)]
        public string? Status { get; set; } // 'active','paused','archived'

        [Column("created_at")]
        public DateTime? CreatedAt { get; set; }

        // Navigation property
        [ForeignKey("LocationId")]
        public Location? Location { get; set; }

        public ICollection<TourImage> Images { get; set; } = new List<TourImage>();
        public ICollection<TourDeparture> Departures { get; set; } = new List<TourDeparture>();
        public ICollection<TourSchedule> Schedules { get; set; } = new List<TourSchedule>();
        public ICollection<TourPrice> Prices { get; set; } = new List<TourPrice>();
        public ICollection<TourTerm> Terms { get; set; } = new List<TourTerm>();
        public ICollection<TourReview> Reviews { get; set; } = new List<TourReview>();
    }
}
