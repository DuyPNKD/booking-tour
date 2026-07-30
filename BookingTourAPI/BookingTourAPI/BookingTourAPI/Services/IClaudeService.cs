using BookingTourAPI.DTOs;

namespace BookingTourAPI.Services
{
    public interface IClaudeService
    {
        Task<AiChatResponseDto> ChatWithAgentAsync(string userMessage, List<ChatMessageDto>? history);
    }
}
