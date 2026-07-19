using BookingTourAPI.Data;
using BookingTourAPI.Models;
using BookingTourAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace BookingTourAPI.Controllers
{
    [ApiController]
    [Route("api/momo")]
    public class MomoController : ControllerBase
    {
        private readonly BookingTourContext _context;
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;
        private readonly IMailerService _mailerService;

        public MomoController(BookingTourContext context, IConfiguration config, IMailerService mailerService)
        {
            _context = context;
            _config = config;
            _httpClient = new HttpClient();
            _mailerService = mailerService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateOrder([FromBody] MomoCreateRequest request)
        {
            try
            {
                var momoSettings = _config.GetSection("Momo");
                string partnerCode = momoSettings["PartnerCode"]!;
                string accessKey = momoSettings["AccessKey"]!;
                string secretKey = momoSettings["SecretKey"]!;
                string orderInfo = momoSettings["OrderInfo"]!;
                string redirectUrl = momoSettings["RedirectUrl"]!;
                string ipnUrl = momoSettings["IpnUrl"]!;
                string requestType = momoSettings["RequestType"]!;
                string apiUrl = momoSettings["ApiUrl"]!;

                string orderId = partnerCode + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                string requestId = orderId;
                string extraData = "";

                string requestTypeToUse = "captureWallet"; // Luôn dùng captureWallet

                string rawSignature = $"accessKey={accessKey}&amount={request.Amount}&extraData={extraData}&ipnUrl={ipnUrl}&orderId={orderId}&orderInfo={orderInfo}&partnerCode={partnerCode}&redirectUrl={redirectUrl}&requestId={requestId}&requestType={requestTypeToUse}";

                string signature = ComputeHmacSha256(rawSignature, secretKey);

                var requestBody = new
                {
                    partnerCode,
                    partnerName = "Momo",
                    storeId = partnerCode,
                    requestId,
                    amount = request.Amount,
                    orderId,
                    orderInfo,
                    redirectUrl,
                    ipnUrl,
                    lang = "vi",
                    requestType = requestTypeToUse,
                    autoCapture = true,
                    extraData,
                    signature
                };

                // Log thông tin gửi đi
                Console.WriteLine("=== MOMO REQUEST ===");
                Console.WriteLine($"Raw Signature: {rawSignature}");
                Console.WriteLine($"Signature: {signature}");
                Console.WriteLine($"Body: {JsonSerializer.Serialize(requestBody)}");

                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = null
                };

                var response = await _httpClient.PostAsJsonAsync(apiUrl, requestBody, options);
                var responseString = await response.Content.ReadAsStringAsync();
                
                Console.WriteLine("=== MOMO RESPONSE ===");
                Console.WriteLine(responseString);

                var result = JsonSerializer.Deserialize<JsonElement>(responseString);

                // Lưu trạng thái 'pending' cho payment
                var payment = new Payment
                {
                    BookingId = request.BookingId,
                    OrderId = orderId,
                    Amount = request.Amount,
                    PaymentMethod = "momo",
                    Status = "pending"
                };

                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MOMO CREATE ERROR] {ex.ToString()}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("callback")]
        public async Task<IActionResult> Callback([FromBody] JsonElement body)
        {
            try
            {
                string? orderId = body.TryGetProperty("orderId", out var orderIdProp) ? orderIdProp.GetString() : null;
                int resultCode = body.TryGetProperty("resultCode", out var resultCodeProp) ? resultCodeProp.GetInt32() : -1;

                if (string.IsNullOrEmpty(orderId)) return Ok("OK");

                var payment = await _context.Payments.FirstOrDefaultAsync(p => p.OrderId == orderId);
                if (payment == null)
                {
                    return Ok("OK");
                }

                if (resultCode == 0)
                {
                    payment.Status = "paid";
                    payment.PaidAt = DateTime.UtcNow;

                    var booking = await _context.Bookings
                        .Include(b => b.User)
                        .Include(b => b.Tour)
                        .FirstOrDefaultAsync(b => b.Id == payment.BookingId);

                    if (booking != null)
                    {
                        booking.Status = "confirmed";

                        // Gửi email xác nhận
                        if (booking.User != null && !string.IsNullOrEmpty(booking.User.Email))
                        {
                            try
                            {
                                await _mailerService.SendBookingConfirmationEmailAsync(
                                    booking.User.Email,
                                    booking.User.Name,
                                    orderId,
                                    booking.Tour?.Title ?? "Tour",
                                    booking.DepartureDate,
                                    booking.TotalPrice
                                );
                            }
                            catch (Exception emailEx)
                            {
                                Console.WriteLine($"[EMAIL SEND ERROR] {emailEx.Message}");
                            }
                        }
                    }
                }
                else
                {
                    payment.Status = "failed";
                    var booking = await _context.Bookings.FindAsync(payment.BookingId);
                    if (booking != null)
                    {
                        booking.Status = "cancelled";
                    }
                }

                await _context.SaveChangesAsync();
                return Ok("OK");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MOMO CALLBACK ERROR] {ex.ToString()}");
                return Ok("OK");
            }
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetStatus([FromQuery] string orderId)
        {
            var payment = await _context.Payments
                .Where(p => p.OrderId == orderId)
                .Select(p => new { p.Status, p.PaidAt })
                .FirstOrDefaultAsync();

            return Ok(new { data = payment });
        }

        private string ComputeHmacSha256(string message, string secretKey)
        {
            byte[] keyByte = Encoding.UTF8.GetBytes(secretKey);
            byte[] messageBytes = Encoding.UTF8.GetBytes(message);
            using (var hmacsha256 = new HMACSHA256(keyByte))
            {
                byte[] hashmessage = hmacsha256.ComputeHash(messageBytes);
                return BitConverter.ToString(hashmessage).Replace("-", "").ToLower();
            }
        }
    }

    public class MomoCreateRequest
    {
        [JsonPropertyName("amount")]
        public int Amount { get; set; }
        [JsonPropertyName("booking_id")]
        public int BookingId { get; set; }
    }
}
