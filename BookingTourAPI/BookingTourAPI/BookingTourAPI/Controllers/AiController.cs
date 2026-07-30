using BookingTourAPI.DTOs;
using BookingTourAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace BookingTourAPI.Controllers
{
    // Đánh dấu đây là một API Controller xử lý các request HTTP
    [ApiController]
    // Cấu hình đường dẫn URL gốc cho các API của controller này: /api/ai
    [Route("api/ai")]
    public class AiController : ControllerBase
    {
        // Khai báo service xử lý logic AI Agent (Claude AI)
        private readonly IClaudeService _claudeService;
        // Khai báo logger để ghi lại nhật ký lỗi nếu có sự cố
        private readonly ILogger<AiController> _logger;

        // Constructor: Nhận vào các dependency được Dependency Injection (DI) tự động bơm vào
        public AiController(IClaudeService claudeService, ILogger<AiController> logger)
        {
            _claudeService = claudeService;
            _logger = logger;
        }

        /// <summary>
        /// Endpoint tiếp nhận chat tư vấn tour từ AI Agent
        /// Đường dẫn đầy đủ: POST /api/ai/chat
        /// </summary>
        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] AiChatRequestDto request)
        {
            // Bước 1: Kiểm tra xem người dùng có nhập tin nhắn hay không, nếu để trống thì trả về lỗi 400 (Bad Request)
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new { message = "Nội dung tin nhắn không được để trống." });
            }

            try
            {
                // Bước 2: Chuyển tin nhắn và lịch sử trò chuyện sang cho ClaudeService để xử lý tư vấn & gọi tool
                var response = await _claudeService.ChatWithAgentAsync(request.Message, request.History);
                
                // Bước 3: Trả kết quả tư vấn (văn bản + tour gợi ý + thông tin đặt tour) về cho Client với mã 200 OK
                return Ok(response);
            }
            catch (Exception ex)
            {
                // Nếu xảy ra lỗi hệ thống, ghi log lại và trả về lỗi 500 kèm thông báo
                _logger.LogError(ex, "Lỗi khi xử lý AI Chat request");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xử lý tin nhắn tư vấn AI.", error = ex.Message });
            }
        }
    }
}

