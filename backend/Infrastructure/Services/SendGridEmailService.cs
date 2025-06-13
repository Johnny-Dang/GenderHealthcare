using System;
using System.Threading.Tasks;
using backend.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace backend.Infrastructure.Services
{
    // Ensure there is no duplicate definition of SendGridEmailService in this namespace.  
    public class SendGridEmailService : IEmailService
    {
        private readonly ISendGridClient _sendGridClient;
        private readonly string _senderEmail;
        private readonly string _senderName;

        public SendGridEmailService(IConfiguration configuration)
        {
            var apiKey = configuration["SendGrid:ApiKey"]
                ?? throw new ArgumentNullException("SendGrid:ApiKey", "SendGrid API key is not configured");
            _senderEmail = configuration["SendGrid:FromEmail"]
                ?? throw new ArgumentNullException("SendGrid:FromEmail", "Sender email is not configured");
            _senderName = configuration["SendGrid:FromName"]
                ?? throw new ArgumentNullException("SendGrid:FromName", "Sender name is not configured");

            _sendGridClient = new SendGridClient(apiKey);
        }

        public async Task<bool> SendVerificationEmailAsync(string toEmail, string verificationCode)
        {
            var from = new EmailAddress(_senderEmail, _senderName);
            var to = new EmailAddress(toEmail);
            var subject = "Email Verification Code";
            var plainTextContent = $"Your verification code is: {verificationCode}";
            var htmlContent = $@"  
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>  
                        <h2>Email Verification</h2>  
                        <p>Please use the following code to verify your email address:</p>  
                        <div style='background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;'>  
                            <strong>{verificationCode}</strong>  
                        </div>  
                        <p>This code will expire in 10 minutes.</p>  
                        <p>If you didn't request this verification, please ignore this email.</p>  
                    </div>";

            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            var response = await _sendGridClient.SendEmailAsync(msg);

            return response.IsSuccessStatusCode;
        }
    }
} 