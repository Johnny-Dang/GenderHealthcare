using System.Net;
using System.Net.Mail;
using backend.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace backend.Application.Services
{
    public class EmailService : IEmailService
    {
        private readonly string _apiKey;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly string _verificationBaseUrl;
        private readonly string _verificationTokenSecret;
        private readonly int _tokenExpirationMinutes;

        public EmailService(IConfiguration configuration)
        {
            _apiKey = configuration["SendGrid:ApiKey"];
            _fromEmail = configuration["SendGrid:FromEmail"];
            _fromName = configuration["SendGrid:FromName"];
            _verificationBaseUrl = configuration["SendGrid:VerificationBaseUrl"];
            _verificationTokenSecret = configuration["EmailVerification:SecretKey"];
            _tokenExpirationMinutes = int.Parse(configuration["EmailVerification:TokenExpirationMinutes"] ?? "10");
        }

        public async Task SendVerificationEmailAsync(string toEmail, string verificationToken)
        {
            var verificationLink = $"{_verificationBaseUrl}?token={verificationToken}";
            
            var client = new SendGridClient(_apiKey);
            var from = new EmailAddress(_fromEmail, _fromName);
            var to = new EmailAddress(toEmail);
            var subject = "Xác thực email của bạn";
            var plainTextContent = $"Vui lòng xác thực email của bạn bằng cách nhấp vào link sau: {verificationLink}";
            var htmlContent = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <h2 style='color: #333;'>Xác thực địa chỉ email của bạn</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất quá trình đăng ký, vui lòng xác thực địa chỉ email của bạn.</p>
                <div style='margin: 30px 0;'>
                    <a href='{verificationLink}' style='background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;'>Xác thực email</a>
                </div>
                <p>Hoặc bạn có thể sao chép và dán link sau vào trình duyệt:</p>
                <p style='word-break: break-all;'>{verificationLink}</p>
                <p>Lưu ý: Link này chỉ có hiệu lực trong {_tokenExpirationMinutes} phút.</p>
                <p style='color: #777; font-size: 0.8em;'>Nếu bạn không thực hiện yêu cầu này, bạn có thể bỏ qua email này.</p>
            </div>";

            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            await client.SendEmailAsync(msg);
        }
    }

    public static class EmailVerificationHelper
    {
        public static string GenerateEmailVerificationToken(string email, string secretKey, int expirationMinutes = 10)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(secretKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Email, email) }),
                Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public static string? ValidateEmailVerificationToken(string token, string secretKey)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(secretKey);
            try
            {
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                };
                
                tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                return jwtToken.Claims.First(x => x.Type == ClaimTypes.Email).Value;
            }
            catch
            {
                return null;
            }
        }
    }
} 