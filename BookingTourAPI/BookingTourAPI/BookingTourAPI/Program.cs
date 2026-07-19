using BookingTourAPI.Data; // Import namespace chứa Database Context (giống như import models/db)
using Microsoft.AspNetCore.Authentication.JwtBearer; // Thư viện hỗ trợ xác thực JWT (giống passport-jwt)
using Microsoft.EntityFrameworkCore; // Thư viện ORM (giống Sequelize hoặc TypeORM)
using Microsoft.IdentityModel.Tokens; // Thư viện xử lý Token
using System.Text;

// Khởi tạo đối tượng Builder để cấu hình các dịch vụ (Services) cho ứng dụng
// Tương đương với việc khởi tạo 'const app = express()' nhưng ở bước thiết lập
var builder = WebApplication.CreateBuilder(args);

// --- PHẦN 1: ĐĂNG KÝ CÁC DỊCH VỤ (Dependency Injection) ---

// Lấy chuỗi kết nối Database từ file appsettings.json (giống process.env.DB_URL)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Đăng ký Database Context với MySQL (Giống việc cấu hình kết nối DB trong Sequelize/Mongoose)
builder.Services.AddDbContext<BookingTourContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 30)),
        mySqlOptions => mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null)));

// Cấu hình CORS (Giống app.use(cors(...)) trong Express)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:5174") // Cho phép Frontend (Vite/React) gọi API
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Cấu hình xác thực JWT (Giống cấu hình Passport JWT Strategy)
var jwtKey = builder.Configuration["Jwt:SecretKey"] ?? "MộtChuỗiBảoMậtRấtDàiVàKhóĐoán123456789!@#";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true, // Kiểm tra chữ ký của Token
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = false, // Có thể bật lên để kiểm tra nguồn phát hành Token
            ValidateAudience = false, // Có thể bật lên để kiểm tra đối tượng sử dụng Token
            ClockSkew = TimeSpan.Zero // Không cho phép lệch thời gian khi kiểm tra hết hạn
        };
    });

// Đăng ký các Controller (Giống việc định nghĩa các Router)
// .AddJsonOptions dùng để cấu hình cách trả về JSON (ở đây là biến PascalCase thành snake_case)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.SnakeCaseLower;
    });

// Đăng ký MailerService vào hệ thống DI (Dependency Injection)
// 'AddScoped' nghĩa là tạo một instance mới cho mỗi request HTTP (giống như tạo mới một helper cho mỗi req)
builder.Services.AddScoped<BookingTourAPI.Services.IMailerService, BookingTourAPI.Services.MailerService>();

// Cấu hình Swagger - Công cụ tạo tài liệu API tự động (Giống Swagger-UI trong Node)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- PHẦN 2: XÂY DỰNG APP VÀ CẤU HÌNH PIPELINE (Middleware) ---

var app = builder.Build(); // Chính thức tạo đối tượng 'app' sau khi đã nạp đủ dịch vụ

// Cấu hình Pipeline xử lý Request (Giống thứ tự app.use() trong Express)

// Nếu là môi trường phát triển (Development) thì bật giao diện Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Kích hoạt CORS (Phải đặt trước Auth)
app.UseCors("AllowFrontend");

// Cấu hình phục vụ file tĩnh (Ví dụ: ảnh upload)
// Đoạn này đang trỏ đến thư mục 'uploads' bên ngoài project để lấy ảnh
var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "backend", "public", "uploads");
if (Directory.Exists(uploadsPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
        RequestPath = "/uploads" // URL sẽ là: http://domain.com/uploads/ten-file.jpg
    });
}

// Tự động chuyển hướng từ HTTP sang HTTPS (Tạm thời tắt ở Local Dev để tránh lỗi CORS khi chuyển hướng)
// app.UseHttpsRedirection();

// Kích hoạt Middleware xác thực (Kiểm tra xem Token có hợp lệ không)
app.UseAuthentication();

// Kích hoạt Middleware phân quyền (Kiểm tra xem User có quyền truy cập không)
app.UseAuthorization();

// Ánh xạ các Controller vào hệ thống Route (Giống việc gán app.use('/api', router))
app.MapControllers();

// Bắt đầu lắng nghe các request (Giống app.listen(port))
app.Run();
