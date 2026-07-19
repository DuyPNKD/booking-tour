namespace BookingTourAPI.Services
{
    public interface IMailerService
    {
        Task SendEmailAsync(string to, string subject, string html);
        Task SendBookingConfirmationEmailAsync(string to, string customerName, string orderId, string tourName, DateTime tourDate, int amount);
        Task SendVerificationEmailAsync(string to, string code);
    }
}
