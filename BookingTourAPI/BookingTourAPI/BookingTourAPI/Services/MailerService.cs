using System.Net;
using System.Net.Mail;
using System.Globalization;

namespace BookingTourAPI.Services
{
    public class MailerService : IMailerService
    {
        private readonly IConfiguration _config;

        public MailerService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string to, string subject, string html)
        {
            var emailSettings = _config.GetSection("Email");
            string host = emailSettings["SmtpHost"]!;
            int port = int.Parse(emailSettings["SmtpPort"]!);
            string user = emailSettings["SmtpUser"]!;
            string pass = emailSettings["SmtpPass"]!;
            string fromName = emailSettings["FromName"]!;

            using (var client = new SmtpClient(host, port))
            {
                client.EnableSsl = true;
                client.UseDefaultCredentials = false;
                client.Credentials = new NetworkCredential(user, pass);

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(user, fromName),
                    Subject = subject,
                    Body = html,
                    IsBodyHtml = true
                };
                mailMessage.To.Add(to);

                await client.SendMailAsync(mailMessage);
            }
        }

        public async Task SendBookingConfirmationEmailAsync(string to, string customerName, string orderId, string tourName, DateTime tourDate, int amount)
        {
            string formattedAmount = amount.ToString("N0", new CultureInfo("vi-VN"));
            string formattedDate = tourDate.ToString("dddd, dd/MM/yyyy", new CultureInfo("vi-VN"));

            string html = $@"
                <div style=""font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: auto;"">
                    <h2 style=""color: #2c3e50; text-align: center;"">XÁC NHẬN ĐƠN HÀNG</h2>
                    <p>Xin chào <strong>{customerName}</strong>,</p>
                    <p>Cảm ơn bạn đã đặt tour tại <strong>DTravel</strong>. Đơn hàng của bạn đã được thanh toán và xác nhận.</p>
                    <table style=""width: 100%; border-collapse: collapse; margin-top: 15px;"">
                        <tr>
                            <td style=""border: 1px solid #ddd; padding: 8px;""><strong>Mã đơn hàng</strong></td>
                            <td style=""border: 1px solid #ddd; padding: 8px;"">{orderId}</td>
                        </tr>
                        <tr>
                            <td style=""border: 1px solid #ddd; padding: 8px;""><strong>Tên tour</strong></td>
                            <td style=""border: 1px solid #ddd; padding: 8px;"">{tourName}</td>
                        </tr>
                        <tr>
                            <td style=""border: 1px solid #ddd; padding: 8px;""><strong>Ngày khởi hành</strong></td>
                            <td style=""border: 1px solid #ddd; padding: 8px; text-transform: capitalize;"">{formattedDate}</td>
                        </tr>
                        <tr>
                            <td style=""border: 1px solid #ddd; padding: 8px;""><strong>Thành tiền</strong></td>
                            <td style=""border: 1px solid #ddd; padding: 8px;"">{formattedAmount} đ</td>
                        </tr>
                    </table>
                    <p style=""margin-top: 15px;"">Chúng tôi rất mong bạn có một chuyến đi tuyệt vời!</p>
                    <br>
                    <p>Trân trọng,</p>
                    <p><em>Tour App DTravel</em></p>
                </div>
            ";

            await SendEmailAsync(to, "Xác nhận đơn hàng DTravel", html);
        }

        public async Task SendVerificationEmailAsync(string to, string code)
        {
            string html = $@"
                <div style=""font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: auto;"">
                    <h2 style=""color: #2c3e50; text-align: center;"">XÁC THỰC ĐĂNG KÝ</h2>
                    <p>Kính chào Quý khách,</p>
                    <p>Mã OTP để hoàn tất quá trình đăng ký của Quý khách là:</p>
                    <p style=""font-size: 24px; font-weight: bold; color: #e74c3c;"">{code}</p>
                    <p>Mã sẽ hết hạn sau <strong>5 phút</strong>.</p>
                    <p>Nếu Quý khách không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>
                    <br>
                    <p>Trân trọng,</p>
                    <p><em>Tour App DTravel</em></p>
                </div>
            ";
            await SendEmailAsync(to, "Xác nhận đăng ký tài khoản", html);
        }
    }
}
