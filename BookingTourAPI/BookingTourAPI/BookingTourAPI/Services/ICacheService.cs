using System;
using System.Threading.Tasks;

namespace BookingTourAPI.Services
{
    /// <summary>
    /// INTERFACE QUẢN LÝ BỘ ĐỆM CACHE (ICacheService)
    /// =========================================================================
    /// MỤC ĐÍCH FILE: Định nghĩa các lệnh thao tác cơ bản với bộ nhớ đệm (Cache).
    /// Giúp tách biệt code giữa giao diện gọi Cache và nơi cài đặt (Redis/MemoryCache).
    /// </summary>
    public interface ICacheService
    {
        /// <summary>
        /// Lấy dữ liệu đã lưu trong Cache ra theo tên key.
        /// Trả về null nếu không tìm thấy dữ liệu hoặc Cache hết hạn.
        /// </summary>
        Task<T?> GetAsync<T>(string key);

        /// <summary>
        /// Lưu dữ liệu (value) vào Cache với tên định danh (key).
        /// expirationTime: Thời gian dữ liệu tồn tại trong Cache (ví dụ 15 phút).
        /// </summary>
        Task SetAsync<T>(string key, T value, TimeSpan? expirationTime = null);

        /// <summary>
        /// Xóa chính xác 1 dữ liệu trong Cache theo tên key.
        /// </summary>
        Task RemoveAsync(string key);

        /// <summary>
        /// Xóa TOÀN BỘ các dữ liệu trong Cache có tên bắt đầu bằng prefixKey.
        /// Ví dụ: RemoveByPrefixAsync("tours:") sẽ xóa sạch cache danh sách và chi tiết tour.
        /// </summary>
        Task RemoveByPrefixAsync(string prefixKey);
    }
}
