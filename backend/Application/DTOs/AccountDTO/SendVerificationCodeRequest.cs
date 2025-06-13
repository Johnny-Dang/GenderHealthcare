namespace backend.Application.DTOs.Accounts
{
    public class SendVerificationCodeRequest
    {
        public string Email { get; set; } = default!;
    }
} 