using System.Text.Json.Serialization;

namespace BookingTourAPI.DTOs
{
    public class ChatMessageDto
    {
        [JsonPropertyName("role")]
        public string Role { get; set; } = "user";

        [JsonPropertyName("content")]
        public string Content { get; set; } = string.Empty;
    }

    public class AiChatRequestDto
    {
        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("history")]
        public List<ChatMessageDto>? History { get; set; }

        [JsonPropertyName("session_id")]
        public string? SessionId { get; set; }
    }

    public class SuggestedTourDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("slug")]
        public string Slug { get; set; } = string.Empty;

        [JsonPropertyName("price")]
        public int Price { get; set; }

        [JsonPropertyName("old_price")]
        public int? OldPrice { get; set; }

        [JsonPropertyName("thumbnail_url")]
        public string? ThumbnailUrl { get; set; }

        [JsonPropertyName("num_day")]
        public int NumDay { get; set; }

        [JsonPropertyName("num_night")]
        public int NumNight { get; set; }

        [JsonPropertyName("location_name")]
        public string? LocationName { get; set; }

        [JsonPropertyName("rating")]
        public float? Rating { get; set; }
    }

    public class AiChatResponseDto
    {
        [JsonPropertyName("reply")]
        public string Reply { get; set; } = string.Empty;

        [JsonPropertyName("suggested_tours")]
        public List<SuggestedTourDto> SuggestedTours { get; set; } = new List<SuggestedTourDto>();

        [JsonPropertyName("booking_created")]
        public bool BookingCreated { get; set; }

        [JsonPropertyName("booking_id")]
        public int? BookingId { get; set; }
    }
}
