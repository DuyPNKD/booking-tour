using BookingTourAPI.DTOs;

namespace BookingTourAPI.Services
{
    public interface IRagService
    {
        Task<List<SuggestedTourDto>> SearchToursAsync(string? keyword, int? maxPrice, int? durationDays, string? destination);
        Task<string> GetTourDetailRAGContextAsync(int tourId);
        Task<string> GetTourScheduleRAGContextAsync(int tourId);
        Task<string> SearchToursRAGContextAsync(string userQuery, int? maxPrice, string? destination);
        Task<(bool Success, int? BookingId, string Message)> CreateBookingDraftAsync(
            int tourId, 
            DateTime departureDate, 
            string customerName, 
            string customerPhone, 
            string customerEmail, 
            int numAdults, 
            int numChildren, 
            string? note);
    }
}
