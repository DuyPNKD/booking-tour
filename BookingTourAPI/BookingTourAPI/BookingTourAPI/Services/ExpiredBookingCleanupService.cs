using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BookingTourAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BookingTourAPI.Services
{
    /// <summary>
    /// TIẾN TRÌNH NGẦM (BACKGROUND SERVICE / WORKER SERVICE)
    /// =========================================================================
    /// MỤC ĐÍCH FILE: Tự động chạy ngầm định kỳ (mỗi 60 giây) để quét toàn bộ DB.
    /// Tìm các đơn hàng ở trạng thái "pending" (Chờ thanh toán) đã khởi tạo quá 15 phút.
    /// Tự động chuyển đơn sang "cancelled" (Đã hủy) và CỘNG HOÀN TRẢ GHẾ TRỐNG cho chuyến đi.
    /// </summary>
    public class ExpiredBookingCleanupService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory; // Factory tạo Scope an toàn cho DbContext trong Singleton
        private readonly ILogger<ExpiredBookingCleanupService> _logger; // Ghi log hệ thống
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1); // Chu kỳ quét: Mỗi 1 phút 1 lần
        private const int ExpirationTimeoutMinutes = 15; // Thời hạn chờ thanh toán: 15 phút

        public ExpiredBookingCleanupService(
            IServiceScopeFactory scopeFactory,
            ILogger<ExpiredBookingCleanupService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        /// <summary>
        /// VÒNG LẶP CHÍNH CỦA BACKGROUND SERVICE
        /// Thực thi liên tục theo chu kỳ 60 giây cho đến khi ứng dụng Backend bị dừng.
        /// </summary>
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("[BACKGROUND JOB START] Tiến trình tự động dọn dẹp đơn quá hạn đã được kích hoạt.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CleanupExpiredBookingsAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[BACKGROUND JOB ERROR] Lỗi xảy ra trong quá trình quét đơn hàng quá hạn.");
                }

                // Chờ 60 giây trước khi chạy lượt tiếp theo
                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("[BACKGROUND JOB STOP] Tiến trình tự động dọn dẹp đơn quá hạn đã dừng.");
        }

        /// <summary>
        /// HÀM XỬ LÝ DỌN DẸP ĐƠN VÀ HOÀN GHẾ TRỐNG
        /// </summary>
        private async Task CleanupExpiredBookingsAsync(CancellationToken stoppingToken)
        {
            // Do BackgroundService là Singleton nhưng DbContext là Scoped, 
            // nên bắt buộc phải tạo Scope riêng cho mỗi lần quét để tránh xung đột DbContext.
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BookingTourContext>();

            var thresholdTime = DateTime.UtcNow.AddMinutes(-ExpirationTimeoutMinutes);

            // Tìm các đơn pending quá 15 phút
            var expiredBookings = await context.Bookings
                .Include(b => b.Details)
                .Where(b => b.Status != null && b.Status.ToLower() == "pending" && b.CreatedAt <= thresholdTime)
                .ToListAsync(stoppingToken);

            if (expiredBookings.Count == 0)
            {
                return; // Không có đơn nào bị quá hạn
            }

            _logger.LogInformation("[EXPIRED BOOKINGS FOUND] Phát hiện {Count} đơn hàng quá hạn chưa thanh toán.", expiredBookings.Count);

            foreach (var booking in expiredBookings)
            {
                // 1. Chuyển trạng thái đơn sang "cancelled"
                booking.Status = "cancelled";

                // 2. Tính tổng số ghế/hành khách của đơn hàng này từ BookingDetails
                int totalSeatsToRestore = booking.Details != null && booking.Details.Count > 0
                    ? booking.Details.Sum(d => d.Quantity)
                    : 1;

                if (totalSeatsToRestore <= 0) totalSeatsToRestore = 1;

                // 3. Tìm Chuyến đi (TourDeparture) tương ứng theo TourId và DepartureDate để hoàn trả ghế
                var departure = await context.TourDepartures
                    .FirstOrDefaultAsync(d => d.TourId == booking.TourId && d.DepartureDate.Date == booking.DepartureDate.Date, stoppingToken);

                if (departure != null)
                {
                    departure.AvailableSeats = (departure.AvailableSeats ?? 20) + totalSeatsToRestore;
                    _logger.LogInformation(
                        "[SEATS RESTORED] Đơn #{BookingId} bị hủy quá hạn. Đã cộng trả {Seats} chỗ trống cho Chuyến đi #{DepartureId} (Còn trống: {AvailableSeats}).",
                        booking.Id, totalSeatsToRestore, departure.Id, departure.AvailableSeats);
                }
            }

            // 4. Lưu tất cả thay đổi xuống MySQL Database
            await context.SaveChangesAsync(stoppingToken);
            _logger.LogInformation("[CLEANUP COMPLETED] Đã dọn dẹp và cập nhật trạng thái thành công cho {Count} đơn hàng.", expiredBookings.Count);
        }
    }
}
