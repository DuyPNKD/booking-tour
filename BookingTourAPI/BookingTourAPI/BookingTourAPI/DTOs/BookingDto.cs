using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BookingTourAPI.DTOs
{
    public class BookingPassengerDto
    {
        [Required]
        [JsonPropertyName("target_type")]
        public string TargetType { get; set; } = null!; // "adult", "child", "infant"
        
        [Required]
        [JsonPropertyName("quantity")]
        public int Quantity { get; set; }
    }

    public class CreateBookingDto
    {
        [Required]
        [JsonPropertyName("tour_id")]
        public int TourId { get; set; }
        
        // Thông tin người đặt
        [JsonPropertyName("full_name")]
        public string? FullName { get; set; }
        
        [JsonPropertyName("gender")]
        public string? Gender { get; set; }

        [JsonPropertyName("email")]
        public string? Email { get; set; }

        [JsonPropertyName("phone_number")]
        public string? Phone { get; set; }

        [JsonPropertyName("address")]
        public string? Address { get; set; }
        
        [Required]
        [JsonPropertyName("departure_date")]
        public DateTime DepartureDate { get; set; }
        
        [Required]
        [JsonPropertyName("details")]
        public List<BookingPassengerDto> Passengers { get; set; } = new List<BookingPassengerDto>();
        
        [JsonPropertyName("note")]
        public string? Note { get; set; }
        
        [JsonPropertyName("total_price")]
        public int TotalPrice { get; set; }
    }

    public class BookingResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int TourId { get; set; }
        public string TourTitle { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string DepartureDate { get; set; } = string.Empty;
        public int TotalPrice { get; set; }
        public string? Note { get; set; }
        public string? CreatedAt { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string TourName { get; set; } = string.Empty;
        public string? LocationName { get; set; }
        public int NumDay { get; set; }
        public int NumNight { get; set; }
        public int PriceAdult { get; set; }
        public int PriceChild { get; set; }
        public int PriceInfant { get; set; }
        public List<BookingPassengerDetailDto> Details { get; set; } = new List<BookingPassengerDetailDto>();
    }

    public class BookingPassengerDetailDto
    {
        public int Id { get; set; }
        public string TargetType { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }

    public class MyBookingDto
    {
        public int Id { get; set; }
        public string TourTitle { get; set; } = string.Empty;
        public string TourSlug { get; set; } = string.Empty;
        public string ThumbnailUrl { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string DepartureDate { get; set; } = string.Empty;
        public int TotalPrice { get; set; }
        public string? CreatedAt { get; set; }
    }
}
