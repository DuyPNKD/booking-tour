using System;
using System.Collections.Concurrent;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace BookingTourAPI.Services
{
    /// <summary>
    /// LỚP THỰC THI BỘ ĐỆM CACHE HYBRID (RedisCacheService)
    /// =========================================================================
    /// MỤC ĐÍCH FILE: Thực thi lưu trữ dữ liệu bộ đệm.
    /// Ưu tiên 1: Lưu vào Redis Server (Bộ nhớ đệm phân tán).
    /// Dự phòng 2 (Fallback): Nếu máy local không bật Redis, tự động lưu vào RAM của .NET (IMemoryCache).
    /// Đảm bảo ứng dụng vừa chạy siêu tốc (1-2ms), vừa không bao giờ bị lỗi sập app khi dev ở local.
    /// </summary>
    public class RedisCacheService : ICacheService
    {
        private readonly IDistributedCache _distributedCache; // Interface bộ đệm Redis của ASP.NET Core
        private readonly IMemoryCache _memoryCache; // Bộ đệm RAM dự phòng
        private readonly IConnectionMultiplexer? _redisConnection; // Kết nối trực tiếp đến Redis
        private readonly ILogger<RedisCacheService> _logger; // Ghi log hệ thống
        private static readonly ConcurrentDictionary<string, bool> _memoryKeys = new(); // Danh sách quản lý các key trong Memory
        private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            PropertyNameCaseInsensitive = true
        };

        public RedisCacheService(
            IDistributedCache distributedCache,
            IMemoryCache memoryCache,
            ILogger<RedisCacheService> logger,
            IConnectionMultiplexer? redisConnection = null)
        {
            _distributedCache = distributedCache;
            _memoryCache = memoryCache;
            _logger = logger;
            _redisConnection = redisConnection;
        }

        /// <summary>
        /// LẤY DỮ LIỆU TỪ CACHE
        /// 1. Kiểm tra Redis trước. Nếu tìm thấy (Cache Hit) -> Deserialize chuỗi JSON về Object và trả về.
        /// 2. Nếu Redis bị lỗi hoặc tắt -> Tự động tìm trong IMemoryCache (RAM local).
        /// 3. Nếu cả 2 đều không có -> Trả về null (Cache Miss).
        /// </summary>
        public async Task<T?> GetAsync<T>(string key)
        {
            try
            {
                var cachedData = await _distributedCache.GetStringAsync(key);
                if (!string.IsNullOrEmpty(cachedData))
                {
                    _logger.LogInformation("[CACHE HIT - REDIS] Lấy dữ liệu thành công từ Redis với Key: {Key}", key);
                    return JsonSerializer.Deserialize<T>(cachedData, _jsonOptions);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[REDIS FALLBACK] Lỗi kết nối Redis, tự động chuyển sang IMemoryCache cho Key: {Key}", key);
            }

            // Kiểm tra trong RAM dự phòng
            if (_memoryCache.TryGetValue(key, out T? memoryValue))
            {
                _logger.LogInformation("[CACHE HIT - MEMORY] Lấy dữ liệu thành công từ MemoryCache với Key: {Key}", key);
                return memoryValue;
            }

            _logger.LogInformation("[CACHE MISS] Không có trong Cache với Key: {Key}", key);
            return default;
        }

        /// <summary>
        /// LƯU DỮ LIỆU VÀO CACHE
        /// Serialize Object thành chuỗi JSON và cất vào cả Redis lẫn IMemoryCache.
        /// </summary>
        public async Task SetAsync<T>(string key, T value, TimeSpan? expirationTime = null)
        {
            if (value == null) return;

            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expirationTime ?? TimeSpan.FromMinutes(15) // Mặc định tồn tại 15 phút
            };

            var json = JsonSerializer.Serialize(value, _jsonOptions);

            try
            {
                await _distributedCache.SetStringAsync(key, json, options);
                _logger.LogInformation("[CACHE SET - REDIS] Đã lưu vào Redis thành công: Key={Key}, Hết hạn trong {TTL} phút", key, (expirationTime ?? TimeSpan.FromMinutes(15)).TotalMinutes);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[REDIS FALLBACK] Lưu vào IMemoryCache dự phòng cho Key: {Key}", key);
            }

            // Đồng thời lưu vào MemoryCache dự phòng
            _memoryCache.Set(key, value, expirationTime ?? TimeSpan.FromMinutes(15));
            _memoryKeys.TryAdd(key, true);
        }

        /// <summary>
        /// XÓA 1 KEY CỤ THỂ TRONG CACHE
        /// </summary>
        public async Task RemoveAsync(string key)
        {
            try
            {
                await _distributedCache.RemoveAsync(key);
                _logger.LogInformation("[CACHE REMOVE - REDIS] Đã xóa Key khỏi Redis: {Key}", key);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[REDIS REMOVE ERROR] Lỗi xóa Key Redis: {Key}", key);
            }

            _memoryCache.Remove(key);
            _memoryKeys.TryRemove(key, out _);
        }

        /// <summary>
        /// XÓA DỮ LIỆU THEO TIỀN TỐ (CACHE INVALIDATION)
        /// Tìm và xóa tất cả các key có bắt đầu bằng prefixKey.
        /// Ví dụ: Khi Admin sửa tour, gọi RemoveByPrefixAsync("tours:") sẽ xóa sạch cache danh sách và chi tiết tour cũ!
        /// </summary>
        public async Task RemoveByPrefixAsync(string prefixKey)
        {
            _logger.LogInformation("[CACHE EVICT BY PREFIX] Đang làm sạch toàn bộ Cache chứa tiền tố: {Prefix}", prefixKey);

            // 1. Quét và xóa các key trong Redis nếu có kết nối
            if (_redisConnection != null && _redisConnection.IsConnected)
            {
                try
                {
                    var endpoints = _redisConnection.GetEndPoints();
                    foreach (var endpoint in endpoints)
                    {
                        var server = _redisConnection.GetServer(endpoint);
                        if (!server.IsReplica)
                        {
                            var keys = server.Keys(pattern: $"{prefixKey}*");
                            foreach (var redisKey in keys)
                            {
                                await _distributedCache.RemoveAsync(redisKey.ToString());
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "[REDIS PREFIX REMOVE ERROR] Lỗi khi quét tiền tố Redis: {Prefix}", prefixKey);
                }
            }

            // 2. Xóa các key khớp tiền tố trong MemoryCache dự phòng
            foreach (var k in _memoryKeys.Keys)
            {
                if (k.StartsWith(prefixKey, StringComparison.OrdinalIgnoreCase))
                {
                    _memoryCache.Remove(k);
                    _memoryKeys.TryRemove(k, out _);
                }
            }
        }
    }
}
