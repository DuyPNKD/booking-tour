using System.Text.Json.Serialization;

namespace BookingTourAPI.DTOs
{
    public class TourDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Slug { get; set; } = null!;
        public int NumDay { get; set; }
        public int NumNight { get; set; }
        public int Price { get; set; }
        public int? OldPrice { get; set; }
        public float? Rating { get; set; }
        public int? RatingCount { get; set; }
        
        [JsonPropertyName("booked")]
        public int? Booked => RatingCount; // Map rating_count sang booked cho Frontend
        
        [JsonPropertyName("image_url")]
        public string? ImageUrl => ThumbnailUrl; // Alias cho thumbnail_url

        [JsonPropertyName("location")]
        public string? Location => LocationName; // Alias cho location_name

        public string? LocationName { get; set; }
        public string? RegionName { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? DepartureDate { get; set; }
        public string? DepartureCity { get; set; }
    }

    public class TourDetailDto : TourDto
    {
        public string? Overview { get; set; }
        public List<string> Images { get; set; } = new List<string>();
        public List<TourDepartureDto> Departures { get; set; } = new List<TourDepartureDto>();
        public List<TourScheduleDto> Schedules { get; set; } = new List<TourScheduleDto>();
        public List<TourPriceDto> Prices { get; set; } = new List<TourPriceDto>();
        public List<TourTermDto> Terms { get; set; } = new List<TourTermDto>();
        public List<TourReviewDto> Reviews { get; set; } = new List<TourReviewDto>();
    }

    public class TourDepartureDto
    {
        public int Id { get; set; }
        public string DepartureDate { get; set; } = null!;
        public string ReturnDate { get; set; } = null!;
        public string SeatStatus { get; set; } = null!;
        public int Price { get; set; }
        public string? DepartureCity { get; set; }
    }
    
    public class TourScheduleDto
    {
        public int Id { get; set; }
        public string DayText { get; set; } = null!;
        public string? Content { get; set; }
    }
    
    public class TourPriceDto
    {
        public int Id { get; set; }
        public string TargetType { get; set; } = null!;
        public int? MinAge { get; set; }
        public int? MaxAge { get; set; }
        public int Price { get; set; }
    }
    
    public class TourTermDto
    {
        public int Id { get; set; }
        public string SectionTitle { get; set; } = null!;
        public string Content { get; set; } = null!;
    }
    
    public class TourReviewDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    public class SuggestTourDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Slug { get; set; } = null!;
    }

    public class HotDestinationDto
    {
        public string Name { get; set; } = null!;
        public int Count { get; set; }
        public string Image { get; set; } = null!;
    }
}
