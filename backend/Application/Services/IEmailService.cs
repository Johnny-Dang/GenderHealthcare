using System.Threading.Tasks;

namespace backend.Application.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendVerificationEmailAsync(string toEmail, string verificationCode);
        Task<bool> SendBookingDetailEmailAsync(string toEmail, string subject, string htmlContent);
    }
} 