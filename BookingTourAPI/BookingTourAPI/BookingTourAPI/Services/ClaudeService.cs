using BookingTourAPI.DTOs;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace BookingTourAPI.Services
{
    /// <summary>
    /// Service quản lý giao tiếp với Anthropic Claude API (Bộ não AI tư vấn)
    /// </summary>
    public class ClaudeService : IClaudeService
    {
        private readonly HttpClient _httpClient;          // Khởi tạo client gửi HTTP Request ra bên ngoài internet
        private readonly IConfiguration _configuration;    // Đọc file cấu hình appsettings.json (lấy API Key, Model)
        private readonly IRagService _ragService;          // Service truy vấn dữ liệu tour và tạo đơn đặt từ DB
        private readonly ILogger<ClaudeService> _logger;   // Ghi nhận nhật ký lỗi

        public ClaudeService(
            HttpClient httpClient, 
            IConfiguration configuration, 
            IRagService ragService,
            ILogger<ClaudeService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _ragService = ragService;
            _logger = logger;
        }

        /// <summary>
        /// Hàm chính tiếp nhận câu hỏi từ người dùng và trả về lời khuyên từ AI Agent
        /// </summary>
        public async Task<AiChatResponseDto> ChatWithAgentAsync(string userMessage, List<ChatMessageDto>? history)
        {
            // BƯỚC 1: Đọc API Key và Model từ file cấu hình hệ thống
            var apiKey = _configuration["Anthropic:ApiKey"] ?? _configuration["ANTHROPIC_API_KEY"];
            var model = _configuration["Anthropic:Model"] ?? _configuration["AI_MODEL"] ?? "claude-haiku-4-5-20251001";

            // Nếu chưa điền API Key thì báo lỗi ngay
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                return new AiChatResponseDto
                {
                    Reply = "Chưa cấu hình ANTHROPIC_API_KEY trong appsettings.json. Vui lòng kiểm tra lại cấu hình server."
                };
            }

            // Khởi tạo các biến lưu trữ kết quả để trả về cho Frontend
            var suggestedTours = new List<SuggestedTourDto>();
            bool bookingCreated = false;
            int? bookingId = null;

            // BƯỚC 2: Định nghĩa System Prompt (Lời dặn dò tính cách & quy tắc cho AI)
            string systemPrompt = @"Bạn là DTravel AI Agent - Trợ lý tư vấn du lịch thông minh, thân thiện của DTravel.

QUY TẮC PHẢN HỒI (CỰC KỲ QUAN TRỌNG):
1. TRẢ LỜI NGẮN GỌN & TỰ NHIÊN: Cửa sổ chat nhỏ gọn, hãy phản hồi súc tích (tối đa 2-4 câu ngắn). Hạn chế lạm dụng dấu in đậm quá nhiều, chỉ in đậm các thông số quan trọng (vd: Mã đơn, Giá tiền, Ngày đi). TUYỆT ĐỐI TRÁNH viết bảng markdown rườm rà hay lặp lại thông tin thừa.
2. KHI GỢI Ý TOUR: Không cần liệt kê lại giá/hình ảnh vì giao diện đã tự động hiển thị các Card Tour bên dưới. Chỉ cần chào nhẹ nhàng và tóm tắt 1-2 câu lý do gợi ý.
3. KHI ĐẶT TOUR THÀNH CÔNG: Phản hồi ấm áp, ngắn gọn trong 2-3 câu (Xác nhận Mã đơn #ID, tên tour, tổng tiền và báo nhân viên sẽ liên hệ). Không tạo bảng biểu hay danh sách dài.
4. SỬ DỤNG TOOLS LINH HOẠT:
   - Tool `search_tours`: Tìm tour phù hợp khi khách hỏi nhu cầu.
   - Tool `get_tour_schedule`: Lấy lịch trình khi khách hỏi chi tiết từng ngày.
   - Tool `create_booking_draft`: Tạo booking khi khách đồng ý đặt và cung cấp thông tin (tên, sdt, ngày đi, số lượng người).";

            // BƯỚC 3: Đóng gói lịch sử cuộc trò chuyện thành định dạng JSON chuẩn của Anthropic Claude
            var messages = new JsonArray();

            // Lấy tối đa 10 tin nhắn gần nhất để giữ ngữ cảnh cuộc trò chuyện mà không làm tốn dung lượng
            if (history != null && history.Any())
            {
                foreach (var h in history.TakeLast(10))
                {
                    messages.Add(new JsonObject
                    {
                        ["role"] = h.Role == "assistant" ? "assistant" : "user",
                        ["content"] = h.Content
                    });
                }
            }

            // Thêm tin nhắn mới nhất mà người dùng vừa gõ vào danh sách
            messages.Add(new JsonObject
            {
                ["role"] = "user",
                ["content"] = userMessage
            });

            // BƯỚC 4: Lấy danh sách định nghĩa các Công cụ (Tools Schema) cho AI sử dụng
            var tools = GetClaudeToolsDefinition();

            // Cấu hình số vòng lặp tối đa giữa AI và Backend (để thực thi công cụ nhiều bước)
            int maxToolIterations = 4;
            int currentIteration = 0;
            string finalReplyText = string.Empty;

            // BƯỚC 5: VÒNG LẶP SUY LUẬN VÀ GỌI TOOL (Agent Loop)
            while (currentIteration < maxToolIterations)
            {
                currentIteration++;

                // Đóng gói request body gửi tới Anthropic API
                var requestBody = new JsonObject
                {
                    ["model"] = model,
                    ["max_tokens"] = 1024,
                    ["system"] = systemPrompt,
                    ["messages"] = messages.DeepClone(),
                    ["tools"] = tools.DeepClone()
                };

                // Tạo HTTP Request POST gửi sang server Anthropic bên Mỹ
                using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages");
                request.Headers.Add("x-api-key", apiKey);                           // Dán API Key xác thực
                request.Headers.Add("anthropic-version", "2023-06-01");            // Khai báo phiên bản API
                request.Content = new StringContent(requestBody.ToJsonString(), Encoding.UTF8, "application/json");

                // Gửi thư và đứng chờ phản hồi từ Claude
                var response = await _httpClient.SendAsync(request);
                var responseJsonString = await response.Content.ReadAsStringAsync();

                // Kiểm tra nếu kết nối HTTP thất bại
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Anthropic API Error: {Error}", responseJsonString);
                    return new AiChatResponseDto
                    {
                        Reply = $"Hệ thống gặp sự cố khi kết nối Claude API: {response.StatusCode}. Vui lòng thử lại sau."
                    };
                }

                // Phân tích kết quả JSON trả về từ Claude
                var responseNode = JsonNode.Parse(responseJsonString);
                var stopReason = responseNode?["stop_reason"]?.ToString();
                var contentArray = responseNode?["content"]?.AsArray();

                if (contentArray == null || !contentArray.Any())
                {
                    break;
                }

                // Lưu phản hồi của AI vào danh sách tin nhắn để giữ ngữ cảnh cho các bước tiếp theo
                messages.Add(new JsonObject
                {
                    ["role"] = "assistant",
                    ["content"] = contentArray.DeepClone()
                });

                // Lấy ra các đoạn văn bản trả lời của AI (nếu có)
                var textBlocks = contentArray.Where(c => c?["type"]?.ToString() == "text").Select(c => c?["text"]?.ToString()).ToList();
                if (textBlocks.Any())
                {
                    finalReplyText = string.Join("\n\n", textBlocks);
                }

                // BƯỚC 6: KIỂM TRA XEM CLAUDE CÓ YÊU CẦU DÙNG TOOL (GỌI HÀM) HAY KHÔNG
                if (stopReason == "tool_use")
                {
                    var toolUseBlocks = contentArray.Where(c => c?["type"]?.ToString() == "tool_use").ToList();
                    var toolResultsContent = new JsonArray();

                    // Duyệt qua từng công cụ mà AI yêu cầu thực thi
                    foreach (var toolBlock in toolUseBlocks)
                    {
                        var toolUseId = toolBlock?["id"]?.ToString();
                        var toolName = toolBlock?["name"]?.ToString();
                        var inputObj = toolBlock?["input"]?.AsObject();

                        string toolOutputString = string.Empty;

                        // --- TRƯỜNG HỢP 1: AI YÊU CẦU TÌM KIẾM TOUR ---
                        if (toolName == "search_tours")
                        {
                            string? keyword = inputObj?["keyword"]?.ToString();
                            string? destination = inputObj?["destination"]?.ToString();
                            int? maxPrice = inputObj?["max_price"]?.GetValue<int?>();
                            int? durationDays = inputObj?["duration_days"]?.GetValue<int?>();

                            // Gọi RagService để query dữ liệu thực tế từ SQL Server
                            var tours = await _ragService.SearchToursAsync(keyword, maxPrice, durationDays, destination);
                            if (tours.Any())
                            {
                                suggestedTours.AddRange(tours);
                                toolOutputString = await _ragService.SearchToursRAGContextAsync(keyword ?? destination ?? "", maxPrice, destination);
                            }
                            else
                            {
                                // Nếu không thấy đúng tiêu chí thì lấy các tour nổi bật fallback
                                toolOutputString = "Không tìm thấy tour phù hợp chính xác theo bộ lọc. Đang lấy các tour nổi bật khác...";
                                var fallbackTours = await _ragService.SearchToursAsync(null, null, null, null);
                                suggestedTours.AddRange(fallbackTours);
                                toolOutputString += await _ragService.SearchToursRAGContextAsync("", null, null);
                            }
                        }
                        // --- TRƯỜNG HỢP 2: AI YÊU CẦU LẤY LỊCH TRÌNH CHI TIẾT ---
                        else if (toolName == "get_tour_schedule")
                        {
                            int tourId = inputObj?["tour_id"]?.GetValue<int>() ?? 0;
                            toolOutputString = await _ragService.GetTourDetailRAGContextAsync(tourId);
                        }
                        // --- TRƯỜNG HỢP 3: AI YÊU CẦU TẠO ĐƠN ĐẶT TOUR ---
                        else if (toolName == "create_booking_draft")
                        {
                            int tourId = inputObj?["tour_id"]?.GetValue<int>() ?? 0;
                            string departureDateStr = inputObj?["departure_date"]?.ToString() ?? DateTime.Now.AddDays(7).ToString("yyyy-MM-DD");
                            DateTime.TryParse(departureDateStr, out var depDate);
                            if (depDate == default) depDate = DateTime.Now.AddDays(7);

                            string name = inputObj?["customer_name"]?.ToString() ?? "Khách hàng";
                            string phone = inputObj?["customer_phone"]?.ToString() ?? "0900000000";
                            string email = inputObj?["customer_email"]?.ToString() ?? "khachhang@example.com";
                            int adults = inputObj?["num_adults"]?.GetValue<int>() ?? 1;
                            int children = inputObj?["num_children"]?.GetValue<int>() ?? 0;
                            string? note = inputObj?["note"]?.ToString();

                            // Gọi RagService lưu thông tin khách & đơn đặt tour vào SQL Server
                            var bookingRes = await _ragService.CreateBookingDraftAsync(tourId, depDate, name, phone, email, adults, children, note);
                            bookingCreated = bookingRes.Success;
                            bookingId = bookingRes.BookingId;
                            toolOutputString = bookingRes.Message;
                        }

                        // Đóng gói kết quả thực thi tool để chuẩn bị gửi ngược lại cho AI
                        toolResultsContent.Add(new JsonObject
                        {
                            ["type"] = "tool_result",
                            ["tool_use_id"] = toolUseId,
                            ["content"] = toolOutputString
                        });
                    }

                    // Thêm kết quả của Tool vào cuộc hội thoại và tiếp tục vòng lặp để AI đọc dữ liệu mới
                    messages.Add(new JsonObject
                    {
                        ["role"] = "user",
                        ["content"] = toolResultsContent
                    });
                }
                else
                {
                    // Nếu AI trả lời bình thường (không cần dùng thêm tool nào nữa), kết thúc vòng lặp
                    break;
                }
            }

            // BƯỚC 7: Lọc trùng lặp danh sách tour gợi ý theo ID
            var uniqueSuggestedTours = suggestedTours
                .GroupBy(t => t.Id)
                .Select(g => g.First())
                .ToList();

            // Đóng gói dữ liệu DTO cuối cùng trả về cho Controller
            return new AiChatResponseDto
            {
                Reply = finalReplyText,
                SuggestedTours = uniqueSuggestedTours,
                BookingCreated = bookingCreated,
                BookingId = bookingId
            };
        }

        private static JsonArray GetClaudeToolsDefinition()
        {
            return new JsonArray
            {
                new JsonObject
                {
                    ["name"] = "search_tours",
                    ["description"] = "Tìm kiếm danh sách tour du lịch phù hợp dựa trên các tiêu chí (từ khóa, địa điểm, ngân sách tối đa, số ngày).",
                    ["input_schema"] = new JsonObject
                    {
                        ["type"] = "object",
                        ["properties"] = new JsonObject
                        {
                            ["destination"] = new JsonObject
                            {
                                ["type"] = "string",
                                ["description"] = "Địa điểm du lịch mong muốn (vd: Hà Giang, Ninh Bình, Na Hang, Hạ Long, Phú Quốc...)"
                            },
                            ["max_price"] = new JsonObject
                            {
                                ["type"] = "integer",
                                ["description"] = "Ngân sách tối đa (VNĐ) mà khách có thể chi trả"
                            },
                            ["duration_days"] = new JsonObject
                            {
                                ["type"] = "integer",
                                ["description"] = "Số ngày du lịch (vd: 3 ngày, 4 ngày)"
                            },
                            ["keyword"] = new JsonObject
                            {
                                ["type"] = "string",
                                ["description"] = "Từ khóa sở thích (vd: biển, núi, văn hóa, nghỉ dưỡng)"
                            }
                        }
                    }
                },
                new JsonObject
                {
                    ["name"] = "get_tour_schedule",
                    ["description"] = "Lấy lịch trình chi tiết từng ngày và chính sách tour theo ID của tour.",
                    ["input_schema"] = new JsonObject
                    {
                        ["type"] = "object",
                        ["properties"] = new JsonObject
                        {
                            ["tour_id"] = new JsonObject
                            {
                                ["type"] = "integer",
                                ["description"] = "Mã ID của tour cần tra cứu lịch trình"
                            }
                        },
                        ["required"] = new JsonArray { "tour_id" }
                    }
                },
                new JsonObject
                {
                    ["name"] = "create_booking_draft",
                    ["description"] = "Tạo đơn đặt tour cho khách hàng sau khi khách chốt đồng ý chọn tour và cung cấp đủ thông tin.",
                    ["input_schema"] = new JsonObject
                    {
                        ["type"] = "object",
                        ["properties"] = new JsonObject
                        {
                            ["tour_id"] = new JsonObject
                            {
                                ["type"] = "integer",
                                ["description"] = "ID của tour khách hàng chốt đặt"
                            },
                            ["departure_date"] = new JsonObject
                            {
                                ["type"] = "string",
                                ["description"] = "Ngày khởi hành (định dạng YYYY-MM-DD)"
                            },
                            ["customer_name"] = new JsonObject
                            {
                                ["type"] = "string",
                                ["description"] = "Họ và tên người đặt tour"
                            },
                            ["customer_phone"] = new JsonObject
                            {
                                ["type"] = "string",
                                ["description"] = "Số điện thoại người đặt"
                            },
                            ["customer_email"] = new JsonObject
                            {
                                ["type"] = "string",
                                ["description"] = "Email nhận xác nhận booking"
                            },
                            ["num_adults"] = new JsonObject
                            {
                                ["type"] = "integer",
                                ["description"] = "Số lượng người lớn"
                            },
                            ["num_children"] = new JsonObject
                            {
                                ["type"] = "integer",
                                ["description"] = "Số lượng trẻ em (mặc định 0)"
                            },
                            ["note"] = new JsonObject
                            {
                                ["type"] = "string",
                                ["description"] = "Ghi chú thêm từ khách hàng"
                            }
                        },
                        ["required"] = new JsonArray { "tour_id", "departure_date", "customer_name", "customer_phone", "customer_email", "num_adults" }
                    }
                }
            };
        }
    }
}
